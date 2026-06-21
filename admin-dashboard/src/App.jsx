import { useState, useEffect } from "react";
import { api } from "./api.js";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#B8860B;--gold2:#DAA520;--gold3:#8B6914;
  --bg:#FAF7F2;--border:rgba(184,134,11,0.2);--border2:rgba(184,134,11,0.4);
  --text:#2C1810;--muted:#8B7355;--card:#FFFDF7;
}
body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
.admin-app{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:24px 16px 60px;}
.admin-header{width:100%;max-width:960px;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;}
.admin-logo{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:700;color:var(--gold3);}
.admin-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:28px;width:100%;max-width:420px;box-shadow:0 10px 40px rgba(184,134,11,.1);}
.admin-input{width:100%;padding:13px 16px;border:1.5px solid var(--border);border-radius:12px;background:#FFFEF9;font-size:.92rem;outline:none;margin-bottom:14px;font-family:'Outfit',sans-serif;}
.admin-input:focus{border-color:var(--gold2);box-shadow:0 0 0 3px rgba(184,134,11,.1);}
.admin-btn{width:100%;padding:13px;border-radius:50px;border:none;background:linear-gradient(135deg,var(--gold3),var(--gold2));color:#fff;font-weight:600;cursor:pointer;font-size:.92rem;font-family:'Outfit',sans-serif;}
.admin-btn:disabled{opacity:.5;cursor:not-allowed;}
.admin-err{color:#E53E3E;font-size:.82rem;margin-bottom:10px;}
.admin-title{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:700;margin-bottom:6px;}
.admin-sub{font-size:.82rem;color:var(--muted);margin-bottom:20px;line-height:1.5;}
.admin-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;width:100%;max-width:960px;margin-bottom:24px;}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;}
.stat-num{font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:700;color:var(--gold3);}
.stat-label{font-size:.78rem;color:var(--muted);margin-top:4px;}
.admin-section{width:100%;max-width:960px;background:var(--card);border:1px solid var(--border);border-radius:18px;padding:24px;margin-bottom:20px;}
.admin-section-title{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:700;margin-bottom:16px;}
.country-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:.88rem;}
.country-row:last-child{border-bottom:none;}
.tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;}
.tab-btn{padding:9px 18px;border-radius:50px;border:1.5px solid var(--border);background:var(--card);cursor:pointer;font-size:.82rem;font-weight:600;color:var(--muted);}
.tab-btn.active{background:rgba(184,134,11,.1);border-color:var(--gold2);color:var(--gold3);}
.media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;}
.media-item{border:1px solid var(--border);border-radius:12px;overflow:hidden;background:#FFFEF9;}
.media-item img,.media-item video{width:100%;height:100px;object-fit:cover;display:block;}
.media-meta{padding:8px;font-size:.7rem;color:var(--muted);}
.media-del{width:100%;padding:6px;background:#E53E3E;color:#fff;border:none;font-size:.72rem;cursor:pointer;}
.feedback-item{border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;background:#FFFEF9;}
.feedback-name{font-weight:700;font-size:.88rem;color:var(--gold3);}
.feedback-date{font-size:.72rem;color:var(--muted);float:right;}
.feedback-msg{font-size:.85rem;margin-top:6px;color:var(--text);}
.logout-btn{background:none;border:1px solid var(--border);border-radius:50px;padding:7px 16px;cursor:pointer;font-size:.78rem;color:var(--muted);}
.spinner{width:24px;height:24px;border:3px solid rgba(184,134,11,.2);border-top-color:var(--gold2);border-radius:50%;animation:spin .7s linear infinite;margin:30px auto;}
@keyframes spin{to{transform:rotate(360deg)}}
`;

function SetupScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSetup() {
    setErr("");
    setLoading(true);
    try {
      await api.setup(password, confirm);
      onDone();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-card">
      <h1 className="admin-title">🔐 First Time Setup</h1>
      <p className="admin-sub">
        Create a password to protect your Happy Wisher admin dashboard. You'll use this every time you log in.
      </p>
      {err && <div className="admin-err">{err}</div>}
      <input
        type="password"
        className="admin-input"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        className="admin-input"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <button className="admin-btn" onClick={handleSetup} disabled={loading}>
        {loading ? "Setting up…" : "Set Password"}
      </button>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  async function handleLogin() {
    setErr("");
    setLoading(true);
    try {
      const { token } = await api.login(password);
      onLogin(token);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (showReset) return <ResetPasswordScreen onBack={() => setShowReset(false)} />;

  return (
    <div className="admin-card">
      <div className="admin-title">🔒 Admin Login</div>
      <div className="admin-sub">Enter your password to access the Happy Wisher dashboard.</div>
      {err && <div className="admin-err">{err}</div>}
      <input
        className="admin-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />
      <button className="admin-btn" onClick={handleLogin} disabled={loading || !password}>
        {loading ? "Checking…" : "Login"}
      </button>
      <button className="logout-btn" style={{ width: "100%", marginTop: 10 }} onClick={() => setShowReset(true)}>
        Forgot password?
      </button>
    </div>
  );
}

function ResetPasswordScreen({ onBack }) {
  const [masterKey, setMasterKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setErr("");
    setLoading(true);
    try {
      await api.resetPassword(masterKey, newPassword, confirm);
      setSuccess(true);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-title">🆘 Reset Password</div>
      <div className="admin-sub">This requires your secret ADMIN_KEY (set in your backend's environment variables on Render).</div>
      {err && <div className="admin-err">{err}</div>}
      {success ? (
        <>
          <div style={{ color: "#27AE60", fontSize: ".85rem", marginBottom: 14 }}>✓ Password reset! You can now log in.</div>
          <button className="admin-btn" onClick={onBack}>Back to Login</button>
        </>
      ) : (
        <>
          <input
            className="admin-input"
            type="password"
            placeholder="ADMIN_KEY (master key)"
            value={masterKey}
            onChange={(e) => setMasterKey(e.target.value)}
          />
          <input
            className="admin-input"
            type="password"
            placeholder="New password (min 6 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            className="admin-input"
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button
            className="admin-btn"
            onClick={handleReset}
            disabled={loading || !masterKey || newPassword.length < 6 || !confirm}
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>
          <button className="logout-btn" style={{ width: "100%", marginTop: 10 }} onClick={onBack}>
            Back to Login
          </button>
        </>
      )}
    </div>
  );
}

function ChangePasswordModal({ token, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setErr("");
    setLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword, confirm, token);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 200 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-card">
        <div className="admin-title">🔑 Change Password</div>
        <div className="admin-sub">Enter your current password and choose a new one.</div>
        {err && <div className="admin-err">{err}</div>}
        {success && <div style={{ color: "#27AE60", fontSize: ".85rem", marginBottom: 10 }}>✓ Password changed successfully!</div>}
        <input className="admin-input" type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <input className="admin-input" type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <input className="admin-input" type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button className="admin-btn" onClick={handleSubmit} disabled={loading || !currentPassword || newPassword.length < 6 || !confirm}>
          {loading ? "Updating…" : "Update Password"}
        </button>
        <button className="logout-btn" style={{ width: "100%", marginTop: 10 }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function Dashboard({ token, onLogout }) {
  const [tab, setTab] = useState("stats");
  const [showChangePw, setShowChangePw] = useState(false);
  const [stats, setStats] = useState(null);
  const [media, setMedia] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getStats(token), api.getMedia(token), api.getFeedback(token)])
      .then(([s, m, f]) => {
        setStats(s);
        setMedia(m.gifts);
        setFeedback(f.feedbacks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  async function handleDeleteMedia(giftId) {
    if (!window.confirm("Delete this media permanently?")) return;
    try {
      await api.deleteMedia(giftId, token);
      setMedia((prev) => prev.filter((g) => g.id !== giftId));
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <div className="spinner"></div>;

  return (
    <>
      <div className="admin-grid">
        <div className="stat-card">
          <div className="stat-num">{stats?.totalUsers || 0}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats?.totalWishes || 0}</div>
          <div className="stat-label">Total Wishes</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats?.totalSpecial || 0}</div>
          <div className="stat-label">Special Wishes</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats?.totalRandom || 0}</div>
          <div className="stat-label">Random Wishes</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats?.totalViews || 0}</div>
          <div className="stat-label">Total Views</div>
        </div>
      </div>

      <div className="admin-section">
        <div className="tabs">
          <button className={`tab-btn ${tab === "stats" ? "active" : ""}`} onClick={() => setTab("stats")}>🌍 Countries</button>
          <button className={`tab-btn ${tab === "media" ? "active" : ""}`} onClick={() => setTab("media")}>🗂 Media Storage</button>
          <button className={`tab-btn ${tab === "feedback" ? "active" : ""}`} onClick={() => setTab("feedback")}>💬 Feedback</button>
          <button className="tab-btn" onClick={() => setShowChangePw(true)}>🔑 Change Password</button>
        </div>

        {tab === "stats" && (
          <div>
            <h2 className="admin-section-title">Users by Country</h2>
            {(stats?.countries || []).length === 0 ? (
              <p>No data yet</p>
            ) : (
              <div>
                {(stats?.countries || []).map((c) => (
                  <div key={c.country} className="country-row">
                    <span>{c.country}</span>
                    <strong>{c.count}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "media" && (
          <div>
            <h2 className="admin-section-title">Media Storage ({media.length} files)</h2>
            {media.filter((g) => g.mediaUrl || g.audioUrl).length === 0 ? (
              <p>No media uploaded yet</p>
            ) : (
              <div className="media-grid">
                {media.filter((g) => g.mediaUrl || g.audioUrl).map((g) => (
                  <div key={g.id} className="media-item">
                    {g.mediaUrl && g.mediaType === "image" && <img src={g.mediaUrl} alt="Media" />}
                    {g.mediaUrl && g.mediaType === "video" && <video src={g.mediaUrl} controls />}
                    {!g.mediaUrl && g.audioUrl && <div className="media-meta">🎵 Audio only</div>}
                    <div className="media-meta">
                      <div>{g.wish?.code}</div>
                      <div>{g.wish?.sender} → {g.wish?.receiver || "public"}</div>
                      <button className="media-del" onClick={() => handleDeleteMedia(g.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "feedback" && (
          <div>
            <h2 className="admin-section-title">User Feedback ({feedback.length})</h2>
            {feedback.length === 0 ? (
              <p>No feedback yet</p>
            ) : (
              feedback.map((f) => (
                <div key={f.id} className="feedback-item">
                  <div className="feedback-name">{f.name} <span className="feedback-date">{new Date(f.createdAt).toLocaleDateString()}</span></div>
                  <div className="feedback-msg">{f.message}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showChangePw && <ChangePasswordModal token={token} onClose={() => setShowChangePw(false)} />}
      <button className="logout-btn" onClick={onLogout}>Logout</button>
    </>
  );
}

export default function App() {
  const [checking, setChecking] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [token, setToken] = useState(sessionStorage.getItem("hw_admin_token") || null);

  useEffect(() => {
    api.getStatus()
      .then(({ configured }) => { setConfigured(configured); setChecking(false); })
      .catch(() => setChecking(false));
  }, []);

  function handleLogin(tok) {
    setToken(tok);
    sessionStorage.setItem("hw_admin_token", tok);
  }

  function handleLogout() {
    setToken(null);
    sessionStorage.removeItem("hw_admin_token");
  }

  return (
    <div className="admin-app">
      <style>{CSS}</style>
      <div className="admin-header">
        <div className="admin-logo">Happy Wisher Admin</div>
        {token && <button className="logout-btn" onClick={handleLogout}>Logout</button>}
      </div>

      {checking ? (
        <div className="spinner"></div>
      ) : token ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : configured ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <SetupScreen onDone={() => setConfigured(true)} />
      )}
    </div>
  );
}
