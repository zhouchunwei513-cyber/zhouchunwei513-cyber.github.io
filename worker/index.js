const COUNTRY_NAMES = {
  CN: "中国", US: "美国", JP: "日本", KR: "韩国", GB: "英国", FR: "法国",
  DE: "德国", RU: "俄罗斯", CA: "加拿大", AU: "澳大利亚", SG: "新加坡",
  HK: "中国香港", TW: "中国台湾", MO: "中国澳门", IN: "印度", TH: "泰国",
  MY: "马来西亚", VN: "越南", ID: "印度尼西亚", PH: "菲律宾", IT: "意大利",
  ES: "西班牙", NL: "荷兰", SE: "瑞典", CH: "瑞士", AT: "奥地利", BE: "比利时",
  PL: "波兰", UA: "乌克兰", TR: "土耳其", BR: "巴西", MX: "墨西哥", AR: "阿根廷",
  NZ: "新西兰", IE: "爱尔兰", NO: "挪威", DK: "丹麦", FI: "芬兰", PT: "葡萄牙",
  GR: "希腊", CZ: "捷克", HU: "匈牙利", RO: "罗马尼亚", BG: "保加利亚", IL: "以色列",
  SA: "沙特阿拉伯", AE: "阿联酋", PK: "巴基斯坦", BD: "孟加拉国", LK: "斯里兰卡",
  NP: "尼泊尔", MM: "缅甸", KH: "柬埔寨", LA: "老挝", BN: "文莱", KP: "朝鲜",
  MN: "蒙古", KZ: "哈萨克斯坦", UZ: "乌兹别克斯坦", ZA: "南非", EG: "埃及",
  NG: "尼日利亚", KE: "肯尼亚", CI: "科特迪瓦", CL: "智利", CO: "哥伦比亚",
  PE: "秘鲁", VE: "委内瑞拉", IR: "伊朗", IQ: "伊拉克", SY: "叙利亚", JO: "约旦",
  LB: "黎巴嫩", QA: "卡塔尔", KW: "科威特", OM: "阿曼", BH: "巴林", CY: "塞浦路斯",
  IS: "冰岛", LU: "卢森堡", MT: "马耳他", EE: "爱沙尼亚", LV: "拉脱维亚",
  LT: "立陶宛", SI: "斯洛文尼亚", HR: "克罗地亚", SK: "斯洛伐克", RS: "塞尔维亚",
  AL: "阿尔巴尼亚", MD: "摩尔多瓦", GE: "格鲁吉亚", AM: "亚美尼亚", AZ: "阿塞拜疆",
  CR: "哥斯达黎加", PA: "巴拿马", GT: "危地马拉", CU: "古巴", DO: "多米尼加",
  EC: "厄瓜多尔", BO: "玻利维亚", UY: "乌拉圭", PY: "巴拉圭", HN: "洪都拉斯",
  SV: "萨尔瓦多", NI: "尼加拉瓜", HT: "海地", JM: "牙买加", TT: "特立尼达和多巴哥",
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const MAX_DAILY = 5000;

function countryName(code) {
  return COUNTRY_NAMES[code] || code || "未知";
}

async function pbkdf2(password, salt, iterations = 100000) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations, hash: "SHA-256" },
    key,
    256
  );
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS },
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/track" && request.method === "POST") {
      return handleTrack(request, env);
    }
    if (path === "/api/login" && request.method === "POST") {
      return handleLogin(request, env);
    }
    if (path === "/api/stats" && request.method === "GET") {
      return handleStats(request, env);
    }
    if (path === "/api/change-password" && request.method === "POST") {
      return handleChangePassword(request, env);
    }

    return json({ ok: false, error: "Not Found" }, 404);
  },
};

async function handleTrack(request, env) {
  const body = await readJson(request);
  const date = todayKey();
  const dailyKey = `daily:${date}`;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const cf = request.cf || {};
  const countryCode = cf.country || "";
  const location = {
    countryCode,
    country: countryName(countryCode),
    province: cf.region || "",
    city: cf.city || "",
    postalCode: cf.postalCode || "",
  };

  const record = {
    ip,
    time: new Date().toISOString(),
    country: location.country,
    province: location.province,
    city: location.city,
    ua: (request.headers.get("User-Agent") || body.ua || "").slice(0, 200),
    path: (body.path || urlPathSafe(request) || "/").slice(0, 200),
  };

  let list = [];
  const prev = await env.VISIT_KV.get(dailyKey, "json");
  if (Array.isArray(prev)) list = prev;
  list.push(record);
  if (list.length > MAX_DAILY) list = list.slice(list.length - MAX_DAILY);
  await env.VISIT_KV.put(dailyKey, JSON.stringify(list));

  const total = (parseInt(await env.VISIT_KV.get("total")) || 0) + 1;
  await env.VISIT_KV.put("total", String(total));

  let ips = [];
  const ipsPrev = await env.VISIT_KV.get(`ips:${date}`, "json");
  if (Array.isArray(ipsPrev)) ips = ipsPrev;
  if (!ips.includes(ip)) {
    ips.push(ip);
    if (ips.length > 5000) ips = ips.slice(ips.length - 5000);
    await env.VISIT_KV.put(`ips:${date}`, JSON.stringify(ips));
  }

  return json({ ok: true });
}

