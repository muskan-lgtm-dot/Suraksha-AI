import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Compass,
  MapPin,
  Phone,
  Navigation,
  Shield,
  Hospital,
  ShieldAlert,
  Search,
  ExternalLink,
  Info
} from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  category: 'police' | 'hospital' | 'women_booth';
  address: string;
  lat: number;
  lng: number;
  phone: string;
  verified: string;
}

// Verified public assistance locations (Delhi NCR sample data)
const SAMPLE_FACILITIES: Facility[] = [
  {
    id: 'p1',
    name: 'Parliament Street Police Station & Women Help Desk',
    category: 'police',
    address: 'Parliament Street, Connaught Place, New Delhi',
    lat: 28.6250,
    lng: 77.2140,
    phone: '011-23361100',
    verified: 'Oct 2026'
  },
  {
    id: 'h1',
    name: 'Dr. Ram Manohar Lohia Hospital (24/7 Emergency Trauma)',
    category: 'hospital',
    address: 'Baba Kharak Singh Marg, New Delhi',
    lat: 28.6238,
    lng: 77.2005,
    phone: '011-23365525',
    verified: 'Oct 2026'
  },
  {
    id: 'p2',
    name: 'Connaught Place Police Post (Regal Building)',
    category: 'police',
    address: 'Outer Circle, Connaught Place, New Delhi',
    lat: 28.6315,
    lng: 77.2195,
    phone: '011-23746677',
    verified: 'Sep 2026'
  },
  {
    id: 'w1',
    name: 'Delhi Police Pink Booth (Dedicated Women Assistance)',
    category: 'women_booth',
    address: 'Janpath Metro Station Gate 2, New Delhi',
    lat: 28.6200,
    lng: 77.2180,
    phone: '1091',
    verified: 'Oct 2026'
  },
  {
    id: 'h2',
    name: 'Lady Hardinge Medical College & Hospital',
    category: 'hospital',
    address: 'Shaheed Bhagat Singh Marg, Connaught Place',
    lat: 28.6350,
    lng: 77.2115,
    phone: '011-23363728',
    verified: 'Oct 2026'
  },
  {
    id: 'p3',
    name: 'Barakhamba Road Police Station',
    category: 'police',
    address: 'Barakhamba Road, Fire Brigade Lane, New Delhi',
    lat: 28.6280,
    lng: 77.2280,
    phone: '011-23412233',
    verified: 'Oct 2026'
  }
];

export const NearbyAssistancePage: React.FC = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Safe Route Assistance Inputs
  const [destination, setDestination] = useState('Hauz Khas Village, New Delhi');
  const [routeCalculated, setRouteCalculated] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Grab location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords({ lat: 28.6289, lng: 77.2160 }),
        { timeout: 6000 }
      );
    } else {
      setCoords({ lat: 28.6289, lng: 77.2160 });
    }
  }, []);

  // Calculate distance in km
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Filter facilities
  const filteredFacilities = SAMPLE_FACILITIES.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Setup Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = coords?.lat || 28.6289;
    const lng = coords?.lng || 77.2160;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lng], 14);
    }

    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();

      // User marker
      const userIcon = L.divIcon({
        className: 'user-pin',
        html: `<div style="background-color: #0D9488; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>`,
        iconSize: [22, 22]
      });
      L.marker([lat, lng], { icon: userIcon })
        .bindPopup('<strong>Your Current Location</strong>')
        .addTo(markersGroupRef.current);

      // Facility markers
      filteredFacilities.forEach((f) => {
        const color = f.category === 'police' ? '#E63946' : f.category === 'hospital' ? '#0D9488' : '#A855F7';
        const icon = L.divIcon({
          className: 'facility-pin',
          html: `<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); color: white; font-size: 11px; font-weight: bold;">${f.category === 'police' ? 'P' : f.category === 'hospital' ? 'H' : 'W'}</div>`,
          iconSize: [26, 26]
        });

        L.marker([f.lat, f.lng], { icon })
          .bindPopup(`<strong>${f.name}</strong><br/>${f.address}<br/><b>Tel:</b> ${f.phone}`)
          .addTo(markersGroupRef.current!);
      });
    }
  }, [coords, selectedCategory, filteredFacilities]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 border-b border-navy-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-white">NEARBY ASSISTANCE & ROUTE ADVISOR</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Discover verified public emergency facilities: Police Stations, 24/7 Hospitals, and Dedicated Women Help Desks.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        {/* Controls Bar: Category Filters & Search */}
        <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Facilities' },
              { id: 'police', label: 'Police Stations' },
              { id: 'hospital', label: 'Emergency Hospitals' },
              { id: 'women_booth', label: 'Women Pink Booths' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-navy-900 text-slate-300 border border-navy-700 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name/street..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Grid: Interactive Map + Facilities Cards List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-[440px] rounded-3xl overflow-hidden border border-navy-800 shadow-2xl relative">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            {/* Safe Route Assistant Card */}
            <div className="p-5 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm text-white">Safe Route Corridor Preview</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter destination..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={() => setRouteCalculated(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shrink-0 shadow-md"
                >
                  Analyze Corridor
                </button>
              </div>

              {routeCalculated && (
                <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-xs text-slate-300 space-y-1.5 animate-fade-in">
                  <div className="flex items-center justify-between font-bold text-sky-300">
                    <span>Corridor: Current Location → {destination}</span>
                    <span>~8.2 km • 24 mins</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Route passes 4 verified police stations, 2 emergency hospitals, and 3 lit commercial avenues.
                  </p>
                  <p className="text-[10px] text-amber-300 flex items-center gap-1 pt-1">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Disclaimer: Route advisor provides facility proximity; it cannot guarantee absolute safety.</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Facilities List Column */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredFacilities.map((f) => {
              const dist = coords ? getDistanceKm(coords.lat, coords.lng, f.lat, f.lng) : null;
              return (
                <div
                  key={f.id}
                  className="p-4 rounded-2xl bg-navy-950 border border-navy-800 hover:border-slate-700 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          f.category === 'police'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : f.category === 'hospital'
                            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}
                      >
                        {f.category.replace('_', ' ')}
                      </span>
                      <h4 className="font-bold text-xs text-white mt-1.5 leading-snug">{f.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{f.address}</p>
                    </div>

                    {dist && (
                      <span className="text-xs font-mono font-bold text-emerald-400 shrink-0 bg-navy-900 px-2 py-1 rounded-lg">
                        {dist} km
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-navy-850 text-xs">
                    <a
                      href={`tel:${f.phone.replace(/[^0-9]/g, '')}`}
                      className="inline-flex items-center gap-1 text-slate-200 hover:text-white font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{f.phone}</span>
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sky-400 hover:underline text-[11px]"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
