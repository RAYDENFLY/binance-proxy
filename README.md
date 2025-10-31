# Binance Futures API Proxy

🚀 **Proxy server untuk Binance Futures API dengan dokumentasi Swagger**

API proxy ini dibuat untuk mem-bypass pembatasan ISP terhadap `fapi.binance.com` dengan cara hosting di Vercel. Semua request akan di-forward ke Binance Futures API.

## 🌟 Features

- ✅ **Full Binance Futures API Support** - Semua endpoint market data
- 📚 **Swagger Documentation** - API docs interaktif di `/api-docs`
- 🛡️ **Rate Limiting** - Proteksi dari spam requests (100 req/menit)
- 🌍 **CORS Enabled** - Bisa diakses dari web dashboard
- ⚡ **Fast & Reliable** - Hosted di Vercel edge network
- 🔥 **No Authentication Required** - Hanya untuk public market data

## 📦 Installation

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Or start production mode
npm start
```

Server akan berjalan di `http://localhost:3002`

## 🚀 Deployment ke Vercel

### Method 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

### Method 2: GitHub Integration

1. Push code ke GitHub repository
2. Import project di [Vercel Dashboard](https://vercel.com/new)
3. Connect repository
4. Deploy otomatis!

## 📚 API Documentation

Setelah server berjalan, buka Swagger UI:

- **Local**: http://localhost:3002/api-docs
- **Production**: https://your-app.vercel.app/api-docs

## 🔌 Available Endpoints

### Market Data

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/ticker/24hr` | GET | 24hr price change statistics | `symbol` (optional) |
| `/api/ticker/price` | GET | Latest price | `symbol` (optional) |
| `/api/ticker/bookTicker` | GET | Best bid/ask price | `symbol` (optional) |
| `/api/exchangeInfo` | GET | Exchange info & trading rules | - |
| `/api/klines` | GET | Candlestick data | `symbol`, `interval`, `limit` |
| `/api/depth` | GET | Order book depth | `symbol`, `limit` |

### Trading Information

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/fundingRate` | GET | Funding rate history | `symbol`, `limit` |
| `/api/openInterest` | GET | Open interest | `symbol` (required) |

### Health Check

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Check API status |
| `/` | GET | Welcome message |

## 💡 Usage Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

// Menggunakan proxy Vercel
const BASE_URL = 'https://your-app.vercel.app';

// Get BTC price
const btcPrice = await axios.get(`${BASE_URL}/api/ticker/price?symbol=BTCUSDT`);
console.log(btcPrice.data);

// Get all 24hr tickers
const tickers = await axios.get(`${BASE_URL}/api/ticker/24hr`);
console.log(tickers.data);

// Get klines
const klines = await axios.get(`${BASE_URL}/api/klines?symbol=BTCUSDT&interval=1h&limit=100`);
console.log(klines.data);
```

### Update Trading Bot

Ganti semua endpoint dari:
```javascript
// OLD (Blocked by ISP)
const response = await axios.get('https://fapi.binance.com/fapi/v1/ticker/24hr');
```

Menjadi:
```javascript
// NEW (Via proxy)
const response = await axios.get('https://your-app.vercel.app/api/ticker/24hr');
```

### Web Dashboard (React)

```javascript
// In your components
const fetchMarketData = async () => {
  try {
    const response = await fetch('https://your-app.vercel.app/api/ticker/24hr');
    const data = await response.json();
    setMarketData(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🛡️ Rate Limiting

API ini memiliki rate limiting untuk proteksi:
- **Limit**: 100 requests per menit per IP
- **Response**: HTTP 429 jika limit terlampaui
- **Reset**: Setiap 1 menit

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
NODE_ENV=development
PORT=3002
```

### Custom Port (Local)

```bash
PORT=4000 npm start
```

## 📖 Architecture

```
┌─────────────────┐
│   Trading Bot   │
│  Web Dashboard  │
└────────┬────────┘
         │
         │ HTTP Request
         ▼
┌─────────────────┐
│  Vercel Proxy   │
│  (This Server)  │
└────────┬────────┘
         │
         │ Forward Request
         ▼
┌─────────────────┐
│ Binance Futures │
│      API        │
└─────────────────┘
```

**Benefits:**
- ✅ Vercel servers can access Binance (no ISP block)
- ✅ Your bot uses proxy URL (bypasses restrictions)
- ✅ Automatic SSL/HTTPS
- ✅ Global edge network (fast)

## 🐛 Troubleshooting

### Error: Cannot connect to Binance

**Solution**: Check if Binance Futures API is down:
```bash
curl https://fapi.binance.com/fapi/v1/ping
```

### Error: Rate limit exceeded

**Solution**: Reduce request frequency atau gunakan caching

### Error: CORS blocked

**Solution**: CORS sudah enabled. Pastikan menggunakan endpoint `/api/*`

## 📝 File Structure

```
binance-proxy/
├── index.js              # Main server file
├── package.json          # Dependencies
├── vercel.json          # Vercel deployment config
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🤝 Contributing

Contributions are welcome! Silakan buat Pull Request.

## 📄 License

MIT License - Free to use

## ⚠️ Disclaimer

This proxy is for **public market data only**. It does **NOT** support:
- ❌ Trading operations (place orders, cancel orders)
- ❌ Account information
- ❌ Private endpoints requiring API keys

This is intentional for security reasons.

## 🔗 Links

- [Binance Futures API Documentation](https://binance-docs.github.io/apidocs/futures/en/)
- [Vercel Documentation](https://vercel.com/docs)
- [Swagger Documentation](https://swagger.io/docs/)

## 📞 Support

Jika ada pertanyaan, buat issue di repository ini.

---

Made with ❤️ to bypass ISP restrictions
