# 🚀 Deployment Guide - Binance Futures API Proxy

## Step-by-Step Deployment ke Vercel

### Option 1: Vercel CLI (Paling Cepat) ⚡

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login ke Vercel
```bash
vercel login
```

Pilih metode login:
- Email
- GitHub
- GitLab
- Bitbucket

#### 3. Deploy Project
```bash
# Masuk ke folder project
cd d:\Tugas\percobaan\binance-proxy

# Deploy (pertama kali akan setup project)
vercel

# Jawab pertanyaan setup:
# Set up and deploy? → Y
# Which scope? → (pilih account Anda)
# Link to existing project? → N
# What's your project's name? → binance-futures-proxy
# In which directory is your code located? → ./
# Want to modify these settings? → N

# Tunggu deployment selesai (~30 detik)
```

#### 4. Production Deployment
Setelah test deployment berhasil:
```bash
vercel --prod
```

#### 5. Dapatkan URL Production
Output akan menampilkan URL seperti:
```
✅  Production: https://binance-futures-proxy-xxxxx.vercel.app
```

---

### Option 2: GitHub + Vercel (Recommended untuk Auto-Deploy) 🔄

#### 1. Push ke GitHub Repository

```bash
cd d:\Tugas\percobaan\binance-proxy

# Initialize git (jika belum)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit: Binance Futures API Proxy"

# Create remote repository di GitHub dulu, kemudian:
git remote add origin https://github.com/YOUR_USERNAME/binance-futures-proxy.git

# Push
git push -u origin main
```

#### 2. Connect ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Login dengan GitHub
3. Klik **"Import Project"**
4. Pilih repository `binance-futures-proxy`
5. Configure project:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`
6. Klik **"Deploy"**

#### 3. Automatic Deployments

Setiap kali push ke GitHub, Vercel akan auto-deploy! 🎉

---

## ✅ Post-Deployment Testing

### 1. Test Health Check
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-31T13:30:00.000Z",
  "binance": "connected"
}
```

### 2. Test Ticker Endpoint
```bash
curl https://your-app.vercel.app/api/ticker/price?symbol=BTCUSDT
```

Expected response:
```json
{
  "symbol": "BTCUSDT",
  "price": "68500.00"
}
```

### 3. Open Swagger Documentation
Browser: `https://your-app.vercel.app/api-docs`

---

## 🔧 Update Trading Bot

### 1. Update reboundDetector.cjs

**File**: `src/services/reboundDetector.cjs`

Ganti:
```javascript
// OLD
const response = await axios.get('https://fapi.binance.com/fapi/v1/ticker/24hr', {
  timeout: 5000
});
```

Dengan:
```javascript
// NEW - Using Vercel Proxy
const PROXY_URL = 'https://your-app.vercel.app';
const response = await axios.get(`${PROXY_URL}/api/ticker/24hr`, {
  timeout: 5000
});
```

### 2. Update ProtectionSystem.jsx

**File**: `web/src/components/ProtectionSystem.jsx`

Ganti:
```javascript
// OLD
const response = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr');
```

Dengan:
```javascript
// NEW - Using Vercel Proxy
const PROXY_URL = 'https://your-app.vercel.app';
const response = await fetch(`${PROXY_URL}/api/ticker/24hr`);
```

### 3. Update reduce-exposure.cjs

**File**: `reduce-exposure.cjs`

Ganti:
```javascript
// OLD
const priceUrl = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;
```

Dengan:
```javascript
// NEW - Using Vercel Proxy
const PROXY_URL = 'https://your-app.vercel.app';
const priceUrl = `${PROXY_URL}/api/ticker/price?symbol=${symbol}`;
```

### 4. Update TradesTable.jsx

**File**: `web/src/components/TradesTable.jsx`

