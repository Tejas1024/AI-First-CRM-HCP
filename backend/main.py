# main.py - Complete FastAPI Backend with LangGraph Agent

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from groq import Groq
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from typing_extensions import TypedDict
import json

# Database imports (using SQLAlchemy)
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Database Setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/crm_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class HCP(Base):
    __tablename__ = "hcps"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    specialty = Column(String)
    hospital = Column(String)
    email = Column(String)
    phone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Interaction(Base):
    __tablename__ = "interactions"
    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"))
    interaction_type = Column(String)
    notes = Column(Text)
    products_discussed = Column(String, nullable=True)
    follow_up_required = Column(Boolean, default=False)
    followup_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# Pydantic Models
class HCPCreate(BaseModel):
    name: str
    specialty: str
    hospital: str
    email: str
    phone: str

class InteractionCreate(BaseModel):
    hcp_id: int
    interaction_type: str
    notes: str
    products_discussed: Optional[str] = None
    follow_up_required: bool = False

class InteractionUpdate(BaseModel):
    interaction_type: Optional[str] = None
    notes: Optional[str] = None
    products_discussed: Optional[str] = None
    follow_up_required: Optional[bool] = None

class ChatMessage(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

# Initialize FastAPI
app = FastAPI(title="AI-First CRM HCP Module")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY"))

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==================== LANGGRAPH TOOLS ====================

# Tool 1: Log Interaction
def log_interaction_tool(hcp_name: str, interaction_type: str, notes: str, products: str = "") -> str:
    """
    Logs an interaction with an HCP. Extracts entities and summarizes the interaction.
    
    Args:
        hcp_name: Name of the healthcare professional
        interaction_type: Type of interaction (visit, call, email, webinar)
        notes: Detailed notes about the interaction
        products: Products discussed during interaction
    """
    db = SessionLocal()
    try:
        # Find HCP by name
        hcp = db.query(HCP).filter(HCP.name.ilike(f"%{hcp_name}%")).first()
        if not hcp:
            return f"Error: HCP with name '{hcp_name}' not found."
        
        # Use LLM to summarize and extract entities
        prompt = f"""Summarize this HCP interaction and extract key entities:
        
Interaction Type: {interaction_type}
Notes: {notes}
Products: {products}

Provide a concise summary (max 2 sentences) and list key points."""
        
        response = groq_client.chat.completions.create(
            model="gemma2-9b-it",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200
        )
        
        summary = response.choices[0].message.content
        
        # Create interaction
        interaction = Interaction(
            hcp_id=hcp.id,
            interaction_type=interaction_type,
            notes=f"{notes}\n\nAI Summary: {summary}",
            products_discussed=products,
            follow_up_required=False
        )
        db.add(interaction)
        db.commit()
        db.refresh(interaction)
        
        return f"Interaction logged successfully (ID: {interaction.id}). {summary}"
    finally:
        db.close()

# Tool 2: Edit Interaction
def edit_interaction_tool(interaction_id: int, field: str, new_value: str) -> str:
    """
    Edits an existing interaction record.
    
    Args:
        interaction_id: ID of the interaction to edit
        field: Field to update (notes, interaction_type, products_discussed)
        new_value: New value for the field
    """
    db = SessionLocal()
    try:
        interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not interaction:
            return f"Error: Interaction {interaction_id} not found."
        
        if field == "notes":
            interaction.notes = new_value
        elif field == "interaction_type":
            interaction.interaction_type = new_value
        elif field == "products_discussed":
            interaction.products_discussed = new_value
        else:
            return f"Error: Invalid field '{field}'. Use: notes, interaction_type, or products_discussed"
        
        interaction.updated_at = datetime.utcnow()
        db.commit()
        
        return f"Interaction {interaction_id} updated successfully. {field} changed to: {new_value}"
    finally:
        db.close()

# Tool 3: Search HCP
def search_hcp_tool(query: str) -> str:
    """
    Searches for HCPs by name, specialty, or hospital.
    
    Args:
        query: Search query (name, specialty, or hospital)
    """
    db = SessionLocal()
    try:
        hcps = db.query(HCP).filter(
            (HCP.name.ilike(f"%{query}%")) |
            (HCP.specialty.ilike(f"%{query}%")) |
            (HCP.hospital.ilike(f"%{query}%"))
        ).limit(10).all()
        
        if not hcps:
            return f"No HCPs found matching '{query}'"
        
        results = []
        for hcp in hcps:
            results.append(f"Dr. {hcp.name} - {hcp.specialty} at {hcp.hospital}")
        
        return "Found HCPs:\n" + "\n".join(results)
    finally:
        db.close()

# Tool 4: Generate Insights
def generate_insights_tool(hcp_id: int, days: int = 30) -> str:
    """
    Generates AI insights about interactions with a specific HCP.
    
    Args:
        hcp_id: ID of the HCP
        days: Number of days to analyze (default 30)
    """
    db = SessionLocal()
    try:
        interactions = db.query(Interaction).filter(
            Interaction.hcp_id == hcp_id
        ).order_by(Interaction.created_at.desc()).limit(10).all()
        
        if not interactions:
            return f"No interactions found for HCP ID {hcp_id}"
        
        # Compile interaction data
        interaction_text = "\n".join([
            f"- {i.interaction_type}: {i.notes[:100]}... (Products: {i.products_discussed})"
            for i in interactions
        ])
        
        prompt = f"""Analyze these HCP interactions and provide insights:

{interaction_text}

Provide:
1. Engagement level (High/Medium/Low)
2. Key interests and concerns
3. Recommended next steps
4. Products to focus on"""
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=400
        )
        
        return response.choices[0].message.content
    finally:
        db.close()

