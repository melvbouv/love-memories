import { useState, FormEvent } from "react";

interface Props {
  onSave: (text: string) => void;
  onClose: () => void;
}

export default function AddTaskModal({ onSave, onClose }: Props) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSave(text.trim());
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Nouvelle tâche</h2>
        <input
          type="text"
          placeholder="Que doit-on faire ?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <button type="submit">Ajouter</button>
        <button type="button" onClick={onClose}>Annuler</button>
      </form>
    </div>
  );
}