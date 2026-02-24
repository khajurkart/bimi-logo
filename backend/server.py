from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
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

from ariadne.asgi import GraphQL
from schema import schema  # Your GraphQL schema here

# ============ APP & MIDDLEWARE ============
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

app = FastAPI(title="KhajurKart API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve React frontend
app.mount("/", StaticFiles(directory="frontend/build", html=True), name="frontend")

# Catch-all route for React Router
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    index_path = Path("frontend/build/index.html")
    if index_path.exists():
        return index_path.read_text()
    return {"error": "index.html not found"}

# ============ GRAPHQL ============
app.add_route("/graphql", GraphQL(schema, debug=True))

# ============ DATABASE & AUTH ============
mongo_url = os.environ['MONGO_URL']
db = AsyncIOMotorClient(mongo_url)[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
security = HTTPBearer()
ADMIN_EMAILS = ["admin@khajurkart.com", "khajurkart@gmail.com"]

# Razorpay client
razorpay_client = razorpay.Client(
    auth=(os.environ['RAZORPAY_KEY_ID'], os.environ['RAZORPAY_KEY_SECRET'])
)

# ============ UTILS ============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

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

# ============ ROUTER ============
api_router = APIRouter(prefix="/api")

# Test endpoint
@api_router.get("/test")
async def test_api():
    return {"message": "Backend works"}

# Example: REST endpoints, auth, products, cart, orders, etc.
# ... Keep all your previous route definitions here ...
# Make sure each route uses `db` and dependencies correctly

app.include_router(api_router)