# Tool 5: Schedule Follow-up
def schedule_followup_tool(interaction_id: int, followup_date: str) -> str:
    """
    Schedules a follow-up for an interaction.
    
    Args:
        interaction_id: ID of the interaction
        followup_date: Date for follow-up (YYYY-MM-DD format)
    """
    db = SessionLocal()
    try:
        interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not interaction:
            return f"Error: Interaction {interaction_id} not found."
        
        try:
            followup_dt = datetime.strptime(followup_date, "%Y-%m-%d")
        except ValueError:
            return "Error: Invalid date format. Use YYYY-MM-DD"
        
        interaction.follow_up_required = True
        interaction.followup_date = followup_dt
        db.commit()
        
        return f"Follow-up scheduled for {followup_date} (Interaction ID: {interaction_id})"
    finally:
        db.close()

# ==================== LANGGRAPH AGENT ====================

class AgentState(TypedDict):
    messages: List[Dict[str, str]]
    tool_calls: List[Dict[str, Any]]
    next_action: str

def create_agent():
    """Creates the LangGraph agent with all tools"""
    
    tools = {
        "log_interaction": log_interaction_tool,
        "edit_interaction": edit_interaction_tool,
        "search_hcp": search_hcp_tool,
        "generate_insights": generate_insights_tool,
        "schedule_followup": schedule_followup_tool
    }
    
    def call_llm(state: AgentState) -> AgentState:
        """LLM node that decides which tool to call"""
        messages = state["messages"]
        
        # Create system prompt with tool descriptions
        system_prompt = """You are an AI assistant for a CRM system helping sales reps manage HCP interactions.

Available tools:
1. log_interaction(hcp_name, interaction_type, notes, products) - Log new interactions
2. edit_interaction(interaction_id, field, new_value) - Edit existing interactions
3. search_hcp(query) - Search for HCPs
4. generate_insights(hcp_id, days) - Generate insights about HCP engagement
5. schedule_followup(interaction_id, followup_date) - Schedule follow-ups

When the user describes an interaction, extract details and use log_interaction.
Be conversational and helpful. Ask clarifying questions if needed."""
        
        prompt = system_prompt + "\n\nConversation:\n" + "\n".join([
            f"{m['role']}: {m['content']}" for m in messages
        ])
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": messages[-1]["content"]}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        response_text = response.choices[0].message.content
        
        # Simple tool call detection
        if "log_interaction" in response_text.lower() or "met with" in messages[-1]["content"].lower():
            state["next_action"] = "log"
        elif "search" in messages[-1]["content"].lower():
            state["next_action"] = "search"
        else:
            state["next_action"] = "respond"
        
        state["messages"].append({"role": "assistant", "content": response_text})
        return state
    
    def route_action(state: AgentState) -> str:
        """Routes to appropriate tool or ends"""
        action = state.get("next_action", "respond")
        if action == "respond":
            return END
        return action
    
    # Create graph
    workflow = StateGraph(AgentState)
    workflow.add_node("llm", call_llm)
    workflow.set_entry_point("llm")
    workflow.add_conditional_edges("llm", route_action)
    
    return workflow.compile()

