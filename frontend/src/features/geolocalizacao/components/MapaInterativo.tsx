"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface Props {
  latitude: number | null;
  longitude: number | null;
  onSelecionar: (lat: number, lon: number) => void;
}

function ControleClique({ onSelecionar }: { onSelecionar: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => onSelecionar(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

function ControleCentralizar({ latitude, longitude }: { latitude: number | null; longitude: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      map.setView([latitude, longitude], Math.max(map.getZoom(), 15));
    }
  }, [latitude, longitude, map]);
  return null;
}

function ControleInvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const ts = [50, 200, 400, 800].map((t) =>
      window.setTimeout(() => map.invalidateSize(), t),
    );
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      ts.forEach(clearTimeout);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}

const CENTRO_PADRAO: [number, number] = [-15.7942, -47.8825]; // Brasília

export default function MapaInterativo({ latitude, longitude, onSelecionar }: Props) {
  const center: [number, number] =
    latitude !== null && longitude !== null ? [latitude, longitude] : CENTRO_PADRAO;
  const zoom = latitude !== null && longitude !== null ? 15 : 4;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ControleClique onSelecionar={onSelecionar} />
      <ControleCentralizar latitude={latitude} longitude={longitude} />
      <ControleInvalidateSize />
      {latitude !== null && longitude !== null && (
        <Marker
          position={[latitude, longitude]}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const pos = (e.target as L.Marker).getLatLng();
              onSelecionar(pos.lat, pos.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
