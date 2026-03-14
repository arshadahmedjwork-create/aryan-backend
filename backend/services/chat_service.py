"""
Chat Service — persists chat messages to Supabase.
"""
from database import get_supabase_admin
from schemas import ChatMessageOut


async def save_message(user_id: str, message: str, role: str) -> ChatMessageOut:
    """Save a chat message."""
    admin = get_supabase_admin()
    payload = {"user_id": user_id, "message": message, "role": role}
    result = admin.table("chat_messages").insert(payload).execute()
    return ChatMessageOut(**result.data[0])


async def get_history(user_id: str, limit: int = 50) -> list[ChatMessageOut]:
    """Get chat history for a user."""
    admin = get_supabase_admin()
    result = (
        admin.table("chat_messages")
        .select("*")
        .eq("user_id", user_id)
        .order("timestamp", desc=True)
        .limit(limit)
        .execute()
    )
    messages = [ChatMessageOut(**m) for m in result.data]
    messages.reverse()  # chronological order
    return messages
