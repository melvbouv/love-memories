type TabId = "photos" | "memories" | "todo";

interface Props {
    current: TabId;
    onChange: (tab: TabId) => void;
}

export default function BottomNav({ current, onChange }: Props) {
    return (
        <nav className="bottom-nav" aria-label="Navigation principale">
            <button
                className={current === "photos" ? "active" : ""}
                onClick={() => onChange("photos")}
            >
                📷<span>Photos</span>
            </button>

            <button
                className={current === "memories" ? "active" : ""}
                onClick={() => onChange("memories")}
            >
                💖<span>Souvenirs</span>
            </button>

            <button
                className={current === "todo" ? "active" : ""}
                onClick={() => onChange("todo")}
            >
                ✅<span>Tâches</span>
            </button>
        </nav>
    );
}