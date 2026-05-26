import React, { useState, useRef } from 'react';
import './LocationExtractor.css';
import EXIF from 'exif-js';

export default function LocationExtractor() {
    const [dragOver, setDragOver] = useState(false);
    const [previewSrc, setPreviewSrc] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewSrc(e.target.result);
            setAnalyzing(true);
            setResult(null);
            setCopied(false);
            extractEXIF(file);
        };
        reader.readAsDataURL(file);
    };

    const dmsToDecimal = (dms, ref) => {
        if (!dms || dms.length < 3) return null;
        let dd = dms[0] + dms[1] / 60 + dms[2] / 3600;
        if (ref === 'S' || ref === 'W') dd *= -1;
        return dd;
    };

    const extractEXIF = (file) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;

        img.onload = function() {
            EXIF.getData(img, function() {
                const latDMS  = EXIF.getTag(this, 'GPSLatitude');
                const latRef  = EXIF.getTag(this, 'GPSLatitudeRef');
                const lngDMS  = EXIF.getTag(this, 'GPSLongitude');
                const lngRef  = EXIF.getTag(this, 'GPSLongitudeRef');
                const dateTaken = EXIF.getTag(this, 'DateTimeOriginal') || EXIF.getTag(this, 'DateTime');
                const make    = EXIF.getTag(this, 'Make') || '';
                const model   = EXIF.getTag(this, 'Model') || '';

                const lat = dmsToDecimal(latDMS, latRef);
                const lng = dmsToDecimal(lngDMS, lngRef);
                
                const cam = [make, model].filter(Boolean).join(' ').trim();

                const newResult = {
                    date: dateTaken || 'None',
                    camera: cam || 'None',
                    lat: lat !== null ? lat.toFixed(6) : 'None',
                    lng: lng !== null ? lng.toFixed(6) : 'None',
                    found: lat !== null && lng !== null,
                    coords: lat !== null && lng !== null ? { lat, lng } : null
                };

                setResult(newResult);
                setAnalyzing(false);
                URL.revokeObjectURL(url);
            });
        };
    };

    const handleCopy = () => {
        if (!result || !result.coords) return;
        const text = `${result.coords.lat.toFixed(6)}, ${result.coords.lng.toFixed(6)}`;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className="extractor-container">
            <div className="extractor-header">
                <div className="extractor-icon">📷</div>
                <div>
                    <div className="extractor-title">Image Location Extractor</div>
                    <div className="extractor-subtitle">Upload a photo to extract GPS coordinates from EXIF data</div>
                </div>
            </div>
            
            <div className="extractor-body">
                <div 
                    className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input 
                        type="file" 
                        accept="image/jpeg,image/tiff,image/png,image/heic"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                    />
                    <div className="drop-zone-icon">🖼️</div>
                    <div className="drop-zone-text">Drop an image here or click to browse</div>
                    <div className="drop-zone-hint">Supports JPEG, TIFF, PNG — GPS data is usually in JPEG photos</div>
                </div>

                {previewSrc && (
                    <div className="preview-section visible">
                        <img className="preview-image" src={previewSrc} alt="Preview" />
                        
                        <div className="result-card">
                            <div className="result-header">
                                <span className={`result-badge ${analyzing ? '' : (result?.found ? 'found' : 'not-found')}`}>
                                    {analyzing ? '…' : (result?.found ? 'FOUND' : 'NOT FOUND')}
                                </span>
                                <span className="result-label">
                                    {analyzing ? 'Analyzing EXIF data…' : (result?.found ? 'GPS coordinates extracted from EXIF' : 'No GPS data in this image')}
                                </span>
                            </div>
                            <div className="result-body">
                                <div className="result-row">
                                    <span className="result-key">Latitude</span>
                                    <span className={`result-value ${result?.lat !== 'None' ? 'coords' : 'none'}`}>
                                        {result?.lat || '—'}
                                    </span>
                                </div>
                                <div className="result-row">
                                    <span className="result-key">Longitude</span>
                                    <span className={`result-value ${result?.lng !== 'None' ? 'coords' : 'none'}`}>
                                        {result?.lng || '—'}
                                    </span>
                                </div>
                                <div className="result-row">
                                    <span className="result-key">Date Taken</span>
                                    <span className="result-value">{result?.date || '—'}</span>
                                </div>
                                <div className="result-row">
                                    <span className="result-key">Camera</span>
                                    <span className="result-value">{result?.camera || '—'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            className="copy-btn" 
                            disabled={!result?.found}
                            onClick={handleCopy}
                        >
                            {copied ? '✅ Copied!' : '📋 Copy Coordinates'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
