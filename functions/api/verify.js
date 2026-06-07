export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: 'invalid_body' });
  }

  const { username, password, phone } = body;

  // 手机号验证
  if (phone) {
    if (phone === env.LOGIN_PHONE) {
      return Response.json({ success: true, token: makeToken('phone') });
    }
    return Response.json({ success: false, error: 'wrong_phone' });
  }

  if (!username || !password) {
    return Response.json({ success: false, error: 'missing_fields' });
  }

  if (username !== env.LOGIN_USER) {
    return Response.json({ success: false, error: 'wrong_account' });
  }

  if (password !== env.LOGIN_PASS) {
    return Response.json({ success: false, error: 'wrong_password' });
  }

  return Response.json({ success: true, token: makeToken(username) });
}

function makeToken(identifier) {
  const payload = {
    sub: identifier,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    iat: Date.now()
  };
  return btoa(JSON.stringify(payload));
}
