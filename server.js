/* ==========================================================================
   Prem Shankar Murti Kala Kendra - Zero-Dependency Node.js Backend Server
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory and log files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const QUOTES_FILE = path.join(DATA_DIR, 'custom_quotes.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(QUOTES_FILE)) fs.writeFileSync(QUOTES_FILE, '[]', 'utf8');
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

// Helper: send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

// Helper: parse POST body
function parseRequestBody(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const parsed = body ? JSON.parse(body) : {};
      callback(null, parsed);
    } catch (err) {
      callback(err, null);
    }
  });
}

// Server Request Handler
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    return res.end();
  }

  // ==================== REST API ENDPOINTS ==================== //

  // 1. GET /api/products
  if (pathname === '/api/products' && method === 'GET') {
    const productsPath = path.join(DATA_DIR, 'products.json');
    fs.readFile(productsPath, 'utf8', (err, content) => {
      if (err) return sendJSON(res, 500, { error: 'Failed to read products database' });
      sendJSON(res, 200, JSON.parse(content));
    });
    return;
  }

  // 2. GET /api/shop-info
  if (pathname === '/api/shop-info' && method === 'GET') {
    const shopPath = path.join(DATA_DIR, 'shop_info.json');
    fs.readFile(shopPath, 'utf8', (err, content) => {
      if (err) return sendJSON(res, 500, { error: 'Failed to read shop info database' });
      sendJSON(res, 200, JSON.parse(content));
    });
    return;
  }

  // 3. POST /api/custom-quote
  if (pathname === '/api/custom-quote' && method === 'POST') {
    parseRequestBody(req, (err, payload) => {
      if (err) return sendJSON(res, 400, { error: 'Invalid JSON payload' });

      const newQuote = {
        id: 'Q-' + Date.now().toString(36).toUpperCase(),
        timestamp: new Date().toISOString(),
        customerName: payload.name || 'Anonymous',
        phone: payload.phone || 'N/A',
        itemType: payload.itemType || 'Custom Idol',
        material: payload.material || 'POP',
        size: payload.size || 'Medium',
        finish: payload.finish || 'Hand Painted',
        notes: payload.notes || '',
        estimatedPrice: payload.estimatedPrice || '₹150'
      };

      fs.readFile(QUOTES_FILE, 'utf8', (readErr, content) => {
        let quotes = [];
        try { quotes = JSON.parse(content); } catch (e) { quotes = []; }
        quotes.push(newQuote);

        fs.writeFile(QUOTES_FILE, JSON.stringify(quotes, null, 2), 'utf8', writeErr => {
          if (writeErr) return sendJSON(res, 500, { error: 'Failed to save quote request' });
          console.log(`[BACKEND LOG] New Custom Quote Saved: ${newQuote.id} for ${newQuote.customerName}`);
          sendJSON(res, 201, {
            success: true,
            message: 'Custom order quote request logged successfully!',
            quote: newQuote
          });
        });
      });
    });
    return;
  }

  // 4. POST /api/orders
  if (pathname === '/api/orders' && method === 'POST') {
    parseRequestBody(req, (err, payload) => {
      if (err) return sendJSON(res, 400, { error: 'Invalid JSON payload' });

      const newOrder = {
        id: 'ORD-' + Date.now().toString(36).toUpperCase(),
        timestamp: new Date().toISOString(),
        items: payload.items || [],
        totalPrice: payload.totalPrice || '₹0',
        status: 'Order Received - Walk-in Pickup Ready'
      };

      fs.readFile(ORDERS_FILE, 'utf8', (readErr, content) => {
        let orders = [];
        try { orders = JSON.parse(content); } catch (e) { orders = []; }
        orders.push(newOrder);

        fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8', writeErr => {
          if (writeErr) return sendJSON(res, 500, { error: 'Failed to save order' });
          console.log(`[BACKEND LOG] New Cart Order Received: ${newOrder.id} Total: ${newOrder.totalPrice}`);
          sendJSON(res, 201, {
            success: true,
            message: 'Cart order logged successfully!',
            order: newOrder
          });
        });
      });
    });
    return;
  }

  // 5. GET /api/custom-quotes
  if (pathname === '/api/custom-quotes' && method === 'GET') {
    fs.readFile(QUOTES_FILE, 'utf8', (err, content) => {
      if (err) return sendJSON(res, 500, { error: 'Failed to read quotes file' });
      sendJSON(res, 200, JSON.parse(content));
    });
    return;
  }

  // 6. GET /api/orders
  if (pathname === '/api/orders' && method === 'GET') {
    fs.readFile(ORDERS_FILE, 'utf8', (err, content) => {
      if (err) return sendJSON(res, 500, { error: 'Failed to read orders file' });
      sendJSON(res, 200, JSON.parse(content));
    });
    return;
  }

  // ==================== STATIC FILE SERVING ==================== //

  let reqPath = pathname === '/' ? '/index.html' : pathname;
  let safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routes
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, fileContent) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(fileContent);
    });
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Prem Shankar Murti Kala Kendra Backend Server Started `);
  console.log(` Server URL: http://localhost:${PORT}`);
  console.log(` Products API: http://localhost:${PORT}/api/products`);
  console.log(` Shop Info API: http://localhost:${PORT}/api/shop-info`);
  console.log(` Custom Quotes API: http://localhost:${PORT}/api/custom-quotes`);
  console.log(` Cart Orders API: http://localhost:${PORT}/api/orders`);
  console.log(`=======================================================`);
});
