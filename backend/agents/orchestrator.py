from agents.delivery_agent import DeliveryAgent
from agents.revenue_agent import RevenueAnalyticsAgent
from agents.product_agent import ProductIntelligenceAgent
from agents.alert_agent import AlertMonitoringAgent
from agents.conversation_agent import ConversationAgent

class OrchestratorAgent:
    def __init__(self, supabase):
        self.supabase = supabase
        self.delivery_agent = DeliveryAgent(supabase)
        self.revenue_agent = RevenueAnalyticsAgent(supabase)
        self.product_agent = ProductIntelligenceAgent(supabase)
        self.alert_agent = AlertMonitoringAgent(supabase)
        self.conv_agent = ConversationAgent()

    async def handle_request(self, user_query: str, intent: str, user_id: str, role: str = "customer"):
        response = ""
        metadata = {}

        if intent == "order_status" or intent == "delivery_eta":
            order_id = self.extract_order_id(user_query)
            if order_id:
                if len(order_id) < 36: # Short ID / Prefix
                    matches = await self.delivery_agent.search_order_by_id(user_id, order_id)
                    if len(matches) == 1:
                        response = await self.conv_agent.generate_response(user_query, matches[0], intent, role)
                    elif len(matches) > 1:
                        response = f"I found {len(matches)} orders matching that partial ID. Could you be more specific?"
                        metadata = {"matches": matches}
                    else:
                        response = f"I couldn't find any orders starting with {order_id}. Could you double-check the ID?"
                else: # Full UUID
                    data = await self.delivery_agent.get_raw_status(order_id)
                    if data and data.get("deliveries"):
                        tracking = data["deliveries"][0]
                        if tracking.get("current_lat") and tracking.get("current_lng"):
                            metadata["live_coordinates"] = {"lat": tracking["current_lat"], "lng": tracking["current_lng"]}
                    
                    response = await self.conv_agent.generate_response(user_query, data, intent, role)
            else:
                recent = await self.delivery_agent.get_recent_order(user_id)
                if recent:
                    response = await self.conv_agent.generate_response(user_query, {"recent_order": recent}, "suggest_recent_order", role)
                else:
                    response = "I couldn't find any recent orders for you. Could you please provide your order ID?"
        
        elif intent == "cancel_order":
            order_id = self.extract_order_id(user_query)
            if not order_id:
                recent = await self.delivery_agent.get_recent_order(user_id)
                order_id = recent["id"] if recent else None
            
            if order_id:
                # AUTONOMOUS ACTION: Update order status to cancelled
                self.supabase.table("orders").update({"status": "cancelled"}).eq("id", order_id).execute()
                response = await self.conv_agent.generate_response(user_query, {"order_id": order_id, "action": "cancelled"}, intent, role)
            else:
                response = "Which order would you like to cancel? I couldn't find a recent one to target."

        elif intent == "refund_request":
            order_id = self.extract_order_id(user_query)
            if order_id:
                # AUTONOMOUS ACTION: Initiate refund protocol
                self.supabase.table("orders").update({"payment_status": "refunding", "status": "refunding"}).eq("id", order_id).execute()
                response = await self.conv_agent.generate_response(user_query, {"order_id": order_id, "action": "refund_initiated"}, intent, role)
            else:
                response = "Please provide the Order ID for the refund request so I can initiate the protocol."

        elif intent == "product_search":
            products = await self.product_agent.search_products(user_query)
            response = await self.conv_agent.generate_response(user_query, products, intent, role)
            if products: metadata = {"products": products}

        elif intent == "recommend_products":
            products = await self.product_agent.get_recommendations()
            response = await self.conv_agent.generate_response(user_query, products, intent, role)
            metadata = {"recommendations": products}

        elif intent == "revenue_analytics" or intent == "sales_summary":
            if role != "admin":
                response = "I'm sorry, access to financial analytics requires Command Level clearance (Admin)."
            else:
                summary = await self.revenue_agent.get_revenue_summary()
                response = await self.conv_agent.generate_response(user_query, summary, intent, role)
                metadata = summary

        elif intent == "fleet_status":
            if role != "admin":
                response = "Access to Fleet Tactical data is restricted to Command Level personnel."
            else:
                # Fetch basic fleet stats
                res = self.supabase.table("deliveries").select("status").execute()
                stats = {"total_units": len(res.data), "active": len([d for d in res.data if d["status"] != "delivered"])}
                response = await self.conv_agent.generate_response(user_query, stats, intent, role)
                metadata = stats

        else:
            response = await self.conv_agent.generate_response(user_query, {}, "general_query", role)

        # Log to AI Logs in Supabase with safety
        try:
            self.supabase.table("ai_logs").insert({
                "user_id": user_id,
                "agent_name": "Orchestrator",
                "query": user_query,
                "intent": intent,
                "response": response,
                "metadata": metadata
            }).execute()
        except Exception as e:
            print(f"[TACTICAL ERROR] Failed to log AI interaction: {e}")

        return response

    def extract_order_id(self, query: str):
        import re
        # Match full UUID
        uuid_match = re.search(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', query.lower())
        if uuid_match:
            return uuid_match.group(0)
        
        # Match short hex ID (prefix) - looking for at least 4 hex chars, optional # prefix
        short_match = re.search(r'#?([0-9a-f]{4,8})', query.lower())
        if short_match:
            return short_match.group(1) # Return just the hex part
            
        return None