agent = create_agent()

# ==================== API ENDPOINTS ====================

@app.get("/")
def read_root():
    return {"message": "AI-First CRM HCP Module API", "version": "1.0"}

# HCP Endpoints
@app.post("/api/hcps")
def create_hcp(hcp: HCPCreate):
    db = SessionLocal()
    try:
        db_hcp = HCP(**hcp.dict())
        db.add(db_hcp)
        db.commit()
        db.refresh(db_hcp)
        return db_hcp
    finally:
        db.close()

@app.get("/api/hcps")
def get_hcps():
    db = SessionLocal()
    try:
        hcps = db.query(HCP).all()
        return hcps
    finally:
        db.close()

# Interaction Endpoints
@app.post("/api/interactions")
def create_interaction(interaction: InteractionCreate):
    db = SessionLocal()
    try:
        db_interaction = Interaction(**interaction.dict())
        db.add(db_interaction)
        db.commit()
        db.refresh(db_interaction)
        return db_interaction
    finally:
        db.close()

@app.get("/api/interactions")
def get_interactions():
    db = SessionLocal()
    try:
        interactions = db.query(Interaction).order_by(Interaction.created_at.desc()).all()
        return interactions
    finally:
        db.close()

@app.put("/api/interactions/{interaction_id}")
def update_interaction(interaction_id: int, interaction: InteractionUpdate):
    db = SessionLocal()
    try:
        db_interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not db_interaction:
            raise HTTPException(status_code=404, detail="Interaction not found")
        
        for key, value in interaction.dict(exclude_unset=True).items():
            setattr(db_interaction, key, value)
        
        db_interaction.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_interaction)
        return db_interaction
    finally:
        db.close()

@app.delete("/api/interactions/{interaction_id}")
def delete_interaction(interaction_id: int):
    db = SessionLocal()
    try:
        db_interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not db_interaction:
            raise HTTPException(status_code=404, detail="Interaction not found")
        db.delete(db_interaction)
        db.commit()
        return {"message": "Interaction deleted"}
    finally:
        db.close()

# Chat Endpoint (LangGraph Agent)
@app.post("/api/chat/interact")
def chat_interact(chat_message: ChatMessage):
    try:
        state = {
            "messages": chat_message.history + [{"role": "user", "content": chat_message.message}],
            "tool_calls": [],
            "next_action": "respond"
        }
        
        result = agent.invoke(state)
        response = result["messages"][-1]["content"]
        
        return {
            "response": response,
            "interaction_logged": "logged successfully" in response.lower()
        }
    except Exception as e:
        return {"response": f"Error: {str(e)}", "interaction_logged": False}

# Tool Endpoints
@app.post("/api/tools/generate-insights")
def api_generate_insights(data: Dict[str, Any]):
    hcp_id = data.get("hcp_id") or data.get("interaction_ids", [None])[0]
    if not hcp_id:
        raise HTTPException(status_code=400, detail="HCP ID required")
    insights = generate_insights_tool(hcp_id)
    return {"insights": insights}

@app.get("/api/tools/search-hcp")
def api_search_hcp(query: str):
    results = search_hcp_tool(query)
    return {"results": results}

@app.post("/api/tools/schedule-followup")
def api_schedule_followup(data: Dict[str, Any]):
    interaction_id = data.get("interaction_id")
    followup_date = data.get("followup_date")
    message = schedule_followup_tool(interaction_id, followup_date)
    return {"message": message}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)