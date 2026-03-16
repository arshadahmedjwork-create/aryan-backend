from datetime import datetime, timedelta

class AlertMonitoringAgent:
    def __init__(self, supabase):
        self.supabase = supabase

    async def check_all(self):
        alerts = []
        alerts.extend(await self.check_low_stock())
        alerts.extend(await self.check_delivery_delays())
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
        # Check for deliveries not completed within ETA
        # For simplicity, returning empty list in this example
        return []
