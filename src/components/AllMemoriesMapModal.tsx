import { Memory } from "../types/memory";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  memories: Memory[];
  onClose: () => void;
}

export default function AllMemoriesMapModal({ memories, onClose }: Props) {
  const points = memories.filter((m) => m.coords);
  // centre approximatif : premier point ou 0/0 fallback
  const center =
    points[0]?.coords ?? { lat: 0, lng: 0 };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="memory-detail"       /* réutilise ton style plein écran */
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0 }}           /* carte plein cadre */
      >
        <button
          className="close-btn"
          aria-label="Fermer"
          onClick={onClose}
        >
          ×
        </button>

        <MapContainer
          center={[center.lat, center.lng]}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap'
          />
          {points.map((m) => (
            <Marker
              key={m.id}
              position={[m.coords!.lat, m.coords!.lng]}
            >
              <Popup>
                {m.title}
                {m.location && <br />}
                {m.location}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
