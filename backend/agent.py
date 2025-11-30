import os
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.tools import tool
from models import SessionLocal, Interaction
from datetime import datetime

# Initialize Groq 
llm = ChatGroq(
    model_name="gemma2-9b-it", 
    api_key=os.getenv("GROQ_API_KEY")
)

# --- Define the 5 Required Tools [cite: 62] ---

@tool
def log_interaction_tool(hcp_name: str, topics: str, sentiment: str, outcomes: str):
    """
    Tool 1[cite: 64]: Logs a new interaction into the database. 
    Use this when the user provides details about a meeting.
    """
    db = SessionLocal()
    new_interaction = Interaction(
        hcp_name=hcp_name,
        topics_discussed=topics,
        sentiment=sentiment,
        outcomes=outcomes,
        date_time=datetime.now()
    )
    db.add(new_interaction)
    db.commit()
    db.refresh(new_interaction)
    db.close()
    return f"Interaction logged successfully with ID {new_interaction.id}"

@tool
def edit_interaction_tool(interaction_id: int, field: str, new_value: str):
    """
    Tool 2[cite: 66]: Edits an existing interaction. 
    Use this if the user wants to correct a mistake in a previous log.
    """
    db = SessionLocal()
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        return "Interaction not found."
    
    if hasattr(interaction, field):
        setattr(interaction, field, new_value)
        db.commit()
        msg = f"Updated {field} to {new_value}."
    else:
        msg = f"Field {field} does not exist."
    db.close()
    return msg

@tool
def search_hcp_tool(query: str):
    """Tool 3: Searches for an HCP in the database."""
    # Mock logic for demo
    return f"Found Dr. {query} in database."

@tool
def suggest_followup_tool(outcome: str):
    """Tool 4: Suggests follow-up actions based on meeting outcomes."""
    return f"Based on outcome '{outcome}', suggest sending the Phase III PDF in 2 weeks."

@tool
def get_product_info_tool(product_name: str):
    """Tool 5: Retrieves compliant product information."""
    return f"Product {product_name} is currently in Phase 3 trials. Efficacy data is available."

tools = [log_interaction_tool, edit_interaction_tool, search_hcp_tool, suggest_followup_tool, get_product_info_tool]

# --- LangGraph Setup ---

class AgentState(TypedDict):
    messages: List[HumanMessage | AIMessage]

def agent_node(state: AgentState):
    messages = state['messages']
    # Life Science Expert Persona [cite: 10]
    system_prompt = SystemMessage(content="""
    You are an AI assistant for a Life Sciences field representative.
    Your goal is to help log interactions, manage HCP data, and ensure compliance.
    You have access to tools to log and edit database records.
    Always summarize the interaction before logging it.
    """)
    
    if not isinstance(messages[0], SystemMessage):
        messages.insert(0, system_prompt)
        
    llm_with_tools = llm.bind_tools(tools)
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

def tool_node(state: AgentState):
    messages = state['messages']
    last_message = messages[-1]
    
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        tool_results = []
        for call in last_message.tool_calls:
            selected_tool = next((t for t in tools if t.name == call['name']), None)
            if selected_tool:
                result = selected_tool.invoke(call['args'])
                tool_results.append(HumanMessage(content=f"Tool {call['name']} output: {str(result)}"))
        return {"messages": tool_results}
    return {"messages": []}

def should_continue(state: AgentState):
    last_message = state['messages'][-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    return END

graph_builder = StateGraph(AgentState)
graph_builder.add_node("agent", agent_node)
graph_builder.add_node("tools", tool_node)
graph_builder.set_entry_point("agent")
graph_builder.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
graph_builder.add_edge("tools", "agent")

app_graph = graph_builder.compile()

def process_chat(message: str, history: list):
    inputs = {"messages": [HumanMessage(content=message)]}
    result = app_graph.invoke(inputs)
    return result['messages'][-1].content