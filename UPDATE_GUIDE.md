# Quick Update Script - Replace Binance URLs

## Files yang Perlu Diupdate

Setelah deploy ke Vercel, ganti `YOUR_VERCEL_URL` dengan URL production Anda.

### 1. src/services/reboundDetector.cjs

**Line ~50-70** (di method `getMarketHealth`):

**BEFORE:**
```javascript
try {
  console.log('📡 Trying Binance Futures API...');
  const response = await axios.get('https://fapi.binance.com/fapi/v1/ticker/24hr', {
    timeout: 5000
  });
  allCoins = response.data;
  console.log('✅ Connected to Futures API');
} catch (futuresError) {
  console.log('⚠️ Futures API failed, using Vision API fallback...');
  const response = await axios.get('https://data-api.binance.vision/api/v3/ticker/24hr', {
    timeout: 5000
  });
  allCoins = response.data;
  console.log('✅ Connected to Vision API (Spot)');
}
```

**AFTER:**
```javascript
const PROXY_URL = 'https://YOUR_VERCEL_URL';

try {
  console.log('📡 Fetching market data via proxy...');
  const response = await axios.get(`${PROXY_URL}/api/ticker/24hr`, {
    timeout: 5000
  });
  allCoins = response.data;
  console.log('✅ Connected via Vercel proxy');
} catch (error) {
  console.error('❌ Proxy connection failed:', error.message);
  throw error;
}
```

---

### 2. web/src/components/ProtectionSystem.jsx

**Line ~80-90** (di `fetchProtectionData`):

**BEFORE:**
```javascript
const response = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr');
```

**AFTER:**
```javascript
const PROXY_URL = 'https://YOUR_VERCEL_URL';
const response = await fetch(`${PROXY_URL}/api/ticker/24hr`);
```

---

### 3. reduce-exposure.cjs

**Line ~30-40** (di `getCurrentPrices`):

**BEFORE:**
```javascript
const priceUrl = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;
const response = await axios.get(priceUrl);
```

**AFTER:**
```javascript
const PROXY_URL = 'https://YOUR_VERCEL_URL';
const priceUrl = `${PROXY_URL}/api/ticker/price?symbol=${symbol}`;
const response = await axios.get(priceUrl);
```

---

### 4. web/src/components/TradesTable.jsx

**Line ~60-80** (di `useEffect` hook yang fetch prices):

**BEFORE:**
```javascript
const response = await fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`);
```

**AFTER:**
```javascript
const PROXY_URL = 'https://YOUR_VERCEL_URL';
const response = await fetch(`${PROXY_URL}/api/ticker/price?symbol=${symbol}`);
```

---

### 5. web/src/components/CurrentPrices.jsx

**Line ~40-60** (di `fetchPrices`):

**BEFORE:**
```javascript
const priceUrl = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;
const response = await fetch(priceUrl);
```

**AFTER:**
```javascript
const PROXY_URL = 'https://YOUR_VERCEL_URL';
const priceUrl = `${PROXY_URL}/api/ticker/price?symbol=${symbol}`;
const response = await fetch(priceUrl);
```

---

### 6. web/src/components/UnrealizedROI.jsx

**Line ~30-50** (di `fetchTrades` atau `calculateROI`):

**BEFORE:**
```javascript
const priceUrl = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;
const response = await fetch(priceUrl);
```

**AFTER:**
```javascript
const PROXY_URL = 'https://YOUR_VERCEL_URL';
const priceUrl = `${PROXY_URL}/api/ticker/price?symbol=${symbol}`;
const response = await fetch(priceUrl);
```

---

## Automated Update Script (PowerShell)

Create file: `update-proxy-urls.ps1`

```powershell
# Replace YOUR_VERCEL_URL with your actual Vercel deployment URL
$PROXY_URL = "https://YOUR_VERCEL_URL"

# Files to update
$files = @(
    "src\services\reboundDetector.cjs",
    "web\src\components\ProtectionSystem.jsx",
    "reduce-exposure.cjs",
    "web\src\components\TradesTable.jsx",
    "web\src\components\CurrentPrices.jsx",
    "web\src\components\UnrealizedROI.jsx"
)

