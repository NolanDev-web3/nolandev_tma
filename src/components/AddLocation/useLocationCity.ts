import { useCallback, useEffect, useRef, useState } from "react";

type CityInfo = {
	lat: number;
	lng: number;
	city?: string;
	state?: string;
	country?: string;
	formatted?: string;
};

type Status = "idle" | "locating" | "resolving" | "success" | "error";

export function useLocationCity(auto = false) {
	const [status, setStatus] = useState<Status>("idle");
	const [data, setData] = useState<CityInfo | null>(null);
	const [error, setError] = useState<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const getCoords = useCallback(
		() =>
			new Promise<{ lat: number; lng: number }>((resolve, reject) => {
				if (!("geolocation" in navigator)) {
					reject(new Error("Geolocation not supported"));
					return;
				}
				navigator.geolocation.getCurrentPosition(
					(pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
					(err) => reject(err),
					{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
				);
			}),
		[]
	);

	const reverseGeocodeToCity = useCallback(async (lat: number, lng: number) => {
		abortRef.current?.abort();
		const ctrl = new AbortController();
		abortRef.current = ctrl;

		const url = new URL("https://nominatim.openstreetmap.org/reverse");
		url.search = new URLSearchParams({
			lat: String(lat),
			lon: String(lng),
			format: "jsonv2",
			"accept-language": "en,zh",
			zoom: "10", // 城市级
		}).toString();

		const res = await fetch(url, {
			signal: ctrl.signal,
			headers: { Accept: "application/json" },
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const json = await res.json();
		const a = json.address || {};
		return {
			lat,
			lng,
			city: a.city || a.town || a.village || a.municipality || a.county,
			state: a.state,
			country: a.country,
			formatted: json.display_name,
		} as CityInfo;
	}, []);

	const locate = useCallback(async () => {
		try {
			setStatus("locating");
			setError(null);
			const { lat, lng } = await getCoords();
			setStatus("resolving");
			const info = await reverseGeocodeToCity(lat, lng);
			setData(info);
			setStatus("success");
			return info;
		} catch (e: any) {
			setError(e?.message || "Failed to get location");
			setStatus("error");
			throw e;
		}
	}, [getCoords, reverseGeocodeToCity]);

	useEffect(() => {
		if (auto) locate();
		return () => abortRef.current?.abort();
	}, [auto, locate]);

	return { status, data, error, locate };
}
