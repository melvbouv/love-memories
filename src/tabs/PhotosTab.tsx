// src/tabs/PhotosTab.tsx

import { useRef, useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePhotos } from "../hooks/usePhotos";
import dayjs from "dayjs";
import "dayjs/locale/fr";
dayjs.locale("fr");

export default function PhotosTab() {
  const { photos, addFiles, remove, addPhotoLocal } = usePhotos();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [current, setCurrent] = useState<string | null>(null);

  // ─── 1) SYNC INIT une seule fois ───
  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then(async (serverList: { key: string; dateTaken: number }[]) => {
        for (const { key, dateTaken } of serverList) {
          const id = key.split("/")[1];
          if (!photos.some((p) => p.id === id)) {
            const res = await fetch(`/api/file/${key}`);
            if (!res.ok) continue;
            const blob = await res.blob();
            await addPhotoLocal(id, blob, dateTaken);
          }
        }
      })
      .catch(() => {
        /* offline : on garde le local */
      });
  }, []); // ← vide = qu’une fois au montage

  // ─── 2) Groupement par date (inchangé) ───
  const groups = useMemo(() => {
    const map = new Map<string, typeof photos>();
    photos.forEach((p) => {
      const day = dayjs(p.dateTaken).format("YYYY-MM-DD");
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(p);
    });
    return Array.from(map.entries()).sort(
      (a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf()
    );
  }, [photos]);

  const big = photos.find((p) => p.id === current) || null;

  return (
    <>
      <div className="photo-groups">
        {groups.map(([day, list]) => (
          <section key={day} className="photo-group">
            <h2 className="photo-date">{dayjs(day).format("D MMMM YYYY")}</h2>
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
        {photos.length === 0 && <p style={{ padding: "1rem" }}>Aucune photo…</p>}
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
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {big &&
        createPortal(
          <div
            className="modal-backdrop"
            onClick={(e) => e.currentTarget === e.target && setCurrent(null)}
          >
            <figure className="photo-modal">
              <img src={big.url} alt="" />
            </figure>
            <button
              className="delete-btn"
              onClick={() => {
                remove(big.id);
                setCurrent(null);
              }}
            >
              Supprimer
            </button>
            <button className="close-btn" onClick={() => setCurrent(null)}>
              Fermer
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
