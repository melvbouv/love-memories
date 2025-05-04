import { Memory } from "../types/memory";
import MemoryCard from "./MemoryCard";

interface Props {
  memories: Memory[];
  onSelect: (m: Memory) => void;
}

export default function VerticalTimeline({ memories, onSelect }: Props) {
  if (!memories.length)
    return (
      <p style={{ textAlign: "center", padding: "2rem" }}>
        Aucun souvenir… ajoute le premier !
      </p>
    );

  return (
    <div className="v-timeline">
      {memories.map((m) => (
        <div className="v-entry" key={m.id}>
          <span className="v-dot" />
          <div className="v-content">
            <MemoryCard memory={m} onClick={() => onSelect(m)} />
          </div>
        </div>
      ))}
    </div>
  );
}