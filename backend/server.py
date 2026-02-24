from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import Optional
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone, timedelta
import os
import jwt
import bcrypt
import razorpay

# --------- ENV & DB ---------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

razorpay_client = razorpay.Client(
    auth=(os.environ["RAZORPAY_KEY_ID"], os.environ["RAZORPAY_KEY_SECRET"])
)

# --------- APP SETUP ---------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# --------- UTILS ---------
ADMIN_EMAILS = ["admin@khajurkart.com", "khajurkart@gmail.com"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = await db.users.find_one(
            {"id": user_id}, {"_id": 0, "password": 0}
        )

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --------- MODELS ---------
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# --------- AUTH ROUTES ---------
@api_router.post("/auth/register")
async def register(user: UserRegister):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = f"user_{datetime.now(timezone.utc).timestamp()}"
    hashed_pwd = hash_password(user.password)

    user_doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hashed_pwd,
        "phone": user.phone,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.users.insert_one(user_doc)

    token = create_access_token({"sub": user_id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone
        }
    }


@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})

    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["id"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user.get("phone")
        }
    }


@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


# --------- CATEGORY ROUTES ---------
@api_router.get("/categories")
async def get_categories():
    return await db.categories.find({}, {"_id": 0}).to_list(100)


# --------- PRODUCT ROUTES ---------
@api_router.get("/products")
async def get_products():
    return await db.products.find({}, {"_id": 0}).to_list(1000)


# --------- TEST ROUTE ---------
@api_router.get("/test")
async def test_api():
    return {"message": "Backend works"}


# --------- INCLUDE ROUTER ---------
app.include_router(api_router)
