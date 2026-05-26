import React, { useState, useEffect, useMemo } from 'react';
import './StickerSelector.css';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5001`;

const EMOJIS = ['🎯','🚀','🎨','📚','🎶','⚙️','🧪','🏆','🎭','🌍','💡','🔬','🎓','🎪','🛡️','🎲','📐','🧩','🎸','🏅'];

const DEMO_STICKERS = [
    { id:'RC-001', name:'ReAcCie Sticker',       committee:'ReAcCie',     description:'The official ReAcCie activity sticker', lustrum:false, emoji:'🎯' },
    { id:'WC-001', name:'WebCie Sticker',        committee:'WebCie',      description:'Digital wizards committee sticker',     lustrum:false, emoji:'💻' },
    { id:'BC-001', name:'BorrelCie Sticker',     committee:'BorrelCie',   description:'Social drinks committee sticker',       lustrum:false, emoji:'🍺' },
    { id:'SC-001', name:'SportCie Sticker',      committee:'SportCie',    description:'Sports and fitness committee sticker',   lustrum:false, emoji:'⚽' },
    { id:'EC-001', name:'EduCie Sticker',        committee:'EduCie',      description:'Education committee sticker',            lustrum:false, emoji:'📚' },
    { id:'LC-001', name:'Lustrum Sticker',       committee:'LustrumCie',  description:'Special 5-year anniversary sticker',     lustrum:true,  emoji:'🎉' },
    { id:'FC-001', name:'FotoCie Sticker',       committee:'FotoCie',     description:'Photography committee sticker',          lustrum:false, emoji:'📷' },
    { id:'MC-001', name:'MusiCie Sticker',       committee:'MusiCie',     description:'Music committee sticker',                lustrum:false, emoji:'🎶' },
    { id:'DC-001', name:'DiesCie Sticker',       committee:'DiesCie',     description:'Anniversary week committee sticker',     lustrum:true,  emoji:'🏆' },
    { id:'KC-001', name:'KookCie Sticker',       committee:'KookCie',     description:'Cooking committee sticker',              lustrum:false, emoji:'🍳' },
    { id:'TC-001', name:'TourCie Sticker',       committee:'TourCie',     description:'Travel & tour committee sticker',        lustrum:false, emoji:'✈️' },
    { id:'PC-001', name:'PromoCie Sticker',      committee:'PromoCie',    description:'Promotion committee sticker',            lustrum:false, emoji:'📢' },
];

export default function StickerSelector() {
    const [stickers, setStickers] = useState(DEMO_STICKERS);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedId, setSelectedId] = useState(null);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        const fetchStickers = async () => {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 2000);
                const res = await fetch(`${API_BASE}/committeeData`, { signal: controller.signal });
                clearTimeout(timeout);
                
                const data = await res.json();
                const backendStickers = (data.committeeData || []).map((c, i) => ({
                    id: c.stickerId,
                    name: c.stickerName,
                    committee: c.committeeLeus,
                    description: c.stickerDescription || '',
                    date: c.stickerDate,
                    lustrum: c.lustrum,
                    emoji: EMOJIS[i % EMOJIS.length],
                }));
                
                if (backendStickers.length > 0) {
                    setStickers(backendStickers);
                }
            } catch (e) {
                console.warn('Backend not available, keeping demo data:', e);
            }
        };

        fetchStickers();
    }, []);

    const filteredStickers = useMemo(() => {
        let result = stickers;
        
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(s => 
                s.name.toLowerCase().includes(q) ||
                s.committee.toLowerCase().includes(q) ||
                s.id.toLowerCase().includes(q) ||
                (s.description && s.description.toLowerCase().includes(q))
            );
        }
        
        if (filter === 'lustrum') {
            result = result.filter(s => s.lustrum);
        } else if (filter === 'regular') {
            result = result.filter(s => !s.lustrum);
        }
        
        return result;
    }, [stickers, search, filter]);

    const handleConfirm = () => {
        if (!selectedId) return;
        const sticker = stickers.find(s => s.id === selectedId);
        
        setConfirmed(true);
        setTimeout(() => setConfirmed(false), 1500);
        
        // Dispatch custom event for parent integration if needed
        window.dispatchEvent(new CustomEvent('sticker-selected', { detail: sticker }));
        console.log('Sticker confirmed:', sticker);
    };

    const selectedSticker = stickers.find(s => s.id === selectedId);

    return (
        <div className="selector-container">
            <div className="selector-header">
                <div className="selector-icon">🏷️</div>
                <div>
                    <div className="selector-title">Committee Sticker Selector</div>
                    <div className="selector-subtitle">Choose the sticker that matches your committee</div>
                </div>
            </div>

            <div className="selector-toolbar">
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search stickers…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button 
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button 
                    className={`filter-btn ${filter === 'regular' ? 'active' : ''}`}
                    onClick={() => setFilter('regular')}
                >
                    Regular
                </button>
                <button 
                    className={`filter-btn ${filter === 'lustrum' ? 'active' : ''}`}
                    onClick={() => setFilter('lustrum')}
                >
                    Lustrum
                </button>
            </div>

            <div className="sticker-grid">
                {filteredStickers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <div className="empty-state-text">No stickers match your search</div>
                    </div>
                ) : (
                    filteredStickers.map(s => (
                        <div 
                            key={s.id}
                            className={`sticker-card ${s.id === selectedId ? 'selected' : ''}`}
                            onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
                        >
                            <span className="sticker-emoji">{s.emoji}</span>
                            <div className="sticker-name">{s.name}</div>
                            <div className="sticker-committee">{s.committee}</div>
                            <div className="sticker-desc">{s.description}</div>
                            <div className="sticker-meta">
                                <span className="sticker-tag">{s.id}</span>
                                {s.lustrum && <span className="sticker-tag lustrum">✨ Lustrum</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="selector-footer">
                <div className="selection-info">
                    {selectedSticker ? (
                        <>Selected: <strong>{selectedSticker.name}</strong> ({selectedSticker.committee})</>
                    ) : (
                        'No sticker selected'
                    )}
                </div>
                <button 
                    className="confirm-btn"
                    disabled={!selectedId}
                    onClick={handleConfirm}
                >
                    {confirmed ? '✅ Confirmed!' : 'Confirm Selection'}
                </button>
            </div>
        </div>
    );
}
