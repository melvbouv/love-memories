import { useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { usePhotos } from "../hooks/usePhotos";
import dayjs from "dayjs";
import "dayjs/locale/fr";    // NEW
dayjs.locale("fr");          // NEW

export default function PhotosTab() {
  const { photos, addFiles, remove } = usePhotos();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [current, setCurrent] = useState<string | null>(null);

  // ---------- Groupe photos par journée ---------- //
  const groups = useMemo(() => {
    const map = new Map<string, typeof photos>();
    photos.forEach((p) => {
      const key = dayjs(p.dateTaken).format("YYYY-MM-DD");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries()).sort(
      (a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf()
    ); // ancien → récent
  }, [photos]);

  const big = photos.find((p) => p.id === current) || null;

  return (
    <>
      {/* ---------- LISTE GROUPÉE ---------- */}
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
                  <img src={p.url} alt="Miniature" loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        ))}

        {photos.length === 0 && (
          <p style={{ padding: "1rem" }}>Aucune photo…</p>
        )}
      </div>

      {/* ---------- Bouton flottant + ---------- */}
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
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* ---------- Modal plein écran ---------- */}
      {big &&
        createPortal(
          <div
            className="modal-backdrop"
            onClick={(e) => e.currentTarget === e.target && setCurrent(null)}
          >
            <figure className="photo-modal">
              <img src={big.url} alt="Photo en grand" />
            </figure>

            <button
              className="delete-btn"
              onClick={() => {
                if (window.confirm("Supprimer cette photo ?")) {
                  remove(big.id);
                  setCurrent(null);
                }
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
