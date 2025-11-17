from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from app.database import get_supabase
from app.models.issue_models import IssueCreate, IssueUpdate, IssueResponse, CommentCreate, CommentResponse
import logging

logger = logging.getLogger(__name__)

class IssueService:
    @staticmethod
    def create_issue(issue_data: IssueCreate, user_id: str) -> IssueResponse:
        """Create new issue"""
        try:
            supabase = get_supabase()
            
            issue_dict = issue_data.dict()
            issue_dict["user_id"] = user_id
            issue_dict["status"] = "new"
            
            response = supabase.table("issues").insert(issue_dict).execute()
            
            if not response.data:
                raise HTTPException(status_code=400, detail="Failed to create issue")
            
            created_issue = response.data[0]
            
            # Get user info for response
            user_info = supabase.table("user_profiles").select("full_name, phone_number").eq("id", user_id).execute()
            
            if user_info.data:
                created_issue["reporter_name"] = user_info.data[0]["full_name"]
                created_issue["reporter_phone"] = user_info.data[0]["phone_number"]
            
            return IssueResponse(**created_issue)
            
        except Exception as e:
            logger.error(f"Create issue error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create issue")
    
    @staticmethod
    def get_all_issues(
        category: Optional[str] = None, 
        status: Optional[str] = None,
        priority: Optional[str] = None
    ) -> List[IssueResponse]:
        """Get all issues with filtering"""
        try:
            supabase = get_supabase()
            
            query = supabase.table("issues").select("""
                *,
                user_profiles!inner(full_name, phone_number)
            """)
            
            if category:
                query = query.eq("category", category)
            if status:
                query = query.eq("status", status)
            if priority:
                query = query.eq("priority", priority)
            
            response = query.order("created_at", desc=True).execute()
            
            issues = []
            for item in response.data:
                issue_dict = {**item}
                issue_dict["reporter_name"] = item["user_profiles"]["full_name"]
                issue_dict["reporter_phone"] = item["user_profiles"]["phone_number"]
                del issue_dict["user_profiles"]
                issues.append(IssueResponse(**issue_dict))
            
            return issues
            
        except Exception as e:
            logger.error(f"Get issues error: {str(e)}")
            return []
    
    @staticmethod
    def get_user_issues(user_id: str) -> List[IssueResponse]:
        """Get issues created by specific user"""
        try:
            supabase = get_supabase()
            
            response = supabase.table("issues").select("""
                *,
                user_profiles!inner(full_name, phone_number)
            """).eq("user_id", user_id).order("created_at", desc=True).execute()
            
            issues = []
            for item in response.data:
                issue_dict = {**item}
                issue_dict["reporter_name"] = item["user_profiles"]["full_name"]
                issue_dict["reporter_phone"] = item["user_profiles"]["phone_number"]
                del issue_dict["user_profiles"]
                issues.append(IssueResponse(**issue_dict))
            
            return issues
            
        except Exception as e:
            logger.error(f"Get user issues error: {str(e)}")
            return []
    
    @staticmethod
    def get_issue_by_id(issue_id: str) -> IssueResponse:
        """Get single issue by ID"""
        try:
            supabase = get_supabase()
            
            response = supabase.table("issues").select("""
                *,
                user_profiles!inner(full_name, phone_number)
            """).eq("id", issue_id).execute()
            
            if not response.data:
                raise HTTPException(status_code=404, detail="Issue not found")
            
            item = response.data[0]
            issue_dict = {**item}
            issue_dict["reporter_name"] = item["user_profiles"]["full_name"]
            issue_dict["reporter_phone"] = item["user_profiles"]["phone_number"]
            del issue_dict["user_profiles"]
            
            return IssueResponse(**issue_dict)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Get issue error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to get issue")
    
    @staticmethod
    def update_issue(issue_id: str, update_data: IssueUpdate) -> IssueResponse:
        """Update issue (for employees)"""
        try:
            supabase = get_supabase()
            
            update_dict = update_data.dict(exclude_unset=True)
            
            response = supabase.table("issues").update(update_dict).eq("id", issue_id).execute()
            
            if not response.data:
                raise HTTPException(status_code=404, detail="Issue not found")
            
            # Get updated issue with user info
            return IssueService.get_issue_by_id(issue_id)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Update issue error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to update issue")
    
    @staticmethod
    def vote_on_issue(issue_id: str, user_id: str, vote_type: str) -> Dict[str, Any]:
        """Vote on an issue"""
        try:
            supabase = get_supabase()
            
            # Check if already voted
            existing = supabase.table("votes").select("*").eq("user_id", user_id).eq("issue_id", issue_id).execute()
            
            if existing.data:
                raise HTTPException(status_code=400, detail="Already voted on this issue")
            
            # Create vote
            vote_data = {
                "user_id": user_id,
                "issue_id": issue_id,
                "vote_type": vote_type
            }
            
            response = supabase.table("votes").insert(vote_data).execute()
            
            if not response.data:
                raise HTTPException(status_code=400, detail="Failed to vote")
            
            return {"success": True, "message": "Vote recorded"}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Vote error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to vote")
    
    @staticmethod
    def add_comment(issue_id: str, user_id: str, comment_data: CommentCreate) -> CommentResponse:
        """Add comment to issue"""
        try:
            supabase = get_supabase()
            
            comment_dict = {
                "issue_id": issue_id,
                "user_id": user_id,
                "content": comment_data.content
            }
            
            response = supabase.table("comments").insert(comment_dict).execute()
            
            if not response.data:
                raise HTTPException(status_code=400, detail="Failed to add comment")
            
            comment = response.data[0]
            
            # Get commenter name
            user_info = supabase.table("user_profiles").select("full_name").eq("id", user_id).execute()
            if user_info.data:
                comment["commenter_name"] = user_info.data[0]["full_name"]
            
            return CommentResponse(**comment)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Add comment error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to add comment")
    
    @staticmethod
    def get_issue_comments(issue_id: str) -> List[CommentResponse]:
        """Get comments for an issue"""
        try:
            supabase = get_supabase()
            
            response = supabase.table("comments").select("*, user_profiles!inner(full_name)").eq("issue_id", issue_id).order("created_at", desc=True).execute()
            
            comments = []
            for item in response.data:
                comment_dict = {**item}
                comment_dict["commenter_name"] = item["user_profiles"]["full_name"]
                del comment_dict["user_profiles"]
                comments.append(CommentResponse(**comment_dict))
            
            return comments
            
        except Exception as e:
            logger.error(f"Get comments error: {str(e)}")
            return []
