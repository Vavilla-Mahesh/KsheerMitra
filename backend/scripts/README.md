# Backend Validation Scripts

This directory contains comprehensive validation, testing, and deployment scripts for the KsheerMitra backend.

## Available Scripts

### 1. Environment Validation (`validate-env.js`)

Validates all environment variables are properly configured.

```bash
npm run validate:env
```

**Features:**
- Checks required variables (PORT, NODE_ENV)
- Validates database configuration
- Checks security variables (JWT_SECRET)
- Warns about insecure defaults
- Verifies optional feature flags

**Exit Codes:**
- `0`: All validations passed
- `1`: Critical issues found

---

### 2. System Check (`system-check.js`)

Comprehensive system health check including database, services, and integrations.

```bash
npm run check:system
```

**Features:**
- Environment variable validation
- Database connectivity test
- Sequelize model synchronization
- Google Maps API validation
- WhatsApp service check
- File system structure validation
- API route verification

**Requirements:**
- Running PostgreSQL database
- Valid API keys (for full testing)

**Exit Codes:**
- `0`: System check passed
- `1`: Critical failures detected

---

### 3. Security Scan (`security-scan.sh`)

Automated security vulnerability scanner.

```bash
npm run check:security
# or
bash scripts/security-scan.sh
```

**Checks:**
- Hardcoded passwords
- Hardcoded API keys
- Hardcoded JWT secrets
- Database connection strings
- Sensitive data in console.log
- .gitignore configuration
- Security TODOs/FIXMEs

**Exit Codes:**
- `0`: No security issues found
- `1`: Security issues detected

---

### 4. API Testing (`test-api.js`)

Tests API endpoints to ensure they're responding correctly.

```bash
npm run test:api
```

**Requirements:**
- Server must be running on PORT (default: 5000)

**Tests:**
- Health check endpoints
- Public endpoints
- Authentication endpoints
- Protected endpoints (auth verification)
- Error handling (404s)

**Usage with server:**
```bash
# Start server in background, wait, then test
npm start & sleep 3 && npm run test:api
```

**Exit Codes:**
- `0`: All tests passed
- `1`: Some tests failed or server not running

---

### 5. Deployment Check (`deployment-check.sh`)

Pre-deployment validation checklist.

```bash
npm run check:deployment
# or
bash scripts/deployment-check.sh
```

**Validates:**
1. Environment configuration
2. Dependencies installation
3. Security configuration
4. File system structure
5. Database migrations
6. SSL/HTTPS readiness
7. CORS configuration
8. Process manager (PM2)
9. Backup strategy
10. Monitoring setup

**Exit Codes:**
- `0`: Ready for deployment
- `1`: Critical issues preventing deployment

---

## Recommended Workflow

### Development Setup

```bash
# 1. Create .env file from example
cp .env.example .env

# 2. Edit .env with your configuration
nano .env

# 3. Install dependencies
npm install

# 4. Validate environment
npm run validate:env

# 5. Start server (will auto-validate)
npm start
```

### Testing Workflow

```bash
# 1. Run security scan
npm run check:security

# 2. Start server
npm start &

# 3. Run API tests (in another terminal)
npm run test:api

# 4. Run full system check
npm run check:system
```

### Pre-Deployment Workflow

```bash
# 1. Run all checks
npm run validate:env
npm run check:security
npm run check:deployment

# 2. Fix any issues reported

# 3. Test in staging environment

# 4. Deploy to production
```

---

## Script Details

### validate-env.js

**Input:** `.env` file  
**Output:** Validation report with pass/fail/warnings

**Example Output:**
```
============================================================
KsheerMitra Backend - Environment Variable Validation
============================================================

✅ .env file found

Checking Required Variables:
------------------------------------------------------------
✅ PORT: 5000
✅ NODE_ENV: development

Checking Database Configuration:
------------------------------------------------------------
✅ PostgreSQL Configuration (PG_*):
   Host: localhost
   Port: 5432
   User: postgres
   Database: ksheermitra

✅ Environment validation PASSED!
```

---

### system-check.js

**Input:** Running system, .env configuration  
**Output:** Comprehensive system status report

**Example Output:**
```
============================================================
KsheerMitra - Full System Check
============================================================

1. Environment Variable Check:
------------------------------------------------------------
✅ PORT: pass
✅ NODE_ENV: pass
✅ Database Config: pass

2. Database Connectivity:
------------------------------------------------------------
✅ Legacy DB Connection (pg): Connected
✅ Sequelize Connection: Connected

...

System Check Summary:
✅ Passed:   15
⚠️  Warnings: 2
❌ Failed:   0
```

---

### security-scan.sh

**Input:** Source code files  
**Output:** Security audit report

**Example Output:**
```
============================================================
Security Check: Scanning for Hardcoded Credentials
============================================================

1. Checking for hardcoded passwords...
✅ No hardcoded passwords found

2. Checking for hardcoded API keys...
✅ No hardcoded API keys found

...

✅ Security scan PASSED
   No critical security issues found
```

---

### test-api.js

**Input:** Running server  
**Output:** API endpoint test results

**Example Output:**
```
============================================================
KsheerMitra - API Endpoint Testing
Base URL: http://localhost:5000
============================================================

1. Health & Meta Endpoints:
------------------------------------------------------------
✅ GET /health: Status 200
✅ GET /meta: Status 200

...

API Test Summary:
✅ Passed: 12
❌ Failed: 0
```

---

### deployment-check.sh

**Input:** Project files, .env configuration  
**Output:** Deployment readiness report

**Example Output:**
```
============================================================
KsheerMitra - Deployment Readiness Check
============================================================

1. Environment Configuration:
------------------------------------------------------------
✅ .env file exists
✅ PORT configured
⚠️  NODE_ENV is development (should be 'production')

...

Deployment Readiness Summary
✅ Passed: 11
⚠️  Warnings: 6
❌ Failed: 1

❌ NOT READY FOR DEPLOYMENT
   Fix critical issues before deploying.
```

---

## Continuous Integration

These scripts can be integrated into CI/CD pipelines:

### GitHub Actions Example

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
        working-directory: ./backend
      
      - name: Validate environment
        run: npm run validate:env
        working-directory: ./backend
      
      - name: Security scan
        run: npm run check:security
        working-directory: ./backend
      
      - name: Start server
        run: npm start &
        working-directory: ./backend
      
      - name: Test API endpoints
        run: npm run test:api
        working-directory: ./backend
```

---

## Troubleshooting

### "command not found: node"
Ensure Node.js is installed: `node --version`

### "Server is not running" (test-api.js)
Start the server first: `npm start`

### "PostgreSQL connection failed" (system-check.js)
Ensure PostgreSQL is running and credentials in .env are correct

### "Permission denied" (shell scripts)
Make scripts executable: `chmod +x scripts/*.sh`

---

## Contributing

When adding new scripts:

1. Add appropriate error handling
2. Provide clear output with symbols (✅ ❌ ⚠️)
3. Use proper exit codes
4. Update this README
5. Add npm script in package.json
6. Test thoroughly

---

## Support

For issues with these scripts:
1. Check the troubleshooting section above
2. Review the SYSTEM_CHECK_REPORT.md
3. Check individual script output for specific errors
4. Contact the development team

---

**Last Updated:** October 19, 2025  
**Version:** 1.0.0
