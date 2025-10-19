# KsheerMitra - Developer Quick Start Guide

This guide will help you get the KsheerMitra application running on your local machine in under 10 minutes.

## Prerequisites

### Required
- **Node.js** 16+ and npm (`node --version` && `npm --version`)
- **PostgreSQL** 12+ (`psql --version`)
- **Git** (`git --version`)

### Optional (for mobile app)
- **Flutter** 3.0+ (`flutter --version`)
- **Android Studio** or **Xcode**
- Physical device or emulator

---

## Backend Setup (5 minutes)

### Step 1: Clone and Install

```bash
# Clone repository
git clone https://github.com/Vavilla-Mahesh/KsheerMitra.git
cd KsheerMitra/backend

# Install dependencies
npm install
```

### Step 2: Database Setup

```bash
# Create database
createdb ksheermitra_dev

# Or using psql
psql -U postgres
CREATE DATABASE ksheermitra_dev;
\q
```

### Step 3: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use your preferred editor
```

**Minimal .env configuration:**
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*

# Database
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=ksheermitra_dev

# Security
JWT_SECRET=your_random_secret_key_here

# Optional Features (can leave disabled for now)
ENABLE_WHATSAPP=false
ENABLE_CRON=false
```

### Step 4: Run Migrations

```bash
# Connect to database and run migrations
psql -U postgres -d ksheermitra_dev -f migrations/001_initial_schema.sql
psql -U postgres -d ksheermitra_dev -f migrations/002_products_and_subscriptions.sql
psql -U postgres -d ksheermitra_dev -f migrations/003_delivery_routes.sql
psql -U postgres -d ksheermitra_dev -f migrations/004_whatsapp_googlemaps_integration.sql
psql -U postgres -d ksheermitra_dev -f migrations/005_multi_product_subscriptions.sql
```

### Step 5: Validate Setup

```bash
# Validate environment
npm run validate:env

# Expected output: ✅ Environment validation PASSED!
```

### Step 6: Start Server

```bash
# Start the server
npm start

# Or for development with auto-reload
npm run dev

# Expected output:
# Server running on port 5000
# Environment: development
# PostgreSQL connection established successfully
```

### Step 7: Test Backend

Open another terminal:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Expected: {"success":true,"message":"Server is healthy","timestamp":"..."}

# Run API tests
npm run test:api
```

✅ **Backend is now running!**

---

## Frontend Setup (5 minutes)

### Step 1: Navigate to Flutter Project

```bash
cd ../ksheermitra  # From backend directory
```

### Step 2: Install Dependencies

```bash
# Get Flutter packages
flutter pub get
```

### Step 3: Configure API Endpoint

**Option A: Using dart-define (Recommended)**

No configuration needed! Just run with the flag:

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:5000
```

**Option B: Edit config file**

Edit `lib/config/api_config.dart`:

```dart
class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:5000',  // Change this
  );
  // ... rest of file
}
```

### Step 4: Setup Emulator/Device

**Android:**
```bash
# List devices
flutter devices

# Start emulator (if none running)
flutter emulators
flutter emulators --launch <emulator_id>
```

**iOS:**
```bash
# List simulators
xcrun simctl list devices

# Start simulator
open -a Simulator
```

### Step 5: Run App

```bash
# For Android emulator (use 10.0.2.2 for localhost)
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000

# For iOS simulator
flutter run --dart-define=API_BASE_URL=http://localhost:5000

# For physical device (use your computer's IP)
flutter run --dart-define=API_BASE_URL=http://192.168.1.100:5000
```

✅ **Frontend is now running!**

---

## Quick Test Workflow

### Test 1: Create Admin User

The server automatically creates an admin user on first start:
- Phone: `9999999999`
- Password: `admin123`

### Test 2: Login via Flutter App

1. Open the app
2. Navigate to login screen
3. Enter phone: `9999999999`
4. Enter password: `admin123`
5. Click login

### Test 3: Create a Product

**Via API (cURL):**
```bash
# First login to get token
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9999999999","password":"admin123"}'

# Copy the token from response
TOKEN="your_token_here"

# Create product
curl -X POST http://localhost:5000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Milk","description":"Fresh cow milk","unit_price":50,"unit":"liter"}'
```

**Via Flutter App:**
1. Login as admin
2. Navigate to Products
3. Click "Add Product"
4. Fill in details and save

### Test 4: Create Subscription

1. Login as customer (create new account)
2. Browse products
3. Select product
4. Click "Subscribe"
5. Choose schedule and save

---

## Common Issues & Solutions

### ❌ "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Windows:
# Start PostgreSQL from Services
```

### ❌ "Port 5000 already in use"

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env
```

### ❌ "Flutter: Unable to connect to backend"

**Solution:**
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical device, use your computer's IP address
- Check firewall is not blocking connections
- Ensure backend is running

### ❌ "Google Maps not showing"

**Solution:**
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_API_KEY"/>
```

### ❌ "JWT secret not configured"

**Solution:**
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
JWT_SECRET=generated_secret_here
```

---

## Development Tools

### Useful Commands

```bash
# Backend
npm run validate:env      # Validate environment
npm run check:system      # Full system check
npm run check:security    # Security scan
npm run test:api          # Test API endpoints
npm run dev               # Development mode with auto-reload

# Frontend
flutter analyze           # Analyze code
flutter test              # Run tests
flutter build apk         # Build Android APK
flutter clean             # Clean build files
```

### Recommended VS Code Extensions

**Backend:**
- ESLint
- Prettier
- REST Client
- PostgreSQL

**Frontend:**
- Flutter
- Dart
- Flutter Widget Snippets

### Database Tools

- **pgAdmin** - GUI for PostgreSQL
- **DBeaver** - Universal database tool
- **Postico** - macOS PostgreSQL client

### API Testing

- **Postman** - API testing tool
- **Insomnia** - REST client
- **curl** - Command line tool

---

## Next Steps

After setup:

1. 📖 Read [SYSTEM_CHECK_REPORT.md](../SYSTEM_CHECK_REPORT.md) for complete system overview
2. 📱 Read [FLUTTER_SETUP_GUIDE.md](../FLUTTER_SETUP_GUIDE.md) for detailed Flutter setup
3. ✅ Follow [TESTING_CHECKLIST.md](../TESTING_CHECKLIST.md) for comprehensive testing
4. 🚀 Review [DEPLOYMENT.md](../DEPLOYMENT.md) for deployment guidelines
5. 📚 Check [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) for API reference

---

## Getting Help

- 📖 Check existing documentation in the repository
- 🔍 Search [Issues](https://github.com/Vavilla-Mahesh/KsheerMitra/issues)
- 💬 Ask questions in [Discussions](https://github.com/Vavilla-Mahesh/KsheerMitra/discussions)
- 📧 Contact the development team

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run validation scripts
5. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

---

**Happy Coding! 🚀**

*Last updated: October 19, 2025*
