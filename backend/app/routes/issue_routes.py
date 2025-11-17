from fastapi import APIRouter, Depends, Query, Path
from typing import List, Optional
from app.models.issue_models import (
    IssueCreate, IssueUpdate, IssueResponse, 
    VoteCreate, CommentCreate, CommentResponse
)
from app.auth.auth_middleware import get_current_user, require_employee
from app.services.issue_service import IssueService

issue_router = APIRouter(prefix="/issues", tags=["Issues"])

@issue_router.post("/", response_model=IssueResponse)
async def create_issue(
    issue: IssueCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new issue (authenticated users only)"""
    return IssueService.create_issue(issue, current_user["user_id"])

@issue_router.get("/", response_model=List[IssueResponse])
async def get_all_issues(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None)
):
    """Get all issues (public endpoint)"""
    return IssueService.get_all_issues(category, status, priority)

@issue_router.get("/my", response_model=List[IssueResponse])
async def get_my_issues(current_user: dict = Depends(get_current_user)):
    """Get current user's issues"""
    return IssueService.get_user_issues(current_user["user_id"])

@issue_router.get("/{issue_id}", response_model=IssueResponse)
async def get_issue(issue_id: str = Path(...)):
    """Get single issue by ID"""
    return IssueService.get_issue_by_id(issue_id)

@issue_router.put("/{issue_id}", response_model=IssueResponse)
async def update_issue(
    issue_id: str,
    issue_update: IssueUpdate,
    current_user: dict = Depends(require_employee)
):
    """Update issue (employees only)"""
    return IssueService.update_issue(issue_id, issue_update)

@issue_router.post("/{issue_id}/vote")
async def vote_on_issue(
    issue_id: str,
    vote: VoteCreate,
    current_user: dict = Depends(get_current_user)
):
    """Vote on issue"""
    return IssueService.vote_on_issue(issue_id, current_user["user_id"], vote.vote_type)

@issue_router.post("/{issue_id}/comments", response_model=CommentResponse)
async def add_comment(
    issue_id: str,
    comment: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add comment to issue"""
    return IssueService.add_comment(issue_id, current_user["user_id"], comment)

@issue_router.get("/{issue_id}/comments", response_model=List[CommentResponse])
async def get_issue_comments(issue_id: str):
    """Get comments for issue"""
    return IssueService.get_issue_comments(issue_id)
