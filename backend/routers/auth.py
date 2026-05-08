"""
Authentication routes — signup, login, profile.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from bson import ObjectId
from config.database import get_collection
from schemas.user_schema import UserSignup, UserLogin, UserUpdate, PasswordChange
from utils.jwt_handler import create_access_token
from utils.password_handler import hash_password, verify_password
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "user"),
        "phone": user.get("phone", ""),
        "location": user.get("location", ""),
        "linkedin": user.get("linkedin", ""),
        "github": user.get("github", ""),
        "website": user.get("website", ""),
        "bio": user.get("bio", ""),
        "title": user.get("title", ""),
        "created_at": str(user.get("created_at", "")),
    }

@router.post("/signup")
async def signup(data: UserSignup):
    col = get_collection("users")
    existing = await col.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "name": data.name,
        "email": data.email.lower(),
        "password": hash_password(data.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await col.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    token = create_access_token({"sub": str(result.inserted_id)})
    return {"success": True, "message": "Account created successfully", "data": {"access_token": token, "token_type": "bearer", "user": serialize_user(user_doc)}}

@router.post("/login")
async def login(data: UserLogin):
    col = get_collection("users")
    user = await col.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user["_id"])})
    return {"success": True, "message": "Login successful", "data": {"access_token": token, "token_type": "bearer", "user": serialize_user(user)}}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"success": True, "data": serialize_user(current_user)}

@router.put("/profile")
async def update_profile(data: UserUpdate, current_user: dict = Depends(get_current_user)):
    col = get_collection("users")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    await col.update_one({"_id": current_user["_id"]}, {"$set": update_data})
    updated = await col.find_one({"_id": current_user["_id"]})
    return {"success": True, "message": "Profile updated", "data": serialize_user(updated)}

@router.put("/change-password")
async def change_password(data: PasswordChange, current_user: dict = Depends(get_current_user)):
    if not verify_password(data.current_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    col = get_collection("users")
    await col.update_one({"_id": current_user["_id"]}, {"$set": {"password": hash_password(data.new_password), "updated_at": datetime.now(timezone.utc)}})
    return {"success": True, "message": "Password updated successfully"}
