export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  const { username, password, phone } = req.body || {};

  // 手机号验证
  if (phone) {
    if (phone === process.env.LOGIN_PHONE) {
      return res.status(200).json({ success: true, token: makeToken('phone') });
    }
    return res.status(200).json({ success: false, error: 'wrong_phone' });
  }

  // 账号密码验证
  if (!username || !password) {
    return res.status(200).json({ success: false, error: 'missing_fields' });
  }

  if (username !== process.env.LOGIN_USER) {
    return res.status(200).json({ success: false, error: 'wrong_account' });
  }

  if (password !== process.env.LOGIN_PASS) {
    return res.status(200).json({ success: false, error: 'wrong_password' });
  }

  return res.status(200).json({ success: true, token: makeToken(username) });
}

function makeToken(identifier) {
  // 简单的 session token，7 天有效
  const payload = {
    sub: identifier,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    iat: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