Ganti:
```javascript
// OLD
const response = await fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`);
```

Dengan:
```javascript
// NEW - Using Vercel Proxy
const PROXY_URL = 'https://your-app.vercel.app';
const response = await fetch(`${PROXY_URL}/api/ticker/price?symbol=${symbol}`);
```

### 5. Update CurrentPrices.jsx

**File**: `web/src/components/CurrentPrices.jsx`

Ganti:
```javascript
// OLD
const priceUrl = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;
```

Dengan:
```javascript
// NEW - Using Vercel Proxy
const PROXY_URL = 'https://your-app.vercel.app';
const priceUrl = `${PROXY_URL}/api/ticker/price?symbol=${symbol}`;
```

### 6. Update UnrealizedROI.jsx

**File**: `web/src/components/UnrealizedROI.jsx`

Ganti:
```javascript
// OLD
const priceUrl = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;
```

Dengan:
```javascript
// NEW - Using Vercel Proxy
const PROXY_URL = 'https://your-app.vercel.app';
const priceUrl = `${PROXY_URL}/api/ticker/price?symbol=${symbol}`;
```

---

## 🎯 Create Config File (Best Practice)

Create: `src/config/proxyConfig.js`

```javascript
module.exports = {
  BINANCE_PROXY_URL: process.env.BINANCE_PROXY_URL || 'https://your-app.vercel.app'
};
```

Then import in all files:
```javascript
const { BINANCE_PROXY_URL } = require('../config/proxyConfig');

// Use it
const response = await axios.get(`${BINANCE_PROXY_URL}/api/ticker/24hr`);
```

Add to `.env`:
```env
BINANCE_PROXY_URL=https://your-app.vercel.app
```

---

## 🔍 Monitoring & Debugging

### View Logs in Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project
3. Go to **"Logs"** tab
4. Real-time logging semua requests

### Check Function Performance
1. Vercel Dashboard → Project → **"Analytics"**
2. Monitor:
   - Response times
   - Error rates
   - Request count
   - Bandwidth usage

---

## 🛡️ Security Recommendations

### 1. Add Rate Limiting (Already Included)
Proxy sudah include rate limiting:
- 100 requests per minute per IP

### 2. Optional: Add API Key Authentication

Edit `index.js`:
```javascript
// Add authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (process.env.REQUIRE_AUTH === 'true') {
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  
  next();
};

// Apply to routes
app.use('/api/', authenticate);
```

Add to Vercel environment variables:
```
REQUIRE_AUTH=true
API_KEY=your_secret_key_here
```

### 3. Enable CORS Whitelist (Optional)

Edit `index.js`:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Local dev
    'https://yourdashboard.vercel.app',  // Production dashboard
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## 📊 Performance Tips

### 1. Enable Caching (Optional)

Install cache middleware:
```bash
npm install node-cache
```

Add caching:
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 10 }); // 10 seconds

app.get('/api/ticker/24hr', async (req, res) => {
  const cacheKey = 'ticker_24hr';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const response = await axios.get(`${BINANCE_FUTURES_BASE}/fapi/v1/ticker/24hr`);
  cache.set(cacheKey, response.data);
  res.json(response.data);
});
```

### 2. Use Vercel Edge Functions (Advanced)

Migrate to Edge Functions untuk latency lebih rendah.

---

## 🚨 Troubleshooting

### Error: "Binance disconnected"
- Check Binance API status: https://www.binance.com/en/support/announcement
- Check Vercel logs untuk detail error

### Error: Rate limit exceeded
- Increase rate limit di `index.js`
- Atau gunakan caching

### Error: CORS blocked
- Verify `cors()` middleware is enabled
- Check browser console untuk detail

### Slow response times
- Add caching (see Performance Tips)
- Consider upgrading Vercel plan

---

## 📈 Next Steps

1. ✅ Deploy ke Vercel
2. ✅ Test semua endpoints
3. ✅ Update all bot components
4. ✅ Monitor logs untuk errors
5. ✅ (Optional) Add authentication
6. ✅ (Optional) Add caching
7. ✅ (Optional) Setup custom domain

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Binance Futures API Docs](https://binance-docs.github.io/apidocs/futures/en/)

---

**Important Note**: Vercel free tier includes:
- ✅ 100GB bandwidth/month
- ✅ Unlimited requests
- ✅ Automatic HTTPS
- ✅ Global CDN

Untuk trading bot Anda, ini sudah lebih dari cukup! 🚀
