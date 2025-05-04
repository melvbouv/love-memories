import { useRef, useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePhotos } from "../hooks/usePhotos";
import dayjs from "dayjs";
import "dayjs/locale/fr";
dayjs.locale("fr");

export default function PhotosTab() {
  const { photos, addFiles, remove } = usePhotos();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [current, setCurrent] = useState<string | null>(null);

  // ── 1) SYNC INIT : récupérer la liste depuis KV
  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then(
        async (serverList: { key: string; dateTaken: number }[]) => {
          for (const { key } of serverList) {
            const id = key.split("/")[1];
            // si on ne possède pas déjà cette photo en local
            if (!photos.some((p) => p.id === id)) {
              try {
                // 1. récupérer le blob
                const res = await fetch(`/api/file/${key}`);
                if (!res.ok) continue;
                const blob = await res.blob();
                // 2. créer un File pour le hook
                const file = new File([blob], id, { type: blob.type });
                // 3. stocker en IndexedDB + UI
                await addFiles([file]);
              } catch {
                /* ignore */
              }
            }
          }
        }
      )
      .catch(() => {
        /* offline : on conserve ce qu’il y a en local */
      });
  }, []);

  // construction des groupes par date (comme avant)
  const groups = useMemo(() => {
    const map = new Map<string, typeof photos>();
    photos.forEach((p) => {
      const key = dayjs(p.dateTaken).format("YYYY-MM-DD");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries()).sort(
      (a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf()
    );
  }, [photos]);

  const big = photos.find((p) => p.id === current) || null;

  return (
    <>
      {/* ===== Listes groupées ===== */}
      <div className="photo-groups">
        {groups.map(([key, list]) => (
          <section key={key} className="photo-group">
            <h2 className="photo-date">
              {dayjs(key).format("D MMMM YYYY")}
            </h2>
            <div className="photo-grid">
              {list.map((p) => (
                <button
                  key={p.id}
                  className="photo-thumb"
                  onClick={() => setCurrent(p.id)}
                >
                  <img src={p.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        ))}
        {photos.length === 0 && (
          <p style={{ padding: "1rem" }}>Aucune photo…</p>
        )}
      </div>

      {/* ===== Bouton + ===== */}
      <button
        id="add-btn"
        aria-label="Ajouter des photos"
        onClick={() => fileInput.current?.click()}
      >
        +
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) {
            // 2) ajout local + cloud : usePhotos gère IndexedDB,
            // et dans le hook on a greffé POST /api/upload + POST /api/photos
            addFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />

      {/* ===== Modal plein écran ===== */}
      {big &&
        createPortal(
          <div
            className="modal-backdrop"
            onClick={(e) =>
              e.currentTarget === e.target && setCurrent(null)
            }
          >
            <figure className="photo-modal">
              <img src={big.url} alt="" />
            </figure>

            <button
              className="delete-btn"
              onClick={() => {
                remove(big.id); // dans le hook on appelle DELETE /api/photos/:key + BUCKET.delete
                setCurrent(null);
              }}
            >
              Supprimer
            </button>
            <button
              className="close-btn"
              onClick={() => setCurrent(null)}
            >
              Fermer
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
