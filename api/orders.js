module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const body = req.body || {};
  const orderId = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  res.status(200).json({
    success: true,
    message: 'Order placed successfully',
    orderId: orderId,
    receivedData: body
  });
};
