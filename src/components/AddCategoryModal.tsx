import { useState, FormEvent } from "react";

interface Props {
  onSave: (name: string) => void;
  onClose: () => void;
}

export default function AddCategoryModal({ onSave, onClose }: Props) {
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Nouvelle catégorie</h2>
        <input
          type="text"
          placeholder="Ex. Voyages, Courses…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Enregistrer</button>
        <button type="button" onClick={onClose}>Annuler</button>
      </form>
    </div>
  );
}