# Quick Reference Card

## 🚀 Essential Commands

### Initial Setup

```bash
# 1. Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 2. Create .env file
cp .env.example .env
nano .env  # Add your GROQ_API_KEY

# 3. Deploy everything
docker-compose up --build
```

### Docker Commands

```bash
# Start all services
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Restart a service
docker-compose restart backend

# Check service status
docker-compose ps

# Execute command in container
docker-compose exec backend python
docker-compose exec db psql -U crm_user -d crm_db

# Remove all containers and volumes
docker-compose down -v
```

### Local Development (Without Docker)

#### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://crm_user:crm_password@localhost:5432/crm_db"
export GROQ_API_KEY="your_key_here"

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Git Commands

```bash
# Initialize repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: AI-First CRM HCP Module"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main

# Check status
git status

# View commit history
git log --oneline

# Create .gitignore if missing
cat > .gitignore << 'EOF'
.env
node_modules/
__pycache__/
*.pyc
venv/
EOF
```

### Database Commands

```bash
# Access PostgreSQL container
docker-compose exec db psql -U crm_user -d crm_db

# Inside PostgreSQL:
\dt                    # List tables
\d hcps               # Describe hcps table
\d interactions       # Describe interactions table
SELECT * FROM hcps;   # View HCPs
SELECT * FROM interactions;  # View interactions
\q                    # Exit

# Reset database
docker-compose down -v
docker-compose up --build
```

### Testing API Endpoints

```bash
# Health check
curl http://localhost:8000/

# Get all HCPs
curl http://localhost:8000/api/hcps

# Get all interactions
curl http://localhost:8000/api/interactions

# Create interaction (example)
curl -X POST http://localhost:8000/api/interactions \
  -H "Content-Type: application/json" \
  -d '{
    "hcp_id": 1,
    "interaction_type": "visit",
    "notes": "Test interaction",
    "products_discussed": "Product A",
    "follow_up_required": false
  }'

# Search HCP
curl "http://localhost:8000/api/tools/search-hcp?query=cardiology"

# View API docs
open http://localhost:8000/docs
```

### Troubleshooting

```bash
# Port already in use
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :8000   # Windows

# Port 3000
lsof -ti:3000 | xargs kill -9  # Mac/Linux

# Permission denied for deploy.sh
chmod +x deploy.sh

# Docker out of space
docker system prune -a

# Node modules issue
cd frontend
rm -rf node_modules package-lock.json
npm install

# Python cache issue
cd backend
find . -type d -name __pycache__ -exec rm -r {} +

# Database connection refused
docker-compose restart db
# Wait 10 seconds
docker-compose restart backend
```

### Video Recording

```bash
# Using ffmpeg (if installed)
ffmpeg -i input.mov -vcodec h264 -acodec aac output.mp4

# Compress video
ffmpeg -i input.mp4 -vcodec h264 -crf 28 compressed.mp4

# Check video duration
ffmpeg -i video.mp4 2>&1 | grep "Duration"
```

### Project Structure Verification

```bash
# Check all required files exist
ls -la README.md .env.example .gitignore docker-compose.yml

# Count lines of code
find . -name "*.py" -not -path "./venv/*" | xargs wc -l
find . -name "*.js" -not -path "./node_modules/*" | xargs wc -l

# Check .env not in git
git status --ignored | grep .env

# Verify Inter font in HTML
grep -i "inter" frontend/public/index.html

# Verify LangGraph import
grep -i "langgraph" backend/main.py
```

### Access Points

```
Frontend:     http://localhost:3000
Backend API:  http://localhost:8000
API Docs:     http://localhost:8000/docs
Database:     localhost:5432
  - User:     crm_user
  - Password: crm_password
  - Database: crm_db

QMS Platform: http://216.48.184.249:5274/quality
  - Username: testing@aivoa.net
  - Password: password123
```

### Environment Variables

```bash
# Required in .env file
GROQ_API_KEY=gsk_...                                    # Get from console.groq.com
DATABASE_URL=postgresql://crm_user:crm_password@db:5432/crm_db
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

### Pre-Submission Checks

```bash
# Test fresh clone
cd /tmp
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git test-clone
cd test-clone
cp .env.example .env
# Add GROQ_API_KEY to .env
docker-compose up --build
# Test in browser
# Clean up
cd ..
rm -rf test-clone
```

### GitHub Repository Checklist

```bash
# Check repository is public
# Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings

# Verify .env is not committed
git log --all --full-history --oneline -- .env
# Should be empty

# Check README renders correctly
# View: https://github.com/YOUR_USERNAME/YOUR_REPO

# Test clone URL
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git temp-test
cd temp-test
ls -la
cd ..
rm -rf temp-test
```

### Useful Aliases (Add to ~/.bashrc or ~/.zshrc)

```bash
# Docker shortcuts
alias dcu='docker-compose up'
alias dcub='docker-compose up --build'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcp='docker-compose ps'
alias dcr='docker-compose restart'

# CRM specific
alias crm-start='docker-compose up -d'
alias crm-stop='docker-compose down'
alias crm-logs='docker-compose logs -f'
alias crm-reset='docker-compose down -v && docker-compose up --build'
```

### Emergency Recovery

```bash
# Complete reset (nuclear option)
docker-compose down -v
rm -rf backend/__pycache__
rm -rf frontend/node_modules
rm -rf frontend/build
docker system prune -a -f
git status  # Check for uncommitted changes
docker-compose up --build

# If database is corrupted
docker-compose down -v
docker volume rm $(docker volume ls -q | grep crm)
docker-compose up --build
```

### Performance Optimization

```bash
# Backend
# Add to backend/main.py before app.run():
import uvicorn
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=4)

# Frontend production build
cd frontend
npm run build
# Serve build folder with nginx or serve

# Database indexes (already in init.sql)
# Check if applied:
docker-compose exec db psql -U crm_user -d crm_db -c "\di"
```

---

## 📌 Pinned Commands (Copy-Paste Ready)

### Deploy Everything (Single Command)
```bash
docker-compose up --build
```

### View All Logs
```bash
docker-compose logs -f
```

### Stop Everything
```bash
docker-compose down
```

### Complete Reset
```bash
docker-compose down -v && docker-compose up --build
```

### Access Database
```bash
docker-compose exec db psql -U crm_user -d crm_db
```

### Check If Running
```bash
curl http://localhost:8000/ && curl http://localhost:3000/
```

---

## 🆘 Help Resources

- **Groq API Docs**: https://console.groq.com/docs
- **LangGraph Docs**: https://langchain-ai.github.io/langgraph/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **Docker Docs**: https://docs.docker.com/
- **Submission Form**: https://forms.gle/xRqpWCrLCiDH33Xa9

---

**Print this page or keep it open while working!**