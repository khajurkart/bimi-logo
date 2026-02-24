from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone, timedelta
import os
import logging
import jwt
import bcrypt
import razorpay
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles  # ✅ always import this

app = FastAPI()
# Serve your frontend folder
app.mount("/", StaticFiles(directory="frontend/public", html=True), name="frontend")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Razorpay client
razorpay_client = razorpay.Client(auth=(os.environ['RAZORPAY_KEY_ID'], os.environ['RAZORPAY_KEY_SECRET']))

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============ MODELS ============

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    created_at: str

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    slug: str
    description: str
    image: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    price: float
    category: str
    image: str
    weight: str
    stock: int
    featured: bool = False
    delivery_charge: float = 0.0

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image: str
    weight: str
    stock: int
    featured: bool = False
    delivery_charge: float = 0.0

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    weight: Optional[str] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None
    delivery_charge: Optional[float] = None

class CartItem(BaseModel):
    product_id: str
    quantity: int

class CartItemResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: str
    quantity: int
    product: Optional[Product] = None

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    items: List[CartItemResponse]

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    customer_name: str
    customer_email: str
    items: List[OrderItem]
    total_amount: float
    delivery_charges: float
    payment_method: str
    payment_status: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    shipping_address: dict
    status: str
    tracking_id: Optional[str] = None
    created_at: str

class ReturnRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    order_id: str
    user_id: str
    customer_name: str
    customer_email: str
    items: List[OrderItem]
    reason: str
    request_type: str  # "return" or "exchange"
    status: str  # "pending", "approved", "rejected", "completed"
    images: Optional[List[str]] = None
    admin_notes: Optional[str] = None
    created_at: str

class CreateReturnRequest(BaseModel):
    order_id: str
    items: List[OrderItem]
    reason: str
    request_type: str
    images: Optional[List[str]] = None

class CreateOrder(BaseModel):
    items: List[OrderItem]
    total_amount: float
    payment_method: str
    shipping_address: dict

class RazorpayOrder(BaseModel):
    amount: float
    currency: str = "INR"

class RazorpayVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str

# ============ AUTH HELPERS ============

ADMIN_EMAILS = ["admin@khajurkart.com", "khajurkart@gmail.com"]  # Admin email list

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

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
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if user is None:
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

# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
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
    
    # Create access token
    access_token = create_access_token({"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user_data.name,
            "email": user_data.email,
            "phone": user_data.phone
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token = create_access_token({"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user.get("phone")
        }
    }

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

@api_router.post("/auth/forgot-password")
async def forgot_password(email: str):
    # Check if user exists
    user = await db.users.find_one({"email": email})
    if not user:
        # Return success even if user doesn't exist (security best practice)
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Generate reset token (valid for 1 hour)
    reset_token = create_access_token({"sub": user["id"], "type": "reset"})
    
    # In production, you would send an email here
    # For now, we'll just store the token in the database
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"reset_token": reset_token, "reset_token_created": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Return the token (in production, this would be sent via email)
    return {
        "message": "Password reset token generated",
        "reset_token": reset_token,
        "reset_url": f"/reset-password?token={reset_token}"
    }

@api_router.post("/auth/reset-password")
async def reset_password(reset_token: str, new_password: str):
    try:
        # Verify token
        payload = jwt.decode(reset_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
        
        # Find user with this token
        user = await db.users.find_one({"id": user_id, "reset_token": reset_token})
        if not user:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Update password
        hashed_pwd = hash_password(new_password)
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"password": hashed_pwd}, "$unset": {"reset_token": "", "reset_token_created": ""}}
        )
        
        return {"message": "Password reset successfully"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Reset token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid reset token")

# ============ CATEGORY ROUTES ============

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

# ============ PRODUCT ROUTES ============

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.get("/search")
async def search_products(q: str):
    if not q:
        return []
    
    # Case-insensitive search in product name and description
    products = await db.products.find(
        {
            "$or": [
                {"name": {"$regex": q, "$options": "i"}},
                {"description": {"$regex": q, "$options": "i"}}
            ]
        },
        {"_id": 0}
    ).to_list(50)
    
    return products

# ============ CART ROUTES ============

@api_router.get("/cart")
async def get_cart(current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    
    if not cart:
        return {"user_id": current_user["id"], "items": []}
    
    # Populate product details
    for item in cart["items"]:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            item["product"] = product
    
    return cart

@api_router.post("/cart/add")
async def add_to_cart(cart_item: CartItem, current_user: dict = Depends(get_current_user)):
    # Check if product exists
    product = await db.products.find_one({"id": cart_item.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get or create cart
    cart = await db.carts.find_one({"user_id": current_user["id"]})
    
    if not cart:
        cart = {"user_id": current_user["id"], "items": []}
    
    # Check if item already in cart
    item_exists = False
    for item in cart["items"]:
        if item["product_id"] == cart_item.product_id:
            item["quantity"] += cart_item.quantity
            item_exists = True
            break
    
    if not item_exists:
        cart["items"].append({"product_id": cart_item.product_id, "quantity": cart_item.quantity})
    
    # Update cart
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": cart},
        upsert=True
    )
    
    return {"message": "Item added to cart"}

@api_router.post("/cart/update")
async def update_cart_item(cart_item: CartItem, current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user["id"]})
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Update quantity
    for item in cart["items"]:
        if item["product_id"] == cart_item.product_id:
            item["quantity"] = cart_item.quantity
            break
    
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"items": cart["items"]}}
    )
    
    return {"message": "Cart updated"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user["id"]})
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Remove item
    cart["items"] = [item for item in cart["items"] if item["product_id"] != product_id]
    
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"items": cart["items"]}}
    )
    
    return {"message": "Item removed from cart"}

