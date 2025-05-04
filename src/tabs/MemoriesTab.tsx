import { useState } from "react";
import { Memory } from "../types/memory";
import { useLocalStorage } from "../hooks/useLocalStorage";
import VerticalTimeline from "../components/VerticalTimeline";
import AddMemoryModal from "../components/AddMemoryModal";
import MemoryDetailModal from "../components/MemoryDetailModal";
import dayjs from "dayjs";
import { v4 as uuid } from "uuid";
import { useAutoScrollBottom } from "../hooks/useAutoScrollBottom";
import AllMemoriesMapModal from "../components/AllMemoriesMapModal";

export default function MemoriesTab() {
    const [memories, setMemories] = useLocalStorage<Memory[]>("memories", []);
    const [showAdd, setShowAdd] = useState(false);
    const [selected, setSelected] = useState<Memory | null>(null);
    const [showMap, setShowMap] = useState(false);           // NEW

    function addMemory(memory: Omit<Memory, "id">) {
        setMemories([...memories, { ...memory, id: uuid() }]);
    }
    function deleteMemory(id: string) {
        setMemories(memories.filter((m) => m.id !== id));
    }

    const ordered = [...memories].sort((a, b) =>
        dayjs(a.date).isAfter(b.date) ? 1 : -1,
    );

    // scroll au bas à chaque ajout / chargement
    useAutoScrollBottom(memories.length);

    return (
        <>
            <VerticalTimeline memories={ordered} onSelect={setSelected} />

            <button
                id="add-btn"
                aria-label="Ajouter"
                onClick={() => setShowAdd(true)}
            >
                +
            </button>
            {/* flotant carte */}
            <button
                id="map-btn"
                aria-label="Carte"
                onClick={() => setShowMap(true)}
            >
                🗺️
            </button>

            {showAdd && (
                <AddMemoryModal
                    onClose={() => setShowAdd(false)}
                    onSave={addMemory}
                />
            )}

            {selected && (
                <MemoryDetailModal
                    memory={selected}
                    onClose={() => setSelected(null)}
                    onDelete={(id) => {
                        deleteMemory(id);
                        setSelected(null);
                    }}
                />
            )}

      {showMap && (
        <AllMemoriesMapModal memories={memories} onClose={() => setShowMap(false)} />
      )}
        </>
    );
}