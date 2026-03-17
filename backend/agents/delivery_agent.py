from datetime import datetime, timedelta

class DeliveryAgent:
    def __init__(self, supabase):
        self.supabase = supabase

    async def get_order_status(self, order_id: str):
        res = self.supabase.table("orders").select("*").eq("id", order_id).execute()
        if not res.data:
            return "Order not found."
            
        order = res.data[0]
        status = order["status"]
        
        if status == "shipped" or status == "out_for_delivery":
            tracking = self.supabase.table("deliveries").select("*").eq("order_id", order_id).execute()
            if tracking.data:
                eta = tracking.data[0].get("eta", "Coming soon")
                return f"Your order is {status}. Estimated arrival: {eta}."
                
        return f"Your order is currently {status}."

    async def get_raw_status(self, order_id: str):
        res = self.supabase.table("orders").select("*, deliveries(*)").eq("id", order_id).execute()
        return res.data[0] if res.data else None

    async def get_recent_order(self, user_id: str):
        res = self.supabase.table("orders").select("*, deliveries(*)").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        return res.data[0] if res.data else None

    async def search_order_by_id(self, user_id: str, short_id: str):
        # Remove '#' if present
        clean_id = short_id.replace("#", "").lower()
        # Search for orders belonging to the user where ID starts with the provided string
        res = self.supabase.table("orders").select("*, deliveries(*)").eq("user_id", user_id).filter("id::text", "ilike", f"{clean_id}%").execute()
        return res.data if res.data else []