@api_router.delete("/cart/clear")
async def clear_cart(current_user: dict = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"items": []}}
    )
    return {"message": "Cart cleared"}

# ============ ORDER ROUTES ============

@api_router.post("/orders")
async def create_order(order_data: CreateOrder, current_user: dict = Depends(get_current_user)):
    order_id = f"order_{datetime.now(timezone.utc).timestamp()}"
    
    # Calculate delivery charges from items
    delivery_charges = 0
    for item in order_data.items:
        # Get product to fetch delivery charge
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if product:
            delivery_charges += product.get("delivery_charge", 0) * item.quantity
    
    order_doc = {
        "id": order_id,
        "user_id": current_user["id"],
        "customer_name": current_user.get("name", ""),
        "customer_email": current_user.get("email", ""),
        "items": [item.model_dump() for item in order_data.items],
        "total_amount": order_data.total_amount,
        "delivery_charges": delivery_charges,
        "payment_method": order_data.payment_method,
        "payment_status": "pending" if order_data.payment_method == "razorpay" else "cod",
        "shipping_address": order_data.shipping_address,
        "status": "pending",
        "tracking_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    # Clear cart
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"items": []}}
    )
    
    return {"order_id": order_id, "message": "Order created successfully"}

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ============ RAZORPAY ROUTES ============

@api_router.post("/razorpay/create-order")
async def create_razorpay_order(order: RazorpayOrder, current_user: dict = Depends(get_current_user)):
    try:
        # Amount in paise (smallest currency unit)
        amount_paise = int(order.amount * 100)
        
        razorpay_order = razorpay_client.order.create({
            "amount": amount_paise,
            "currency": order.currency,
            "payment_capture": 1
        })
        
        return {
            "id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "key_id": os.environ['RAZORPAY_KEY_ID']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/razorpay/verify-payment")
async def verify_razorpay_payment(payment_data: RazorpayVerify, current_user: dict = Depends(get_current_user)):
    try:
        # Verify signature
        params_dict = {
            'razorpay_order_id': payment_data.razorpay_order_id,
            'razorpay_payment_id': payment_data.razorpay_payment_id,
            'razorpay_signature': payment_data.razorpay_signature
        }
        
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Update order
        await db.orders.update_one(
            {"id": payment_data.order_id, "user_id": current_user["id"]},
            {
                "$set": {
                    "payment_status": "paid",
                    "razorpay_order_id": payment_data.razorpay_order_id,
                    "razorpay_payment_id": payment_data.razorpay_payment_id,
                    "status": "confirmed"
                }
            }
        )
        
        return {"message": "Payment verified successfully"}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ ADMIN ROUTES ============

