from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import hashlib
import re
from pathlib import Path
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
import uuid
from datetime import datetime, timezone, timedelta
from enum import Enum
import boto3
from botocore.exceptions import ClientError

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="AI Usage Analyzer", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# S3 client (optional)
s3_client = None
try:
    if os.environ.get('AWS_ACCESS_KEY_ID'):
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
            region_name=os.environ.get('AWS_REGION', 'us-east-1')
        )
except Exception as e:
    logging.warning(f"S3 client not initialized: {e}")

# Enums
class AIProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    COHERE = "cohere"
    OTHER = "other"

class EventType(str, Enum):
    TEXT_GENERATION = "text_generation"
    IMAGE_GENERATION = "image_generation"
    EMBEDDING = "embedding"
    FINE_TUNING = "fine_tuning"
    OTHER = "other"

class UserRole(str, Enum):
    ADMIN = "admin"
    AUDITOR = "auditor"
    DEVELOPER = "developer"

# Models
class AIUsageEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    provider: AIProvider
    model: str
    event_type: EventType
    user_id: str
    service: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    cost_usd: Optional[float] = None
    prompt_hash: Optional[str] = None
    response_hash: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    has_pii: Optional[bool] = False
    redacted_prompt: Optional[str] = None
    s3_key: Optional[str] = None

class AIUsageEventCreate(BaseModel):
    provider: AIProvider
    model: str
    event_type: EventType
    user_id: str
    service: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    cost_usd: Optional[float] = None
    prompt: Optional[str] = None
    response: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AIUsageEventBatch(BaseModel):
    events: List[AIUsageEventCreate]

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    role: UserRole
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyticsResponse(BaseModel):
    total_events: int
    total_cost: float
    events_last_24h: int
    cost_last_24h: float
    top_models: List[Dict[str, Any]]
    top_users: List[Dict[str, Any]]
    top_services: List[Dict[str, Any]]
    usage_over_time: List[Dict[str, Any]]

# Helper functions
def detect_pii(text: str) -> bool:
    """Basic PII detection using regex patterns"""
    if not text:
        return False
    
    pii_patterns = [
        r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
        r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',  # Credit Card
        r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',  # Phone Number
    ]
    
    for pattern in pii_patterns:
        if re.search(pattern, text):
            return True
    return False

