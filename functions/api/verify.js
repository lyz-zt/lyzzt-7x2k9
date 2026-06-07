export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: 'invalid_body' });
  }

  const { username, password, phone, debug } = body;

  // 调试模式：返回环境变量状态
  if (debug === true) {
    const info = {};
    for (const key of ['LOGIN_USER', 'LOGIN_PASS', 'LOGIN_PHONE']) {
      const val = env[key];
      info[key] = {
        exists: val !== undefined && val !== null,
        type: typeof val,
        length: val ? val.length : 0,
        hasSpaces: val ? val !== val.trim() : false
      };
    }
    return Response.json({ debug: true, env: info });
  }

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

// 调试接口：查看环境变量状态（不暴露实际值）
export async function onRequestGet({ env }) {
  const info = {};
  for (const key of ['LOGIN_USER', 'LOGIN_PASS', 'LOGIN_PHONE']) {
    const val = env[key];
    info[key] = {
      exists: val !== undefined && val !== null,
      type: typeof val,
      length: val ? val.length : 0,
      hasSpaces: val ? val !== val.trim() : false
    };
  }
  return Response.json(info);
}

function makeToken(identifier) {
  const payload = {
    sub: identifier,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    iat: Date.now()
  };
  return btoa(JSON.stringify(payload));
}
