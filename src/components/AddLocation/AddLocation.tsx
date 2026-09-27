import { useState } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { useLocationCity } from './useLocationCity';
export default function AddLocation({ onLocationChanged }: { onLocationChanged?: (location: string) => void }) {
  const { locate } = useLocationCity(false);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const update = (value: string) => { setLocation(value); onLocationChanged?.(value); };
  const getLocation = async () => {
    setLoading(true); setError(false);
    try { const info = await locate(); if (info) update(`${info.state}, ${info.country}`); else setError(true); }
    catch { setError(true); }
    finally { setLoading(false); }
  };
  return <div><div className="nd-location">{location ? <><MapPin size={14} /><span>{location}</span><button aria-label="Remove location" onClick={() => update('')}><X size={15} /></button></> : <button onClick={() => void getLocation()} disabled={loading}>{loading ? <Loader2 size={14} className="nd-spin" /> : <MapPin size={14} />}Add location</button>}</div>{error && <p className="text-xs nd-muted mt-2" role="status">Location unavailable.</p>}</div>;
}
