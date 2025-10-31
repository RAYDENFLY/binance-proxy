const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Binance Futures Proxy API',
      version: '1.0.0',
      description: 'Proxy API for Binance Futures to bypass ISP restrictions',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
      {
        url: 'https://your-vercel-app.vercel.app',
        description: 'Production server (Vercel)',
      },
    ],
    tags: [
      {
        name: 'Market Data',
        description: 'Futures market data endpoints',
      },
      {
        name: 'Trading',
        description: 'Trading information endpoints',
      },
      {
        name: 'Health',
        description: 'API health check',
      },
    ],
  },
  apis: ['./index.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Binance Futures Proxy API',
}));

// Base Binance Futures URL - Using Vision API as fallback for ISP restrictions
const BINANCE_FUTURES_BASE = 'https://fapi.binance.com';
const BINANCE_VISION_BASE = 'https://data-api.binance.vision';

// Helper function to try Futures API with Vision fallback
async function fetchWithFallback(futuresPath, visionPath) {
  try {
    const response = await axios.get(`${BINANCE_FUTURES_BASE}${futuresPath}`, { timeout: 5000 });
    return { data: response.data, source: 'futures' };
  } catch (error) {
    console.log(`Futures API failed, using Vision API fallback: ${error.message}`);
    const response = await axios.get(`${BINANCE_VISION_BASE}${visionPath}`, { timeout: 5000 });
    return { data: response.data, source: 'vision' };
  }
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Welcome
 *     description: Welcome message and API information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 docs:
 *                   type: string
 */
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Binance Futures Proxy API',
    version: '1.0.0',
    docs: '/api-docs',
    endpoints: {
      '24h Ticker': '/api/ticker/24hr',
      'Price': '/api/ticker/price',
      'Book Ticker': '/api/ticker/bookTicker',
      'Exchange Info': '/api/exchangeInfo',
      'Klines': '/api/klines',
      'Depth': '/api/depth',
    }
  });
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Check if API and Binance connection is working
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 binance:
 *                   type: string
 */
