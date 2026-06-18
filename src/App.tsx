import { useState } from "react";
import { useAuth } from "@identity/application/AuthContext";
import { CategoryList } from "@finance/ui/CategoryList";
import { RecordList } from "@finance/ui/RecordList";
import { Dashboard } from "@finance/ui/Dashboard";

type View = "dashboard" | "records" | "categories";

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: "dashboard",  label: "Дашборд" },
  { id: "records",    label: "Записи" },
  { id: "categories", label: "Категорије" },
];

export default function App() {
  const { user, loading, signIn, signOutUser } = useAuth();
  const [view, setView] = useState<View>("dashboard");

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Учитавање…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100vh", gap: 24,
      }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>💰</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4 }}>Праћење финансија</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Пријавите се да бисте наставили</p>
        </div>
        <button className="primary" style={{ padding: "12px 28px", fontSize: "0.95rem" }} onClick={signIn}>
          Пријави се преко Google налога
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Nav */}
      <header style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "0 24px", height: 56,
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <span style={{ fontWeight: 700, fontSize: "1rem", marginRight: 16, color: "var(--accent)" }}>💰</span>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className="ghost"
            onClick={() => setView(item.id)}
            style={{
              borderRadius: "var(--radius-sm)",
              color: view === item.id ? "var(--text-primary)" : "var(--text-secondary)",
              background: view === item.id ? "var(--bg-hover)" : "transparent",
              borderColor: "transparent",
              fontWeight: view === item.id ? 600 : 400,
            }}
          >
            {item.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {user.email}
            <span style={{
              marginLeft: 6, padding: "1px 8px",
              background: "var(--accent-light)", color: "var(--accent)",
              borderRadius: 999, fontSize: "0.7rem", fontWeight: 600,
            }}>{user.role}</span>
          </span>
          <button className="ghost" style={{ fontSize: "0.8rem" }} onClick={signOutUser}>Одјави се</button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: "32px 24px", maxWidth: 1100, width: "100%", margin: "0 auto" }}>
        {view === "dashboard"  && <Dashboard />}
        {view === "records"    && <RecordList role={user.role} currentUserId={user.id} />}
        {view === "categories" && <CategoryList role={user.role} />}
      </main>
    </div>
  );
}
