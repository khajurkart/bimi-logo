import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Categories
categories = [
    {
        "id": "gourmet-collection",
        "name": "Gourmet Collection",
        "slug": "gourmet-collection",
        "description": "Exquisite selection of premium dry fruits",
        "image": "https://images.pexels.com/photos/31496295/pexels-photo-31496295.jpeg"
    },
    {
        "id": "dates",
        "name": "Dates",
        "slug": "dates",
        "description": "Premium Medjool and Ajwa dates",
        "image": "https://images.pexels.com/photos/15807109/pexels-photo-15807109.jpeg"
    },
    {
        "id": "nuts",
        "name": "Nuts",
        "slug": "nuts",
        "description": "Finest quality nuts from around the world",
        "image": "https://images.pexels.com/photos/20377557/pexels-photo-20377557.jpeg"
    },
    {
        "id": "dry-fruits",
        "name": "Dry Fruits",
        "slug": "dry-fruits",
        "description": "Premium dried fruits selection",
        "image": "https://images.unsplash.com/photo-1610832958506-aa56368176cf"
    },
    {
        "id": "natural-spice-powder",
        "name": "Natural Spice Powder",
        "slug": "natural-spice-powder",
        "description": "Authentic ground spices",
        "image": "https://images.unsplash.com/photo-1606914469276-31bc4103c50c"
    },
    {
        "id": "stuffed-dates",
        "name": "Stuffed Dates",
        "slug": "stuffed-dates",
        "description": "Dates filled with premium nuts",
        "image": "https://static.prod-images.emergentagent.com/jobs/1488ece7-7b71-4c89-a940-ced66486fd5e/images/b07e8876f2deca20c91c053f745518c3ca3e365def7fe9dcbbe732503648f7ee.png"
    },
    {
        "id": "spices",
        "name": "Spices",
        "slug": "spices",
        "description": "Whole spices from premium sources",
        "image": "https://images.pexels.com/photos/4198755/pexels-photo-4198755.jpeg"
    }
]

