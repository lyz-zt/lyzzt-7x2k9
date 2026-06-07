export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: 'invalid_body' });
  }

  const { username, password, phone } = body;

  if (phone) {
    if (phone === env.LOGIN_PHONE) {
      const token = await makeToken('phone', env);
      return Response.json({ success: true, token });
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

  const token = await makeToken(username, env);
  return Response.json({ success: true, token });
}

async function makeToken(identifier, env) {
  const payload = {
    sub: identifier,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    iat: Date.now()
  };
  const payloadB64 = btoa(JSON.stringify(payload));
  const sig = await signData(payloadB64, env);
  return payloadB64 + '.' + sig;
}

async function signData(data, env) {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(env.LOGIN_USER + ':' + env.LOGIN_PASS);
  const key = await crypto.subtle.importKey(
    'raw', keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}
