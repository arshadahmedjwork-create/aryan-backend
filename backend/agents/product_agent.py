class ProductIntelligenceAgent:
    def __init__(self, supabase):
        self.supabase = supabase

    async def search_products(self, query: str):
        # Supabase ilike search
        res = self.supabase.table("products").select("*").ilike("name", f"%{query}%").execute()
        return res.data

    async def get_recommendations(self):
        # Returns products with low stock or featured
        # For simplicity, just return all products for now
        res = self.supabase.table("products").select("*").limit(5).execute()
        return res.data
