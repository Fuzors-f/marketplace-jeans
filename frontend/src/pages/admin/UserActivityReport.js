import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import {
  FaChartLine, FaUsers, FaUserSecret, FaShoppingCart, FaSearch,
  FaEye, FaSignInAlt, FaBoxOpen, FaDownload, FaCalendarAlt,
  FaSpinner, FaHeart, FaGlobe, FaFire
} from 'react-icons/fa';

// ─── Tiny bar-chart component (no extra lib needed) ──────────────────────────
const BarChart = ({ data = [], keyField, valueField, color = 'bg-blue-500', maxItems = 10 }) => {
  const sliced = data.slice(0, maxItems);
  const max = Math.max(...sliced.map(d => d[valueField] || 0), 1);
  return (
    <div className="space-y-2">
      {sliced.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-32 truncate text-gray-600 shrink-0 text-right">{item[keyField] || '—'}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all`}
              style={{ width: `${((item[valueField] || 0) / max) * 100}%` }}
            />
          </div>
          <span className="w-10 text-right font-semibold text-gray-700">{(item[valueField] || 0).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Mini line-chart (SVG sparkline) ─────────────────────────────────────────
const Sparkline = ({ data = [], field = 'total_events', color = '#3b82f6' }) => {
  if (!data.length) return null;
  const vals = data.map(d => Number(d[field]) || 0);
  const max = Math.max(...vals, 1);
  const W = 400, H = 60, pad = 4;
  const pts = vals.map((v, i) => {
    const x = pad + (i / Math.max(vals.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((v / max) * (H - pad * 2));
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
    </svg>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center shrink-0`}>
      <Icon className="text-white text-xl" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const UserActivityReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [sessionModal, setSessionModal] = useState(null);
  const [sessionEvents, setSessionEvents] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (dateRange.start) params.set('start_date', dateRange.start);
      if (dateRange.end) params.set('end_date', dateRange.end);
      const res = await apiClient.get(`/activity-logs/report?${params}`);
      if (res.data.success) setReport(res.data.data);
    } catch (err) {
      setError('Gagal memuat laporan aktivitas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const openSessionTimeline = async (sessionId) => {
    setSessionModal(sessionId);
    setSessionLoading(true);
    try {
      const res = await apiClient.get(`/activity-logs/session/${sessionId}`);
      if (res.data.success) setSessionEvents(res.data.data);
    } catch (e) {
      setSessionEvents([]);
    } finally {
      setSessionLoading(false);
    }
  };

  const fmt = (n) => (n || 0).toLocaleString();
  const fmtDate = (d) => d ? new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

  const actionColor = (action) => {
    const map = {
      login: 'bg-green-100 text-green-800',
      register: 'bg-blue-100 text-blue-800',
      logout: 'bg-gray-100 text-gray-700',
      create_order: 'bg-purple-100 text-purple-800',
      add_to_cart: 'bg-yellow-100 text-yellow-800',
      view_product: 'bg-cyan-100 text-cyan-800',
      search: 'bg-orange-100 text-orange-800',
      remove_from_cart: 'bg-red-100 text-red-800',
      add_to_wishlist: 'bg-pink-100 text-pink-800',
    };
    return map[action] || 'bg-gray-100 text-gray-700';
  };

  const t = report?.totals || {};
  const tabs = [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'trend', label: 'Tren Harian' },
    { id: 'users', label: 'Top Users' },
    { id: 'guests', label: 'Sesi Tamu' },
    { id: 'products', label: 'Produk Populer' },
    { id: 'searches', label: 'Pencarian' },
  ];

  return (
    <>
      <Helmet><title>Laporan Aktivitas User - Admin</title></Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FaChartLine className="text-indigo-600" />
                Laporan Aktivitas User & Tamu
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Pantau semua aktivitas pengguna terdaftar dan pengunjung anonim (guest)
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-gray-400">—</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={fetchReport}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center gap-1"
              >
                <FaCalendarAlt /> Terapkan
              </button>
              <Link
                to="/admin/activity-logs"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-1"
              >
                <FaEye /> Log Detail
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-indigo-400" />
            </div>
          ) : report && (
            <>
              {/* ── KPI Cards ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={FaFire} label="Total Events" value={fmt(t.total_events)} color="bg-red-500" />
                <StatCard icon={FaUsers} label="User Terdaftar" value={fmt(t.unique_registered_users)} sub={`${fmt(t.total_logins)} login`} color="bg-blue-500" />
                <StatCard icon={FaUserSecret} label="Sesi Tamu" value={fmt(t.unique_guests)} sub={`${fmt(t.unique_ips)} IP unik`} color="bg-gray-500" />
                <StatCard icon={FaBoxOpen} label="Pesanan Dibuat" value={fmt(t.total_orders)} color="bg-purple-500" />
                <StatCard icon={FaShoppingCart} label="Tambah Keranjang" value={fmt(t.total_add_to_cart)} color="bg-yellow-500" />
                <StatCard icon={FaEye} label="View Produk" value={fmt(t.total_product_views)} color="bg-cyan-500" />
                <StatCard icon={FaSearch} label="Pencarian" value={fmt(t.total_searches)} color="bg-orange-500" />
                <StatCard icon={FaSignInAlt} label="Registrasi Baru" value={fmt(t.total_registers)} color="bg-green-500" />
              </div>

              {/* ── User type split ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow p-5">
                  <h2 className="font-semibold mb-4 flex items-center gap-2 text-gray-700">
                    <FaUsers className="text-blue-500" /> Distribusi Tipe User
                  </h2>
                  <BarChart
                    data={report.byUserType}
                    keyField="user_type"
                    valueField="event_count"
                    color="bg-blue-500"
                  />
                </div>
                <div className="bg-white rounded-xl shadow p-5">
                  <h2 className="font-semibold mb-4 flex items-center gap-2 text-gray-700">
                    <FaFire className="text-red-500" /> Top Aksi
                  </h2>
                  <BarChart
                    data={report.topActions}
                    keyField="action"
                    valueField="count"
                    color="bg-red-400"
                  />
                </div>
              </div>

              {/* ── Tabs ── */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="border-b flex overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {/* OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-700">Tren Aktivitas (sparkline)</h3>
                      <Sparkline data={report.dailyTrend} field="total_events" color="#6366f1" />
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Login / hari</p>
                          <Sparkline data={report.dailyTrend} field="logins" color="#22c55e" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Pesanan / hari</p>
                          <Sparkline data={report.dailyTrend} field="orders" color="#a855f7" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">View Produk / hari</p>
                          <Sparkline data={report.dailyTrend} field="product_views" color="#06b6d4" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-700 pt-4">Distribusi Per Jam (hari ini)</h3>
                      <BarChart
                        data={report.hourlyDistribution.map(h => ({ ...h, label: `${String(h.hour).padStart(2,'0')}:00` }))}
                        keyField="label"
                        valueField="count"
                        color="bg-indigo-400"
                        maxItems={24}
                      />
                    </div>
                  )}

                  {/* TREND */}
                  {activeTab === 'trend' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {['Tanggal','Total Events','Login','Pesanan','View Produk','Tambah Keranjang','Tamu','User'].map(h => (
                              <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {report.dailyTrend.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 whitespace-nowrap">{row.date}</td>
                              <td className="px-3 py-2 font-semibold">{fmt(row.total_events)}</td>
                              <td className="px-3 py-2 text-green-700">{fmt(row.logins)}</td>
                              <td className="px-3 py-2 text-purple-700">{fmt(row.orders)}</td>
                              <td className="px-3 py-2 text-cyan-700">{fmt(row.product_views)}</td>
                              <td className="px-3 py-2 text-yellow-700">{fmt(row.add_to_carts)}</td>
                              <td className="px-3 py-2 text-gray-600">{fmt(row.guest_sessions)}</td>
                              <td className="px-3 py-2 text-blue-700">{fmt(row.registered_users)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* TOP USERS */}
                  {activeTab === 'users' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {['#','Nama','Email','Role','Total Events','Login','Pesanan','Terakhir Aktif'].map(h => (
                              <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {report.topUsers.map((u, i) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                              <td className="px-3 py-2 font-medium">{u.full_name}</td>
                              <td className="px-3 py-2 text-gray-500">{u.email}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  u.role === 'admin' ? 'bg-red-100 text-red-700' :
                                  u.role === 'member' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>{u.role}</span>
                              </td>
                              <td className="px-3 py-2 font-semibold">{fmt(u.event_count)}</td>
                              <td className="px-3 py-2 text-green-700">{fmt(u.login_count)}</td>
                              <td className="px-3 py-2 text-purple-700">{fmt(u.order_count)}</td>
                              <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{fmtDate(u.last_seen)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* GUEST SESSIONS */}
                  {activeTab === 'guests' && (
                    <div className="overflow-x-auto">
                      <p className="text-sm text-gray-500 mb-3">
                        <FaUserSecret className="inline mr-1" />
                        Sesi tamu diidentifikasi via <code className="bg-gray-100 px-1 rounded">x-session-id</code> header.
                        Klik untuk lihat timeline aktivitas sesi.
                      </p>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {['Session ID','IP','Events','View Produk','Keranjang','Pencarian','Pesanan','Pertama','Terakhir',''].map(h => (
                              <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {report.guestSessions.map((s, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-mono text-xs max-w-xs truncate text-gray-500">{s.session_id}</td>
                              <td className="px-3 py-2 font-mono text-xs">{s.ip_address}</td>
                              <td className="px-3 py-2 font-semibold">{fmt(s.event_count)}</td>
                              <td className="px-3 py-2 text-cyan-700">{fmt(s.product_views)}</td>
                              <td className="px-3 py-2 text-yellow-700">{fmt(s.add_to_carts)}</td>
                              <td className="px-3 py-2 text-orange-700">{fmt(s.searches)}</td>
                              <td className="px-3 py-2 text-purple-700">{fmt(s.orders)}</td>
                              <td className="px-3 py-2 text-gray-500 whitespace-nowrap text-xs">{fmtDate(s.first_seen)}</td>
                              <td className="px-3 py-2 text-gray-500 whitespace-nowrap text-xs">{fmtDate(s.last_seen)}</td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => openSessionTimeline(s.session_id)}
                                  className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                                >
                                  Timeline
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {report.guestSessions.length === 0 && (
                        <p className="text-center text-gray-400 py-8">Belum ada data sesi tamu</p>
                      )}
                    </div>
                  )}

                  {/* TOP PRODUCTS */}
                  {activeTab === 'products' && (
                    <div className="space-y-4">
                      <BarChart
                        data={report.topProducts}
                        keyField="product_name"
                        valueField="view_count"
                        color="bg-cyan-500"
                      />
                      <table className="w-full text-sm mt-4">
                        <thead className="bg-gray-50">
                          <tr>
                            {['#','Produk','View','Viewer Unik'].map(h => (
                              <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {report.topProducts.map((p, i) => (
                            <tr key={p.product_id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                              <td className="px-3 py-2 font-medium">{p.product_name || `Produk #${p.product_id}`}</td>
                              <td className="px-3 py-2 text-cyan-700 font-semibold">{fmt(p.view_count)}</td>
                              <td className="px-3 py-2 text-gray-600">{fmt(p.unique_viewers)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* SEARCHES */}
                  {activeTab === 'searches' && (
                    <div className="space-y-4">
                      <BarChart
                        data={report.topSearches}
                        keyField="keyword"
                        valueField="count"
                        color="bg-orange-400"
                      />
                      <table className="w-full text-sm mt-4">
                        <thead className="bg-gray-50">
                          <tr>
                            {['#','Kata Kunci','Jumlah Pencarian'].map(h => (
                              <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {report.topSearches.map((s, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                              <td className="px-3 py-2 font-medium">{s.keyword || '—'}</td>
                              <td className="px-3 py-2 font-semibold text-orange-700">{fmt(s.count)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {report.topSearches.length === 0 && (
                        <p className="text-center text-gray-400 py-8">Belum ada data pencarian</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Session Timeline Modal ── */}
      {sessionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold">Timeline Sesi Tamu</h3>
              <p className="text-xs font-mono text-gray-400 truncate max-w-xs">{sessionModal}</p>
              <button onClick={() => setSessionModal(null)} className="text-gray-400 hover:text-gray-600 text-xl ml-4">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              {sessionLoading ? (
                <div className="text-center py-10"><FaSpinner className="animate-spin text-3xl text-indigo-400 mx-auto" /></div>
              ) : sessionEvents.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Tidak ada events</p>
              ) : (
                <ol className="relative border-l border-gray-200 space-y-4 pl-4">
                  {sessionEvents.map((ev) => (
                    <li key={ev.id} className="ml-2">
                      <span className="absolute -left-1 w-2.5 h-2.5 bg-indigo-400 rounded-full border-2 border-white" />
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1 mb-0.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColor(ev.action)}`}>
                              {ev.action}
                            </span>
                            {ev.entity_type && (
                              <span className="text-xs text-gray-400">{ev.entity_type}{ev.entity_id ? ` #${ev.entity_id}` : ''}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{ev.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(ev.created_at)}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserActivityReport;
