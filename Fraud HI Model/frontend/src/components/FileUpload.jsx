
import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

function FileUpload({ setData, setLoading, loading }) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file) => {
        const isValid = file.type === 'text/csv' ||
            file.name.endsWith('.csv') ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls') ||
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel';

        if (!isValid) {
            setError('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls).');
            return;
        }
        setError(null);
        setFile(file);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Assuming backend is at local port 8000
            const response = await axios.post('http://127.0.0.1:8000/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setData(response.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to analyze file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '3rem 2rem', textAlign: 'center' }}>
            <div
                className={`dropzone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                    border: '2px dashed ' + (dragActive ? 'var(--primary)' : 'var(--card-border)'),
                    borderRadius: '16px',
                    padding: '2rem',
                    background: dragActive ? 'rgba(139,92,246,0.1)' : 'transparent',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                }}
                onClick={() => inputRef.current.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />

                {!file ? (
                    <>
                        <div style={{ margin: '0 auto 1rem', width: '64px', height: '64px', background: 'rgba(148, 163, 184, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UploadCloud size={32} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-dark)' }}>Drag & drop your file here</h3>
                        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>Supports CSV and Excel files (.csv, .xlsx, .xls)</p>
                    </>
                ) : (
                    <div className={loading ? "scan-container" : ""} style={{ position: 'relative' }}>
                        {loading && <div className="scan-line"></div>}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            padding: loading ? '1.5rem' : '0',
                            background: loading ? 'rgba(6, 182, 212, 0.05)' : 'transparent',
                            borderRadius: '12px'
                        }}>
                            <FileText size={32} style={{ color: 'var(--secondary)' }} />
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ margin: 0, fontWeight: 600 }}>{file.name}</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)' }}>{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            {!loading && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <AlertCircle size={18} />
                    <span style={{ fontWeight: 500 }}>{error}</span>
                </div>
            )}

            {file && (
                <button
                    className="btn btn-primary"
                    style={{ marginTop: '2rem', width: '100%', justifyContent: 'center', fontSize: '1.1rem' }}
                    onClick={handleUpload}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            Analyzing...
                        </>
                    ) : (
                        'Run Analysis'
                    )}
                </button>
            )}

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

export default FileUpload;
