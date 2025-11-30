from sqlalchemy import Column, Integer, String, Text, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/hcp_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Interaction(Base):
    __tablename__ = "interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String, index=True)
    interaction_type = Column(String)
    date_time = Column(DateTime, default=datetime.utcnow)
    attendees = Column(String)
    topics_discussed = Column(Text)
    materials_shared = Column(String)
    sentiment = Column(String) # Positive, Neutral, Negative
    outcomes = Column(Text)
    follow_up_actions = Column(Text)

def init_db():
    Base.metadata.create_all(bind=engine)