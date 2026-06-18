// UI: Дашборд — банкарски приказ стања, mobile-first (ADR-007, ADR-009).

import { useState, useMemo } from "react";
import { useRecordList } from "@finance/application/useRecordList";
import { useCategoryList } from "@finance/application/useCategoryList";
import type { RecordType } from "@finance/domain/Category";
import type { FinanceRecord } from "@finance/domain/FinanceRecord";

type PeriodPreset = "данас" | "овај месец" | "ова година" | "све";

const PERIODS: { id: PeriodPreset; label: string }[] = [
  { id: "данас",      label: "Данас" },
  { id: "овај месец", label: "Месец" },
  { id: "ова година", label: "Година" },
  { id: "све",        label: "Све" },
];

function periodBounds(preset: PeriodPreset): { from: Date; to: Date } | null {
  const now = new Date();
  if (preset === "све") return null;
  if (preset === "данас") {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { from, to: new Date(from.getTime() + 86_400_000) };
  }
  if (preset === "овај месец") {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to:   new Date(now.getFullYear(), now.getMonth() + 1, 1),
    };
  }
  return {
    from: new Date(now.getFullYear(), 0, 1),
    to:   new Date(now.getFullYear() + 1, 0, 1),
  };
}

function fmt(value: number, currency: string): string {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function fmtCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(1) + "М";
  if (Math.abs(value) >= 1_000)     return (value / 1_000).toFixed(1) + "К";
  return value.toLocaleString("sr-RS");
}

// ── Подкомпоненте ──────────────────────────────────────────────────────────

function BalanceHero({ currency, income, expense }: { currency: string; income: number; expense: number }) {
  const balance = income - expense;
  const positive = balance >= 0;
  return (
    <div className="balance-hero">
      <p className="balance-label">Укупно стање · {currency}</p>
      <p className={`balance-amount ${positive ? "pos" : "neg"}`}>
        {positive ? "+" : ""}{fmt(balance, currency)}
      </p>
      <div className="balance-row">
        <div className="balance-stat">
          <span className="stat-dot income-dot" />
          <span className="stat-label">Приходи</span>
          <span className="stat-val income-val">+{fmtCompact(income)}</span>
        </div>
        <div className="balance-divider" />
        <div className="balance-stat">
          <span className="stat-dot expense-dot" />
          <span className="stat-label">Расходи</span>
          <span className="stat-val expense-val">−{fmtCompact(expense)}</span>
        </div>
      </div>
    </div>
  );
}

function MiniBar({ income, expense }: { income: number; expense: number }) {
  const total = income + expense;
  if (total === 0) return null;
  const pct = Math.round((income / total) * 100);
  return (
    <div className="mini-bar-wrap">
      <div className="mini-bar-track">
        <div className="mini-bar-fill income-fill"  style={{ width: `${pct}%` }} />
        <div className="mini-bar-fill expense-fill" style={{ width: `${100 - pct}%` }} />
      </div>
      <div className="mini-bar-labels">
        <span className="income-val">{pct}% приходи</span>
        <span className="expense-val">{100 - pct}% расходи</span>
      </div>
    </div>
  );
}

function RecentItem({ record, categoryName }: { record: FinanceRecord; categoryName: string }) {
  const isIncome = record.type === "Приход";
  const d = record.dateTime;
  const timeStr = d.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" });
  const dateStr = d.toLocaleDateString("sr-RS", { day: "numeric", month: "short" });
  return (
    <div className="recent-item">
      <div className={`recent-icon ${isIncome ? "income-icon" : "expense-icon"}`}>
        {isIncome ? "↑" : "↓"}
      </div>
      <div className="recent-meta">
        <span className="recent-counterparty">{record.counterparty}</span>
        <span className="recent-cat">{categoryName}</span>
      </div>
      <div className="recent-right">
        <span className={`recent-amount ${isIncome ? "income-val" : "expense-val"}`}>
          {isIncome ? "+" : "−"}{fmtCompact(record.amount.value)} {record.amount.currency}
        </span>
        <span className="recent-time">{dateStr} {timeStr}</span>
      </div>
    </div>
  );
}

// ── Главна компонента ──────────────────────────────────────────────────────

export function Dashboard() {
  const records    = useRecordList();
  const categories = useCategoryList();

  const [period,         setPeriod]         = useState<PeriodPreset>("овај месец");
  const [typeFilter,     setTypeFilter]     = useState<RecordType | "Сви">("Сви");
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

  const summary = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    for (const r of filtered) {
      const cur = r.amount.currency;
      if (!map[cur]) map[cur] = { income: 0, expense: 0 };
      if (r.type === "Приход") map[cur].income += r.amount.value;
      else                     map[cur].expense += r.amount.value;
    }
    return map;
  }, [filtered]);

  const currencies = Object.keys(summary).sort();

  const recent = useMemo(
    () => [...filtered].sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()).slice(0, 8),
    [filtered]
  );

  function catName(id: string): string {
    return categories.find((c) => c.id === id)?.name ?? "—";
  }

  const hasFilters = typeFilter !== "Сви" || categoryFilter !== "све";

  return (
    <div className="db-root">

      {/* ── Период pill-tab ── */}
      <div className="period-tabs">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            className={`period-tab ${period === p.id ? "active" : ""}`}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Hero картице по валути ── */}
      {currencies.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>Нема записа за изабрани период.</p>
        </div>
      ) : (
        currencies.map((cur) => {
          const { income, expense } = summary[cur];
          return (
            <div key={cur} className="card mb-16">
              <BalanceHero currency={cur} income={income} expense={expense} />
              <MiniBar income={income} expense={expense} />
            </div>
          );
        })
      )}

      {/* ── Додатни филтери ── */}
      <details className="filter-details">
        <summary className={`filter-summary ${hasFilters ? "has-filters" : ""}`}>
          <span>Филтери</span>
          {hasFilters && <span className="filter-badge">●</span>}
        </summary>
        <div className="filter-body">
          <label className="filter-label">
            Тип
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as RecordType | "Сви")}>
              <option value="Сви">Сви</option>
              <option value="Приход">Приход</option>
              <option value="Расход">Расход</option>
            </select>
          </label>
          <label className="filter-label">
            Категорија
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="све">Све</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
              ))}
            </select>
          </label>
        </div>
      </details>

      {/* ── Последње трансакције ── */}
      {recent.length > 0 && (
        <div className="card">
          <p className="section-title">Последње трансакције</p>
          <div className="recent-list">
            {recent.map((r) => (
              <RecentItem key={r.id} record={r} categoryName={catName(r.categoryId)} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
