import { Memory } from "../types/memory";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// icône Leaflet par défaut (CDN vers le sprite) – évite l’import bundler
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
    memory: Memory;
    onClose: () => void;
}

export default function MemoryDetail({ memory, onClose }: Props) {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <article
                className="memory-detail"
                onClick={(e) => e.stopPropagation()}
            >
                {/* bouton flottant */}
                <button
                    className="close-btn"
                    aria-label="Fermer"
                    onClick={onClose}
                >
                    ×
                </button>

                <header>
                    <h2>{memory.title}</h2>
                    <time>
                        {new Intl.DateTimeFormat("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        }).format(new Date(memory.date))}
                    </time>
                    {memory.description && <p>{memory.description}</p>}
                </header>

                <section className="gallery">
                    {memory.photos.map((src, idx) => (
                        <img src={src} alt="" key={idx} />
                    ))}
                </section>

                {memory.coords && (
                    <section className="memory-map">
                        <MapContainer
                            center={[memory.coords.lat, memory.coords.lng]}
                            zoom={13}
                            style={{ height: "240px", width: "100%", borderRadius: "var(--radius)" }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='© OpenStreetMap'
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
            </article>
        </div>
    );
}