// UI: Листа финансијских записа са формом за унос/измену (само Admin).
// Viewer види само табелу без акција.

import { useState } from "react";
import {
  createFinanceRecord,
  updateFinanceRecord,
} from "@finance/infrastructure/FinanceRecordRepository";
import { useRecordList } from "@finance/application/useRecordList";
import { useCategoryList } from "@finance/application/useCategoryList";
import type { FinanceRecord } from "@finance/domain/FinanceRecord";
import type { RecordType } from "@finance/domain/Category";
import type { Role } from "@identity/domain/User";

interface Props {
  role: Role;
  currentUserId: string;
}

const EMPTY_FORM = {
  type: "Приход" as RecordType,
  value: "",
  currency: "RSD",
  dateTime: new Date().toISOString().slice(0, 16),
  categoryId: "",
  counterparty: "",
  description: "",
};

export function RecordList({ role, currentUserId }: Props) {
  const records = useRecordList();
  const categories = useCategoryList();
  const isAdmin = role === "Admin";

  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const activeCategories = categories.filter((c) => c.active);

  function categoryName(id: string): string {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return id;
    return cat.active ? cat.name : `${cat.name} (деактивирана)`;
  }

  function validate(): string {
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0)
      return "Износ мора бити позитиван број.";
    if (!form.currency.trim()) return "Валута је обавезна.";
    if (!form.categoryId) return "Категорија је обавезна.";
    if (!form.counterparty.trim()) return "Контрагент је обавезан.";
    return "";
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError("");

    const payload = {
      type: form.type,
      amount: { value: Number(form.value), currency: form.currency.trim().toUpperCase() },
      dateTime: new Date(form.dateTime),
      categoryId: form.categoryId,
      counterparty: form.counterparty.trim(),
      description: form.description.trim() || undefined,
      authorId: currentUserId,
    };

    if (editId) {
      await updateFinanceRecord(editId, {
        type: payload.type,
        amount: payload.amount,
        dateTime: payload.dateTime,
        categoryId: payload.categoryId,
        counterparty: payload.counterparty,
        description: payload.description,
      });
      setEditId(null);
    } else {
      await createFinanceRecord(payload);
    }
    setForm(EMPTY_FORM);
  }

  function startEdit(r: FinanceRecord) {
    setEditId(r.id);
    setForm({
      type: r.type,
      value: String(r.amount.value),
      currency: r.amount.currency,
      dateTime: r.dateTime.toISOString().slice(0, 16),
      categoryId: r.categoryId,
      counterparty: r.counterparty,
      description: r.description ?? "",
    });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  const sorted = [...records].sort(
    (a, b) => b.dateTime.getTime() - a.dateTime.getTime()
  );

  // Форма приказује само категорије које одговарају тренутно изабраном типу.
  const filteredCategories = activeCategories.filter((c) => c.type === form.type);

  return (
    <div>
      <h2>Финансијски записи</h2>

      {isAdmin && (
        <div>
          <h3>{editId ? "Измени запис" : "Нови запис"}</h3>
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as RecordType, categoryId: "" })
            }
          >
            <option value="Приход">Приход</option>
            <option value="Расход">Расход</option>
          </select>
          <input
            placeholder="Износ"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
          <input
            placeholder="Валута (нпр. RSD)"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            style={{ width: 80 }}
          />
          <input
            type="datetime-local"
            value={form.dateTime}
            onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
          />
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">— Категорија —</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Контрагент"
            value={form.counterparty}
            onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
          />
          <input
            placeholder="Опис (опционо)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button onClick={handleSubmit}>{editId ? "Сачувај" : "Додај"}</button>
          {editId && <button onClick={cancelEdit}>Откажи</button>}
          {formError && <span style={{ color: "red" }}>{formError}</span>}
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Датум</th>
            <th>Тип</th>
            <th>Износ</th>
            <th>Категорија</th>
            <th>Контрагент</th>
            <th>Опис</th>
            {isAdmin && <th>Акција</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id}>
              <td>{r.dateTime.toLocaleString("sr-RS")}</td>
              <td>{r.type}</td>
              <td>
                {r.amount.value.toLocaleString("sr-RS")} {r.amount.currency}
              </td>
              <td>{categoryName(r.categoryId)}</td>
              <td>{r.counterparty}</td>
              <td>{r.description ?? "—"}</td>
              {isAdmin && (
                <td>
                  <button onClick={() => startEdit(r)}>Уреди</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
