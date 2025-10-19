#!/bin/bash

# Deployment Readiness Check Script
# Comprehensive pre-deployment validation

echo "============================================================"
echo "KsheerMitra - Deployment Readiness Check"
echo "============================================================"
echo ""

EXIT_CODE=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

function check_pass() {
  echo -e "${GREEN}✅ $1${NC}"
  PASSED=$((PASSED + 1))
}

function check_fail() {
  echo -e "${RED}❌ $1${NC}"
  FAILED=$((FAILED + 1))
  EXIT_CODE=1
}

function check_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

function check_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. Environment Configuration
echo "1. Environment Configuration:"
echo "------------------------------------------------------------"

if [ -f ".env" ]; then
  check_pass ".env file exists"
  
  # Check for critical variables
  if grep -q "^PORT=" .env; then
    check_pass "PORT configured"
  else
    check_fail "PORT not configured in .env"
  fi
  
  if grep -q "^NODE_ENV=" .env; then
    NODE_ENV=$(grep "^NODE_ENV=" .env | cut -d '=' -f2)
    if [ "$NODE_ENV" = "production" ]; then
      check_pass "NODE_ENV set to production"
    else
      check_warn "NODE_ENV is $NODE_ENV (should be 'production' for deployment)"
    fi
  else
    check_fail "NODE_ENV not configured"
  fi
  
  # Check JWT_SECRET is not default
  if grep -q "^JWT_SECRET=" .env; then
    JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d '=' -f2)
    if [ "$JWT_SECRET" = "your_secret_key_change_in_production" ] || [ "$JWT_SECRET" = "test_secret_key_for_development_only_change_in_production" ]; then
      check_fail "JWT_SECRET is using default/test value - SECURITY RISK"
    else
      check_pass "JWT_SECRET is customized"
    fi
  else
    check_fail "JWT_SECRET not configured"
  fi
  
  # Check database configuration
  if grep -q "^DATABASE_URL=" .env || (grep -q "^PG_DATABASE=" .env && grep -q "^PG_USER=" .env); then
    check_pass "Database configuration present"
  else
    check_fail "Database configuration missing"
  fi
  
else
  check_fail ".env file not found"
fi

echo ""

# 2. Dependencies
echo "2. Dependencies:"
echo "------------------------------------------------------------"

if [ -d "node_modules" ]; then
  check_pass "node_modules directory exists"
  
  # Check if dependencies are up to date
  if npm list --depth=0 > /dev/null 2>&1; then
    check_pass "All dependencies installed correctly"
  else
    check_warn "Some dependency issues detected (run 'npm list' for details)"
  fi
else
  check_fail "node_modules not found - run 'npm install'"
fi

echo ""

# 3. Security
echo "3. Security Checks:"
echo "------------------------------------------------------------"

# Check .gitignore
if grep -q "^\.env$" .gitignore 2>/dev/null; then
  check_pass ".env excluded from git"
else
  check_fail ".env not excluded in .gitignore - SECURITY RISK"
fi

if grep -q "^node_modules" .gitignore 2>/dev/null; then
  check_pass "node_modules excluded from git"
else
  check_warn "node_modules not excluded in .gitignore"
fi

# Check for secrets in git
if git rev-parse --git-dir > /dev/null 2>&1; then
  if git ls-files | grep -q "^\.env$"; then
    check_fail ".env file is tracked by git - REMOVE IT IMMEDIATELY"
  else
    check_pass ".env file not tracked by git"
  fi
fi

# Run security scan if available
if [ -f "scripts/security-scan.sh" ]; then
  check_info "Running security scan..."
  if bash scripts/security-scan.sh > /dev/null 2>&1; then
    check_pass "Security scan passed"
  else
    check_warn "Security scan found issues (review scripts/security-scan.sh output)"
  fi
fi

echo ""

# 4. Required Directories
echo "4. File System Structure:"
echo "------------------------------------------------------------"

