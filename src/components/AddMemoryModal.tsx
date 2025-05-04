import { useState, ChangeEvent, FormEvent } from "react";
import imageCompression from "browser-image-compression";
import { Memory } from "../types/memory";
import dayjs from "dayjs";

interface Props {
    onClose: () => void;
    onSave: (memory: Omit<Memory, "id">) => void;
}

export default function AddMemoryModal({ onClose, onSave }: Props) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState(""); 
    const [photos, setPhotos] = useState<string[]>([]);

    function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files?.length) return;
        Array.from(files).forEach(async (file) => {
            // options: 0.5 MB max et redimensionnement si besoin (> 2048 px)
            const compressed = await imageCompression(file, {
                maxSizeMB: 0.5,                // ≈ 500 kB
                maxWidthOrHeight: 2048,        // garde qualité raisonnable
                useWebWorker: true,
            });

            const fd = new FormData();
            fd.append("file", compressed, file.name || "photo.jpg");
            
            const { key } = await fetch("/api/upload", {
              method: "POST",
              body: fd,
            }).then(r => r.json());
            
            // URL accessible via notre proxy
            const url = `/api/file/${key}`;
            
            setPhotos(prev => [...prev, url]);
            
        });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        
                // --- Géocodage (OpenStreetMap Nominatim) ---
                let coords: { lat: number; lng: number } | undefined;
                if (location.trim()) {
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
                                location
                            )}`,
                            { headers: { "Accept-Language": "fr" } }
                        );
                        const data: any[] = await res.json();
                        if (data[0]) coords = { lat: +data[0].lat, lng: +data[0].lon };
                    } catch {
                        /* si réseau KO, on ignore */
                    }
                }
        
                onSave({ title, date, description, photos, location: location || undefined, coords });
                onClose();
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>Nouveau souvenir</h2>

                <input
                    type="text"
                    placeholder="Titre"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Lieu (ville, adresse…)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />


                <label>
                    Photos
                    <input type="file" accept="image/*" multiple onChange={handlePhoto} />
                </label>

                {!!photos.length && (
                    <div className="photo-preview">
                        {photos.map((p, i) => (
                            <img src={p} alt="" key={i} />
                        ))}
                    </div>
                )}

                <button type="submit">Enregistrer</button>
                <button type="button" onClick={onClose}>
                    Annuler
                </button>
            </form>
        </div>
    );
}