import { useCallback, useEffect, useRef, useState } from 'react';
import { api, setUnauthorizedHandler } from './api.js';
import { ConfirmDialog, OrderFormDialog } from './Dialogs.jsx';
import { DEFAULT_STATUSES, SORT_OPTIONS, errorText, statusClass, statusLabel } from './labels.js';

const fmtDate = (iso) => new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`;

// ---------------------------------------------------------------- login
function Login({ disabled, onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError('');
    try {
      await api.login(password);
      onDone();
    } catch (err) {
      setError(err.status === 401 ? 'Wrong password.'
        : err.status === 429 ? 'Too many wrong attempts. Try again in about 15 minutes.'
        : err.status === 503 ? 'The admin area is switched off on the server.' : errorText(err));
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit}>
        <h1>Kvarta · Orders</h1>
        {disabled ? (
          <p className="login__off">The admin area is switched off. Set <code>ADMIN_PASSWORD</code> in the <code>.env</code> file and restart the server.</p>
        ) : (
          <>
            <label className="field">
              <span>Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="btn btn--primary" disabled={busy || !password}>Log in</button>
          </>
        )}
      </form>
    </main>
  );
}

// ---------------------------------------------------------------- orders table
function OrdersTable({ orders, statuses, onStatus, onEdit, onDelete }) {
  return (
    <table className="orders">
      <thead>
        <tr>
          <th>#</th><th>Added</th><th>Customer</th><th>Order</th><th>Comment</th><th>Status</th>
          <th><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id}>
            <td data-label="No." className="orders__id">#{o.id}</td>
            <td data-label="Added" title={o.created_at}>
              <div>
                {fmtDate(o.created_at)}
                {o.source === 'manual' && <span className="tag">manual</span>}
              </div>
            </td>
            <td data-label="Customer">
              <div>
                <strong>{o.name || '—'}</strong>
                <a href={telHref(o.phone)} className="phone">{o.phone}</a>
              </div>
            </td>
            <td data-label="Order">
              <div>
                {o.order_type || '—'}
                {o.heard_from && <small className="muted">via {o.heard_from}</small>}
              </div>
            </td>
            <td data-label="Comment" className="orders__comment">{o.comment || <span className="muted">—</span>}</td>
            <td data-label="Status">
              <select className={`status ${statusClass(o.status)}`} value={o.status} onChange={(e) => onStatus(o, e.target.value)}
                aria-label={`Status of order #${o.id}`}>
                {statuses.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
            </td>
            <td className="orders__actions">
              <button type="button" className="btn btn--small" onClick={() => onEdit(o)} aria-label={`Edit order #${o.id}`}>Edit</button>
              <button type="button" className="btn btn--small btn--danger-ghost" onClick={() => onDelete(o)} aria-label={`Delete order #${o.id}`}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------- dashboard
function Dashboard({ statuses, onLoggedOut }) {
  const [query, setQuery] = useState({ q: '', status: 'all', sort: 'created_at', dir: 'desc' }); // default: everything, newest first
  const [search, setSearch] = useState('');
  const [data, setData] = useState({ orders: [], counts: null });
  const [loadState, setLoadState] = useState('loading'); // loading | ready | error
  const [form, setForm] = useState(null);                 // null | { mode: 'add' } | { mode: 'edit', order }
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const toast = useCallback((text, kind = 'ok') => {
    const id = Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const load = useCallback(async () => {
    const mine = ++seq.current; // a slower, older answer must never overwrite a newer one
    try {
      const r = await api.orders(query);
      if (mine !== seq.current) return;
      setData({ orders: r.orders, counts: r.counts });
      setLoadState('ready');
    } catch (err) {
      if (mine === seq.current && err.status !== 401) setLoadState('error');
    }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  // typing in the search box updates the list after a short pause
  useEffect(() => {
    const t = setTimeout(() => setQuery((q) => (q.q === search.trim() ? q : { ...q, q: search.trim() })), 250);
    return () => clearTimeout(t);
  }, [search]);

  // coming back to the tab: pick up orders that arrived meanwhile
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible' && !form && !deleting) load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load, form, deleting]);

  async function changeStatus(order, status) {
    if (status === order.status) return;
    setData((d) => ({ ...d, orders: d.orders.map((o) => (o.id === order.id ? { ...o, status } : o)) })); // instant
    try {
      await api.setStatus(order.id, status);
      toast(`Order #${order.id}: ${statusLabel(status)}`);
    } catch (err) {
      toast(`Could not change the status. ${errorText(err)}`, 'error');
    }
    load();
  }

  async function saveForm(values) { // errors go back to the dialog, which shows them
    if (form.mode === 'add') {
      const r = await api.create(values);
      toast(`Order #${r.order.id} added`);
    } else {
      await api.update(form.order.id, values);
      toast(`Order #${form.order.id} saved`);
    }
    setForm(null);
    load();
  }

  async function confirmDelete() {
    setDeleteBusy(true);
    try {
      await api.remove(deleting.id);
      toast(`Order #${deleting.id} deleted`);
    } catch (err) {
      toast(err.status === 404 ? `Order #${deleting.id} was already deleted` : `Could not delete. ${errorText(err)}`, err.status === 404 ? 'ok' : 'error');
    }
    setDeleteBusy(false);
    setDeleting(null);
    load();
  }

  async function logout() {
    try { await api.logout(); } finally { onLoggedOut(); }
  }

  const { orders, counts } = data;
  const filtered = query.q !== '' || query.status !== 'all';

  return (
    <div className="page">
      <header className="top">
        <h1>Kvarta · Orders</h1>
        <div className="top__actions">
          <button type="button" className="btn btn--primary" onClick={() => setForm({ mode: 'add' })}>+ Add order</button>
          <button type="button" className="btn" onClick={load}>Refresh</button>
          <button type="button" className="btn btn--ghost" onClick={logout}>Log out</button>
        </div>
      </header>

      <section className="toolbar" aria-label="Search, filter and sort">
        <label className="search">
          <span className="sr-only">Search orders</span>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, order, comment, #number…" />
        </label>
        <div className="chips" role="group" aria-label="Filter by status">
          {['all', ...statuses].map((s) => (
            <button key={s} type="button" className={`chip ${query.status === s ? 'is-on' : ''}`} aria-pressed={query.status === s}
              onClick={() => setQuery((q) => ({ ...q, status: s }))}>
              {s === 'all' ? 'All' : statusLabel(s)} <span className="chip__n">{counts ? counts[s] ?? 0 : '·'}</span>
            </button>
          ))}
        </div>
        <div className="sort">
          <label>
            <span>Sort by</span>
            <select value={query.sort} onChange={(e) => setQuery((q) => ({ ...q, sort: e.target.value }))}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <button type="button" className="btn" onClick={() => setQuery((q) => ({ ...q, dir: q.dir === 'asc' ? 'desc' : 'asc' }))}
            aria-label={`Sort direction: ${query.dir === 'asc' ? 'ascending' : 'descending'}. Click to reverse.`}>
            {query.dir === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      </section>

      <main>
        {loadState === 'error' && (
          <p className="notice notice--error" role="alert">Could not load the orders. <button type="button" className="link" onClick={load}>Try again</button></p>
        )}
        {loadState === 'loading' && <p className="notice">Loading…</p>}
        {loadState === 'ready' && orders.length === 0 && (
          <p className="notice">{filtered ? 'No orders match your search or filter.' : 'No orders yet. New orders from the website appear here.'}</p>
        )}
        {orders.length > 0 && (
          <>
            <p className="count" aria-live="polite">{filtered ? `${orders.length} of ${counts?.all ?? orders.length} orders` : `${orders.length} orders`}</p>
            <OrdersTable orders={orders} statuses={statuses} onStatus={changeStatus} onEdit={(o) => setForm({ mode: 'edit', order: o })} onDelete={setDeleting} />
          </>
        )}
      </main>

      {form && <OrderFormDialog key={form.order?.id ?? 'new'} mode={form.mode} order={form.order} onSave={saveForm} onClose={() => setForm(null)} />}
      {deleting && (
        <ConfirmDialog title="Are you sure?" danger busy={deleteBusy} onConfirm={confirmDelete} onCancel={() => setDeleting(null)}>
          <p>Delete order #{deleting.id} ({deleting.name || deleting.phone})? This cannot be undone.</p>
        </ConfirmDialog>
      )}

      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={`toast toast--${t.kind}`}>{t.text}</div>)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- root
export default function App() {
  const [auth, setAuth] = useState('checking'); // checking | login | disabled | ok
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);

  const check = useCallback(() => {
    api.session()
      .then((r) => { setStatuses(r.statuses || DEFAULT_STATUSES); setAuth('ok'); })
      .catch((err) => setAuth(err.status === 503 ? 'disabled' : 'login'));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setAuth('login')); // session expired / server restarted
    check();
  }, [check]);

  if (auth === 'checking') return <p className="notice">Loading…</p>;
  if (auth === 'ok') return <Dashboard statuses={statuses} onLoggedOut={() => setAuth('login')} />;
  return <Login disabled={auth === 'disabled'} onDone={check} />;
}
