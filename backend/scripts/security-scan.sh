#!/bin/bash

# Script to check for hardcoded credentials and sensitive data

echo "============================================================"
echo "Security Check: Scanning for Hardcoded Credentials"
echo "============================================================"
echo ""

FOUND_ISSUES=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Exclude patterns
EXCLUDE_DIRS="node_modules|.git|uploads|sessions|invoices|scripts"

echo "Checking for potential security issues..."
echo ""

# Check for hardcoded passwords
echo "1. Checking for hardcoded passwords..."
PASSWORDS=$(grep -r -i --exclude-dir={node_modules,.git,uploads,sessions,invoices} \
  -E "(password|passwd|pwd)\s*[:=]\s*['\"][^'\"]{3,}" . 2>/dev/null | \
  grep -v ".env.example" | grep -v "validate-env.js" | grep -v "security-scan.sh" | \
  grep -v "your_password" | grep -v "placeholder" | head -5)

if [ -n "$PASSWORDS" ]; then
  echo -e "${RED}⚠️  Potential hardcoded passwords found:${NC}"
  echo "$PASSWORDS"
  FOUND_ISSUES=$((FOUND_ISSUES + 1))
else
  echo -e "${GREEN}✅ No hardcoded passwords found${NC}"
fi
echo ""

# Check for API keys
echo "2. Checking for hardcoded API keys..."
API_KEYS=$(grep -r -i --exclude-dir={node_modules,.git,uploads,sessions,invoices} \
  -E "(api[_-]?key|apikey|api_secret)\s*[:=]\s*['\"][A-Za-z0-9]{20,}" . 2>/dev/null | \
  grep -v ".env.example" | grep -v "security-scan.sh" | \
  grep -v "your_google_maps_api_key" | grep -v "test_api_key" | head -5)

if [ -n "$API_KEYS" ]; then
  echo -e "${RED}⚠️  Potential hardcoded API keys found:${NC}"
  echo "$API_KEYS"
  FOUND_ISSUES=$((FOUND_ISSUES + 1))
else
  echo -e "${GREEN}✅ No hardcoded API keys found${NC}"
fi
echo ""

# Check for JWT secrets
echo "3. Checking for hardcoded JWT secrets..."
JWT_SECRETS=$(grep -r -i --exclude-dir={node_modules,.git,uploads,sessions,invoices} \
  -E "jwt[_-]?secret\s*[:=]\s*['\"][^'\"]{10,}" . 2>/dev/null | \
  grep -v ".env.example" | grep -v "security-scan.sh" | \
  grep -v "your_secret_key" | grep -v "test_secret" | head -5)

if [ -n "$JWT_SECRETS" ]; then
  echo -e "${RED}⚠️  Potential hardcoded JWT secrets found:${NC}"
  echo "$JWT_SECRETS"
  FOUND_ISSUES=$((FOUND_ISSUES + 1))
else
  echo -e "${GREEN}✅ No hardcoded JWT secrets found${NC}"
fi
echo ""

# Check for database connection strings
echo "4. Checking for hardcoded database connection strings..."
DB_STRINGS=$(grep -r -i --exclude-dir={node_modules,.git,uploads,sessions,invoices} \
  -E "(postgres|mysql|mongodb)://[^@]+@" . 2>/dev/null | \
  grep -v ".env.example" | grep -v "security-scan.sh" | \
  grep -v "user:password@host" | head -5)

if [ -n "$DB_STRINGS" ]; then
  echo -e "${RED}⚠️  Potential hardcoded database strings found:${NC}"
  echo "$DB_STRINGS"
  FOUND_ISSUES=$((FOUND_ISSUES + 1))
else
  echo -e "${GREEN}✅ No hardcoded database connection strings found${NC}"
fi
echo ""

# Check for console.log with sensitive data patterns
echo "5. Checking for console.log with potential sensitive data..."
SENSITIVE_LOGS=$(grep -r -i --exclude-dir={node_modules,.git,uploads,sessions,invoices} \
  -E "console\.log.*\((password|token|secret|key)" . 2>/dev/null | \
  grep -v "security-scan.sh" | head -5)

if [ -n "$SENSITIVE_LOGS" ]; then
  echo -e "${YELLOW}⚠️  Console logs with potential sensitive data:${NC}"
  echo "$SENSITIVE_LOGS"
  echo -e "${YELLOW}   (Review these to ensure no sensitive data is logged)${NC}"
else
  echo -e "${GREEN}✅ No obvious sensitive data in console.log statements${NC}"
fi
echo ""

# Check for TODO/FIXME comments about security
echo "6. Checking for security-related TODO/FIXME comments..."
SECURITY_TODOS=$(grep -r -i --exclude-dir={node_modules,.git,uploads,sessions,invoices} \
  -E "(TODO|FIXME).*\b(security|auth|password|token)\b" . 2>/dev/null | head -5)

if [ -n "$SECURITY_TODOS" ]; then
  echo -e "${YELLOW}ℹ️  Security-related TODO/FIXME comments found:${NC}"
  echo "$SECURITY_TODOS"
else
  echo -e "${GREEN}✅ No security-related TODO/FIXME comments${NC}"
fi
echo ""

# Check .env file is in .gitignore
echo "7. Checking .gitignore configuration..."
if grep -q "^\.env$" .gitignore 2>/dev/null; then
  echo -e "${GREEN}✅ .env file is properly excluded in .gitignore${NC}"
else
  echo -e "${RED}❌ .env file is NOT in .gitignore - CRITICAL SECURITY ISSUE${NC}"
  FOUND_ISSUES=$((FOUND_ISSUES + 1))
fi
echo ""

# Summary
echo "============================================================"
echo "Security Scan Summary"
echo "============================================================"

if [ $FOUND_ISSUES -eq 0 ]; then
  echo -e "${GREEN}✅ Security scan PASSED${NC}"
  echo "   No critical security issues found"
  exit 0
else
  echo -e "${RED}❌ Security scan found $FOUND_ISSUES potential issues${NC}"
  echo "   Please review and fix the issues above"
  exit 1
fi
