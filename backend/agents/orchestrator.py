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

    async def handle_request(self, user_query: str, intent: str, user_id: str, role: str = "customer", history: list = []):
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
            extracted_id = self.extract_order_id(user_query)
            lower_query = user_query.lower()
            
            # Check for negative response
            negative_signals = ["no", "denied", "stop", "don't", "dont", "negative"]
            is_negative = any(sig == lower_query.strip(".,!?") for sig in negative_signals)
            
            # Get last assistant question from history
            last_assistant_msg = next((m['content'] for m in reversed(history) if m['role'] == 'assistant'), "")
            
            if is_negative:
                if "provide" in last_assistant_msg.lower() and "order id" in last_assistant_msg.lower():
                    # Case: Order ID? -> no -> overview of new products
                    products = await self.product_agent.get_recommendations()
                    response = "Neural link maintained. No orders have been terminated. As per protocol, here is an overview of our latest high-performance products in the store."
                    metadata = {"products": products[:3]}
                    return response
                elif "confirm" in last_assistant_msg.lower() or "verification" in last_assistant_msg.lower():
                    # Case: Confirm? -> no -> Can you provide order id?
                    response = "Acknowledgment. If that was not the correct target, please provide the specific Order ID for the order you wish to terminate."
                    return response
                else:
                    response = "Understood. Cancellation protocol aborted. How else can I assist you today?"
                    return response

            order_id = None
            if not extracted_id:
                # Try to find order id in history if not in query
                for m in reversed(history):
                    id_in_history = self.extract_order_id(m['content'])
                    if id_in_history:
                        extracted_id = id_in_history
                        break

            if not extracted_id:
                recent = await self.delivery_agent.get_recent_order(user_id)
                order_id = recent["id"] if recent else None
            else:
                if len(extracted_id) < 36:
                    matches = await self.delivery_agent.search_order_by_id(user_id, extracted_id)
                    if len(matches) == 1:
                        order_id = matches[0]["id"]
                    elif len(matches) > 1:
                        return f"I found {len(matches)} orders matching that partial ID. Could you be more specific?"
                    else:
                        return f"I couldn't find any orders starting with {extracted_id}. Could you double-check the ID?"
                else:
                    order_id = extracted_id
            
            if order_id:
                # 1. Fetch Order Items for confirmation
                items_res = self.supabase.table("order_items").select("products(name), quantity").eq("order_id", order_id).execute()
                items_list = [f"{item['products']['name']} x{item['quantity']}" for item in items_res.data]
                
                # 2. Check for confirmation
                confirmation_signals = ["confirm", "yes", "proceed", "ok", "sure", "yep", "do it", "cancel it", "please cancel", "cancel that"]
                is_confirming = any(sig in lower_query for sig in confirmation_signals)
                
                reason = self.extract_reason(user_query)
                
                if is_confirming:
                    # Case: Confirm? -> yes (with or without reason)
                    if reason == "No specific reason provided.":
                        # Check history for reason if they said "yes" to "To complete... state the reason"
                        if "state the reason" in last_assistant_msg.lower() or "reason" in last_assistant_msg.lower():
                            # The current query might be the reason itself if it's not a simple "yes"
                            if len(user_query.split()) > 1:
                                reason = user_query
                            else:
                                response = "Acknowledgment received. To complete the termination protocol, please state the reason for cancellation."
                                return response
                        else:
                            response = "Acknowledgment received. To complete the termination protocol, please state the reason for cancellation."
                            return response
                    
                    # If we have reason or it's provided now
                    self.supabase.table("orders").update({
                        "status": "cancelled",
                        "cancellation_reason": reason
                    }).eq("id", order_id).execute()
                    response = await self.conv_agent.generate_response(user_query, {"order_id": order_id, "action": "cancelled", "reason": reason}, intent, role)
                else:
                    # If they provided an order ID but didn't confirm yet
                    # OR they just said "Cancel my order"
                    data = {
                        "order_id": order_id,
                        "items": items_list,
                        "instruction": f"Your order {order_id[:8]} containing {', '.join(items_list)} is identified. Please confirm if you wish to proceed with termination."
                    }
                    response = await self.conv_agent.generate_response(user_query, data, "cancel_verification", role)
            else:
                # No order ID found anywhere
                response = "To initiate termination protocols, I require a specific Order ID. Could you please provide the identification string for the target order?"

        elif intent == "refund_request":
            extracted_id = self.extract_order_id(user_query)
            order_id = None
            if extracted_id:
                if len(extracted_id) < 36:
                    matches = await self.delivery_agent.search_order_by_id(user_id, extracted_id)
                    if len(matches) == 1:
                        order_id = matches[0]["id"]
                    elif len(matches) > 1:
                        return f"I found {len(matches)} orders matching that partial ID. Could you be more specific?"
                    else:
                        return f"I couldn't find any orders starting with {extracted_id}. Could you double-check the ID?"
                else:
                    order_id = extracted_id

            if order_id:
                # AUTONOMOUS ACTION: Initiate refund protocol by updating order status
                self.supabase.table("orders").update({"status": "refunding"}).eq("id", order_id).execute()
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

    def extract_reason(self, query: str):
        # A simple heuristic: if a user is confirming and providing text, that text is the reason
        # We strip out common confirmation and filler words
        confirmation_keywords = [
            "yes", "confirm", "proceed", "cancel", "order", "my", "please", 
            "i", "want", "to", "that", "this", "it", "now", "ok", "sure", "yep"
        ]
        words = query.lower().split()
        reason_words = [w for w in words if w not in confirmation_keywords and len(w) > 2]
        
        if len(reason_words) > 0:
            return " ".join(reason_words).capitalize()
        return "No specific reason provided."
