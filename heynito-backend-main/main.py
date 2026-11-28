import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from backend.routes.chat_routes import router as chat_router
from backend.routes.conversation_routes import router as conversation_router
from backend.routes.document_routes import router as document_router
from backend.routes.auth_routes import router as auth_router
from backend.routes.payment_routes import router as payment_router
import uuid
import logging
from fastapi import Request
import time

# http://127.0.0.1:8000/docs?utm_source=chatgpt.com
# .\myenv\Scripts\python.exe -m uvicorn main:app --reload
# .\myenv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000 --workers 4

# FastAPI application's instance
app = FastAPI(
    
    title="HeyNito Chatbot API",
    version="1.0.0"
)

# cors config added so that browser doesnt block requests from netlify.
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)

# to make the request id tracking -- add the uuuid to evevry incoming request !! 
@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.perf_counter()

    try:
        response = await call_next(request)
        duration = time.perf_counter() - start_time

        logger.info(
            "request_id=%s method=%s path=%s status=%s duration=%.3fs",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            duration,
        )

        response.headers["X-Request-ID"] = request_id
        return response

    except Exception:
        logger.exception(
            "request_id=%s method=%s path=%s failed",
            request_id,
            request.method,
            request.url.path,
        )
        raise

# Backend status check karne ke liye
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Alag files mein defined APIs ko app se connect karna
app.include_router(chat_router)
app.include_router(conversation_router)
app.include_router(document_router)
app.include_router(auth_router)
app.include_router(payment_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run( "main:app", host="127.0.0.1", port=8000, reload=True )
