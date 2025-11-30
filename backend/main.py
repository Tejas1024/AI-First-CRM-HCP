from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from models import init_db, SessionLocal, Interaction
from agent import process_chat
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
@app.on_event("startup")
def on_startup():
    init_db()

# --- Pydantic Models ---
class InteractionCreate(BaseModel):
    hcp_name: str
    interaction_type: str
    attendees: Optional[str]
    topics_discussed: str
    materials_shared: Optional[str]
    sentiment: str
    outcomes: Optional[str]
    follow_up_actions: Optional[str]

class ChatRequest(BaseModel):
    message: str
    history: List[str] = []

# --- Routes ---

@app.post("/interactions/")
def create_interaction(interaction: InteractionCreate):
    db = SessionLocal()
    db_item = Interaction(**interaction.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    db.close()
    return db_item

@app.get("/interactions/")
def get_interactions():
    db = SessionLocal()
    items = db.query(Interaction).all()
    db.close()
    return items

@app.post("/chat/")
def chat_with_agent(req: ChatRequest):
    # This connects the Frontend Chat to the LangGraph Agent [cite: 15]
    response = process_chat(req.message, req.history)
    return {"response": response}