foreach ($file in $files) {
    $path = "d:\Tugas\percobaan\$file"
    
    if (Test-Path $path) {
        Write-Host "Updating $file..." -ForegroundColor Green
        
        # Replace fapi.binance.com URLs
        (Get-Content $path) -replace 'https://fapi\.binance\.com/fapi/v1/', "$PROXY_URL/api/" | Set-Content $path
        
        # Replace data-api.binance.vision URLs (fallback)
        (Get-Content $path) -replace 'https://data-api\.binance\.vision/api/v3/', "$PROXY_URL/api/" | Set-Content $path
        
        Write-Host "✓ Updated $file" -ForegroundColor Green
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nAll files updated successfully!" -ForegroundColor Cyan
Write-Host "Proxy URL: $PROXY_URL" -ForegroundColor Cyan
```

**Usage:**
```powershell
# Edit script and set your Vercel URL first
.\update-proxy-urls.ps1
```

---

## Manual Find & Replace (VS Code)

1. Open VS Code
2. Press `Ctrl+Shift+H` (Find and Replace in Files)
3. Find: `https://fapi\.binance\.com/fapi/v1/`
4. Replace: `https://YOUR_VERCEL_URL/api/`
5. Click "Replace All"

Then repeat for fallback:
3. Find: `https://data-api\.binance\.vision/api/v3/`
4. Replace: `https://YOUR_VERCEL_URL/api/`
5. Click "Replace All"

---

## Testing After Update

### 1. Test Protection Monitor
```bash
node protection-monitor.cjs
```

Expected output:
```
📡 Fetching market data via proxy...
✅ Connected via Vercel proxy

Risk Level: MINIMAL (0/100)
...
```

### 2. Test Reduce Exposure
```bash
node reduce-exposure.cjs 30
```

Should fetch current prices without errors.

### 3. Test Web Dashboard
```bash
cd web
npm run dev
```

Open browser, go to "Protection" tab, should show real-time data.

---

## Rollback Plan

If proxy has issues, you can quickly rollback:

### PowerShell Rollback Script
```powershell
$files = @(
    "src\services\reboundDetector.cjs",
    "web\src\components\ProtectionSystem.jsx",
    "reduce-exposure.cjs",
    "web\src\components\TradesTable.jsx",
    "web\src\components\CurrentPrices.jsx",
    "web\src\components\UnrealizedROI.jsx"
)

foreach ($file in $files) {
    $path = "d:\Tugas\percobaan\$file"
    
    # Restore original URLs
    (Get-Content $path) -replace 'https://YOUR_VERCEL_URL/api/', 'https://fapi.binance.com/fapi/v1/' | Set-Content $path
}

Write-Host "Rollback complete!" -ForegroundColor Yellow
```

---

## Environment Variable Approach (Best Practice)

Instead of hardcoding URLs, use environment variables:

### Create: `src/config/apiConfig.js`
```javascript
module.exports = {
  BINANCE_API_URL: process.env.BINANCE_PROXY_URL || 'https://fapi.binance.com/fapi/v1',
  USE_PROXY: process.env.USE_PROXY === 'true'
};
```

### Create: `.env`
```env
USE_PROXY=true
BINANCE_PROXY_URL=https://YOUR_VERCEL_URL/api
```

### Usage in components:
```javascript
const { BINANCE_API_URL } = require('./config/apiConfig');

const response = await axios.get(`${BINANCE_API_URL}/ticker/24hr`);
```

This way you can switch between proxy and direct access by changing env variable!

---

## Summary Checklist

- [ ] Deploy proxy to Vercel
- [ ] Get production URL
- [ ] Test `/api/health` endpoint
- [ ] Update all 6 files with new URL
- [ ] Test protection-monitor.cjs
- [ ] Test reduce-exposure.cjs
- [ ] Test web dashboard
- [ ] Monitor Vercel logs for 24 hours
- [ ] (Optional) Setup custom domain
- [ ] (Optional) Add caching for better performance

---

Good luck with deployment! 🚀
