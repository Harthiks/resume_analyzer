"""
AI Career Assistant chatbot routes.
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from middleware.auth_middleware import get_current_user
from services.ai_service import chat_with_assistant
from config.database import get_collection
from schemas.analysis_schema import ChatMessage
from bson import ObjectId

router = APIRouter(prefix="/chat", tags=["Chat Assistant"])

@router.post("/message")
async def send_message(data: ChatMessage, current_user: dict = Depends(get_current_user)):
    col = get_collection("chat_history")
    history = []
    conv_id = data.conversation_id
    if conv_id:
        try:
            chat = await col.find_one({"_id": ObjectId(conv_id), "user_id": current_user["_id"]})
            if chat:
                history = chat.get("messages", [])
        except Exception:
            pass

    response = await chat_with_assistant(data.message, history)

    new_messages = history + [
        {"role": "user", "content": data.message, "timestamp": str(datetime.now(timezone.utc))},
        {"role": "assistant", "content": response, "timestamp": str(datetime.now(timezone.utc))},
    ]

    if conv_id:
        try:
            await col.update_one({"_id": ObjectId(conv_id)}, {"$set": {"messages": new_messages, "updated_at": datetime.now(timezone.utc)}})
        except Exception:
            conv_id = None

    if not conv_id:
        result = await col.insert_one({
            "user_id": current_user["_id"],
            "messages": new_messages,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        })
        conv_id = str(result.inserted_id)

    return {"success": True, "data": {"response": response, "conversation_id": str(conv_id)}}

@router.get("/history")
async def chat_history(current_user: dict = Depends(get_current_user)):
    col = get_collection("chat_history")
    chats = await col.find({"user_id": current_user["_id"]}).sort("updated_at", -1).limit(10).to_list(10)
    for c in chats:
        c["id"] = str(c.pop("_id"))
        c["user_id"] = str(c.get("user_id", ""))
        c["created_at"] = str(c.get("created_at", ""))
        c["updated_at"] = str(c.get("updated_at", ""))
    return {"success": True, "data": chats}
