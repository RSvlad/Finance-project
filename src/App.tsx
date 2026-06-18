import { useState, useEffect } from "react";
import { useAuth } from "@identity/application/AuthContext";
import { CategoryList } from "@finance/ui/CategoryList";
import { RecordList } from "@finance/ui/RecordList";
import { Dashboard } from "@finance/ui/Dashboard";
import { ensureSystemCategories } from "@finance/infrastructure/CategoryRepository";

type View = "dashboard" | "records" | "categories";

export default function App() {
  const { user, loading, signIn, signOutUser } = useAuth();
  const [view, setView] = useState<View>("dashboard");

  useEffect(() => {
    if (user?.role === "Admin") {
      ensureSystemCategories().catch(console.error);
    }
  }, [user]);

  if (loading) {
    return <p>Учитавање...</p>;
  }

  if (!user) {
    return <button onClick={signIn}>Пријави се преко Google налога</button>;
  }

  return (
    <div>
      <nav>
        <button onClick={() => setView("dashboard")} disabled={view === "dashboard"}>
          Дашборд
        </button>
        <button onClick={() => setView("records")} disabled={view === "records"}>
          Записи
        </button>
        <button onClick={() => setView("categories")} disabled={view === "categories"}>
          Категорије
        </button>
        <span style={{ marginLeft: 16 }}>
          {user.email} ({user.role})
        </span>
        <button onClick={signOutUser} style={{ marginLeft: 8 }}>
          Одјави се
        </button>
      </nav>

      <main>
        {view === "dashboard" && <Dashboard />}
        {view === "records" && (
          <RecordList role={user.role} currentUserId={user.id} />
        )}
        {view === "categories" && <CategoryList role={user.role} />}
      </main>
    </div>
  );
}
