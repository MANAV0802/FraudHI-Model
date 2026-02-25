import { X } from 'lucide-react';

function ClaimInvestigation({ claim, onClose, onApprove, onHold, onEscalate }) {
    if (!claim) return null;

    const getRiskLevel = (probability) => {
        if (probability >= 0.8) return 'HIGH';
        if (probability >= 0.6) return 'MEDIUM';
        return 'LOW';
    };

    const getRiskBadgeClass = (probability) => {
        if (probability >= 0.8) return 'badge-high';
        if (probability >= 0.6) return 'badge-medium';
        return 'badge-low';
    };

    return (
        <div className="glass-card-no-hover animate-slide-down" style={{
            marginTop: '1.5rem',
            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.15), 0 5px 10px -5px rgba(0, 0, 0, 0.1)',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: 'var(--text-dark)' }}>Claim Investigation Panel</h3>
                    <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>Review claim details and take action</p>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(148, 163, 184, 0.1)',
                        color: 'var(--text-dim)',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'}
                >
                    <X size={20} />
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.5rem'
            }}>
                <InfoCard label="Claim ID" value={`#${claim.row_id + 1}`} />
                <InfoCard label="Claim Amount" value={claim.claim_amount ? `€${claim.claim_amount.toLocaleString()}` : 'N/A'} />
                <InfoCard label="Provider Type" value={claim.provider_type || 'Unknown'} />
                <InfoCard label="Fraud Probability" value={`${(claim.fraud_probability * 100).toFixed(1)}%`} highlight />
            </div>

            <div style={{
                background: 'rgba(148, 163, 184, 0.08)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-dark)' }}>Risk Assessment</h4>
                    <span className={`badge ${getRiskBadgeClass(claim.fraud_probability)}`}>
                        {getRiskLevel(claim.fraud_probability)}
                    </span>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600 }}>
                        Risk Factors Detected:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
                        {claim.risk_reasons && claim.risk_reasons.length > 0 ? (
                            claim.risk_reasons.map((reason, idx) => (
                                <li key={idx} style={{ fontSize: '0.9rem' }}>{reason}</li>
                            ))
                        ) : (
                            <li style={{ fontSize: '0.9rem' }}>High fraud probability score</li>
                        )}
                    </ul>
                </div>
            </div>

        </div>
    );
}

function InfoCard({ label, value, highlight }) {
    return (
        <div style={{
            background: highlight ? 'var(--danger-bg)' : 'rgba(148, 163, 184, 0.08)',
            borderRadius: '10px',
            padding: '1rem',
            border: highlight ? '1px solid var(--danger)' : '1px solid var(--card-border)'
        }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                {label}
            </p>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: highlight ? 'var(--danger-text)' : 'var(--text-dark)' }}>
                {value}
            </p>
        </div>
    );
}

export default ClaimInvestigation;
