# server.py
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone, timedelta
import os
import jwt
import bcrypt
import razorpay

#from ariadne.asgi import GraphQL
#from schema import schema  # Your GraphQL schema

# --------- ENV & DB ---------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

razorpay_client = razorpay.Client(auth=(os.environ["RAZORPAY_KEY_ID"], os.environ["RAZORPAY_KEY_SECRET"]))

# --------- APP SETUP ---------
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# API Router
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# --------- STATIC FILES (React Build) ---------
app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")
app.mount("/", StaticFiles(directory="frontend/build", html=True), name="frontend")

@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    index_path = Path("frontend/build/index.html")
    if index_path.exists():
        return index_path.read_text()
    return {"error": "index.html not found"}

# --------- UTILS ---------
ADMIN_EMAILS = ["admin@khajurkart.com", "khajurkart@gmail.com"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("email") not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# --------- MODELS ---------
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# You can add the other models here (Product, Category, Cart, Order, etc.)
# For brevity, I’m skipping repeating all of them. Keep your existing models.

# --------- AUTH ROUTES ---------
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = f"user_{datetime.now(timezone.utc).timestamp()}"
    hashed_pwd = hash_password(user_data.password)
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_pwd,
        "phone": user_data.phone,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    access_token = create_access_token({"sub": user_id})
    return {"access_token": access_token, "token_type": "bearer", "user": user_doc}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = create_access_token({"sub": user["id"]})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

# --------- CATEGORY ROUTES ---------
@api_router.get("/categories")
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

# --------- PRODUCT ROUTES ---------
@api_router.get("/products")
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    return products

# Add other routes (cart, orders, razorpay) the same way

# --------- INCLUDE ROUTER ---------
app.include_router(api_router)

# --------- GRAPHQL ---------
#app.add_route("/graphql", GraphQL(schema, debug=True))


# --------- TEST ROUTE ---------
@app.get("/api/test")
async def test_api():
    return {"message": "Backend works"}
