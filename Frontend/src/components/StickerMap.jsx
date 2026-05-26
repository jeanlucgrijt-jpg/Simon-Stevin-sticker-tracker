import React, { useEffect, useState, useRef } from 'react';
import './StickerMap.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5001`;

export default function StickerMap() {
    const mapRef = useRef(null);
    const [stats, setStats] = useState({ stickers: 0, locations: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Initialize map only once
        if (!mapRef.current) {
            mapRef.current = L.map('sticker-map', { center: [51.4416, 5.4697], zoom: 13, attributionControl: false });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { 
                maxZoom: 19, 
                subdomains: 'abcd' 
            }).addTo(mapRef.current);
        }

        const loadStickers = async () => {
            try {
                const r = await fetch(`${API_BASE}/stickerData`);
                const d = await r.json();
                const stickers = d.stickerData || [];
                
                const regions = new Set();
                stickers.forEach(s => regions.add(Math.round(Number(s.latitude)) + ',' + Math.round(Number(s.longitude))));
                
                setStats({ stickers: stickers.length, locations: regions.size });

                const group = L.featureGroup();
                stickers.forEach(s => {
                    const lat = Number(s.latitude);
                    // Handle typo in original code (longtidue vs longitude)
                    const lng = Number(s.longitude) || Number(s.longtidue); 
                    if (isNaN(lat) || isNaN(lng)) return;
                    
                    L.marker([lat, lng], { icon: createIcon(getType(s)) })
                     .bindPopup(buildPopup(s), { maxWidth: 280 })
                     .addTo(group);
                });
                
                group.addTo(mapRef.current);
                if (stickers.length > 0) {
                    mapRef.current.fitBounds(group.getBounds().pad(0.15));
                }
                setLoading(false);
            } catch (e) {
                console.warn('Could not load stickers:', e);
                setError(true);
                setLoading(false);
            }
        };

        loadStickers();

        // Cleanup
        return () => {
            if (mapRef.current) {
                mapRef.current.off();
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const createIcon = (type) => {
        const colors = { 
            regular: 'linear-gradient(135deg,#a855f7,#6366f1)', 
            lustrum: 'linear-gradient(135deg,#f59e0b,#ef4444)', 
            recent: 'linear-gradient(135deg,#22c55e,#06b6d4)' 
        };
        return L.divIcon({ 
            className: '', 
            html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${colors[type] || colors.regular};transform:rotate(-45deg);border:2px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:12px">📌</span></div>`, 
            iconSize: [28, 28], 
            iconAnchor: [14, 28], 
            popupAnchor: [0, -28] 
        });
    };

    const buildPopup = (s) => {
        const d = s.datePicture ? new Date(s.datePicture).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown';
        const lng = s.longitude || s.longtidue;
        return `<div class="popup-content"><div class="popup-sticker-name">${s.title || 'Untitled'}</div><div class="popup-sticker-committee">🏷️ ${s.stickerId || 'N/A'}</div>${s.description ? `<div style="font-size:12px;color:#94a3b8;margin-bottom:10px">${s.description}</div>` : ''}<div class="popup-meta"><span>📅 ${d}</span><span>📍 ${Number(s.latitude).toFixed(4)}, ${Number(lng).toFixed(4)}</span></div></div>`;
    };

    const getType = (s) => {
        if (s.lustrum) return 'lustrum';
        const u = new Date(s.dateUploaded || s.datePicture); 
        const w = new Date(); w.setDate(w.getDate() - 7);
        return u > w ? 'recent' : 'regular';
    };

    return (
        <div className="sticker-map-container" id="stickerMapWidget">
            <div className="sticker-map-header">
                <div className="sticker-map-header-left">
                    <div className="sticker-map-icon">📍</div>
                    <div>
                        <div className="sticker-map-title">Sticker Map</div>
                        <div className="sticker-map-subtitle">Simon Stevin — worldwide sticker locations</div>
                    </div>
                </div>
                <div className="sticker-map-stats">
                    <div className="sticker-map-stat">
                        <span className="sticker-map-stat-dot"></span>
                        <span>{stats.stickers}</span> stickers
                    </div>
                    <div className="sticker-map-stat">
                        <span>{stats.locations}</span> locations
                    </div>
                </div>
            </div>
            
            <div id="sticker-map"></div>
            
            {(loading || error) && (
                <div className={`sticker-map-loading`}>
                    {loading ? (
                        <>
                            <div className="sticker-map-spinner"></div>
                            <div className="sticker-map-loading-text">Loading sticker data…</div>
                        </>
                    ) : (
                        <>
                            <div style={{fontSize: '24px', marginBottom: '8px'}}>🗺️</div>
                            <div className="sticker-map-loading-text">No data available</div>
                            <div style={{fontSize: '11px', color: '#64748b', marginTop: '4px'}}>Start the backend to see markers</div>
                        </>
                    )}
                </div>
            )}
            
            <div className="sticker-map-footer">
                <div>Powered by Leaflet &amp; OpenStreetMap</div>
                <div className="sticker-map-legend">
                    <div className="sticker-map-legend-item"><span className="sticker-map-legend-dot regular"></span> Regular</div>
                    <div className="sticker-map-legend-item"><span className="sticker-map-legend-dot lustrum"></span> Lustrum</div>
                    <div className="sticker-map-legend-item"><span className="sticker-map-legend-dot recent"></span> Recent</div>
                </div>
            </div>
        </div>
    );
}
