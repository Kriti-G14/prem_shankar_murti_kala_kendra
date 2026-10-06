const productsData = require('../data/products.json');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(productsData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products' });
  }
};
