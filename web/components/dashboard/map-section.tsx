'use client';

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Institution data for map display
type MapInstitution = {
  name: string;
  location: string;
  zip: string;
  lat: number;
  lng: number;
  credits?: number;
  lastUpdated?: string;
};

// Props for map section component
type MapSectionProps = {
  institutions: MapInstitution[];
  learnerLocation?: { lat: number; lng: number };
};

// Map component that displays institutions on an interactive map
export function MapSection({
  institutions,
  learnerLocation,
}: MapSectionProps) {
  // Refs for map container and instance
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Initialize map when component mounts or dependencies change
  useEffect(() => {
    if (!accessToken || !mapRef.current) {
      return;
    }

    mapboxgl.accessToken = accessToken;
    const container = mapRef.current;

    // Determine map center: prefer learner location, then first institution, then US center
    const fallbackCenter: [number, number] = [-98.5795, 39.8283];
    const center: [number, number] = learnerLocation
      ? [learnerLocation.lng, learnerLocation.lat]
      : institutions[0]
        ? [institutions[0].lng, institutions[0].lat]
        : fallbackCenter;

    mapInstance.current = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom: institutions.length ? 7 : 4,
      attributionControl: false,
    });

    // Add navigation controls to map
    mapInstance.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Create bounds to fit all markers
    const bounds = new mapboxgl.LngLatBounds();

    // Add markers for each institution
    institutions.forEach((institution) => {
      const lngLat: [number, number] = [institution.lng, institution.lat];
      bounds.extend(lngLat);

      const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(
        `<div style="font-size:13px">
          <strong>${institution.name}</strong><br/>
          ${institution.location} · ${institution.zip}<br/>
          Credits: ${institution.credits ?? "--"}<br/>
          Updated: ${institution.lastUpdated ?? "Unknown"}
        </div>`,
      );

      new mapboxgl.Marker({
        color: "#6ebf10",
      })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(mapInstance.current!);
    });

    // Fit map to show all markers if there are multiple
    if (institutions.length > 1) {
      mapInstance.current.fitBounds(bounds, { padding: 40 });
    }

    // Cleanup: remove map instance when component unmounts or dependencies change
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [accessToken, institutions, learnerLocation]);

  return (
    <section className="rounded-3xl border border-[#cadcc5] bg-white p-6 shadow-xl shadow-[#6ebf10]/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6ebf10]">
            Map Overview
          </p>
          <h2 className="text-lg font-semibold text-[#1c1c1c]">
            Institutions near you
          </h2>
        </div>
        <span className="rounded-full bg-white/70 px-4 py-1 text-xs font-semibold text-[#4a4a4a]">
          Live explorer
        </span>
      </div>
      {/* Show error message if Mapbox token is missing */}
      {!accessToken ? (
        <p className="mt-4 rounded-2xl border border-dashed border-[#6ebf10] bg-[#f6fff0] p-4 text-sm text-[#1c1c1c]">
          Mapbox access token missing. Set{" "}
          <code className="rounded bg-black/10 px-1 py-0.5">
            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </code>{" "}
          to enable the map.
        </p>
      ) : (
        <div
          ref={mapRef}
          className="mt-4 h-72 w-full rounded-2xl border border-white/40 shadow-inner shadow-black/10 sm:h-80 lg:h-[28rem]"
        />
      )}
    </section>
  );
}
