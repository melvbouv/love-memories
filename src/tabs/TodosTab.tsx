import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { TodoCategory } from "../types/todo";
import AddCategoryModal from "../components/AddCategoryModal";
import AddTaskModal from "../components/AddTaskModal";
import TodoCard from "../components/TodoCard";
import { v4 as uuid } from "uuid";
import { useSwipeable } from "react-swipeable";

export default function TodosTab() {
  const [cats, setCats] = useLocalStorage<TodoCategory[]>("todos", []);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [current, setCurrent] = useState(0); // index du carrousel

  // ----- helpers -----
  function addCategory(name: string) {
    setCats([...cats, { id: uuid(), name, tasks: [] }]);
    setCurrent(cats.length); // aller direct sur la nouvelle carte
  }

  function addTask(text: string) {
    setCats(
      cats.map((c, i) =>
        i === current
          ? {
              ...c,
              tasks: [...c.tasks, { id: uuid(), text, done: false }],
            }
          : c,
      ),
    );
  }

  function toggleTask(taskId: string) {
    setCats(
      cats.map((c, i) =>
        i === current
          ? {
              ...c,
              tasks: c.tasks.map((t) =>
                t.id === taskId ? { ...t, done: !t.done } : t,
              ),
            }
          : c,
      ),
    );
  }

    function deleteTask(taskId: string) {
        setCats(
          cats.map((c, i) =>
            i === current
              ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }
              : c,
          ),
        );
      }
    
      function deleteCategory() {
        if (!confirm("Supprimer cette catégorie et toutes ses tâches ?")) return;
        const newCats = cats.filter((_, i) => i !== current);
        setCats(newCats);
        setCurrent((prev) => Math.max(0, prev - 1));
      }

  // ----- swipe handlers -----
  const handlers = useSwipeable({
    onSwipedLeft() {
      if (current < cats.length - 1) setCurrent(current + 1);
    },
    onSwipedRight() {
      if (current > 0) setCurrent(current - 1);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  return (
    <>
      {/* ─────── PILE ─────── */}
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
              opacity: Math.abs(offset) > 3 ? 0 : 1, // on cache les trop lointaines
            };

            return (
              <div key={cat.id} className="stack-card" style={style}>
                <TodoCard
                  cat={cat}
                  onToggle={(taskId) => toggleTask(taskId)}
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

      {/* Bouton + catégorie */}
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