def redact_pii(text: str) -> str:
    """Basic PII redaction"""
    if not text:
        return text
    
    redacted = text
    redacted = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[REDACTED-SSN]', redacted)
    redacted = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[REDACTED-EMAIL]', redacted)
    redacted = re.sub(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b', '[REDACTED-CARD]', redacted)
    redacted = re.sub(r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', '[REDACTED-PHONE]', redacted)
    
    return redacted

def calculate_hash(text: str) -> str:
    """Calculate SHA-256 hash of text"""
    if not text:
        return None
    return hashlib.sha256(text.encode()).hexdigest()

async def store_to_s3(content: str, key: str) -> bool:
    """Store content to S3 bucket"""
    if not s3_client:
        return False
    
    try:
        bucket = os.environ.get('S3_BUCKET_NAME')
        if not bucket:
            return False
            
        s3_client.put_object(
            Bucket=bucket,
            Key=key,
            Body=content.encode(),
            ServerSideEncryption='AES256'
        )
        return True
    except ClientError as e:
        logging.error(f"S3 upload failed: {e}")
        return False

async def process_usage_event(event_data: AIUsageEventCreate) -> AIUsageEvent:
    """Process and enhance usage event"""
    event_dict = event_data.dict()
    
    # Process prompt and response
    prompt = event_dict.pop('prompt', None)
    response = event_dict.pop('response', None)
    
    # Create event object
    event = AIUsageEvent(**event_dict)
    
    # PII detection and redaction
    if prompt:
        event.has_pii = detect_pii(prompt)
        event.redacted_prompt = redact_pii(prompt) if event.has_pii else prompt
        event.prompt_hash = calculate_hash(prompt)
        
        # Store full prompt to S3 if configured
        if s3_client and prompt:
            s3_key = f"prompts/{event.id}.txt"
            if await store_to_s3(prompt, s3_key):
                event.s3_key = s3_key
    
    if response:
        event.response_hash = calculate_hash(response)
    
    # Calculate cost if not provided
    if event.cost_usd is None and event.total_tokens:
        # Basic cost estimation (can be enhanced)
        cost_per_token = 0.00002  # $0.02 per 1K tokens
        event.cost_usd = event.total_tokens * cost_per_token
    
    return event

# Authentication (basic for MVP)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Basic authentication - for MVP, return a default admin user"""
    # In production, validate JWT token here
    return User(
        username="admin",
        email="admin@example.com",
        role=UserRole.ADMIN
    )

# API Routes
@api_router.get("/")
async def root():
    return {"message": "AI Usage Analyzer API", "version": "1.0.0"}

@api_router.post("/v1/ai-usage/events", response_model=AIUsageEvent)
async def create_usage_event(
    event_data: AIUsageEventCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a single AI usage event"""
    try:
        event = await process_usage_event(event_data)
        
        # Store in MongoDB
        await db.ai_usage_events.insert_one(event.dict())
        
        return event
    except Exception as e:
        logging.error(f"Error creating usage event: {e}")
        raise HTTPException(status_code=500, detail="Failed to create usage event")

@api_router.post("/v1/ai-usage/events/batch", response_model=List[AIUsageEvent])
async def create_usage_events_batch(
    batch_data: AIUsageEventBatch,
    current_user: User = Depends(get_current_user)
):
    """Create multiple AI usage events in batch"""
    try:
        events = []
        for event_data in batch_data.events:
            event = await process_usage_event(event_data)
            events.append(event)
        
        # Batch insert to MongoDB
        if events:
            await db.ai_usage_events.insert_many([event.dict() for event in events])
        
        return events
    except Exception as e:
        logging.error(f"Error creating batch usage events: {e}")
        raise HTTPException(status_code=500, detail="Failed to create batch usage events")

@api_router.get("/v1/ai-usage/events", response_model=List[AIUsageEvent])
async def get_usage_events(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    provider: Optional[AIProvider] = None,
    model: Optional[str] = None,
    user_id: Optional[str] = None,
    service: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user)
):
    """Get AI usage events with filtering"""
    try:
        query = {}
        
        if provider:
            query["provider"] = provider
        if model:
            query["model"] = model
        if user_id:
            query["user_id"] = user_id
        if service:
            query["service"] = service
        
        if start_date or end_date:
            date_query = {}
            if start_date:
                date_query["$gte"] = start_date
            if end_date:
                date_query["$lte"] = end_date
            query["timestamp"] = date_query
        
        events = await db.ai_usage_events.find(query).skip(offset).limit(limit).sort("timestamp", -1).to_list(length=None)
        return [AIUsageEvent(**event) for event in events]
        
    except Exception as e:
        logging.error(f"Error retrieving usage events: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve usage events")

@api_router.get("/v1/ai-usage/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    days: int = Query(7, ge=1, le=365),
    current_user: User = Depends(get_current_user)
):
    """Get analytics for AI usage"""
    try:
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        last_24h = datetime.now(timezone.utc) - timedelta(hours=24)
        
        # Aggregation pipelines
        total_events = await db.ai_usage_events.count_documents({})
        total_cost_result = await db.ai_usage_events.aggregate([
            {"$group": {"_id": None, "total": {"$sum": "$cost_usd"}}}
        ]).to_list(1)
        total_cost = total_cost_result[0]["total"] if total_cost_result else 0.0
        
        events_last_24h = await db.ai_usage_events.count_documents({
            "timestamp": {"$gte": last_24h}
        })
        
        cost_last_24h_result = await db.ai_usage_events.aggregate([
            {"$match": {"timestamp": {"$gte": last_24h}}},
            {"$group": {"_id": None, "total": {"$sum": "$cost_usd"}}}
        ]).to_list(1)
        cost_last_24h = cost_last_24h_result[0]["total"] if cost_last_24h_result else 0.0
        
        # Top models
        top_models = await db.ai_usage_events.aggregate([
            {"$match": {"timestamp": {"$gte": start_date}}},
            {"$group": {
                "_id": {"provider": "$provider", "model": "$model"},
                "count": {"$sum": 1},
                "cost": {"$sum": "$cost_usd"}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 5},
            {"$project": {
                "provider": "$_id.provider",
                "model": "$_id.model",
                "count": 1,
                "cost": 1,
                "_id": 0
            }}
        ]).to_list(5)
        
        # Top users
        top_users = await db.ai_usage_events.aggregate([
            {"$match": {"timestamp": {"$gte": start_date}}},
            {"$group": {
                "_id": "$user_id",
                "count": {"$sum": 1},
                "cost": {"$sum": "$cost_usd"}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 5},
            {"$project": {
                "user_id": "$_id",
                "count": 1,
                "cost": 1,
                "_id": 0
            }}
        ]).to_list(5)
        
        # Top services
        top_services = await db.ai_usage_events.aggregate([
            {"$match": {"timestamp": {"$gte": start_date}}},
            {"$group": {
                "_id": "$service",
                "count": {"$sum": 1},
                "cost": {"$sum": "$cost_usd"}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 5},
            {"$project": {
                "service": "$_id",
                "count": 1,
                "cost": 1,
                "_id": 0
            }}
        ]).to_list(5)
        
        # Usage over time (daily)
        usage_over_time = await db.ai_usage_events.aggregate([
            {"$match": {"timestamp": {"$gte": start_date}}},
            {"$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$timestamp"
                    }
                },
                "count": {"$sum": 1},
                "cost": {"$sum": "$cost_usd"}
            }},
            {"$sort": {"_id": 1}},
            {"$project": {
                "date": "$_id",
                "count": 1,
                "cost": 1,
                "_id": 0
            }}
        ]).to_list(days)
        
        return AnalyticsResponse(
            total_events=total_events,
            total_cost=total_cost,
            events_last_24h=events_last_24h,
            cost_last_24h=cost_last_24h,
            top_models=top_models,
            top_users=top_users,
            top_services=top_services,
            usage_over_time=usage_over_time
        )
        
    except Exception as e:
        logging.error(f"Error retrieving analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics")

@api_router.post("/v1/ai-usage/generate-demo-data")
async def generate_demo_data(
    count: int = Query(50, ge=1, le=1000),
    current_user: User = Depends(get_current_user)
):
    """Generate demo AI usage data"""
    try:
        import random
        from datetime import datetime, timezone, timedelta
        
        providers = [AIProvider.OPENAI, AIProvider.ANTHROPIC, AIProvider.GOOGLE]
        models = {
            AIProvider.OPENAI: ["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo"],
            AIProvider.ANTHROPIC: ["claude-3-opus", "claude-3-sonnet", "claude-instant"],
            AIProvider.GOOGLE: ["gemini-pro", "gemini-pro-vision", "palm-2"]
        }
        services = ["web-app", "api-service", "chatbot", "content-generator", "analytics"]
        users = ["user-001", "user-002", "user-003", "user-004", "user-005"]
        
        demo_events = []
        
        for _ in range(count):
            provider = random.choice(providers)
            model = random.choice(models[provider])
            service = random.choice(services)
            user_id = random.choice(users)
            
            # Random timestamp within last 7 days
            days_ago = random.randint(0, 7)
            hours_ago = random.randint(0, 23)
            timestamp = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=hours_ago)
            
            prompt_tokens = random.randint(10, 2000)
            completion_tokens = random.randint(5, 1000)
            total_tokens = prompt_tokens + completion_tokens
            cost_usd = total_tokens * 0.00002 * random.uniform(0.8, 1.2)
            
            event_data = AIUsageEventCreate(
                provider=provider,
                model=model,
                event_type=EventType.TEXT_GENERATION,
                user_id=user_id,
                service=service,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                cost_usd=round(cost_usd, 4),
                prompt=f"Sample prompt for {service} using {model}",
                response=f"Sample response from {model}",
                metadata={"demo": True, "batch_id": str(uuid.uuid4())}
            )
            
            event = await process_usage_event(event_data)
            event.timestamp = timestamp  # Override timestamp
            demo_events.append(event)
        
        # Insert demo data
        if demo_events:
            await db.ai_usage_events.insert_many([event.dict() for event in demo_events])
        
        return {"message": f"Generated {len(demo_events)} demo events", "count": len(demo_events)}
        
    except Exception as e:
        logging.error(f"Error generating demo data: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate demo data")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()