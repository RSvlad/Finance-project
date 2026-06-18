import { useState } from "react";
import { useAuth } from "@identity/application/AuthContext";
import { CategoryList } from "@finance/ui/CategoryList";
import { RecordList } from "@finance/ui/RecordList";
import { Dashboard } from "@finance/ui/Dashboard";

type View = "dashboard" | "records" | "categories";

const NAV_ITEMS: { id: View; label: string; icon: string }[] = [
  { id: "dashboard",  label: "Стање",      icon: "◈" },
  { id: "records",    label: "Записи",     icon: "≡" },
  { id: "categories", label: "Категорије", icon: "⊞" },
];

export default function App() {
  const { user, loading, signIn, signOutUser } = useAuth();
  const [view, setView] = useState<View>("dashboard");

  if (loading) {
    return (
      <div className="center-screen">
        <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Учитавање…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="center-screen login-screen">
        <div className="login-logo">💰</div>
        <h1 className="login-title">Финансије</h1>
        <p className="login-sub">Пријавите се да бисте наставили</p>
        <button className="primary login-btn" onClick={signIn}>
          Пријави се преко Google налога
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell">

      {/* ── Top bar ── */}
      <header className="top-bar">
        <span className="top-bar-logo">💰</span>
        <span className="top-bar-title">
          {{
            dashboard:  "Стање",
            records:    "Записи",
            categories: "Категорије",
          }[view]}
        </span>
        <div className="top-bar-right">
          <span className="role-badge">{user.role}</span>
          <button className="ghost icon-btn" title="Одјава" onClick={signOutUser}>⏏</button>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="app-main">
        {view === "dashboard"  && <Dashboard />}
        {view === "records"    && <RecordList role={user.role} currentUserId={user.id} />}
        {view === "categories" && <CategoryList role={user.role} />}
      </main>

      {/* ── Bottom nav ── */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`bottom-nav-item ${view === item.id ? "active" : ""}`}
            onClick={() => setView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
