import { useEffect } from "react";
import { usePhotos } from "../hooks/usePhotos";

export default function PhotosTab() {
  const { photos, remove, addPhotoLocal } = usePhotos();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/photos");
      if (!res.ok) return;
      const remotePhotos = await res.json();

      for (const { key, dateTaken } of remotePhotos) {
        const existing = photos.find((p) => p.id === key);
        if (!existing) {
          const fileRes = await fetch(`/api/file/${encodeURIComponent(key)}`);
          if (!fileRes.ok) continue;
          const blob = await fileRes.blob();
          await addPhotoLocal(key, blob, dateTaken);
        }
      }
    })();
  }, []);

  return (
    <div>
      {photos.map((photo) => (
        <div key={photo.id}>
          <img src={`/api/file/${encodeURIComponent(photo.id)}`} alt="photo" />
          <button onClick={() => remove(photo.id)}>Supprimer</button>
        </div>
      ))}
    </div>
  );
}