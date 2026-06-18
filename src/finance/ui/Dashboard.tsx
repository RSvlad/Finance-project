// UI: Дашборд — read model агрегација на клијенту (видети ADR-007).
// Приходи, расходи и салдо приказани по свакој валути одвојено (видети ADR-009).
// Подржава филтер по периоду, типу и категорији.

import { useState, useMemo } from "react";
import { useRecordList } from "@finance/application/useRecordList";
import { useCategoryList } from "@finance/application/useCategoryList";
import type { RecordType } from "@finance/domain/Category";

type PeriodPreset = "данас" | "овај месец" | "ова година" | "све";

function periodBounds(preset: PeriodPreset): { from: Date; to: Date } | null {
  const now = new Date();
  if (preset === "све") return null;
  if (preset === "данас") {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const to = new Date(from.getTime() + 86_400_000);
    return { from, to };
  }
  if (preset === "овај месец") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { from, to };
  }
  // ова година
  const from = new Date(now.getFullYear(), 0, 1);
  const to = new Date(now.getFullYear() + 1, 0, 1);
  return { from, to };
}

export function Dashboard() {
  const records = useRecordList();
  const categories = useCategoryList();

  const [period, setPeriod] = useState<PeriodPreset>("овај месец");
  const [typeFilter, setTypeFilter] = useState<RecordType | "Сви">("Сви");
  const [categoryFilter, setCategoryFilter] = useState<string>("све");

  const filtered = useMemo(() => {
    const bounds = periodBounds(period);
    return records.filter((r) => {
      if (bounds && (r.dateTime < bounds.from || r.dateTime >= bounds.to)) return false;
      if (typeFilter !== "Сви" && r.type !== typeFilter) return false;
      if (categoryFilter !== "све" && r.categoryId !== categoryFilter) return false;
      return true;
    });
  }, [records, period, typeFilter, categoryFilter]);

  // Агрегација по валути: { currency → { income, expense } }
  const summary = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    for (const r of filtered) {
      const cur = r.amount.currency;
      if (!map[cur]) map[cur] = { income: 0, expense: 0 };
      if (r.type === "Приход") map[cur].income += r.amount.value;
      else map[cur].expense += r.amount.value;
    }
    return map;
  }, [filtered]);

  const currencies = Object.keys(summary).sort();

  return (
    <div>
      <h2>Дашборд</h2>

      <div>
        <label>
          Период:{" "}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodPreset)}
          >
            <option value="данас">Данас</option>
            <option value="овај месец">Овај месец</option>
            <option value="ова година">Ова година</option>
            <option value="све">Све</option>
          </select>
        </label>
        {" "}
        <label>
          Тип:{" "}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as RecordType | "Сви")}
          >
            <option value="Сви">Сви</option>
            <option value="Приход">Приход</option>
            <option value="Расход">Расход</option>
          </select>
        </label>
        {" "}
        <label>
          Категорија:{" "}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="све">Све</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </label>
      </div>

      {currencies.length === 0 ? (
        <p>Нема записа за изабрани период.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Валута</th>
              <th>Приходи</th>
              <th>Расходи</th>
              <th>Салдо</th>
            </tr>
          </thead>
          <tbody>
            {currencies.map((cur) => {
              const { income, expense } = summary[cur];
              const balance = income - expense;
              return (
                <tr key={cur}>
                  <td>{cur}</td>
                  <td>{income.toLocaleString("sr-RS")}</td>
                  <td>{expense.toLocaleString("sr-RS")}</td>
                  <td style={{ color: balance >= 0 ? "green" : "red" }}>
                    {balance.toLocaleString("sr-RS")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