@api_router.get("/admin/check")
async def check_admin(admin: dict = Depends(get_admin_user)):
    return {"is_admin": True, "email": admin["email"]}

@api_router.post("/admin/products", response_model=Product)
async def create_product(product_data: ProductCreate, admin: dict = Depends(get_admin_user)):
    product_id = f"product_{datetime.now(timezone.utc).timestamp()}"
    
    product_doc = {
        "id": product_id,
        **product_data.model_dump()
    }
    
    await db.products.insert_one(product_doc)
    return Product(**product_doc)

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductUpdate, admin: dict = Depends(get_admin_user)):
    # Get existing product
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update only provided fields
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    
    if update_data:
        await db.products.update_one(
            {"id": product_id},
            {"$set": update_data}
        )
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return Product(**updated_product)

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@api_router.get("/admin/orders")
async def get_all_orders(admin: dict = Depends(get_admin_user)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, admin: dict = Depends(get_admin_user)):
    valid_statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    # Generate tracking ID if status is shipped and doesn't have one
    update_data = {"status": status}
    if status == "shipped":
        order = await db.orders.find_one({"id": order_id}, {"_id": 0})
        if order and not order.get("tracking_id"):
            update_data["tracking_id"] = f"KK{datetime.now(timezone.utc).strftime('%Y%m%d')}{order_id[-6:].upper()}"
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully"}

@api_router.get("/orders/track/{tracking_id}")
async def track_order(tracking_id: str):
    order = await db.orders.find_one({"tracking_id": tracking_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found with this tracking ID")
    return order

# ============ RETURN/EXCHANGE ROUTES ============

@api_router.post("/returns")
async def create_return_request(return_data: CreateReturnRequest, current_user: dict = Depends(get_current_user)):
    # Verify order exists and belongs to user
    order = await db.orders.find_one({"id": return_data.order_id, "user_id": current_user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if order is delivered (can only return/exchange delivered orders)
    if order["status"] != "delivered":
        raise HTTPException(status_code=400, detail="Can only return/exchange delivered orders")
    
    # Check if return already exists for this order
    existing_return = await db.returns.find_one({"order_id": return_data.order_id})
    if existing_return:
        raise HTTPException(status_code=400, detail="Return/Exchange request already exists for this order")
    
    return_id = f"return_{datetime.now(timezone.utc).timestamp()}"
    
    return_doc = {
        "id": return_id,
        "order_id": return_data.order_id,
        "user_id": current_user["id"],
        "customer_name": current_user.get("name", ""),
        "customer_email": current_user.get("email", ""),
        "items": [item.model_dump() for item in return_data.items],
        "reason": return_data.reason,
        "request_type": return_data.request_type,
        "status": "pending",
        "images": return_data.images or [],
        "admin_notes": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.returns.insert_one(return_doc)
    return {"return_id": return_id, "message": f"{return_data.request_type.title()} request submitted successfully"}

@api_router.get("/returns")
async def get_user_returns(current_user: dict = Depends(get_current_user)):
    returns = await db.returns.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return returns

@api_router.get("/returns/{return_id}", response_model=ReturnRequest)
async def get_return_detail(return_id: str, current_user: dict = Depends(get_current_user)):
    return_req = await db.returns.find_one({"id": return_id, "user_id": current_user["id"]}, {"_id": 0})
    if not return_req:
        raise HTTPException(status_code=404, detail="Return request not found")
    return return_req

# ============ ADMIN RETURN ROUTES ============

@api_router.get("/admin/returns")
async def get_all_returns(admin: dict = Depends(get_admin_user)):
    returns = await db.returns.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return returns

@api_router.put("/admin/returns/{return_id}/status")
async def update_return_status(return_id: str, status: str, admin_notes: Optional[str] = None, admin: dict = Depends(get_admin_user)):
    valid_statuses = ["pending", "approved", "rejected", "completed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    update_data = {"status": status}
    if admin_notes:
        update_data["admin_notes"] = admin_notes
    
    result = await db.returns.update_one(
        {"id": return_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Return request not found")
    
    return {"message": "Return status updated successfully"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

#port = int(os.environ.get("PORT", 10000))
#app.run(host="0.0.0.0", port=port)
