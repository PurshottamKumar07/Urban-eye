from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes.auth_routes import auth_router
from app.routes.issue_routes import issue_router
from app.routes.user_routes import user_router

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="Civic Issue Reporter MVP with JWT Authentication"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(issue_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Civic Issue Reporter MVP",
        "version": settings.API_VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
