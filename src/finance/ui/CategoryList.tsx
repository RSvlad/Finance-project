// UI: Листа категорија са inline edit и деактивацијом (само Admin).
// Viewer види само листу без акцијских дугмади.

import { useState } from "react";
import {
  createCategory,
  updateCategory,
} from "@finance/infrastructure/CategoryRepository";
import { useCategoryList } from "@finance/application/useCategoryList";
import type { Category, RecordType } from "@finance/domain/Category";
import type { Role } from "@identity/domain/User";

interface Props {
  role: Role;
}

export function CategoryList({ role }: Props) {
  const categories = useCategoryList();
  const isAdmin = role === "Admin";

  // Форма за нову категорију
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<RecordType>("Приход");
  const [formError, setFormError] = useState("");

  // Inline edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) {
      setFormError("Назив је обавезан.");
      return;
    }
    setFormError("");
    await createCategory({ name: trimmed, type: newType, active: true, system: false });
    setNewName("");
  }

  async function handleDeactivate(cat: Category) {
    await updateCategory(cat.id, { active: false });
  }

  async function handleEditSave(cat: Category) {
    const trimmed = editName.trim();
    if (!trimmed) return;
    await updateCategory(cat.id, { name: trimmed });
    setEditId(null);
  }

  const income = categories.filter((c) => c.type === "Приход");
  const expense = categories.filter((c) => c.type === "Расход");

  return (
    <div>
      <h2>Категорије</h2>

      {(["Приход", "Расход"] as RecordType[]).map((t) => (
        <section key={t}>
          <h3>{t}</h3>
          <ul>
            {(t === "Приход" ? income : expense).map((cat) => (
              <li key={cat.id} style={{ opacity: cat.active ? 1 : 0.5 }}>
                {isAdmin && editId === cat.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <button onClick={() => handleEditSave(cat)}>Сачувај</button>
                    <button onClick={() => setEditId(null)}>Откажи</button>
                  </>
                ) : (
                  <>
                    {cat.name}
                    {!cat.active && " (деактивирана)"}
                    {isAdmin && !cat.system && cat.active && (
                      <>
                        {" "}
                        <button
                          onClick={() => {
                            setEditId(cat.id);
                            setEditName(cat.name);
                          }}
                        >
                          Уреди
                        </button>
                        <button onClick={() => handleDeactivate(cat)}>
                          Деактивирај
                        </button>
                      </>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {isAdmin && (
        <div>
          <h3>Нова категорија</h3>
          <input
            placeholder="Назив"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as RecordType)}
          >
            <option value="Приход">Приход</option>
            <option value="Расход">Расход</option>
          </select>
          <button onClick={handleCreate}>Додај</button>
          {formError && <span style={{ color: "red" }}>{formError}</span>}
        </div>
      )}
    </div>
  );
}
