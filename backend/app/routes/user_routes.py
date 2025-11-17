from fastapi import APIRouter, Depends
from app.auth.auth_middleware import get_current_user, require_employee
from app.database import get_supabase
from app.models.user_models import UserResponse

user_router = APIRouter(prefix="/user", tags=["User"])

@user_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile"""
    try:
        supabase = get_supabase()
        response = supabase.table("user_profiles").select("*").eq("id", current_user["user_id"]).execute()
        
        if not response.data:
            return {"error": "User not found"}
        
        user = response.data[0]
        return {
            "id": user["id"],
            "full_name": user["full_name"],
            "phone_number": user["phone_number"],
            "role": user["role"],
            "department": user.get("department"),
            "status": user["status"]
        }
    except Exception as e:
        return {"error": str(e)}

@user_router.get("/dashboard/citizen")
async def citizen_dashboard(current_user: dict = Depends(get_current_user)):
    """Citizen dashboard - view issues statistics"""
    try:
        supabase = get_supabase()
        
        # Get all issues stats
        all_issues = supabase.table("issues").select("*").execute()
        my_issues = supabase.table("issues").select("*").eq("user_id", current_user["user_id"]).execute()
        my_votes = supabase.table("votes").select("*").eq("user_id", current_user["user_id"]).execute()
        
        # Calculate stats
        total_issues = len(all_issues.data)
        my_issues_count = len(my_issues.data)
        my_votes_count = len(my_votes.data)
        
        # Group by status
        status_count = {}
        for issue in all_issues.data:
            status = issue.get("status", "unknown")
            status_count[status] = status_count.get(status, 0) + 1
        
        # Group by category
        category_count = {}
        for issue in all_issues.data:
            category = issue.get("category", "other")
            category_count[category] = category_count.get(category, 0) + 1
        
        return {
            "role": "citizen",
            "user_id": current_user["user_id"],
            "stats": {
                "total_issues": total_issues,
                "my_issues": my_issues_count,
                "my_votes": my_votes_count,
                "issues_by_status": status_count,
                "issues_by_category": category_count
            },
            "recent_issues": all_issues.data[:5]
        }
        
    except Exception as e:
        return {"error": str(e)}

@user_router.get("/dashboard/government")
async def government_dashboard(current_user: dict = Depends(require_employee)):
    """Government dashboard - manage issues"""
    try:
        supabase = get_supabase()
        
        # Get all issues
        all_issues = supabase.table("issues").select("*").execute()
        
        # Calculate stats
        total_issues = len(all_issues.data)
        new_issues = [i for i in all_issues.data if i.get("status") == "new"]
        in_progress = [i for i in all_issues.data if i.get("status") == "in_progress"]
        resolved = [i for i in all_issues.data if i.get("status") == "resolved"]
        
        # Priority breakdown
        priority_count = {}
        for issue in all_issues.data:
            priority = issue.get("priority", "medium")
            priority_count[priority] = priority_count.get(priority, 0) + 1
        
        # Category breakdown
        category_count = {}
        for issue in all_issues.data:
            category = issue.get("category", "other")
            category_count[category] = category_count.get(category, 0) + 1
        
        return {
            "role": "employee",
            "user_id": current_user["user_id"],
            "stats": {
                "total_issues": total_issues,
                "new_issues": len(new_issues),
                "in_progress": len(in_progress),
                "resolved": len(resolved),
                "by_priority": priority_count,
                "by_category": category_count
            },
            "pending_action": new_issues[:10],  # First 10 new issues
            "high_priority": [i for i in all_issues.data if i.get("priority") == "high"][:5]
        }
        
    except Exception as e:
        return {"error": str(e)}
