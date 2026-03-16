import os
from supabase import create_client, Client
from dotenv import load_dotenv
import bcrypt

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("supabase_anon")
supabase: Client = create_client(url, key)

def seed_users():
    # Hardcoded users
    users = [
        {
            "id": "00000000-0000-0000-0000-000000000001",
            "email": "admin@autonomiq.ai",
            "password_hash": bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            "role": "admin",
            "full_name": "System Admin"
        },
        {
            "id": "00000000-0000-0000-0000-000000000002",
            "email": "customer@gmail.com",
            "password_hash": bcrypt.hashpw("cust123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            "role": "customer",
            "full_name": "Demo Customer"
        },
        {
            "id": "00000000-0000-0000-0000-000000000003",
            "email": "driver@autonomiq.ai",
            "password_hash": bcrypt.hashpw("driver123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            "role": "driver",
            "full_name": "Autonomous Bot v2"
        }
    ]

    for user in users:
        try:
            # Delete existing to ensure fixed ID is used
            supabase.table("users").delete().eq("email", user['email']).execute()
            res = supabase.table("users").insert(user).execute()
            print(f"Seeded user: {user['email']} with ID: {user['id']}")
        except Exception as e:
            print(f"Error seeding {user['email']}: {e}")

if __name__ == "__main__":
    seed_users()
