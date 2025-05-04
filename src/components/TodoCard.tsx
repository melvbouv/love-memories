import { TodoCategory } from "../types/todo";
import clsx from "clsx";

interface Props {
    cat: TodoCategory;
    onToggle: (taskId: string) => void;
    onAddTask: () => void;
    onDeleteTask: (taskId: string) => void;
    onDeleteCategory: () => void;   // ←  cette ligne doit exister
}

export default function TodoCard({
    cat,
    onToggle,
    onAddTask,
    onDeleteTask,
    onDeleteCategory,              // ←  et celle-ci dans les params
}: Props) {
    return (
        <article className="todo-card">
            <header>
                <h2>{cat.name}</h2>
                <button className="trash-btn cat-trash" onClick={onDeleteCategory} title="Supprimer la catégorie">
                    🗑️
                </button>
            </header>
            <div className="todo-list-wrapper">
                <ul className="todo-list">
                    {cat.tasks.map((t) => (
                        <li key={t.id} className={clsx({ done: t.done })}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={t.done}
                                    onChange={() => onToggle(t.id)}
                                />
                                <span>{t.text}</span>
                            </label>
                            <button
                                className="trash-btn"
                                onClick={() => onDeleteTask(t.id)}
                                title="Supprimer la tâche"
                            >
                                🗑️
                            </button>
                        </li>
                    ))}

                    {!cat.tasks.length && (
                        <li className="empty">Aucune tâche – ajoute la première !</li>
                    )}
                </ul>
            </div>

            <button className="add-task-btn" onClick={onAddTask}>
                + Tâche
            </button>
        </article>
    );
}