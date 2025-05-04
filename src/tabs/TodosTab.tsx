import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

export default function TodosTab() {
  const [todos, setTodos] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newText, setNewText] = useState("");

  // 1) charger depuis KV
  useEffect(() => {
    fetch("/api/todos")
      .then((r) => r.json())
      .then(setTodos)
      .catch(() => {});
  }, []);

  // 2) ajouter
  const add = async () => {
    const todo = { id: uuid(), text: newText, done: false };
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    });
    setTodos((t) => [...t, todo]);
    setNewText("");
  };

  // 3) toggler
  const toggle = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: "PUT" });
    setTodos((t) => t.map((x) => x.id === id ? { ...x, done: !x.done } : x));
  };

  // 4) supprimer
  const remove = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    setTodos((t) => t.filter((x) => x.id !== id));
  };

  return (
    <div className="todo-card">
      <input
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
      />
      <button onClick={add}>Ajouter</button>
      <ul>
        {todos.map((t) => (
          <li key={t.id} className={t.done ? "done" : ""}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggle(t.id)}
            />
            <span>{t.text}</span>
            <button className="trash-btn" onClick={() => remove(t.id)}>🗑</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
