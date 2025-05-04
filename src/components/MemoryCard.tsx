import { Memory } from "../types/memory";
import clsx from "clsx";

interface Props {
  memory: Memory;
  onClick?: () => void;
}

export default function MemoryCard({ memory, onClick }: Props) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(memory.date));

  return (
    <article
      className={clsx("memory-card", onClick && "memory-card--clickable")}
      onClick={onClick}
    >
      <time className="memory-date">{formattedDate}</time>

      {memory.photos[0] && <img src={memory.photos[0]} alt="" />}
      <h3>{memory.title}</h3>
      <p>{memory.description}</p>
    </article>
  );
}