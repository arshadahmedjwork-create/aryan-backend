"""
Agent Router — routes user queries to the appropriate AI agent based on intent.
Uses keyword-based intent detection with LLM fallback.
"""
from schemas import UserOut, UserRole


# ── Intent Detection ───────────────────────────────────────────────────────

INTENT_KEYWORDS = {
    "conversation": [
        "hello", "hi", "hey", "help", "thanks", "thank", "bye",
        "what", "how", "who", "general", "chat",
    ],
    "analytics": [
        "revenue", "sales", "sold", "top", "best", "performance",
        "trend", "analytics", "report", "profit", "earnings",
        "drop", "decline", "growth", "compare",
    ],
    "operations": [
        "delivery", "deliver", "ship", "shipping", "transit",
        "driver", "logistics", "dispatch", "package", "track",
        "delay", "delayed", "late",
    ],
    "loyalty": [
        "nps", "feedback", "satisfaction", "survey", "loyalty",
        "promoter", "score", "review", "rating", "happy", "unhappy",
    ],
    "anomaly": [
        "anomaly", "unusual", "spike", "alert", "warning",
        "abnormal", "unexpected", "issue", "problem", "inventory",
        "stock", "low stock",
    ],
}


def detect_intent(message: str) -> str:
    """Detect the intent of a user message using keyword matching."""
    lower = message.lower()
    scores: dict[str, int] = {}
    for intent, keywords in INTENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in lower)
        if score > 0:
            scores[intent] = score

    if not scores:
        return "conversation"

    # Check for order-specific queries from customers
    if any(word in lower for word in ["order", "status", "my order", "where"]):
        if any(word in lower for word in ["deliver", "ship", "track"]):
            return "operations"
        return "conversation"

    return max(scores, key=scores.get)


def route_to_agent(message: str, user: UserOut) -> str:
    """Route a message to the appropriate agent based on intent and user role."""
    intent = detect_intent(message)

    # Role-based routing overrides
    if user.role == UserRole.customer:
        # Customers primarily use conversation and operations agents
        if intent in ("analytics", "anomaly"):
            return "conversation"
        return intent

    elif user.role == UserRole.owner:
        # Owners can use all agents
        return intent

    elif user.role == UserRole.operations_manager:
        # Ops managers primarily use operations agent
        if intent in ("analytics", "loyalty"):
            return "operations"
        return intent

    return intent
