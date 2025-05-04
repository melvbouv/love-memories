import { useState } from "react";
import { Memory } from "../types/memory";
import { useLocalStorage } from "../hooks/useLocalStorage";
import VerticalTimeline from "../components/VerticalTimeline";
import AddMemoryModal from "../components/AddMemoryModal";
import MemoryDetailModal from "../components/MemoryDetailModal";
import dayjs from "dayjs";
import { useAutoScrollBottom } from "../hooks/useAutoScrollBottom";
import AllMemoriesMapModal from "../components/AllMemoriesMapModal";
import { useEffect } from "react";   // déjà présent si tu as d’autres hooks


export default function MemoriesTab() {
    const [memories, setMemories] = useLocalStorage<Memory[]>("memories", []);
    const [showAdd, setShowAdd] = useState(false);
    const [selected, setSelected] = useState<Memory | null>(null);
    const [showMap, setShowMap] = useState(false);           // NEW

    // ─── SYNC serveur → état local ───
    useEffect(() => {
        // appel uniquement au montage (dépendances : [])
        fetch("/api/memories")
            .then((r) => {
                if (!r.ok) throw new Error("network");
                return r.json();
            })
            .then((serverList: Memory[]) => {
                setMemories(serverList);          // ► écrit dans state *et* localStorage
            })
            .catch(() => {
                // Hors-ligne ou 1ʳᵉ utilisation : on garde les souvenirs locaux
                // Pas d’alerte pour ne pas spammer l’utilisateur
            });
    }, []); // tableau vide = exécution unique


    async function addMemory(memory: Omit<Memory, "id">) {
        try {
            const saved = await fetch("/api/memories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(memory),
            }).then((r) => r.json());          // renvoie {..., id}

            setMemories([...memories, saved]);
        } catch {
            alert("Impossible d’enregistrer (réseau ?)");
        }
    }

    async function deleteMemory(id: string) {
        try {
            await fetch(`/api/delete/${id}`, { method: "DELETE" });
            setMemories(memories.filter((m) => m.id !== id));
        } catch {
            alert("Erreur de suppression (réseau ?)");
        }
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