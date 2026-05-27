const express = require('express');
const router = express.Router();

/**
 * 测试路由 - 直接打印 req.body
 */
router.post('/debug-body', (req, res) => {
  console.log('\n=== DEBUG BODY ===');
  console.log('req.body:', req.body);
  console.log('req.body type:', typeof req.body);
  console.log('req.body is object:', req.body !== null && typeof req.body === 'object');
  console.log('req.body keys:', Object.keys(req.body));
  console.log('req.body.api_key:', req.body.api_key);
  console.log('req.body.canteenCode:', req.body.canteenCode);
  console.log('');

  res.json({
    received_body: req.body,
    body_keys: Object.keys(req.body),
    api_key: req.body.api_key
  });
});

module.exports = router;