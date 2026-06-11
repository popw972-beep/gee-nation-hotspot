# G££ Nation Hotspot - Complete Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start PostgreSQL with Docker
```bash
docker run --name gee-nation-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=gee_nation \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed sample data
npm run db:seed
```

### 4. Start Dev Server
```bash
npm run dev
```

**Access:**
- 📊 Admin: http://localhost:3000/admin
- 🌐 Portal: http://localhost:3000/portal

---

## 📋 Prerequisites

### Required Software
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 13+ or **Docker** ([Download Docker](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

### M-Pesa Daraja Account
- Create account at: https://sandbox.safaricom.co.ke/
- Generate credentials:
  - Consumer Key
  - Consumer Secret
  - Shortcode
  - Passkey

### MikroTik Router (Optional for local testing)
- IP: 192.168.88.1
- Default credentials: admin/admin

---

## 🗄️ Database Setup

### Option A: Docker (Recommended - Fastest)

```bash
# Create and start PostgreSQL container
docker run --name gee-nation-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=gee_nation \
  -p 5432:5432 \
  -d postgres:15

# Verify connection
docker exec -it gee-nation-db psql -U postgres -c "SELECT 1"
```

### Option B: Local PostgreSQL Installation

#### macOS (Homebrew)
```bash
# Install
brew install postgresql@15

# Start service
brew services start postgresql@15

# Verify
psql -U postgres -c "SELECT 1"
```

#### Ubuntu/Debian
```bash
# Install
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Verify
sudo -u postgres psql -c "SELECT 1"
```

#### Windows
- Download installer: https://www.postgresql.org/download/windows/
- Run installer and follow setup wizard
- Verify: Open pgAdmin or command prompt

---

## ⚙️ Environment Configuration

### Update `.env.local`

1. Open `.env.local` in your editor
2. Update with your actual credentials:

```env
# Database (adjust password if different)
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/gee_nation"

# Application
NEXT_PUBLIC_URL="http://localhost:3000"
NODE_ENV="development"

# M-Pesa (from Daraja sandbox)
MPESA_CONSUMER_KEY="paste_your_consumer_key"
MPESA_CONSUMER_SECRET="paste_your_consumer_secret"
MPESA_SHORTCODE="174379"
MPESA_PASSKEY="paste_your_passkey"

# MikroTik Router
MIKROTIK_HOST="192.168.88.1"
MIKROTIK_PORT="8728"
MIKROTIK_USER="admin"
MIKROTIK_PASSWORD="admin"
```

**Get M-Pesa Credentials:**
1. Visit: https://sandbox.safaricom.co.ke/
2. Sign in with your account
3. Go to "My Apps"
4. Copy Consumer Key & Consumer Secret
5. Go to "Test Credentials"
6. Copy Shortcode & Passkey

---

## 🗃️ Prisma & Database Migrations

### Initialize Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init
```

This will:
- Create database schema (tables for User, Transaction, Voucher)
- Generate Prisma client
- Create migration files

### Seed Sample Data

```bash
npm run db:seed
```

This creates:
- **3 Sample Users** (john_doe, mary_wanjiku, peter_kari)
- **5 Sample Vouchers** (GNS-1H00-TEST, GNS-3H00-TEST, etc.)
- **3 Sample Transactions** (2 completed, 1 pending)

### View Database

```bash
# Open Prisma Studio (GUI)
npm run db:studio
```

Opens at: http://localhost:5555

---

## 🏃 Start Development Server

```bash
npm run dev
```

**Output:**
```
  ▲ Next.js 14.2.3
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1234ms
```

---

## 📱 Access Different Sections

### Admin Dashboard
```
URL: http://localhost:3000/admin
Email: admin
Password: admin
```

**Available Pages:**
- Dashboard - Statistics & revenue charts
- Users - Manage WiFi users
- Vouchers - Generate & track voucher codes
- Payments - View M-Pesa transactions
- Plans - Configure WiFi packages
- Reports - Revenue analytics
- Settings - Router & API configuration

### Customer Captive Portal
```
URL: http://localhost:3000/portal
```

**Features:**
- Browse WiFi packages
- Pay with M-Pesa (test mode)
- Login with voucher code
- Responsive mobile design

---

## 🧪 Testing M-Pesa Integration

### Test 1: Initiate Payment

```bash
curl -X POST http://localhost:3000/api/mpesa/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0712345678",
    "amount": 100,
    "packageId": "1day"
  }'
```

**Expected Response:**
```json
{
  "MerchantRequestID": "123-456",
  "CheckoutRequestID": "ws_CO_12345",
  "ResponseCode": "0"
}
```

### Test 2: Simulate M-Pesa Callback

In production, M-Pesa sends a callback. For testing, simulate it:

```bash
curl -X POST http://localhost:3000/api/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "123-456",
        "CheckoutRequestID": "ws_CO_12345",
        "ResultCode": 0,
        "ResultDesc": "The service request is processed successfully.",
        "CallbackMetadata": {
          "Item": [
            { "Name": "Amount", "Value": 100 },
            { "Name": "MpesaReceiptNumber", "Value": "MEB123456" },
            { "Name": "PhoneNumber", "Value": "254712345678" }
          ]
        }
      }
    }
  }'
