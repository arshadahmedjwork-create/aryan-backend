from database.db import get_supabase
import uuid

def seed():
    supabase = get_supabase()
    
    # Check if products exist
    res = supabase.table("products").select("id").execute()
    if len(res.data) > 0:
        print("Products already seeded.")
        return

    print("Seeding products...")
    products = [
        {"name": "Master AI Chip", "category": "Electronics", "price": 299.99, "description": "High-performance neural processor.", "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475"},
        {"name": "Quantum Headset", "category": "Audio", "price": 199.99, "description": "Immersive sound with spatial awareness.", "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"},
        {"name": "Cyber Drone", "category": "Drones", "price": 499.00, "description": "Autonomous delivery and surveillance drone.", "image_url": "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9"},
        {"name": "Nano Glow Watch", "category": "Wearables", "price": 149.50, "description": "Smartwatch with bio-holographic display.", "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30"}
    ]
    
    res = supabase.table("products").insert(products).execute()
    inserted_products = res.data
    
    print(f"Inserted {len(inserted_products)} products.")
    
    # Seed Inventory
    inventory = []
    for p in inserted_products:
        inventory.append({
            "product_id": p["id"],
            "stock_quantity": 50
        })
    
    supabase.table("inventory").insert(inventory).execute()
    print("Seeding inventory complete.")

if __name__ == "__main__":
    seed()
