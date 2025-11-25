from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware
import os
import json
import asyncio
from typing import List, Dict, Any, Optional

app = FastAPI(title="Croissant Task Index API")

# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# CORS configuration - allow all origins for production (can be restricted if needed)
# For production, consider restricting to specific domains
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
if "*" in allowed_origins:
    allow_origins = ["*"]
else:
    allow_origins = allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TASKS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/tasks"))

def matches_filters(task: Dict[str, Any], filters: Dict[str, Any]) -> bool:
    """Check if a task matches the given filters"""
    task_categories = task.get("task_categories", {})
    
    # Search text filter
    if filters.get("search_text"):
        search_lower = filters["search_text"].lower()
        if (search_lower not in task.get("name", "").lower() and 
            search_lower not in task.get("description", "").lower()):
            return False
    
    # Verified filter
    if filters.get("verified_only"):
        if not task_categories.get("verified", False):
            return False
    
    # Topic filter
    if filters.get("topics"):
        task_topics = [t.lower() for t in task_categories.get("topics", [])]
        filter_topics = [t.lower() for t in filters["topics"]]
        if not any(t in task_topics for t in filter_topics):
            return False
    
    # Data type filter
    if filters.get("data_types"):
        task_data_types = [dt.lower() for dt in task_categories.get("data_types", [])]
        filter_data_types = [dt.lower() for dt in filters["data_types"]]
        if not any(dt in task_data_types for dt in filter_data_types):
            return False
    
    # Model type filter
    if filters.get("model_types"):
        task_model_types = [mt.lower() for mt in task_categories.get("model_types", [])]
        filter_model_types = [mt.lower() for mt in filters["model_types"]]
        if not any(mt in task_model_types for mt in filter_model_types):
            return False
    
    # Metrics filter
    if filters.get("metrics"):
        task_metrics = [m.lower() for m in task_categories.get("metrics", [])]
        filter_metrics = [m.lower() for m in filters["metrics"]]
        if not any(m in task_metrics for m in filter_metrics):
            return False
    
    return True

@app.get("/tasks")
def list_tasks(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search_text: Optional[str] = Query(None, description="Search in name/description"),
    verified_only: bool = Query(False, description="Filter by verified code only"),
    topics: Optional[str] = Query(None, description="Comma-separated list of topics"),
    data_types: Optional[str] = Query(None, description="Comma-separated list of data types"),
    model_types: Optional[str] = Query(None, description="Comma-separated list of model types"),
    metrics: Optional[str] = Query(None, description="Comma-separated list of metrics"),
):
    """List tasks with pagination and filtering"""
    if not os.path.exists(TASKS_DIR):
        return {"tasks": [], "total": 0, "page": page, "limit": limit, "total_pages": 0}
    
    # Parse filter parameters
    filters = {
        "search_text": search_text,
        "verified_only": verified_only,
        "topics": [t.strip() for t in topics.split(",")] if topics else None,
        "data_types": [dt.strip() for dt in data_types.split(",")] if data_types else None,
        "model_types": [mt.strip() for mt in model_types.split(",")] if model_types else None,
        "metrics": [m.strip() for m in metrics.split(",")] if metrics else None,
    }
    
    # Load and filter all tasks
    all_tasks = []
    files = sorted(os.listdir(TASKS_DIR))
    
    for filename in files:
        if filename.endswith(".json"):
            file_path = os.path.join(TASKS_DIR, filename)
            try:
                with open(file_path, "r") as f:
                    data = json.load(f)
                    task_problem = data.get("cr:TaskProblem", {})
                    task_categories = task_problem.get("task_categories", {})
                    task = {
                        "id": filename.replace(".json", ""),
                        "name": task_problem.get("name", "Unknown Task"),
                        "description": task_problem.get("description", "")[:200] + "...",
                        "url": task_problem.get("url", ""),
                        "openreview_url": task_problem.get("openreview_url", ""),
                        "pdf_url": task_problem.get("pdf_url", ""),
                        "task_categories": task_categories
                    }
                    
                    # Apply filters
                    if matches_filters(task, filters):
                        all_tasks.append(task)
            except Exception as e:
                print(f"Error reading {filename}: {e}")
                continue
    
    # Paginate
    total = len(all_tasks)
    total_pages = (total + limit - 1) // limit
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_tasks = all_tasks[start_idx:end_idx]
    
    return {
        "tasks": paginated_tasks,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@app.get("/tasks/{task_id}")
def get_task(task_id: str):
    file_path = os.path.join(TASKS_DIR, f"{task_id}.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Task not found")
    
    with open(file_path, "r") as f:
        return json.load(f)

@app.post("/tasks/{task_id}/run")
async def run_task(task_id: str, platform: str = Query("local", description="Platform to run on")):
    # Mock execution
    await asyncio.sleep(2) # Simulate work
    return {"status": "success", "message": f"Task {task_id} executed successfully on {platform} (Mock)."}

@app.get("/tasks/filters/metadata")
def get_filter_metadata():
    """Return all unique values for filters"""
    tasks = []
    if not os.path.exists(TASKS_DIR):
        return {"topics": [], "data_types": [], "model_types": [], "metrics": []}
    
    all_topics = set()
    all_data_types = set()
    all_model_types = set()
    all_metrics = set()
    
    for filename in sorted(os.listdir(TASKS_DIR)):
        if filename.endswith(".json"):
            file_path = os.path.join(TASKS_DIR, filename)
            try:
                with open(file_path, "r") as f:
                    data = json.load(f)
                    task_problem = data.get("cr:TaskProblem", {})
                    categories = task_problem.get("task_categories", {})
                    
                    all_topics.update(categories.get("topics", []))
                    all_data_types.update(categories.get("data_types", []))
                    all_model_types.update(categories.get("model_types", []))
                    all_metrics.update(categories.get("metrics", []))
            except:
                continue
    
    return {
        "topics": sorted(list(all_topics)),
        "data_types": sorted(list(all_data_types)),
        "model_types": sorted(list(all_model_types)),
        "metrics": sorted(list(all_metrics))
    }

# Serve static files from frontend dist directory (after all API routes)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))
if os.path.exists(frontend_dist):
    # Mount assets directory - Vite builds put JS/CSS in assets/ subdirectory
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    
    # Serve index.html for root route
    @app.get("/")
    def serve_root():
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "Welcome to Croissant Task Index API"}
    
    # Catch-all for SPA routes - serve index.html for any non-API route
    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # Serve static files if they exist (favicon, etc.)
        static_file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(static_file_path) and os.path.isfile(static_file_path):
            return FileResponse(static_file_path)
        # Otherwise serve index.html for SPA routing
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Not found")
else:
    @app.get("/")
    def read_root():
        return {"message": "Welcome to Croissant Task Index API - Frontend not built yet"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

