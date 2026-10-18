// The only place that talks to the server. Every call is a fixed endpoint: there is no way to send SQL.
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error || `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(method, url, body, signal) {
  let res;
  try {
    res = await fetch(url, {
      method,
      signal,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, // the server requires JSON for changes (CSRF guard)
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, { error: 'network' });
  }
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    if (res.status === 401 && !url.endsWith('/login') && !url.endsWith('/session')) onUnauthorized();
    throw new ApiError(res.status, data);
  }
  return data;
}

const B = '/api/admin';
export const api = {
  session: () => request('GET', `${B}/session`),
  login: (password) => request('POST', `${B}/login`, { password }),
  logout: () => request('POST', `${B}/logout`, {}),
  orders: ({ q, status, sort, dir }, signal) => {
    const p = new URLSearchParams({ status, sort, dir });
    if (q) p.set('q', q);
    return request('GET', `${B}/orders?${p}`, undefined, signal);
  },
  create: (v) => request('POST', `${B}/orders`, v),
  update: (id, v) => request('PUT', `${B}/orders/${id}`, v),
  setStatus: (id, status) => request('PATCH', `${B}/orders/${id}/status`, { status }),
  remove: (id) => request('DELETE', `${B}/orders/${id}`),
};
