import { useState, useEffect, useRef, useMemo } from 'react';
import { Pie, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { RefreshCcw, TrendingUp, ShieldAlert, Percent, Euro, Bell, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import ClaimInvestigation from './ClaimInvestigation';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CountUp = ({ end, duration = 1000, prefix = '', suffix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentCount = Math.floor(progress * end);
            setCount(currentCount);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setCount(end);
            }
        };
        window.requestAnimationFrame(step);
    }, [end, duration]);

    return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const Typewriter = ({ text, delay = 50 }) => {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, delay);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, delay, text]);

    return (
        <span style={{ position: 'relative' }}>
            {currentText}
            {currentIndex < text.length && <span className="cursor"></span>}
        </span>
    );
};

function Dashboard({ data, onReset, isDarkMode }) {
    const { summary, results } = data;
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [chartView, setChartView] = useState('count'); // 'count' or 'amount'
    const [filter, setFilter] = useState('all'); // 'all', 'high', 'medium'
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    // Calculate additional KPI metrics
    const fraudRate = summary.total_claims > 0
        ? ((summary.fraud_cases / summary.total_claims) * 100).toFixed(1)
        : 0;

    // Estimate prevented fraud (assuming average claim amount or using actual data)
    const estimatedPrevented = results
        .filter(r => r.is_fraud && r.claim_amount)
        .reduce((sum, r) => sum + r.claim_amount, 0);

    // Calculate total amounts for chart
    const legitimateAmount = results
        .filter(r => !r.is_fraud && r.claim_amount)
        .reduce((sum, r) => sum + r.claim_amount, 0);

    const fraudAmount = results
        .filter(r => r.is_fraud && r.claim_amount)
        .reduce((sum, r) => sum + r.claim_amount, 0);

    // Age Distribution Data
    const ageGroups = {
        'Under 30': results.filter(r => r.patient_age < 30).length,
        '30-45': results.filter(r => r.patient_age >= 30 && r.patient_age < 45).length,
        '45-60': results.filter(r => r.patient_age >= 45 && r.patient_age < 60).length,
        '60+': results.filter(r => r.patient_age >= 60).length
    };

    const ageData = {
        labels: Object.keys(ageGroups),
        datasets: [
            {
                data: Object.values(ageGroups),
                backgroundColor: [
                    'rgba(96, 165, 250, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(244, 114, 182, 0.7)',
                    'rgba(251, 146, 60, 0.7)',
                ],
                borderColor: ['#60a5fa', '#8b5cf6', '#f472b6', '#fb923c'],
                borderWidth: 2,
                cutout: '65%'
            },
        ],
    };

    // Provider Type Analysis
    const providerFraud = results.reduce((acc, curr) => {
        if (curr.is_fraud) {
            acc[curr.provider_type] = (acc[curr.provider_type] || 0) + 1;
        }
        return acc;
    }, {});

    const providerData = {
        labels: Object.keys(providerFraud),
        datasets: [
            {
                label: 'Fraud Cases',
                data: Object.values(providerFraud),
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderColor: '#8b5cf6',
                borderWidth: 1,
                borderRadius: 4
            },
        ],
    };

    // Pie chart items
    const pieData = {
        labels: ['Legitimate', 'Fraudulent'],
        datasets: [
            {
                data: chartView === 'count'
                    ? [summary.legitimate_cases, summary.fraud_cases]
                    : [legitimateAmount, fraudAmount],
                backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)'],
                borderColor: ['#10b981', '#ef4444'],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    padding: 15,
                    font: {
                        size: 12,
                        family: 'Inter, sans-serif'
                    }
                }
            },
            tooltip: {
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.9)',
                padding: 12,
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        if (chartView === 'amount') {
                            return `${label}: €${value.toLocaleString()}`;
                        }
                        return `${label}: ${value}`;
                    }
                }
            }
        }
    };

    // Filter high risk claims
    let highRiskClaims = results
        .filter(r => r.is_fraud)
        .sort((a, b) => b.fraud_probability - a.fraud_probability);

    // Apply filter
    if (filter === 'high') {
        highRiskClaims = highRiskClaims.filter(c => c.fraud_probability >= 0.8);
    } else if (filter === 'medium') {
        highRiskClaims = highRiskClaims.filter(c => c.fraud_probability >= 0.6 && c.fraud_probability < 0.8);
    }

    // Pagination logic
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const paginatedClaims = highRiskClaims.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(highRiskClaims.length / recordsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber !== '...') {
            setCurrentPage(pageNumber);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                end = 4;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            if (start > 2) pages.push('...');

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) pages.push('...');

            pages.push(totalPages);
        }
        return pages;
    };

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

    const getProgressBarClass = (probability) => {
        if (probability >= 0.8) return 'progress-fill-high';
        if (probability >= 0.6) return 'progress-fill-medium';
        return 'progress-fill-low';
    };

    const handleRowClick = (claim) => {
        setSelectedClaim(claim);
    };

    const handleAction = (action, claim) => {
        console.log(`${action} action for claim #${claim.row_id + 1}`);
        setSelectedClaim(null);
        // Here you could add actual API calls or state management
    };

    return (
        <div className="animate-fade-in" style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', color: 'var(--text-dark)' }}>HealthRisk AI Dashboard</h2>
                    <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                        AI-powered healthcare fraud detection
                    </p>
                </div>
                <button className="btn btn-primary" onClick={onReset}>
                    <RefreshCcw size={18} /> Upload New Batch
                </button>
            </div>

            {/* AI Insights Bar */}
            <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary)', background: 'rgba(139, 92, 246, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.4rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                        <ShieldAlert size={18} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>AI ANALYST:</span>{' '}
                        <Typewriter text={`Analysis complete for ${summary.total_claims} claims. Detected ${summary.fraud_cases} high-risk anomalies requiring immediate attention. Total potential savings: €${Math.round(estimatedPrevented).toLocaleString()}.`} />
                    </p>
                </div>
            </div>

            {/* KPI Cards - 4 across */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <KPICard
                    title="Total Claims"
                    value={<CountUp end={summary.total_claims} />}
                    subtitle="Uploaded batch total"
                    icon={<TrendingUp size={24} />}
                    iconColor="#60a5fa"
                    iconBg="rgba(96, 165, 250, 0.15)"
                />
                <KPICard
                    title="Fraud Detected"
                    value={<CountUp end={summary.fraud_cases} />}
                    subtitle="High risk flagged cases"
                    icon={<ShieldAlert size={24} />}
                    iconColor="#ef4444"
                    iconBg="rgba(239, 68, 68, 0.15)"
                />
                <KPICard
                    title="Fraud Rate"
                    value={<CountUp end={parseFloat(fraudRate)} suffix="%" />}
                    subtitle="Fraud ratio"
                    icon={<Percent size={24} />}
                    iconColor="#facc15"
                    iconBg="rgba(250, 204, 21, 0.15)"
                />
                <KPICard
                    title="Estimated Fraud Prevented"
                    value={<CountUp end={Math.round(estimatedPrevented)} prefix="€" />}
                    subtitle="Potential financial loss avoided"
                    icon={<Euro size={24} />}
                    iconColor="#22c55e"
                    iconBg="rgba(34, 197, 94, 0.15)"
                />
            </div>

            {/* Main Content - Split Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Fraud Distribution Chart */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Fraud Distribution</h3>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                        <button
                            className={`btn-toggle ${chartView === 'count' ? 'active' : ''}`}
                            onClick={() => setChartView('count')}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                            Count
                        </button>
                        <button
                            className={`btn-toggle ${chartView === 'amount' ? 'active' : ''}`}
                            onClick={() => setChartView('amount')}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                            Amount
                        </button>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
                        <div style={{ width: '100%', maxWidth: '200px' }}>
                            <Pie data={pieData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Age Distribution Donut Chart */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Age Comparison</h3>
                    <div style={{ marginBottom: '1rem', height: '26px' }}></div> {/* Spacer to align with toggle */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
                        <div style={{ width: '100%', maxWidth: '200px' }}>
                            <Doughnut data={ageData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Provider Analysis Bar Chart */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Provider Risk Analysis</h3>
                    <div style={{ marginBottom: '1rem', height: '26px' }}></div> {/* Spacer */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
                        <Bar
                            data={providerData}
                            options={{
                                ...chartOptions,
                                indexAxis: 'y',
                                plugins: {
                                    ...chartOptions.plugins,
                                    legend: { display: false }
                                },
                                scales: {
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: isDarkMode ? '#94a3b8' : '#64748b' }
                                    },
                                    y: {
                                        grid: { display: false },
                                        ticks: { color: isDarkMode ? '#94a3b8' : '#64748b' }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* High Risk Alerts Table */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>High Risk Claims Queue</h3>
                        {highRiskClaims.length > 0 && (
                            <span className="badge badge-alert" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Bell size={12} /> {highRiskClaims.length} New
                            </span>
                        )}
                    </div>

                    {/* Filter Dropdown */}
                    <div className="filter-dropdown" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={16} color="var(--text-dim)" />
                        <select
                            className="filter-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Risks</option>
                            <option value="high">High Risk Only</option>
                            <option value="medium">Medium Risk Only</option>
                        </select>
                    </div>
                </div>

                {highRiskClaims.length > 0 ? (
                    <>
                        <div className="table-wrapper" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>Claim ID</th>
                                        <th style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>Fraud Probability</th>
                                        <th style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>Risk Reason</th>
                                        <th style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>Risk Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedClaims.map((claim) => (
                                        <tr
                                            key={claim.row_id}
                                            onClick={() => handleRowClick(claim)}
                                            className={claim.fraud_probability >= 0.85 ? 'row-critical' : ''}
                                            style={{
                                                background: selectedClaim?.row_id === claim.row_id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <td style={{ fontWeight: 600 }}>#{claim.row_id + 1}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div className="progress-bar" style={{ flex: 1, maxWidth: '120px' }}>
                                                        <div
                                                            className={`progress-fill ${getProgressBarClass(claim.fraud_probability)}`}
                                                            style={{ width: `${claim.fraud_probability * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: '45px' }}>
                                                        {(claim.fraud_probability * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                                {claim.risk_reasons && claim.risk_reasons.length > 0
                                                    ? claim.risk_reasons[0]
                                                    : 'Anomalous pattern detected'}
                                            </td>
                                            <td>
                                                <span className={`badge ${getRiskBadgeClass(claim.fraud_probability)}`}>
                                                    {getRiskLevel(claim.fraud_probability)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    className="btn-pagination"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: currentPage === 1 ? 0.5 : 1 }}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>

                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                    {getPageNumbers().map((page, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(page)}
                                            disabled={page === '...'}
                                            style={{
                                                minWidth: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--card-border)',
                                                background: currentPage === page ? 'var(--primary)' : 'transparent',
                                                color: currentPage === page ? '#fff' : (page === '...' ? 'var(--text-dim)' : 'var(--text-primary)'),
                                                fontWeight: 600,
                                                cursor: page === '...' ? 'default' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s',
                                                fontSize: '0.9rem',
                                                boxShadow: currentPage === page ? '0 4px 12px rgba(139, 92, 246, 0.25)' : 'none'
                                            }}
                                            className={currentPage === page ? 'active' : ''}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className="btn-pagination"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                        <ShieldAlert size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p style={{ margin: 0 }}>No claims match the selected filter criteria.</p>
                    </div>
                )}
                {/* Investigation Panel */}
                {selectedClaim && (
                    <ClaimInvestigation
                        claim={selectedClaim}
                        onClose={() => setSelectedClaim(null)}
                        onApprove={(claim) => handleAction('Approve', claim)}
                        onHold={(claim) => handleAction('Hold', claim)}
                        onEscalate={(claim) => handleAction('Escalate', claim)}
                    />
                )}
            </div>
        </div>
    );
}

function KPICard({ title, value, subtitle, icon, iconColor, iconBg, highlight, badge }) {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    };

    return (
        <div
            ref={cardRef}
            className="glass-card tilt-card"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: highlight ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-card)',
                border: highlight ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--card-border)',
                position: 'relative'
            }}
        >
            {badge && (
                <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '12px',
                    width: '12px',
                    height: '12px',
                    background: 'linear-gradient(135deg, #ef4444, #f87171)',
                    borderRadius: '50%',
                    boxShadow: '0 0 0 3px var(--bg-dark)',
                    animation: 'pulse 2s infinite'
                }}></div>
            )}
            <div style={{
                padding: '0.75rem',
                borderRadius: '12px',
                background: iconBg,
                color: iconColor,
                display: 'inline-flex',
                alignSelf: 'flex-start'
            }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    {title}
                </p>
                <p className="kpi-value" style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
                    {value}
                </p>
                <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    {subtitle}
                </p>
            </div>
        </div>
    );
}

export default Dashboard;
