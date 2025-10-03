# KsheerMitra Deployment Guide

This guide covers deploying both the backend API and Flutter mobile app to production.

## Table of Contents
- [Backend Deployment](#backend-deployment)
- [Database Setup](#database-setup)
- [Flutter App Deployment](#flutter-app-deployment)
- [Production Checklist](#production-checklist)

---

## Backend Deployment

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

#### Prerequisites
- Ubuntu/Debian server
- Node.js 18+ installed
- PostgreSQL 14+ installed
- Domain name (optional but recommended)

#### Steps

1. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (for reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

2. **Setup PostgreSQL**
```bash
# Create database and user
sudo -u postgres psql

postgres=# CREATE DATABASE ksheer_mitra;
postgres=# CREATE USER ksheer_user WITH PASSWORD 'your_secure_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE ksheer_mitra TO ksheer_user;
postgres=# \q
```

3. **Deploy Application**
```bash
# Clone repository
git clone https://github.com/your-repo/KsheerMitra.git
cd KsheerMitra/backend

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env  # Edit with production values
```

4. **Run Migrations**
```bash
psql -h localhost -U ksheer_user -d ksheer_mitra -f migrations/001_initial_schema.sql
```

5. **Start with PM2**
```bash
# Start application
pm2 start server.js --name ksheer-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

6. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/ksheer-api
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ksheer-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Setup SSL with Let's Encrypt**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Option 2: Docker Deployment

#### Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: ksheer_mitra
      POSTGRES_USER: ksheer_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  api:
    build: ./backend
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ksheer_user
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ksheer_mitra
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Deploy:
```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

#### Heroku
```bash
# Create app
heroku create ksheer-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_ACCESS_SECRET=your_secret
heroku config:set JWT_REFRESH_SECRET=your_secret
heroku config:set BCRYPT_ROUNDS=12

# Deploy
git push heroku main

# Run migrations
heroku pg:psql < backend/migrations/001_initial_schema.sql
```

#### AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init ksheer-api

# Create environment
eb create ksheer-production

# Deploy
eb deploy
```

---

## Database Setup

### Production Best Practices

1. **Security**
```sql
-- Create read-only user for reporting
CREATE USER readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE ksheer_mitra TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
```

2. **Backups**
```bash
# Automated daily backup
crontab -e

# Add line:
0 2 * * * pg_dump -U ksheer_user ksheer_mitra | gzip > /backups/ksheer_$(date +\%Y\%m\%d).sql.gz
```

3. **Performance Indexes**
```sql
-- Already included in migrations, but verify:
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_date ON orders(order_date);
```

4. **Connection Pooling** (if scaling beyond single client)
Consider upgrading to pg Pool for production at scale.

---

## Flutter App Deployment

### Android

#### Prerequisites
- Android Studio installed
- Java JDK 11+
- Android SDK

#### Build Steps

1. **Update Version**
Edit `pubspec.yaml`:
```yaml
version: 1.0.0+1  # version+build_number
```

2. **Configure Signing**
Create `android/key.properties`:
```properties
storePassword=your_keystore_password
keyPassword=your_key_password
keyAlias=ksheer
storeFile=/path/to/keystore.jks
```

Generate keystore:
```bash
keytool -genkey -v -keystore ~/ksheer-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ksheer
```

Update `android/app/build.gradle`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

3. **Build Release**
```bash
# Clean
flutter clean

# Get dependencies
flutter pub get

# Build APK
flutter build apk --release --dart-define=API_BASE_URL=https://api.yourdomain.com

# Or build App Bundle (recommended for Play Store)
flutter build appbundle --release --dart-define=API_BASE_URL=https://api.yourdomain.com
```

Output: `build/app/outputs/bundle/release/app-release.aab`

4. **Upload to Google Play**
- Go to Google Play Console
- Create app
- Upload AAB file
- Fill in store listing details
- Submit for review

### iOS

#### Prerequisites
- macOS with Xcode installed
- Apple Developer account ($99/year)

#### Build Steps

1. **Configure Xcode**
```bash
cd flutter_app/ios
open Runner.xcworkspace
```

In Xcode:
- Set Team
- Set Bundle Identifier (com.yourcompany.ksheermitra)
- Configure signing

2. **Update Info.plist**
Add network security:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>yourdomain.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSIncludesSubdomains</key>
            <true/>
        </dict>
    </dict>
</dict>
```

3. **Build Archive**
```bash
# Clean
flutter clean

# Build
flutter build ios --release --dart-define=API_BASE_URL=https://api.yourdomain.com
```

In Xcode:
- Product > Archive
- Distribute App
- Upload to App Store

4. **App Store Connect**
- Create app listing
- Upload build
- Submit for review

---

## Production Checklist

### Backend

- [ ] Environment variables set securely
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled
- [ ] JWT secrets are strong and unique
- [ ] CORS configured for specific origins
- [ ] Rate limiting configured
- [ ] Error logging implemented
- [ ] Health monitoring setup
- [ ] PM2 or similar process manager
- [ ] Nginx reverse proxy configured
- [ ] Firewall configured (only 80, 443, SSH)
- [ ] Database connection limits set
- [ ] Indexes optimized

### Database

- [ ] Production credentials different from dev
- [ ] Daily automated backups
- [ ] Backup restoration tested
- [ ] Read replicas (if needed)
- [ ] Connection pooling (if scaling)
- [ ] Query performance monitored

### Flutter App

- [ ] API_BASE_URL points to production
- [ ] App signed with release keys
- [ ] Keystore backed up securely
- [ ] Version incremented
- [ ] Release build tested
- [ ] Network security configured
- [ ] App permissions reviewed
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] App icon and splash screen set

### Security

- [ ] All secrets in environment variables
- [ ] No hardcoded credentials
- [ ] HTTPS enforced
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] Rate limiting tested
- [ ] Password hashing verified (bcrypt, cost 12)
- [ ] JWT expiration appropriate (15m access, 30d refresh)
- [ ] Refresh token rotation working
- [ ] Logout revokes tokens

### Monitoring

- [ ] Server monitoring (CPU, memory, disk)
- [ ] Application logging
- [ ] Error tracking (Sentry, etc.)
- [ ] API response time monitoring
- [ ] Database query performance
- [ ] Uptime monitoring
- [ ] Alert system configured

### Documentation

- [ ] API documentation updated
- [ ] Deployment procedures documented
- [ ] Troubleshooting guide created
- [ ] Environment variables documented
- [ ] Architecture diagrams created

---

## Environment Variables Reference

### Production Backend (.env)

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=ksheer_user
DB_PASSWORD=your-secure-db-password
DB_NAME=ksheer_mitra

# JWT (Generate strong secrets)
JWT_ACCESS_SECRET=your-very-long-random-access-secret-change-this
JWT_REFRESH_SECRET=your-very-long-random-refresh-secret-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Security
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Generate Secrets

```bash
# Generate strong secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Troubleshooting

### Backend Issues

**Database connection fails**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check network connectivity
psql -h DB_HOST -U DB_USER -d DB_NAME

# Check firewall
sudo ufw status
```

**PM2 process crashes**
```bash
# View logs
pm2 logs ksheer-api

# Restart
pm2 restart ksheer-api

# Monitor
pm2 monit
```

### Flutter Build Issues

**Android build fails**
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter build apk --release
```

**iOS signing issues**
- Verify certificates in Xcode
- Check Team setting
- Verify Bundle Identifier

### Performance Issues

**Database slow queries**
```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Add indexes as needed
CREATE INDEX CONCURRENTLY idx_name ON table_name(column_name);
```

**API response slow**
- Check database indexes
- Monitor server resources
- Consider caching
- Optimize queries

---

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**
   - Nginx or cloud load balancer
   - Multiple API instances
   - Sticky sessions for WebSocket (if added)

2. **Database**
   - Connection pooling (pg Pool)
   - Read replicas for reports
   - Caching layer (Redis)

3. **File Storage**
   - S3 or similar for assets
   - CDN for static content

### Monitoring & Alerts

- **Application**: PM2, New Relic, DataDog
- **Infrastructure**: CloudWatch, Prometheus
- **Errors**: Sentry, Rollbar
- **Uptime**: Pingdom, StatusCake

---

## Maintenance

### Regular Tasks

**Daily**
- Monitor logs for errors
- Check server resources
- Verify backups completed

**Weekly**
- Review slow queries
- Check disk space
- Update dependencies (security patches)

**Monthly**
- Review user feedback
- Analyze usage patterns
- Plan feature updates
- Security audit

### Updates

```bash
# Backend dependencies
npm audit
npm update

# Flutter dependencies
flutter pub outdated
flutter pub upgrade
```

---

## Support

For deployment issues:
- Check logs: `pm2 logs ksheer-api`
- Review documentation
- Contact: devops@ksheermitra.com
