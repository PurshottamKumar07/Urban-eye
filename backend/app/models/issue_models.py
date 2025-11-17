
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class IssueStatus(str, Enum):
    NEW = "new"
    ACKNOWLEDGED = "acknowledged"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class IssueCategory(str, Enum):
    ROADS = "roads"
    STREETLIGHTS = "streetlights"
    WATER_SUPPLY = "water_supply"
    WASTE_MANAGEMENT = "waste_management"
    PUBLIC_TRANSPORT = "public_transport"
    PARKS = "parks"
    DRAINAGE = "drainage"
    ELECTRICITY = "electricity"
    OTHER = "other"

class IssuePriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IssueCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    category: IssueCategory
    priority: IssuePriority = IssuePriority.MEDIUM
    location_lat: float = Field(..., ge=-90, le=90)
    location_lng: float = Field(..., ge=-180, le=180)
    location_address: Optional[str] = Field(None, max_length=500)
    image_urls: Optional[List[str]] = []

class IssueUpdate(BaseModel):
    status: Optional[IssueStatus] = None
    priority: Optional[IssuePriority] = None
    resolution_notes: Optional[str] = None
    assigned_to: Optional[str] = None

class IssueResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    location_lat: float
    location_lng: float
    location_address: Optional[str]
    image_urls: List[str] = []
    resolution_notes: Optional[str] = None
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # User info (from join)
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    
    class Config:
        from_attributes = True

class VoteCreate(BaseModel):
    vote_type: str = Field(default="upvote", pattern="^(upvote|downvote)$")

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class CommentResponse(BaseModel):
    id: str
    user_id: str
    issue_id: str
    content: str
    created_at: datetime
    commenter_name: Optional[str] = None
    
    class Config:
        from_attributes = True
