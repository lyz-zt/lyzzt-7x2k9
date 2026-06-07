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
