from datetime import datetime, timedelta

class AlertMonitoringAgent:
    def __init__(self, supabase):
        self.supabase = supabase

    async def check_all(self):
        alerts = []
        alerts.extend(await self.check_low_stock())
        alerts.extend(await self.check_delivery_delays())
        alerts.extend(await self.check_unusual_sales())
        return alerts

    async def check_low_stock(self):
        # Checking 'inventory' table if it exists, otherwise 'products'
        # Based on user's new schema, it's 'inventory'
        res = self.supabase.table("inventory").select("*, products(name)").lt("stock_quantity", 5).execute()
        
        new_alerts = []
        for inv in res.data:
            product_name = inv.get("products", {}).get("name", "Unknown Product")
            alert_msg = f"Low stock alert: {product_name} only has {inv['stock_quantity']} left."
            
            # Log the alert
            self.supabase.table("alerts").insert({
                "type": "inventory",
                "severity": "high",
                "message": alert_msg
            }).execute()
            
            new_alerts.append(alert_msg)
            
        return new_alerts

    async def check_delivery_delays(self):
        # Check for deliveries stuck in 'out_for_delivery' for more than 4 hours
        threshold = (datetime.utcnow() - timedelta(hours=4)).isoformat()
        res = self.supabase.table("deliveries").select("*, orders(total_price)").eq("status", "out_for_delivery").lt("updated_at", threshold).execute()
        
        new_alerts = []
        for delivery in res.data:
            alert_msg = f"Delivery Delay: Order {delivery['order_id']} has been out for over 4 hours."
            self.supabase.table("alerts").insert({
                "type": "delivery",
                "severity": "high",
                "message": alert_msg
            }).execute()
            new_alerts.append(alert_msg)
        return new_alerts

    async def check_unusual_sales(self):
        # Detect if sales in last hour are 50% lower than previous hour (very simple pattern)
        now = datetime.utcnow()
        last_hour = (now - timedelta(hours=1)).isoformat()
        prev_hour = (now - timedelta(hours=2)).isoformat()
        
        res_now = self.supabase.table("orders").select("total_price").gte("created_at", last_hour).execute()
        res_prev = self.supabase.table("orders").select("total_price").gte("created_at", prev_hour).lt("created_at", last_hour).execute()
        
        total_now = sum(o["total_price"] for o in res_now.data)
        total_prev = sum(o["total_price"] for o in res_prev.data)
        
        if total_prev > 100 and total_now < (total_prev * 0.5):
            alert_msg = f"Unusual Sales Pattern: Revenue dropped from ${total_prev} to ${total_now} in the last hour."
            self.supabase.table("alerts").insert({
                "type": "revenue",
                "severity": "critical",
                "message": alert_msg
            }).execute()
            return [alert_msg]
        return []
