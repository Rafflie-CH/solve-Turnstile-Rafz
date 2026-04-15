const axios = require('axios');

async function solveTurnstile(apiKey, websiteURL, websiteKey) {
  // Gunakan endpoint Token API NopeCHA
  const response = await axios.post('https://api.nopecha.com/token', {
    type: 'turnstile',
    sitekey: websiteKey,
    url: websiteURL
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });

  if (!response.data || !response.data.token) {
    throw new Error('NopeCHA gagal menghasilkan token');
  }
  return response.data.token;
}

module.exports = async (req, res) => {
  // Set CORS headers biar bisa dipanggil dari mana saja
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let apiKey, websiteURL, websiteKey;

  if (req.method === 'POST') {
    apiKey = req.body.apiKey || req.body.apikey;
    websiteURL = req.body.websiteURL || req.body.url;
    websiteKey = req.body.websiteKey || req.body.sitekey;
  } else {
    apiKey = req.query.apiKey || req.query.apikey;
    websiteURL = req.query.websiteURL || req.query.url;
    websiteKey = req.query.websiteKey || req.query.sitekey;
  }

  if (!apiKey || !websiteURL || !websiteKey) {
    return res.status(400).json({
      error: 'Missing parameters. Need apiKey, websiteURL, websiteKey'
    });
  }

  try {
    const token = await solveTurnstile(apiKey, websiteURL, websiteKey);
    res.json({
      success: true,
      token,
      source: 'nopecha',
      message: 'Captcha solved successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
