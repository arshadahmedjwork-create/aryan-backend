from sqlmodel import Session
from database.db import engine
from models.models import Product, User, Order, OrderItem
from utils.auth import get_password_hash
from uuid import uuid4
import random

def seed_data():
    with Session(engine) as session:
        # Create Users
        admin = User(email="admin@autonomiq.ai", password_hash=get_password_hash("admin123"), role="admin", full_name="Admin User")
        driver = User(email="driver@autonomiq.ai", password_hash=get_password_hash("driver123"), role="driver", full_name="John Driver")
        customer = User(email="customer@gmail.com", password_hash=get_password_hash("cust123"), role="customer", full_name="Jane Customer")
        
        session.add_all([admin, driver, customer])
        session.commit()
        
        # Create Products
        products = [
            Product(name="Grok Burger", description="AI Optimized Deliciousness", price=12.99, category="Food", stock_quantity=50),
            Product(name="Quantum Coffee", description="Energy for the 4th dimension", price=4.50, category="Beverages", stock_quantity=100),
            Product(name="Neural Fries", description="Smarter side dish", price=3.99, category="Food", stock_quantity=30),
            Product(name="Logic Lemonade", description="Clear your mind", price=2.99, category="Beverages", stock_quantity=0),
            Product(name="Silicon Steak", description="Premium build quality", price=24.99, category="Food", stock_quantity=15),
        ]
        session.add_all(products)
        session.commit()
        
        # Create Orders
        for _ in range(20):
            order = Order(
                user_id=customer.id,
                total_price=random.uniform(10, 100),
                status="delivered",
                payment_status="completed"
            )
            session.add(order)
            session.commit()
            
            # Add items
            item = OrderItem(
                order_id=order.id,
                product_id=random.choice(products).id,
                quantity=random.randint(1, 3),
                price_at_purchase=12.99
            )
            session.add(item)
            
        session.commit()
        print("Seed data created successfully.")

if __name__ == "__main__":
    seed_data()
