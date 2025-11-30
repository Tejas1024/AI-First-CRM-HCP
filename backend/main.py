from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from models import init_db, SessionLocal, Interaction
from agent import process_chat
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# Updated Model to match PDF Fields
class InteractionCreate(BaseModel):
    hcp_name: str
    interaction_type: str
    interaction_date: str     # Added [cite: 38]
    interaction_time: str     # Added [cite: 39]
    attendees: Optional[str]  # Added [cite: 41]
    topics_discussed: str
    materials_shared: Optional[str]    # Added [cite: 46]
    samples_distributed: Optional[str] # Added [cite: 47]
    sentiment: str
    outcomes: Optional[str]
    follow_up_actions: Optional[str]

class ChatRequest(BaseModel):
    message: str
    history: List[str] = []

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
    response = process_chat(req.message, req.history)
    return {"response": response}