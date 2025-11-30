"""
Database initialization script for Windows local development
Run this after setting up the backend to create tables and sample data
"""

from main import Base, engine, SessionLocal, HCP, Interaction
from datetime import datetime, timedelta

print("🔧 Initializing database...")

# Create all tables
Base.metadata.create_all(bind=engine)
print("✅ Tables created")

# Create database session
db = SessionLocal()

try:
    # Check if data already exists
    existing_hcps = db.query(HCP).count()
    if existing_hcps > 0:
        print("⚠️  Database already has data. Skipping sample data insertion.")
        db.close()
        exit(0)

    # Sample HCPs
    hcps_data = [
        HCP(name="John Smith", specialty="Cardiology", hospital="City General Hospital", 
            email="john.smith@citygeneral.com", phone="+1-555-0101"),
        HCP(name="Sarah Johnson", specialty="Endocrinology", hospital="Metro Medical Center",
            email="sarah.johnson@metromedical.com", phone="+1-555-0102"),
        HCP(name="Michael Chen", specialty="Oncology", hospital="Regional Cancer Institute",
            email="michael.chen@rci.org", phone="+1-555-0103"),
        HCP(name="Emily Williams", specialty="Neurology", hospital="Brain & Spine Clinic",
            email="emily.williams@brainspine.com", phone="+1-555-0104"),
        HCP(name="David Martinez", specialty="Rheumatology", hospital="Joint Care Center",
            email="david.martinez@jointcare.com", phone="+1-555-0105"),
        HCP(name="Lisa Anderson", specialty="Gastroenterology", hospital="Digestive Health Hospital",
            email="lisa.anderson@digestivehealth.com", phone="+1-555-0106"),
        HCP(name="Robert Taylor", specialty="Pulmonology", hospital="Respiratory Care Institute",
            email="robert.taylor@respcare.org", phone="+1-555-0107"),
        HCP(name="Jennifer Brown", specialty="Dermatology", hospital="Skin Health Clinic",
            email="jennifer.brown@skinhealth.com", phone="+1-555-0108"),
    ]

    print("📝 Adding sample HCPs...")
    for hcp in hcps_data:
        db.add(hcp)
    
    db.commit()
    print(f"✅ Added {len(hcps_data)} HCPs")

    # Sample interactions
    interactions_data = [
        Interaction(
            hcp_id=1, 
            interaction_type="visit", 
            notes="Discussed new cardiovascular drug trials. Dr. Smith showed high interest in efficacy data for hypertension patients. Requested detailed clinical study results.", 
            products_discussed="CardioMax, HeartGuard", 
            follow_up_required=True,
            created_at=datetime.utcnow() - timedelta(days=2)
        ),
        Interaction(
            hcp_id=2,
            interaction_type="call",
            notes="Phone consultation about diabetes management solutions. Dr. Johnson interested in latest glucose monitoring technology and patient compliance tools.",
            products_discussed="GlucoControl, DiabetesCare Pro",
            follow_up_required=False,
            created_at=datetime.utcnow() - timedelta(days=5)
        ),
        Interaction(
            hcp_id=3,
            interaction_type="email",
            notes="Responded to inquiry about oncology drug side effects. Provided comprehensive documentation on patient safety profiles and clinical outcomes.",
            products_discussed="OncoSafe, CancerGuard",
            follow_up_required=True,
            created_at=datetime.utcnow() - timedelta(days=7)
        ),
        Interaction(
            hcp_id=1,
            interaction_type="webinar",
            notes="Attended product webinar on cardiovascular innovations. Asked detailed questions about drug interactions and contraindications.",
            products_discussed="CardioMax",
            follow_up_required=False,
            created_at=datetime.utcnow() - timedelta(days=10)
        ),
        Interaction(
            hcp_id=4,
            interaction_type="visit",
            notes="In-person meeting to discuss neurological disorder treatments. Dr. Williams very receptive to new Alzheimer's disease therapies.",
            products_discussed="NeuroPlus, BrainCare",
            follow_up_required=True,
            created_at=datetime.utcnow() - timedelta(days=3)
        ),
    ]

    print("📝 Adding sample interactions...")
    for interaction in interactions_data:
        db.add(interaction)
    
    db.commit()
    print(f"✅ Added {len(interactions_data)} interactions")

    print("\n" + "="*50)
    print("✅ Database initialized successfully!")
    print("="*50)
    print(f"📊 Total HCPs: {db.query(HCP).count()}")
    print(f"📊 Total Interactions: {db.query(Interaction).count()}")
    print("\n🚀 You can now start the server with:")
    print("   uvicorn main:app --reload")
    print("="*50)

except Exception as e:
    print(f"❌ Error initializing database: {str(e)}")
    db.rollback()
finally:
    db.close()