import { useEffect, useRef, useState } from "react";

export default function PhotosTab() {
  const [photos, setPhotos] = useState<{ key: string; dateTaken: number }[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  // 1) Charge la liste depuis KV
  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then(setPhotos)
      .catch(() => {});
  }, []);

  // 2) Ajout de fichiers
  const handleAdd = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const compressed = await /* compression 0.5MB */;
      // upload blob → R2
      const { key } = await fetch("/api/upload", {
        method: "POST",
        body: (() => {
          const fd = new FormData();
          fd.append("file", compressed, file.name);
          return fd;
        })(),
      }).then((r) => r.json());
      // extraire dateTaken EXIF
      const dateTaken = await /* exifr.parse(compressed) */;
      // enregistrer metadata
      await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, dateTaken }),
      });
    }
    // rechargement simplifié
    const updated = await fetch("/api/photos").then((r) => r.json());
    setPhotos(updated);
  };

  // 3) Suppression d’une photo
  const handleDelete = async (key: string) => {
    if (!confirm("Supprimer ?")) return;
    await fetch(`/api/photos/${encodeURIComponent(key)}`, { method: "DELETE" });
    setPhotos((p) => p.filter((x) => x.key !== key));
  };

  return (
    <>
      <div className="photo-grid">
        {photos.map((p) => (
          <button key={p.key} onClick={() => /* full screen */ null}>
            <img src={`/api/file/${p.key}`} alt="" />
          </button>
        ))}
      </div>
      <button onClick={() => fileInput.current?.click()}>+</button>
      <input
        type="file"
        multiple
        accept="image/*"
        hidden
        ref={fileInput}
        onChange={(e) => e.target.files && handleAdd(e.target.files)}
      />
    </>
  );
}
