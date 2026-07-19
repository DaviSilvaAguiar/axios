"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MagnifyingGlass, Crosshair, X, CircleNotch } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import { toast } from "@/lib/toast";
import { getEnderecosApi, reverseGeocodeApi } from "../geolocation.api";
import type { Localizacao, NominatimResult } from "../geolocation.types";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-app-surface-raised text-app-text-muted">
      <CircleNotch size={22} className="animate-spin" />
    </div>
  ),
});

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (loc: Localizacao) => void;
  initialValue?: Localizacao | null;
}

export default function LocationSelector({ open, onClose, onConfirm, initialValue }: Props) {
  const [latitude,  setLatitude]  = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address,   setAddress]   = useState<string>("");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLatitude(initialValue?.latitude ?? null);
    setLongitude(initialValue?.longitude ?? null);
    setAddress(initialValue?.address ?? "");
    setSearch("");
    setResults([]);
  }, [open, initialValue]);

  async function handleSearch() {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await getEnderecosApi(search);
      setResults(res);
      if (res.length === 0) toast.info("No address found.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  function selectResult(r: NominatimResult) {
    setLatitude(parseFloat(r.lat));
    setLongitude(parseFloat(r.lon));
    setAddress(r.display_name);
    setResults([]);
    setSearch("");
  }

  async function handleSelectOnMap(lat: number, lon: number) {
    setLatitude(lat);
    setLongitude(lon);
    const resolvedAddress = await reverseGeocodeApi(lat, lon).catch(() => null);
    if (resolvedAddress) setAddress(resolvedAddress);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Your browser does not support geolocation.");
      return;
    }
    setCapturing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        await handleSelectOnMap(lat, lon);
        setCapturing(false);
      },
      (err) => {
        setCapturing(false);
        const msg = err.code === err.PERMISSION_DENIED
          ? "Location permission denied."
          : "Unable to get your location.";
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function handleConfirm() {
    if (latitude === null || longitude === null) {
      toast.error("Select a point on the map.");
      return;
    }
    onConfirm({ latitude, longitude, address: address || null });
    onClose();
  }

  const canConfirm = latitude !== null && longitude !== null;

  return (
    <Modal open={open} onClose={onClose} className="!max-w-4xl">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <h2 className="text-feature-title text-app-text">Select location</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-app-text-muted hover:text-app-text transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 border-b border-app-border space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label=""
                placeholder="Search by address, place, city..."
                icon={<MagnifyingGlass size={16} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button type="button" variant="dark" onClick={handleSearch} disabled={searching || !search.trim()}>
              {searching ? "Searching..." : "Search"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={handleUseMyLocation}
              disabled={capturing}
              title="Use my current location"
            >
              <Crosshair size={16} />
              {capturing ? "Capturing..." : "My location"}
            </Button>
          </div>

          {results.length > 0 && (
            <ul className="max-h-40 overflow-y-auto rounded-xl border border-app-border bg-app-surface-raised divide-y divide-app-border-subtle">
              {results.map((r, idx) => (
                <li key={`${r.lat}-${r.lon}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => selectResult(r)}
                    className="w-full text-left px-4 py-2.5 text-body-sm text-app-text hover:bg-app-hover cursor-pointer"
                  >
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="h-[400px] w-full">
          <InteractiveMap
            latitude={latitude}
            longitude={longitude}
            onSelect={handleSelectOnMap}
          />
        </div>

        <div className="px-6 py-4 border-t border-app-border space-y-1">
          <p className="text-caption text-app-text-muted">Selected address</p>
          <p className="text-body-sm text-app-text">
            {address || (latitude !== null ? `${latitude.toFixed(6)}, ${longitude?.toFixed(6)}` : "No point selected — click the map, search an address or use your location.")}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-app-border">
          <Button type="button" variant="light" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleConfirm} disabled={!canConfirm}>Confirm</Button>
        </div>
      </div>
    </Modal>
  );
}
