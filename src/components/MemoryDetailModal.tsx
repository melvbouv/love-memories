import { Memory } from "../types/memory";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";   // NEW
import "leaflet/dist/leaflet.css";                                        // NEW
import L from "leaflet";                                                  // NEW

// icône par défaut (on pointe vers le CDN Leaflet)
delete (L.Icon.Default as any).prototype._getIconUrl;                     // NEW
L.Icon.Default.mergeOptions({                                             // NEW
  iconRetinaUrl:                                                          // NEW
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",     // NEW
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", // NEW
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});                                                                       // NEW

interface Props {
    memory: Memory;
    onClose: () => void;
    onDelete: (id: string) => void;        // 👈
}

export default function MemoryDetailModal({ memory, onClose, onDelete }: Props) {
    function handleDelete() {
        if (confirm("Supprimer ce souvenir ?")) {
            onDelete(memory.id);
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="memory-detail" onClick={(e) => e.stopPropagation()}>
                {/* ——— EN-TÊTE ——— */}
                <header>
                    <h2>{memory.title}</h2>
                    <p className="detail-date">
                        {new Intl.DateTimeFormat("fr-FR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        }).format(new Date(memory.date))}
                    </p>
                    {memory.description && <p>{memory.description}</p>}
                </header>

                {/* ——— GALERIE ——— */}
                <div className="detail-gallery">
                    {memory.photos.map((src, i) => (
                        <img key={i} src={src} alt={`photo ${i + 1}`} />
                    ))}
                </div>

                {/* ——— CARTE ——— */}
                {memory.coords && (
                    <section className="memory-map">
                        <MapContainer
                            center={[memory.coords.lat, memory.coords.lng]}
                            zoom={13}
                            style={{
                                height: "240px",
                                width: "100%",
                                borderRadius: "var(--radius)",
                                marginTop: "1rem",
                            }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="© OpenStreetMap"
                            />
                            <Marker position={[memory.coords.lat, memory.coords.lng]}>
                                <Popup>
                                    {memory.title}
                                    {memory.location && <br />}
                                    {memory.location}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </section>
                )}



                {/* ——— BOUTONS ——— */}
                <button className="close-btn" onClick={onClose}>
                    Fermer
                </button>
                <button className="delete-btn" onClick={handleDelete}>
                    Supprimer
                </button>
            </div>
        </div>
    );
}