from datetime import datetime, timedelta

class RevenueAnalyticsAgent:
    def __init__(self, supabase):
        self.supabase = supabase

    async def get_revenue_summary(self):
        # In a real app, we'd use a SQL function or filter by date
        # Supabase SDK filter: .gte("created_at", date)
        today = datetime.utcnow().date().isoformat()
        
        res = self.supabase.table("orders").select("total_price").eq("payment_status", "completed").gte("created_at", today).execute()
        
        daily_total = float(sum(o["total_price"] for o in res.data))
        
        # Weekly summary (last 7 days)
        last_week = (datetime.utcnow() - timedelta(days=7)).date().isoformat()
        res_week = self.supabase.table("orders").select("total_price").eq("payment_status", "completed").gte("created_at", last_week).execute()
        
        weekly_total = float(sum(o["total_price"] for o in res_week.data))
        
        return {
            "daily_revenue": daily_total,
            "weekly_total": weekly_total,
            "orders_count": int(len(res.data))
        }