app.get('/api/health', async (req, res) => {
  try {
    // Test Binance connection with fallback
    await fetchWithFallback('/fapi/v1/ping', '/api/v3/ping');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      binance: 'connected',
      note: 'Using fallback to Vision API if needed'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      binance: 'disconnected',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ticker/24hr:
 *   get:
 *     summary: 24hr Ticker Price Change Statistics
 *     description: Get 24 hour rolling window price change statistics for all symbols
 *     tags: [Market Data]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         description: Trading symbol (e.g., BTCUSDT)
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   symbol:
 *                     type: string
 *                   priceChange:
 *                     type: string
 *                   priceChangePercent:
 *                     type: string
 *                   lastPrice:
 *                     type: string
 *                   volume:
 *                     type: string
 */
app.get('/api/ticker/24hr', async (req, res) => {
  try {
    const { symbol } = req.query;
    const futuresPath = symbol 
      ? `/fapi/v1/ticker/24hr?symbol=${symbol}`
      : `/fapi/v1/ticker/24hr`;
    const visionPath = symbol
      ? `/api/v3/ticker/24hr?symbol=${symbol}`
      : `/api/v3/ticker/24hr`;
    
    const result = await fetchWithFallback(futuresPath, visionPath);
    res.json(result.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

/**
 * @swagger
 * /api/ticker/price:
 *   get:
 *     summary: Symbol Price Ticker
 *     description: Latest price for a symbol or symbols
 *     tags: [Market Data]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         description: Trading symbol (e.g., BTCUSDT)
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                 price:
 *                   type: string
 */
app.get('/api/ticker/price', async (req, res) => {
  try {
    const { symbol } = req.query;
    const futuresPath = symbol 
      ? `/fapi/v1/ticker/price?symbol=${symbol}`
      : `/fapi/v1/ticker/price`;
    const visionPath = symbol
      ? `/api/v3/ticker/price?symbol=${symbol}`
      : `/api/v3/ticker/price`;
    
    const result = await fetchWithFallback(futuresPath, visionPath);
    res.json(result.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

/**
 * @swagger
 * /api/ticker/bookTicker:
 *   get:
 *     summary: Symbol Order Book Ticker
 *     description: Best price/qty on the order book for a symbol
 *     tags: [Market Data]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         description: Trading symbol (e.g., BTCUSDT)
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/ticker/bookTicker', async (req, res) => {
  try {
    const { symbol } = req.query;
    const url = symbol 
      ? `${BINANCE_FUTURES_BASE}/fapi/v1/ticker/bookTicker?symbol=${symbol}`
      : `${BINANCE_FUTURES_BASE}/fapi/v1/ticker/bookTicker`;
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

/**
 * @swagger
 * /api/exchangeInfo:
 *   get:
 *     summary: Exchange Information
 *     description: Current exchange trading rules and symbol information
 *     tags: [Market Data]
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/exchangeInfo', async (req, res) => {
  try {
    const response = await axios.get(`${BINANCE_FUTURES_BASE}/fapi/v1/exchangeInfo`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

/**
 * @swagger
 * /api/klines:
 *   get:
 *     summary: Kline/Candlestick Data
 *     description: Kline/candlestick bars for a symbol
 *     tags: [Market Data]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Trading symbol (e.g., BTCUSDT)
 *       - in: query
 *         name: interval
 *         required: true
 *         schema:
 *           type: string
 *           enum: [1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M]
 *         description: Kline interval
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 500
 *         description: Number of klines (max 1500)
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/klines', async (req, res) => {
  try {
    const { symbol, interval, limit = 500 } = req.query;
    
    if (!symbol || !interval) {
      return res.status(400).json({
        error: 'Missing required parameters: symbol and interval'
      });
    }
    
    const url = `${BINANCE_FUTURES_BASE}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

/**
 * @swagger
 * /api/depth:
 *   get:
 *     summary: Order Book
 *     description: Get order book depth
 *     tags: [Market Data]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Trading symbol (e.g., BTCUSDT)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           enum: [5, 10, 20, 50, 100, 500, 1000]
 *         description: Order book depth
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/depth', async (req, res) => {
  try {
    const { symbol, limit = 100 } = req.query;
    
    if (!symbol) {
      return res.status(400).json({
        error: 'Missing required parameter: symbol'
      });
    }
    
    const url = `${BINANCE_FUTURES_BASE}/fapi/v1/depth?symbol=${symbol}&limit=${limit}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

/**
 * @swagger
 * /api/fundingRate:
 *   get:
 *     summary: Get Funding Rate History
 *     description: Get funding rate history for a symbol
 *     tags: [Trading]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         description: Trading symbol (e.g., BTCUSDT)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of records (max 1000)
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/fundingRate', async (req, res) => {
  try {
    const { symbol, limit = 100 } = req.query;
    const url = symbol
      ? `${BINANCE_FUTURES_BASE}/fapi/v1/fundingRate?symbol=${symbol}&limit=${limit}`
      : `${BINANCE_FUTURES_BASE}/fapi/v1/fundingRate?limit=${limit}`;
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

/**
 * @swagger
 * /api/openInterest:
 *   get:
 *     summary: Open Interest
 *     description: Get present open interest of a specific symbol
 *     tags: [Trading]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Trading symbol (e.g., BTCUSDT)
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/openInterest', async (req, res) => {
  try {
    const { symbol } = req.query;
    
    if (!symbol) {
      return res.status(400).json({
        error: 'Missing required parameter: symbol'
      });
    }
    
    const url = `${BINANCE_FUTURES_BASE}/fapi/v1/openInterest?symbol=${symbol}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    docs: '/api-docs'
  });
});

// Start server
// Bind to 0.0.0.0 to make it accessible from outside the container (required for Docker/Easypanel)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║     🚀 Binance Futures Proxy API Server Started      ║
╚════════════════════════════════════════════════════════╝

📡 Server running on: http://0.0.0.0:${PORT}
📚 API Documentation: http://localhost:${PORT}/api-docs
🔥 Ready to proxy Binance Futures requests!

Available Endpoints:
  GET  /api/ticker/24hr       - 24hr ticker stats
  GET  /api/ticker/price      - Current prices
  GET  /api/ticker/bookTicker - Order book ticker
  GET  /api/exchangeInfo      - Exchange info
  GET  /api/klines            - Candlestick data
  GET  /api/depth             - Order book depth
  GET  /api/fundingRate       - Funding rate history
  GET  /api/openInterest      - Open interest
  GET  /api/health            - Health check

🐳 Docker/Easypanel ready - Listening on all interfaces
Press Ctrl+C to stop
  `);
});

module.exports = app;
