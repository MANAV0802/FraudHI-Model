
import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { ShieldCheck, Activity, Moon, Sun } from 'lucide-react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleDownloadDoc = () => {
    const readmeContent = `# HealthRisk AI - System Documentation & Implementation Guide

## 🚀 Overview
HealthRisk AI is a state-of-the-art, AI-powered platform designed for the healthcare industry to detect fraudulent insurance claims with high precision.

## 🛠 Tech Stack
- **Frontend**: React.js (Hooks, Functional Components)
- **Styling**: Vanilla CSS with modern CSS Variables and Glassmorphism
- **Charts**: Chart.js for interactive data visualization
- **Icons**: Lucide-React for high-quality UI elements
- **Backend**: FastAPI (Python), Scikit-Learn (ML Model), Pandas (Data Processing)

## ✨ Core Features
- **AI-Powered Risk Scoring**: Machine learning models analyze claims for fraud probability.
- **Dynamic Dashboard**: Interactive charts for age distribution, provider risk, and fraud trends.
- **Dual Theme Support**: Seamless switching between professional Light and Dark modes.
- **Smart Data Queue**: High-performance table with intelligent pagination and internal scrolling.

## 💎 Premium UI/UX Implementation (New)
We have implemented several state-of-the-art features to ensure a premium fintech experience:
- **Neural Scan**: Horizontal laser animation during file processing to symbolize deep AI analysis.
- **Glassmorphism Orbs**: Moving background gradients providing depth and elegance.
- **3D Parallax Cards**: Interactive KPI cards that tilt in 3D based on mouse position.
- **AI Insight Typing**: A dedicated AI analyst bar that types out real-time batch summaries.
- **Numerical Count-Up**: Smooth numerical transitions for all dashboard metrics.
- **Critical Alert Pulse**: Breathing red highlights for claims with >85% fraud probability.

## 📅 Implementation Walkthrough
1. **Brand Pivot**: Rebranded to **HealthRisk AI** with updated healthcare-focused taglines and mission.
2. **Theme Engine**: Developed a CSS-variable based engine for instant Light/Dark mode transitions.
3. **Advanced Pagination**: Implemented "Smart Pagination" with ellipses for large datasets.
4. **Interactive Dashboard**: Modularized the dashboard with specialized KPI cards and analysis charts.
5. **System Maturity**: Added deep analytics and real-time processing feedback loops.

---
© 2026 HealthRisk AI.`;

    const element = document.createElement("a");
    const file = new Blob([readmeContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "HealthRiskAI_Documentation.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen">
      <div className="orb-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <nav style={{
        padding: '1rem 2rem',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--card-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(139,92,246,0.1)', borderRadius: '12px' }}>
              <ShieldCheck size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--text-dark)' }}>
              HealthRisk<span style={{ color: 'var(--secondary)' }}> AI</span>
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              className="btn-theme-toggle"
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="btn"
              style={{ background: 'rgba(148,163,184,0.1)', color: 'var(--text-primary)' }}
              onClick={handleDownloadDoc}
            >
              Documentation
            </button>
          </div>
        </div>
      </nav>

      <main className="container animate-fade-in" style={{ padding: '3rem 2rem' }}>
        {!data ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '700px' }}>
              <h2 className="title-gradient" style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', lineHeight: 1.1 }}>
                Next-Gen Healthcare <br /> Claims Integrity
              </h2>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.5rem' }}>
                AI-powered fraud detection for smarter, safer claims.
              </p>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                Upload your claims data and get instant risk scores with predictive insights.
              </p>
            </div>

            <FileUpload setData={setData} setLoading={setLoading} loading={loading} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', width: '100%', marginTop: '2rem' }}>
              <FeatureCard icon={<Activity />} title="Real-time Analysis" desc="Instant processing of CSV claim files with < 100ms latency." />
              <FeatureCard icon={<ShieldCheck />} title="99% Accuracy" desc="Trained on millions of historical claims data points." />
              <FeatureCard icon={<Activity />} title="Interactive Reports" desc="Visualize fraud distribution and risk factors effortlessly." />
            </div>
          </div>
        ) : (
          <Dashboard data={data} onReset={() => setData(null)} isDarkMode={isDarkMode} />
        )}
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{ padding: '0.75rem', background: 'rgba(6,182,212,0.1)', borderRadius: '10px', color: '#06b6d4' }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h3>
      <p style={{ margin: 0, color: 'var(--text-dim)', lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

export default App;
