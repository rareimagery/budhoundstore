import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { STORE_COORDINATES, LOMPOC_CENTER } from "../lib/constants";

// Fix Leaflet default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom green marker for the selected store
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Recenter map when store changes
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function StoreMap({ store }) {
  const coords = store?.internalId
    ? STORE_COORDINATES[store.internalId]
    : null;

  const center = coords
    ? { lat: coords.lat, lng: coords.lng }
    : LOMPOC_CENTER;

  const addr = store?.address;
  const addressText = addr
    ? [addr.address_line1, addr.locality, addr.administrative_area, addr.postal_code]
        .filter(Boolean)
        .join(", ")
    : coords?.address || "";

  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-brand-surface">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-[300px] md:h-[400px] w-full"
        style={{ background: "#1a1a1a" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <RecenterMap lat={center.lat} lng={center.lng} />
        {coords && (
          <Marker position={[coords.lat, coords.lng]} icon={greenIcon}>
            <Popup>
              <div className="text-sm">
                <strong>{store?.name || coords.name}</strong>
                <br />
                {addressText}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
