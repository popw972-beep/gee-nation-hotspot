# 🧪 Complete Local Testing Guide

## ⚡ 30-Second Quick Start

```bash
# 1. Start database
docker run --name gee-nation-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=gee_nation -p 5432:5432 -d postgres:15

# 2. Install & setup
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# 3. Run
npm run dev

# 4. Access
# Admin: http://localhost:3000/admin
# Portal: http://localhost:3000/portal
```

---

## 🎯 Test Scenarios

### Scenario 1: M-Pesa Payment Flow (Recommended First Test)

**Goal:** Test complete payment from selection to callback

**Steps:**

1. **Open Captive Portal**
   ```
   URL: http://localhost:3000/portal
   ```

2. **Select Package**
   - Click "1 Day - KSh 100"
   - Click "PAY WITH M-PESA"

3. **Enter Phone Number**
   - Enter: `0712345678`
   - Click "Pay KSh 100"

4. **Simulate M-Pesa Response**
   ```bash
   curl -X POST http://localhost:3000/api/mpesa/callback \
     -H "Content-Type: application/json" \
     -d '{
       "Body": {
         "stkCallback": {
           "CheckoutRequestID": "ws_CO_12345",
           "ResultCode": 0,
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

5. **Verify in Database**
   ```bash
   npm run db:studio
   # Check: Transaction table → status should be "Completed"
   ```

6. **Check Admin Dashboard**
   ```
   URL: http://localhost:3000/admin
   Check: Today's Revenue increased by KSh 100
   ```

---

### Scenario 2: Voucher Generation & Validation

**Goal:** Test creating and using voucher codes

**Steps:**

1. **Generate Vouchers via API**
   ```bash
   curl -X POST http://localhost:3000/api/voucher/generate \
     -H "Content-Type: application/json" \
     -d '{
       "planName": "1 Hour",
       "count": 5
     }'
   ```

2. **View Generated Vouchers**
   ```bash
   npm run db:studio
   # Navigate to Voucher table
   # You should see 5 new codes with format: GNS-XXXX-XXXX
   ```

3. **Use Voucher in Portal**
   - Open http://localhost:3000/portal
   - Click "LOGIN WITH VOUCHER"
   - Enter one of the generated codes
   - Should activate WiFi access

4. **Verify in Admin**
   - Go to http://localhost:3000/admin/vouchers
   - See generated vouchers with "Used" status

---

### Scenario 3: User Management

**Goal:** Test creating and managing WiFi users

**Steps:**

1. **View Existing Users**
   ```
   URL: http://localhost:3000/admin/users
   Should show:
   - john_doe (1 Day)
   - mary_wanjiku (3 Hours)
   - peter_kari (1 Week)
   ```

2. **Create New User**
   - Click "Add User"
   - Enter details:
     - Username: testuser
     - IP: 192.168.88.10
     - Plan: 1 Day
   - Click Save

3. **Verify User Added**
   ```bash
   npm run db:studio
   # Check User table for new entry
   ```

4. **Create on MikroTik** (if connected)
   ```bash
   curl -X POST http://localhost:3000/api/hotspot/user/add \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "password": "testuser",
       "profile": "1Day_Profile"
     }'
   ```

---

### Scenario 4: Revenue Reports

**Goal:** Test dashboard analytics and reports

**Steps:**

1. **Open Admin Dashboard**
   ```
   URL: http://localhost:3000/admin
   ```

2. **Verify Statistics**
   - Total Users: 248 (from sample data)
   - Active Users: 124
   - Today's Revenue: KSh 12,450
   - Transactions: 68

3. **View Revenue Chart**
   - Should show line chart with revenue over days
   - Month-over-month growth

4. **Access Reports Page**
   ```
   URL: http://localhost:3000/admin/reports
   ```
   - Export data as CSV
   - View detailed transaction history

---

## 🔍 API Testing with cURL

### Test M-Pesa Initiation
```bash
curl -X POST http://localhost:3000/api/mpesa/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0712345678",
    "amount": 100,
    "packageId": "1day"
  }'
```

**Expected:** 200 OK with CheckoutRequestID

---

### Test Voucher Generation
```bash
curl -X POST http://localhost:3000/api/voucher/generate \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "1 Day",
    "count": 10
  }'
```

**Expected:** 200 OK with success message

---

### Test Voucher Validation
```bash
curl -X POST http://localhost:3000/api/voucher/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "GNS-1H00-TEST"
  }'
```

**Expected:** 200 OK with voucher details

---

### Test Hotspot User Creation
```bash
curl -X POST http://localhost:3000/api/hotspot/user/add \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "newuser123",
    "profile": "1Hour_Profile",
    "limitUpstream": "2M",
    "limitDownstream": "2M"
  }'
