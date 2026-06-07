export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ valid: false });
  }

  const { token } = body;
  if (!token || !token.includes('.')) {
    return Response.json({ valid: false });
  }

  const idx = token.lastIndexOf('.');
  const payloadB64 = token.substring(0, idx);
  const sig = token.substring(idx + 1);

  // 验证签名
  const expectedSig = await signData(payloadB64, env);
  if (sig !== expectedSig) {
    return Response.json({ valid: false });
  }

  // 验证过期
  let payload;
  try {
    payload = JSON.parse(atob(payloadB64));
  } catch {
    return Response.json({ valid: false });
  }

  if (payload.exp && Date.now() > payload.exp) {
    return Response.json({ valid: false });
  }

  return Response.json({ valid: true });
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
