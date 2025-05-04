import { useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { TodoCategory } from "../types/todo";
import AddCategoryModal from "../components/AddCategoryModal";
import AddTaskModal from "../components/AddTaskModal";
import TodoCard from "../components/TodoCard";
import { v4 as uuid } from "uuid";
import { useSwipeable } from "react-swipeable";

export default function TodosTab() {
  const [cats, setCats] = useLocalStorage<TodoCategory[]>(
    "todos",
    []
  );
  const [showCatModal, setShowCatModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [current, setCurrent] = useState(0);

  // ── 1) SYNC INIT : récupérer les catégories + tâches depuis /api/todos
  useEffect(() => {
    fetch("/api/todos")
      .then((r) => r.json())
      .then((serverCats: TodoCategory[]) => setCats(serverCats))
      .catch(() => {
        /* offline : on garde localStorage */
      });
  }, []);

  // ── 2) CRUD catégories ──
  function addCategory(name: string) {
    const newCat = { id: uuid(), name, tasks: [] };
    setCats((prev) => [...prev, newCat]);
    setCurrent(cats.length);
    // sync serveur
    fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCat),
    }).catch(() => {});
  }

  function deleteCategory() {
    if (!confirm("Supprimer cette catégorie ?")) return;
    const toDel = cats[current];
    setCats((prev) => prev.filter((_, i) => i !== current));
    setCurrent((i) => Math.max(i - 1, 0));
    // sync serveur : supprime catégorie (et toutes ses tâches)
    fetch(`/api/todos/${toDel.id}`, { method: "DELETE" }).catch(() => {});
  }

  // ── 3) CRUD tâches ──
  function addTask(text: string) {
    const cat = cats[current];
    const todo = { id: uuid(), text, done: false, category: cat.name };
    setCats((prev) =>
      prev.map((c, i) =>
        i === current
          ? { ...c, tasks: [...c.tasks, todo] }
          : c
      )
    );
    // sync serveur : ajoute la tâche
    fetch(`/api/todos/${cat.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    }).catch(() => {});
  }

  function toggleTask(taskId: string) {
    const cat = cats[current];
    setCats((prev) =>
      prev.map((c, i) =>
        i === current
          ? {
              ...c,
              tasks: c.tasks.map((t) =>
                t.id === taskId ? { ...t, done: !t.done } : t
              ),
            }
          : c
      )
    );
    // sync toggle
    fetch(`/api/todos/${cat.id}/tasks/${taskId}`, {
      method: "PUT",
    }).catch(() => {});
  }

  function deleteTask(taskId: string) {
    const cat = cats[current];
    setCats((prev) =>
      prev.map((c, i) =>
        i === current
          ? {
              ...c,
              tasks: c.tasks.filter((t) => t.id !== taskId),
            }
          : c
      )
    );
    // sync suppr tâche
    fetch(`/api/todos/${cat.id}/tasks/${taskId}`, {
      method: "DELETE",
    }).catch(() => {});
  }

  // ── 4) Swipe carousel ──
  const handlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrent((i) => Math.min(i + 1, cats.length - 1)),
    onSwipedRight: () =>
      setCurrent((i) => Math.max(i - 1, 0)),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  return (
    <>
      {cats.length ? (
        <div className="todo-stack" {...handlers}>
          {cats.map((cat, idx) => {
            const offset = idx - current;
            const style: React.CSSProperties = {
              transform: `
                translateX(${offset * 15}%)
                translateY(${Math.abs(offset) * 8}px)
                scale(${1 - Math.abs(offset) * 0.06})
                rotateZ(${offset * 2}deg)
              `,
              zIndex: 100 - Math.abs(offset),
              opacity: Math.abs(offset) > 3 ? 0 : 1,
            };
            return (
              <div key={cat.id} className="stack-card" style={style}>
                <TodoCard
                  cat={cat}
                  onToggle={toggleTask}
                  onAddTask={() => setShowTaskModal(true)}
                  onDeleteTask={deleteTask}
                  onDeleteCategory={deleteCategory}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ textAlign: "center", padding: "2rem" }}>
          Pas encore de catégorie… crée la première !
        </p>
      )}

      <button
        id="add-btn"
        aria-label="Nouvelle catégorie"
        onClick={() => setShowCatModal(true)}
      >
        +
      </button>

      {showCatModal && (
        <AddCategoryModal
          onSave={addCategory}
          onClose={() => setShowCatModal(false)}
        />
      )}
      {showTaskModal && (
        <AddTaskModal
          onSave={addTask}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </>
  );
}