REQUIRED_DIRS=("uploads" "uploads/products" "invoices" "sessions")

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    check_pass "$dir/ directory exists"
  else
    check_warn "$dir/ directory missing (will be created automatically)"
  fi
done

echo ""

# 5. Database Migrations
echo "5. Database Migrations:"
echo "------------------------------------------------------------"

if [ -d "migrations" ]; then
  MIGRATION_COUNT=$(ls -1 migrations/*.sql 2>/dev/null | wc -l)
  if [ $MIGRATION_COUNT -gt 0 ]; then
    check_pass "Found $MIGRATION_COUNT migration files"
    check_info "Ensure migrations are run before deployment"
  else
    check_warn "No migration files found in migrations/"
  fi
else
  check_warn "migrations/ directory not found"
fi

echo ""

# 6. SSL/HTTPS
echo "6. SSL/HTTPS Configuration:"
echo "------------------------------------------------------------"

check_info "Ensure SSL/TLS certificates are configured on your web server"
check_info "For production, always use HTTPS"

echo ""

# 7. CORS Configuration
echo "7. CORS Configuration:"
echo "------------------------------------------------------------"

if grep -q "^CORS_ORIGIN=" .env; then
  CORS_ORIGIN=$(grep "^CORS_ORIGIN=" .env | cut -d '=' -f2)
  if [ "$CORS_ORIGIN" = "*" ]; then
    check_warn "CORS_ORIGIN is set to '*' (allows all origins)"
    check_info "For production, set specific allowed origins"
  else
    check_pass "CORS_ORIGIN configured with specific origins"
  fi
else
  check_warn "CORS_ORIGIN not configured (defaults to '*')"
fi

echo ""

# 8. Process Manager
echo "8. Process Manager:"
echo "------------------------------------------------------------"

if command -v pm2 &> /dev/null; then
  check_pass "PM2 is installed"
  check_info "Use 'pm2 start server.js --name ksheermitra' to run in production"
else
  check_warn "PM2 not installed (recommended for production)"
  check_info "Install with: npm install -g pm2"
fi

echo ""

# 9. Backup Strategy
echo "9. Backup Strategy:"
echo "------------------------------------------------------------"

check_info "Ensure you have a backup strategy for:"
check_info "  - Database (automated backups)"
check_info "  - Uploaded files (uploads/ directory)"
check_info "  - Environment configuration (.env)"
check_info "  - WhatsApp sessions (if using WhatsApp)"

echo ""

# 10. Monitoring
echo "10. Monitoring & Logging:"
echo "------------------------------------------------------------"

check_info "Consider setting up:"
check_info "  - Application monitoring (PM2, New Relic, DataDog)"
check_info "  - Error tracking (Sentry)"
check_info "  - Log aggregation (ELK Stack, Papertrail)"
check_info "  - Uptime monitoring (UptimeRobot, Pingdom)"

echo ""

# Summary
echo "============================================================"
echo "Deployment Readiness Summary"
echo "============================================================"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ READY FOR DEPLOYMENT${NC}"
    echo "   All checks passed. System is ready to deploy."
  else
    echo -e "${YELLOW}⚠️  READY WITH WARNINGS${NC}"
    echo "   Review warnings above before deployment."
  fi
else
  echo -e "${RED}❌ NOT READY FOR DEPLOYMENT${NC}"
  echo "   Fix critical issues before deploying."
fi

echo ""
echo "Pre-Deployment Checklist:"
echo "  1. Review and fix all failed checks above"
echo "  2. Update all placeholder API keys and secrets"
echo "  3. Set NODE_ENV=production"
echo "  4. Configure CORS for production domain"
echo "  5. Run database migrations"
echo "  6. Test in staging environment"
echo "  7. Set up SSL/HTTPS"
echo "  8. Configure monitoring and logging"
echo "  9. Set up automated backups"
echo "  10. Review security best practices"
echo ""

exit $EXIT_CODE
