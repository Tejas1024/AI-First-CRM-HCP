#!/bin/bash

# validate_setup.sh - Comprehensive validation script
# Run this before submitting to check all requirements

set -e

echo "🔍 AI-First CRM HCP Module - Setup Validation"
echo "=============================================="
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check 1: Project structure
echo "📁 Checking project structure..."
if [ ! -f "README.md" ]; then
    error "README.md not found"
else
    success "README.md exists"
fi

if [ ! -f ".env.example" ]; then
    error ".env.example not found"
else
    success ".env.example exists"
fi

if [ ! -f ".gitignore" ]; then
    error ".gitignore not found"
else
    success ".gitignore exists"
fi

if [ ! -f "docker-compose.yml" ]; then
    error "docker-compose.yml not found"
else
    success "docker-compose.yml exists"
fi

if [ ! -f "init.sql" ]; then
    error "init.sql not found"
else
    success "init.sql exists"
fi

if [ ! -f "backend/main.py" ]; then
    error "backend/main.py not found"
else
    success "backend/main.py exists"
fi

if [ ! -f "backend/requirements.txt" ]; then
    error "backend/requirements.txt not found"
else
    success "backend/requirements.txt exists"
fi

if [ ! -f "frontend/src/App.js" ]; then
    error "frontend/src/App.js not found"
else
    success "frontend/src/App.js exists"
fi

if [ ! -f "frontend/package.json" ]; then
    error "frontend/package.json not found"
else
    success "frontend/package.json exists"
fi

echo ""

# Check 2: API Key Security
echo "🔐 Checking API key security..."
if [ -f ".env" ]; then
    if git ls-files --error-unmatch .env 2>/dev/null; then
        error ".env file is tracked by git! Remove it with: git rm --cached .env"
    else
        success ".env file exists and is not tracked by git"
    fi
    
    if grep -q "your_groq_api_key_here" .env; then
        warning ".env still contains placeholder API key"
    else
        success ".env has been configured with actual API key"
    fi
else
    warning ".env file not found (will need to create from .env.example)"
fi

# Check if .env is in .gitignore
if grep -q "^\.env$" .gitignore; then
    success ".env is in .gitignore"
else
    error ".env is NOT in .gitignore!"
fi

# Check for hardcoded API keys
if grep -r "gsk_" backend/ frontend/ --exclude-dir=venv --exclude-dir=node_modules 2>/dev/null | grep -v ".env"; then
    error "Found hardcoded API keys in code!"
else
    success "No hardcoded API keys found"
fi

echo ""

# Check 3: LangGraph and LLM usage
echo "🤖 Checking LangGraph and LLM requirements..."
if grep -q "from langgraph" backend/main.py; then
    success "LangGraph is imported"
else
    error "LangGraph NOT found in backend/main.py (REQUIRED!)"
fi

if grep -q "from groq import Groq" backend/main.py; then
    success "Groq LLM is imported"
else
    error "Groq NOT found in backend/main.py (REQUIRED!)"
fi

echo ""

# Check 4: Five required tools
echo "🔧 Checking 5 required tools..."
TOOLS=(
    "log_interaction_tool"
    "edit_interaction_tool"
    "search_hcp_tool"
    "generate_insights_tool"
    "schedule_followup_tool"
)

for tool in "${TOOLS[@]}"; do
    if grep -q "def $tool" backend/main.py; then
        success "Tool found: $tool"
    else
        error "Tool MISSING: $tool (REQUIRED!)"
    fi
done

echo ""

# Check 5: React and Redux
echo "⚛️  Checking React and Redux..."
if grep -q "from react-redux" frontend/src/App.js || grep -q "import.*redux" frontend/src/App.js; then
    success "Redux is used in frontend"
else
    error "Redux NOT found in frontend (REQUIRED!)"
fi

if grep -q "configureStore\\|createSlice" frontend/src/App.js; then
    success "Redux Toolkit is properly used"
else
    warning "Redux Toolkit usage not detected"
fi

echo ""

# Check 6: Inter font
echo "🔤 Checking Google Inter font..."
if grep -i "Inter" frontend/public/index.html; then
    success "Inter font found in index.html"
else
    error "Inter font NOT found in index.html (REQUIRED!)"
fi

if grep -i "Inter" frontend/src/index.css; then
    success "Inter font referenced in CSS"