```

**Expected:** 200 OK with success message

---

### Get All Users
```bash
curl http://localhost:3000/api/users
```

**Expected:** 200 OK with array of users

---

### Get All Transactions
```bash
curl http://localhost:3000/api/transactions
```

**Expected:** 200 OK with array of transactions

---

## 📊 Database Direct Testing

### Using Prisma Studio

```bash
npm run db:studio
```

**Then you can:**
- View all tables in GUI
- Add/edit/delete records
- Query data
- Test relationships

---

### Using SQL Directly

```bash
# Connect to database
psql postgresql://postgres:password@localhost:5432/gee_nation

# View users
SELECT * FROM "User";

# View transactions
SELECT * FROM "Transaction";

# View vouchers
SELECT * FROM "Voucher";

# Count active users
SELECT COUNT(*) FROM "User" WHERE status = 'Active';

# Total revenue
SELECT SUM(amount) FROM "Transaction" WHERE status = 'Completed';
```

---

## 📱 Mobile Testing

### Test on Physical Device

```bash
# Find your PC IP
ipconfig         # Windows
ifconfig         # macOS/Linux

# On your phone, visit:
http://your-pc-ip:3000

# Test portal on mobile
http://your-pc-ip:3000/portal
```

### Test with Browser DevTools

```
1. Press F12 (or Cmd+Option+I on Mac)
2. Click mobile icon
3. Test on different screen sizes:
   - iPhone SE (375x667)
   - iPhone 12 (390x844)
   - iPad (768x1024)
   - Galaxy S21 (360x800)
```

---

## 🔐 Security Testing

### Test Input Validation

**SQL Injection Test:**
```bash
curl -X POST http://localhost:3000/api/voucher/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "'; DROP TABLE Voucher; --"
  }'
# Should return validation error, not drop table
```

**XSS Test:**
- Try entering `<script>alert("xss")</script>` in forms
- Should be sanitized/escaped

---

## 📈 Performance Testing

### Load Test (Simple)

```bash
# Install Apache Bench
# macOS: brew install httpd
# Ubuntu: sudo apt-get install apache2-utils

# Run load test
ab -n 100 -c 10 http://localhost:3000/

# This sends 100 requests with 10 concurrent
```

---

## 🔧 Debugging Tips

### Enable Verbose Logging

```bash
# In .env.local, add:
DEBUG=*

# Run again
npm run dev
```

### View Database Queries

```bash
# In .env.local, add:
DATABASE_URL="postgresql://...?schema=public"

# Then check terminal for all SQL queries
```

### Check Network Requests

1. Open DevTools (F12)
2. Go to "Network" tab
3. Refresh page
4. Click requests to see:
   - Request/Response headers
   - Payload sent
   - Response received

### Check Browser Console

1. Open DevTools (F12)
2. Go to "Console" tab
3. Look for errors (red text)
4. Check logs from application

---

## ✅ Testing Checklist

### Basic Setup
- [ ] PostgreSQL running
- [ ] npm install complete
- [ ] .env.local configured
- [ ] Database migrations done
- [ ] Sample data seeded
- [ ] Dev server running

### UI Testing
- [ ] Admin dashboard loads
- [ ] Admin pages accessible
- [ ] Captive portal responsive
- [ ] Mobile view works

### M-Pesa Integration
- [ ] API endpoint responds
- [ ] Payment initiation works
- [ ] Callback processing works
- [ ] Transaction saved correctly
- [ ] Revenue updated in dashboard

### Voucher System
- [ ] Voucher generation works
- [ ] Codes generated correctly
- [ ] Voucher validation works
- [ ] Used status updates

### Database
- [ ] Data persists after restart
- [ ] Relationships work correctly
- [ ] Queries execute efficiently
- [ ] Backup/restore works

### Security
- [ ] Input validation works
- [ ] XSS protection enabled
- [ ] SQL injection prevented
- [ ] Sensitive data not logged

---

## 🎯 Success Criteria

Your setup is complete when:

✅ You can see admin dashboard
✅ You can select a package on portal
✅ You can complete a payment flow
✅ Transaction appears in database
✅ Revenue updates on dashboard
✅ Vouchers can be created and used
✅ Mobile view is responsive

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| View database GUI | `npm run db:studio` |
| Seed data | `npm run db:seed` |
| Reset database | `npm run db:reset` |
| Build production | `npm run build` |
| Check database | `psql -U postgres -d gee_nation` |
| View Docker logs | `docker logs gee-nation-db` |
| Stop Docker | `docker stop gee-nation-db` |

---

## 🚀 Next Steps After Testing

1. **Deploy to Staging**
   - Use Vercel, Railway, or DigitalOcean
   - Point to staging database

2. **Switch to Production M-Pesa**
   - Update credentials in `.env.production`
   - Test with small amounts first

3. **Configure MikroTik**
   - Set up router with actual IP
   - Create hotspot profiles
   - Test user creation

4. **Setup Monitoring**
   - Add error tracking (Sentry)
   - Add analytics (Vercel Analytics)
   - Setup email alerts

5. **Go Live**
   - Deploy to production
   - Monitor first transactions closely
   - Be ready to rollback if needed

---

Happy Testing! 🎉