# Products
products = [
    # Gourmet Collection
    {
        "id": "gourmet-gift-box",
        "name": "Royal Gourmet Gift Box",
        "description": "An exquisite collection of premium dates, nuts, and spices beautifully packaged in a luxury box",
        "price": 3499.00,
        "category": "gourmet-collection",
        "image": "https://images.pexels.com/photos/31496295/pexels-photo-31496295.jpeg",
        "weight": "1kg",
        "stock": 25,
        "featured": True,
        "delivery_charge": 50.00
    },
    {
        "id": "premium-assortment",
        "name": "Premium Dry Fruits Assortment",
        "description": "Handpicked selection of finest dry fruits and nuts",
        "price": 2499.00,
        "category": "gourmet-collection",
        "image": "https://images.pexels.com/photos/18740976/pexels-photo-18740976.jpeg",
        "weight": "750g",
        "stock": 30,
        "featured": True,
        "delivery_charge": 40.00
    },
    
    # Dates
    {
        "id": "medjool-dates",
        "name": "Premium Medjool Dates",
        "description": "Large, soft, and sweet Medjool dates from the finest palms",
        "price": 899.00,
        "category": "dates",
        "image": "https://static.prod-images.emergentagent.com/jobs/1488ece7-7b71-4c89-a940-ced66486fd5e/images/9ef22138b1ac284627d8ada276fc5bfcc8c70f752587e055521011939341415b.png",
        "weight": "500g",
        "stock": 50,
        "featured": True,
        "delivery_charge": 30.00
    },
    {
        "id": "ajwa-dates",
        "name": "Ajwa Dates",
        "description": "Sacred dates from Madinah, rich in flavor and nutrients",
        "price": 1299.00,
        "category": "dates",
        "image": "https://images.pexels.com/photos/13065738/pexels-photo-13065738.jpeg",
        "weight": "500g",
        "stock": 40,
        "featured": False,
        "delivery_charge": 35.00
    },
    {
        "id": "kimia-dates",
        "name": "Kimia Dates",
        "description": "Persian dates with a unique dark color and rich taste",
        "price": 649.00,
        "category": "dates",
        "image": "https://images.pexels.com/photos/15794083/pexels-photo-15794083.jpeg",
        "weight": "500g",
        "stock": 60,
        "featured": False,
        "delivery_charge": 25.00
    },
    
    # Nuts
    {
        "id": "california-almonds",
        "name": "California Almonds",
        "description": "Premium quality California almonds, rich in protein and vitamins",
        "price": 799.00,
        "category": "nuts",
        "image": "https://static.prod-images.emergentagent.com/jobs/1488ece7-7b71-4c89-a940-ced66486fd5e/images/d0209b13fd7a6d1c6476d2f8679946333984b9966f56d36444d5f94197d0170f.png",
        "weight": "500g",
        "stock": 80,
        "featured": True,
        "delivery_charge": 30.00
    },
    {
        "id": "premium-cashews",
        "name": "Premium Cashews",
        "description": "Jumbo cashews from the finest plantations",
        "price": 899.00,
        "category": "nuts",
        "image": "https://images.pexels.com/photos/11046278/pexels-photo-11046278.jpeg",
        "weight": "500g",
        "stock": 70,
        "featured": False,
        "delivery_charge": 30.00
    },
    {
        "id": "iran-pistachios",
        "name": "Iranian Pistachios",
        "description": "Premium roasted and salted pistachios from Iran",
        "price": 1099.00,
        "category": "nuts",
        "image": "https://images.pexels.com/photos/8105126/pexels-photo-8105126.jpeg",
        "weight": "500g",
        "stock": 50,
        "featured": False,
        "delivery_charge": 35.00
    },
    {
        "id": "mixed-nuts",
        "name": "Deluxe Mixed Nuts",
        "description": "Perfect blend of almonds, cashews, walnuts, and pistachios",
        "price": 949.00,
        "category": "nuts",
        "image": "https://images.pexels.com/photos/4033324/pexels-photo-4033324.jpeg",
        "weight": "500g",
        "stock": 60,
        "featured": False,
        "delivery_charge": 30.00
    },
    
    # Dry Fruits
    {
        "id": "afghan-raisins",
        "name": "Afghan Golden Raisins",
        "description": "Sun-dried premium raisins from Afghanistan",
        "price": 349.00,
        "category": "dry-fruits",
        "image": "https://images.pexels.com/photos/5966630/pexels-photo-5966630.jpeg",
        "weight": "500g",
        "stock": 90,
        "featured": False,
        "delivery_charge": 20.00
    },
    {
        "id": "turkish-apricots",
        "name": "Turkish Apricots",
        "description": "Naturally dried Turkish apricots, no preservatives",
        "price": 449.00,
        "category": "dry-fruits",
        "image": "https://images.pexels.com/photos/12630427/pexels-photo-12630427.jpeg",
        "weight": "500g",
        "stock": 75,
        "featured": False,
        "delivery_charge": 25.00
    },
    {
        "id": "dried-figs",
        "name": "Premium Dried Figs",
        "description": "Tender and sweet dried figs rich in fiber",
        "price": 599.00,
        "category": "dry-fruits",
        "image": "https://images.pexels.com/photos/10047961/pexels-photo-10047961.jpeg",
        "weight": "500g",
        "stock": 65,
        "featured": False,
        "delivery_charge": 25.00
    },
    
    # Natural Spice Powder
    {
        "id": "turmeric-powder",
        "name": "Organic Turmeric Powder",
        "description": "Pure organic turmeric powder with high curcumin content",
        "price": 199.00,
        "category": "natural-spice-powder",
        "image": "https://images.pexels.com/photos/4198843/pexels-photo-4198843.jpeg",
        "weight": "200g",
        "stock": 100,
        "featured": False,
        "delivery_charge": 15.00
    },
    {
        "id": "red-chili-powder",
        "name": "Premium Red Chili Powder",
        "description": "Authentic red chili powder with perfect heat balance",
        "price": 179.00,
        "category": "natural-spice-powder",
        "image": "https://images.pexels.com/photos/3802315/pexels-photo-3802315.jpeg",
        "weight": "200g",
        "stock": 120,
        "featured": False,
        "delivery_charge": 15.00
    },
    {
        "id": "coriander-powder",
        "name": "Fresh Coriander Powder",
        "description": "Freshly ground coriander powder for authentic taste",
        "price": 149.00,
        "category": "natural-spice-powder",
        "image": "https://images.pexels.com/photos/5560027/pexels-photo-5560027.jpeg",
        "weight": "200g",
        "stock": 110,
        "featured": False,
        "delivery_charge": 15.00
    },
    
    # Stuffed Dates
    {
        "id": "almond-stuffed-dates",
        "name": "Almond Stuffed Dates",
        "description": "Premium dates filled with crunchy California almonds",
        "price": 1199.00,
        "category": "stuffed-dates",
        "image": "https://static.prod-images.emergentagent.com/jobs/1488ece7-7b71-4c89-a940-ced66486fd5e/images/b07e8876f2deca20c91c053f745518c3ca3e365def7fe9dcbbe732503648f7ee.png",
        "weight": "500g",
        "stock": 45,
        "featured": True,
        "delivery_charge": 35.00
    },
    {
        "id": "pistachio-stuffed-dates",
        "name": "Pistachio Stuffed Dates",
        "description": "Medjool dates filled with premium Iranian pistachios",
        "price": 1299.00,
        "category": "stuffed-dates",
        "image": "https://static.prod-images.emergentagent.com/jobs/1488ece7-7b71-4c89-a940-ced66486fd5e/images/b07e8876f2deca20c91c053f745518c3ca3e365def7fe9dcbbe732503648f7ee.png",
        "weight": "500g",
        "stock": 40,
        "featured": False,
        "delivery_charge": 35.00
    },
    {
        "id": "mixed-nut-stuffed-dates",
        "name": "Mixed Nut Stuffed Dates",
        "description": "Dates filled with a delicious mix of almonds, cashews, and pistachios",
        "price": 1399.00,
        "category": "stuffed-dates",
        "image": "https://static.prod-images.emergentagent.com/jobs/1488ece7-7b71-4c89-a940-ced66486fd5e/images/b07e8876f2deca20c91c053f745518c3ca3e365def7fe9dcbbe732503648f7ee.png",
        "weight": "500g",
        "stock": 35,
        "featured": False,
        "delivery_charge": 35.00
    },
    
    # Spices
    {
        "id": "premium-saffron",
        "name": "Premium Kashmiri Saffron",
        "description": "Authentic Kashmiri saffron threads, the world's most expensive spice",
        "price": 2499.00,
        "category": "spices",
        "image": "https://images.pexels.com/photos/33654800/pexels-photo-33654800.jpeg",
        "weight": "5g",
        "stock": 20,
        "featured": True,
        "delivery_charge": 20.00
    },
    {
        "id": "cardamom-green",
        "name": "Green Cardamom",
        "description": "Premium quality green cardamom pods from Kerala",
        "price": 799.00,
        "category": "spices",
        "image": "https://images.pexels.com/photos/6069857/pexels-photo-6069857.jpeg",
        "weight": "100g",
        "stock": 55,
        "featured": False,
        "delivery_charge": 20.00
    },
    {
        "id": "cinnamon-sticks",
        "name": "Ceylon Cinnamon Sticks",
        "description": "True Ceylon cinnamon sticks with sweet and delicate flavor",
        "price": 349.00,
        "category": "spices",
        "image": "https://images.pexels.com/photos/7387643/pexels-photo-7387643.jpeg",
        "weight": "100g",
        "stock": 70,
        "featured": False,
        "delivery_charge": 20.00
    }
]

async def seed_database():
    print("Starting database seeding...")
    
    # Clear existing data
    await db.categories.delete_many({})
    await db.products.delete_many({})
    
    # Insert categories
    print("Inserting categories...")
    await db.categories.insert_many(categories)
    print(f"Inserted {len(categories)} categories")
    
    # Insert products
    print("Inserting products...")
    await db.products.insert_many(products)
    print(f"Inserted {len(products)} products")
    
    print("Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_database())
