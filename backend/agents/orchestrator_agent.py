from agents import conversation_agent
from typing import Dict, Any

class OrchestratorAgent:
    def __init__(self, session):
        self.session = session

    async def route_request(self, user_id: str, message: str, role: str):
        # 1. Extract intent
        extraction = await conversation_agent.extract_intent(message)
        intent = extraction.get("intent")
        entities = extraction.get("entities", {})

        # 2. Route based on intent
        if intent == "order_status":
            from agents.delivery_agent import DeliveryAgent
            agent = DeliveryAgent(self.session)
            return await agent.get_status(entities.get("order_id"))
            
        elif intent == "product_search":
            from agents.product_agent import ProductIntelligenceAgent
            agent = ProductIntelligenceAgent(self.session)
            return await agent.search_products(entities.get("search_query"))
            
        elif intent == "sales_summary":
            if role != "admin":
                return "I'm sorry, only administrators can access sales data."
            from agents.revenue_agent import RevenueAnalyticsAgent
            agent = RevenueAnalyticsAgent(self.session)
            return await agent.get_summary()
            
        elif intent == "greeting":
            return "Hello! I am your AutonomIQ Assistant. How can I help you today?"
            
        else:
            return "I'm not sure I understand. Could you please rephrase that?"