else
    warning "Inter font not found in index.css"
fi

echo ""

# Check 7: Database
echo "🗄️  Checking database configuration..."
if grep -q "postgresql" docker-compose.yml || grep -q "postgres" docker-compose.yml; then
    success "PostgreSQL configured in docker-compose.yml"
else
    warning "PostgreSQL not found in docker-compose (MySQL ok too)"
fi

if grep -q "CREATE TABLE" init.sql; then
    success "init.sql contains table definitions"
else
    error "init.sql does not contain CREATE TABLE statements"
fi

echo ""

# Check 8: Dependencies
echo "📦 Checking dependencies..."
if grep -q "fastapi" backend/requirements.txt; then
    success "FastAPI in requirements.txt"
else
    error "FastAPI NOT in requirements.txt"
fi

if grep -q "langgraph" backend/requirements.txt; then
    success "LangGraph in requirements.txt"
else
    error "LangGraph NOT in requirements.txt (REQUIRED!)"
fi

if grep -q "groq" backend/requirements.txt; then
    success "Groq in requirements.txt"
else
    error "Groq NOT in requirements.txt (REQUIRED!)"
fi

if grep -q "react" frontend/package.json; then
    success "React in package.json"
else
    error "React NOT in package.json"
fi

if grep -q "@reduxjs/toolkit\\|react-redux" frontend/package.json; then
    success "Redux in package.json"
else
    error "Redux NOT in package.json (REQUIRED!)"
fi

echo ""

# Check 9: Docker setup
echo "🐳 Checking Docker configuration..."
if [ -f "backend/Dockerfile" ]; then
    success "Backend Dockerfile exists"
else
    error "Backend Dockerfile not found"
fi

if [ -f "frontend/Dockerfile" ]; then
    success "Frontend Dockerfile exists"
else
    error "Frontend Dockerfile not found"
fi

if grep -q "services:" docker-compose.yml; then
    NUM_SERVICES=$(grep -c "^  [a-z].*:" docker-compose.yml || echo "0")
    if [ "$NUM_SERVICES" -ge 3 ]; then
        success "Docker compose has $NUM_SERVICES services"
    else
        warning "Expected at least 3 services (db, backend, frontend)"
    fi
fi

echo ""

# Check 10: README quality
echo "📖 Checking README.md..."
README_LINES=$(wc -l < README.md)
if [ "$README_LINES" -lt 100 ]; then
    warning "README.md is quite short ($README_LINES lines)"
else
    success "README.md is comprehensive ($README_LINES lines)"
fi

if grep -q "LangGraph" README.md; then
    success "README mentions LangGraph"
else
    warning "README should mention LangGraph"
fi

if grep -q "Tool" README.md; then
    success "README describes tools"
else
    warning "README should describe the 5 tools"
fi

echo ""

# Check 11: Git status
echo "📝 Checking git status..."
if [ -d ".git" ]; then
    success "Git repository initialized"
    
    if git status --porcelain | grep -q "^??"; then
        warning "Untracked files exist. Consider adding or ignoring them."
    fi
    
    if git status --porcelain | grep -q "^ M\\|^M"; then
        warning "Uncommitted changes exist. Commit before pushing."
    fi
    
    # Check if remote is set
    if git remote -v | grep -q "origin"; then
        success "Git remote 'origin' is configured"
    else
        warning "Git remote 'origin' not set. Add with: git remote add origin <URL>"
    fi
else
    error "Not a git repository! Initialize with: git init"
fi

echo ""

# Summary
echo "=============================================="
echo "📊 Validation Summary"
echo "=============================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ No errors found!${NC}"
else
    echo -e "${RED}❌ Found $ERRORS error(s) - MUST FIX BEFORE SUBMITTING${NC}"
fi

if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ No warnings${NC}"
else
    echo -e "${YELLOW}⚠️  Found $WARNINGS warning(s) - Consider addressing${NC}"
fi

echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 PERFECT! Ready for submission!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test: docker-compose up --build"
    echo "2. Record video (10-15 minutes)"
    echo "3. Push to GitHub"
    echo "4. Submit: https://forms.gle/xRqpWCrLCiDH33Xa9"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Fix warnings before submitting (recommended)${NC}"
else
    echo -e "${RED}❌ MUST fix all errors before submitting!${NC}"
    exit 1
fi

echo ""