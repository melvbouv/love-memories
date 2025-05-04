import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import * as exifr from "exifr";

export default function PhotosTab() {
    const [photos, setPhotos] = useState<{ key: string; dateTaken: number }[]>([]);
    const fileInput = useRef<HTMLInputElement>(null);
  
    // charge la liste existante
    useEffect(() => {
      fetch("/api/photos")
        .then((r) => r.json())
        .then(setPhotos)
        .catch(() => {});
    }, []);
  
    // la fonction corrigée :
      const handleAdd = async (files: FileList) => {
            // [...] compression, EXIF, upload, metadata
            await Promise.all(
              Array.from(files).map(async (file) => {
                // 1) compression
                const MAX_MB = 0.5;
                const compressed =
                  file.size > MAX_MB * 1024 * 1024
                    ? await imageCompression(file, {
                        maxSizeMB: MAX_MB,
                        maxWidthOrHeight: 2500,
                        useWebWorker: true,
                      })
                    : file;
        
                // 2) extraction EXIF
                let dateTaken = file.lastModified;
                try {
                  const exif = await exifr.parse(compressed, ["DateTimeOriginal"]);
                  if (exif?.DateTimeOriginal) {
                    dateTaken = exif.DateTimeOriginal.getTime();
                  }
                } catch {
                  /* ignore */
                }
        
                // 3) upload blob → R2
                const fd = new FormData();
                fd.append("file", compressed, file.name);
                const { key } = await fetch("/api/upload", {
                  method: "POST",
                  body: fd,
                }).then((r) => {
                  if (!r.ok) throw new Error("upload failed");
                  return r.json();
                });
        
                // 4) enregistrer la métadonnée dans KV
                await fetch("/api/photos", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ key, dateTaken }),
                });
              })
            );
        
            // 5) recharger et mettre à jour l’état
            const updated = await fetch("/api/photos").then((r) => r.json());
            setPhotos(updated);
          };
  
    return (
      <>
        <div className="photo-grid">
          {photos.map((p) => (
            <button key={p.key} onClick={() => /* fullscreen */ null}>
              <img src={`/api/file/${p.key}`} alt="" />
            </button>
          ))}
        </div>
  
        <button id="add-btn" onClick={() => fileInput.current?.click()}>
          +
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) handleAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </>
    );
  }