function urlPathSafe(request) {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "/";
  }
}

async function getAdminCreds(env) {
  const user = (await env.VISIT_KV.get("admin_user")) || env.ADMIN_USER || "admin";
  const salt = await env.VISIT_KV.get("admin_salt");
  const passHash = await env.VISIT_KV.get("admin_passhash");
  return { user, salt, passHash };
}

async function handleLogin(request, env) {
  const { username, password } = await readJson(request);
  const { user, salt, passHash } = await getAdminCreds(env);

  if (!username || !password) return json({ ok: false, error: "参数不完整" }, 400);

  const targetUser = env.ADMIN_USER || "admin";
  if (username !== targetUser) return json({ ok: false, error: "用户名或密码错误" }, 401);

  if (salt && passHash) {
    const h = await pbkdf2(password, salt);
    if (h !== passHash) return json({ ok: false, error: "用户名或密码错误" }, 401);
  } else {
    const expected = env.ADMIN_PASSWORD || "admin123";
    if (password !== expected) return json({ ok: false, error: "用户名或密码错误" }, 401);
  }

  const token = randomToken();
  await env.VISIT_KV.put(`token:${token}`, user, { expirationTtl: 604800 });
  return json({ ok: true, token });
}

async function handleStats(request, env) {
  const token = new URL(request.url).searchParams.get("token") || request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ ok: false, error: "未授权" }, 401);

  const t = await env.VISIT_KV.get(`token:${token}`);
  if (!t) return json({ ok: false, error: "会话已过期" }, 401);

  const total = parseInt(await env.VISIT_KV.get("total")) || 0;
  const today = todayKey();
  const todayList = (await env.VISIT_KV.get(`daily:${today}`, "json")) || [];
  const todayIps = (await env.VISIT_KV.get(`ips:${today}`, "json")) || [];

  const list = await env.VISIT_KV.list({ prefix: "daily:", limit: 100 });
  const daily = [];
  for (const key of list.keys) {
    const d = key.name.replace("daily:", "");
    const arr = (await env.VISIT_KV.get(key.name, "json")) || [];
    daily.push({ date: d, count: arr.length, uniqueIps: (await env.VISIT_KV.get(`ips:${d}`, "json"))?.length || 0 });
  }
  daily.sort((a, b) => a.date.localeCompare(b.date));

  const recent = todayList.slice(-200).reverse();
  return json({ ok: true, total, today: { count: todayList.length, uniqueIps: todayIps.length }, daily, recent });
}

async function handleChangePassword(request, env) {
  const { token, oldPassword, newPassword } = await readJson(request);
  if (!token) return json({ ok: false, error: "未授权" }, 401);
  const t = await env.VISIT_KV.get(`token:${token}`);
  if (!t) return json({ ok: false, error: "会话已过期" }, 401);
  if (!oldPassword || !newPassword) return json({ ok: false, error: "参数不完整" }, 400);
  if (newPassword.length < 6) return json({ ok: false, error: "新密码至少 6 位" }, 400);

  const salt = await env.VISIT_KV.get("admin_salt");
  const passHash = await env.VISIT_KV.get("admin_passhash");

  let valid = false;
  if (salt && passHash) {
    valid = (await pbkdf2(oldPassword, salt)) === passHash;
  } else {
    valid = oldPassword === (env.ADMIN_PASSWORD || "admin123");
  }
  if (!valid) return json({ ok: false, error: "旧密码错误" }, 401);

  const newSalt = randomToken();
  const newHash = await pbkdf2(newPassword, newSalt);
  await env.VISIT_KV.put("admin_salt", newSalt);
  await env.VISIT_KV.put("admin_passhash", newHash);
  return json({ ok: true, message: "密码已更新" });
}