```

**Verify in Database:**
```bash
npm run db:studio
# Navigate to Transaction table
# Should show status: "Completed" for checkout ws_CO_12345
```

### Test 3: Full Payment Flow in UI

1. Open http://localhost:3000/portal
2. Select "1 Day - KSh 100"
3. Click "PAY WITH M-PESA"
4. Enter phone: 0712345678
5. Click "Pay KSh 100"
6. Simulate callback (use curl command above)
7. Check admin dashboard for completed transaction

---

## 🎟️ Testing Voucher System

### Generate Vouchers

```bash
curl -X POST http://localhost:3000/api/voucher/generate \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "1 Day",
    "count": 10
  }'
```

### Validate Voucher

```bash
curl -X POST http://localhost:3000/api/voucher/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "GNS-1H00-TEST"
  }'
```

### View in Admin

1. Go to http://localhost:3000/admin/vouchers
2. Click "Generate Vouchers"
3. Enter plan name and quantity
4. View generated codes

---

## 🔌 Testing MikroTik Integration

### Check Router Connection

```bash
# Ping router
ping 192.168.88.1

# SSH into router
ssh admin@192.168.88.1
# Password: admin

# View hotspot users
/ip/hotspot/user/print
```

### Create User via API

```bash
curl -X POST http://localhost:3000/api/hotspot/user/add \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "password": "testuser123",
    "profile": "1Day_Profile",
    "limitUpstream": "5M",
    "limitDownstream": "5M"
  }'
```

### Verify User Created

```bash
# SSH into router
ssh admin@192.168.88.1

# List hotspot users
/ip/hotspot/user/print

# Should show: testuser123 with profile 1Day_Profile
```

---

## 📊 Database Commands

```bash
# View data in GUI
npm run db:studio

# Create new migration
npm run db:migrate

# Seed sample data
npm run db:seed

# Reset database (WARNING: deletes all data)
npm run db:reset

# Backup database
pg_dump gee_nation > backup.sql

# Restore database
psql gee_nation < backup.sql
```

---

## 🐛 Troubleshooting

### Issue: Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# If using Docker:
docker start gee-nation-db

# If local PostgreSQL:
# macOS: brew services start postgresql@15
# Ubuntu: sudo systemctl start postgresql
```

### Issue: Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Issue: M-Pesa API Error

```
Error: Invalid credentials or API not responding
```

**Solution:**
1. Verify `.env.local` has correct credentials
2. Check internet connection
3. Visit https://sandbox.safaricom.co.ke/ - ensure credentials are valid
4. IP whitelisting: Add your IP to Daraja settings
5. Check firewall/antivirus blocking requests

### Issue: Prisma Migration Error

```bash
# Reset database completely
npm run db:reset

# This will:
# 1. Drop all tables
# 2. Recreate schema
# 3. Run all migrations
# 4. Seed sample data
```

### Issue: MikroTik Connection Failed

```
Error: Connection refused or timeout
```

**Solution:**
```bash
# Verify router is accessible
ping 192.168.88.1

# Check if router API is enabled
ssh admin@192.168.88.1
/ip/service/enable api

# Verify credentials are correct
# Default: admin/admin
```

---

## 📈 Monitoring & Logs

### View Application Logs

```bash
# Dev server automatically shows logs
npm run dev

# Check for errors in terminal
```

### View Database Logs

```bash
# If using Docker
docker logs gee-nation-db

# If local PostgreSQL
# macOS: /usr/local/var/log/postgres.log
# Ubuntu: /var/log/postgresql/
```

### Database Backup

```bash
# Backup database
pg_dump -U postgres gee_nation > backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup_*.sql
```

---

## ✅ Pre-Production Checklist

- [ ] Database backed up
- [ ] All M-Pesa credentials working
- [ ] MikroTik router configured
- [ ] Admin dashboard tested
- [ ] Payment flow tested end-to-end
- [ ] Voucher system tested
- [ ] Mobile responsiveness verified
- [ ] Error logging configured
- [ ] Email notifications setup
- [ ] Rate limiting implemented
- [ ] Security headers added
- [ ] HTTPS/SSL configured

---

## 📚 Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm install             # Install dependencies
npm run build          # Build for production
npm start              # Run production build

# Database
npm run db:studio     # Open Prisma GUI
npm run db:migrate    # Run migrations
npm run db:seed       # Seed sample data
npm run db:reset      # Reset database

# Testing
curl -X POST ...      # Test APIs with curl
npm run lint          # Check code quality

# Docker
docker ps             # List running containers
docker logs <name>    # View container logs
docker stop <name>    # Stop container
docker rm <name>      # Remove container
```

---

## 🆘 Getting Help

If you encounter issues:

1. **Check logs** - Terminal and browser console
2. **Verify configuration** - `.env.local` settings
3. **Test connectivity** - Ping database, router, M-Pesa
4. **Check documentation** - Review relevant API docs
5. **Database Studio** - Run `npm run db:studio` to inspect data

---

## 🎉 You're All Set!

Your G££ Nation Hotspot system is ready for local testing. Start with:

```bash
npm run dev
```

Then visit:
- Admin: http://localhost:3000/admin
- Portal: http://localhost:3000/portal

Happy testing! 🚀
