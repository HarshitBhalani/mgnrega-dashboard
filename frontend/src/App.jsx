import { useState, useEffect } from "react";
import DistrictSelector from "./components/DistrictSelector";
import SummaryCard from "./components/SummaryCard";
import YearSelector from "./components/YearSelector";
import axios from "axios";
import { strings, LANGS } from "./i18n";
import "./App.css";
import logo from "./assets/logo.png";

import {
  Building2,
  HelpCircle,
  BarChart2,
  Wallet,
  Users,
  LineChart,
  Calendar,
  Hand,
  AlertTriangle,
  RefreshCcw,
  X,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [districtId, setDistrictId] = useState("");
  const [districts, setDistricts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [finYear, setFinYear] = useState("2024-2025");
  const [lang, setLang] = useState(LANGS.hi);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateStats, setStateStats] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const t = strings[lang];

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `${API_BASE_URL}/api/districts/UTTAR%20PRADESH`,
          { timeout: 10000 }
        );

        if (res.data.success) {
          const arr = Array.isArray(res.data.data) ? res.data.data : [];

          const uniqueMap = new Map();
          arr.forEach((r) => {
            const key = `${r.district_code}-${r.fin_year}`;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, r);
            }
          });

          const uniqueData = Array.from(uniqueMap.values());
          setDistricts(uniqueData);
          fetchStateStats();
        } else {
          setError(res.data.message || "Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching districts:", err);
        setError(
          t.errorFetchingData ||
            "Unable to load data. Please check your internet connection."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, []);

  const fetchStateStats = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/stats/UTTAR%20PRADESH?fin_year=2024-2025`,
        { timeout: 8000 }
      );
      if (res.data.success) {
        setStateStats(res.data.stats);
      }
    } catch (err) {
      console.error("Error fetching state stats:", err);
    }
  };

  useEffect(() => {
    if (!districtId) {
      setSummary(null);
      return;
    }

    const exact = districts.find(
      (d) => d.district_code === districtId && d.fin_year === finYear
    );

    const fallback = districts.find((d) => d.district_code === districtId);

    setSummary(exact || fallback || null);
  }, [districtId, districts, finYear]);

  const pastData = districts.filter((d) => d.district_code === districtId);

  const handleDistrictSelect = (code) => {
    setDistrictId(code);

    if (window.innerWidth < 960) {
      setTimeout(() => {
        document.querySelector(".summary-column")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  return (
    <div className="app-root">
      {/* ---------- HEADER ---------- */}
      <header className="topbar">
        <div className="header-content">
          <div className="logo-section">
            {/* <Building2 size={32} className="text-blue-600 mr-2" /> */}
            <img src={logo} alt="Logo" width={"50px"}  height={"50px"}/>
            <div>
              <h1 className="app-title">{t.title}</h1>
              <div className="app-subtitle">{t.subtitle}</div>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="help-btn flex items-center gap-2"
              onClick={() => setShowHelp(!showHelp)}
              title={t.help}
            >
              <HelpCircle size={18} />
              {t.help}
            </button>

            <div className="lang-controls">
              <button
                className={`lang-btn ${lang === LANGS.hi ? "active" : ""}`}
                onClick={() => setLang(LANGS.hi)}
              >
                हिन्दी
              </button>
              <button
                className={`lang-btn ${lang === LANGS.en ? "active" : ""}`}
                onClick={() => setLang(LANGS.en)}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- HELP MODAL ---------- */}
      {showHelp && (
        <div className="help-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-header flex justify-between items-center">
              <h2>{t.helpTitle}</h2>
              <button className="close-btn" onClick={() => setShowHelp(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="help-content">
              <div className="help-section">
                <div className="flex items-center gap-2">
                  <BarChart2 size={18} />
                  <h3>{t.helpBudget}</h3>
                </div>
                <p>{t.helpBudgetDesc}</p>
              </div>

              <div className="help-section">
                <div className="flex items-center gap-2">
                  <Wallet size={18} />
                  <h3>{t.helpWage}</h3>
                </div>
                <p>{t.helpWageDesc}</p>
              </div>

              <div className="help-section">
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <h3>{t.helpWorkers}</h3>
                </div>
                <p>{t.helpWorkersDesc}</p>
              </div>

              <div className="help-section">
                <div className="flex items-center gap-2">
                  <LineChart size={18} />
                  <h3>{t.helpChart}</h3>
                </div>
                <p>{t.helpChartDesc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- MAIN CONTENT ---------- */}
      <main className="container">
        <section className="selector-card">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t.loading}</p>
            </div>
          ) : error ? (
            <div className="error-state text-center">
              <AlertTriangle size={24} className="text-red-500 mx-auto mb-2" />
              <p className="error-message">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="retry-btn flex items-center gap-2"
              >
                <RefreshCcw size={16} /> {t.retry}
              </button>
            </div>
          ) : (
            <>
              <div className="selector-header">
                <h3 className="selector-title">{t.selectDistrict}</h3>
                <div className="selector-subtitle">
                  {t.selectDistrictDesc}
                </div>
              </div>

              <DistrictSelector
                districts={districts}
                onSelect={handleDistrictSelect}
                lang={lang}
                placeholder={t.searchPlaceholder}
              />

              {districtId && (
                <div className="year-selector-wrapper mt-4">
                  <div className="year-selector-header flex items-center gap-2">
                    <Calendar size={18} />
                    <span className="year-label">{t.selectYear}</span>
                  </div>
                  <YearSelector value={finYear} onChange={setFinYear} lang={lang} />
                </div>
              )}

              {!districtId && (
                <div className="instruction-box text-center mt-4">
                  {/* <Hand size={20} className="mx-auto mb-2 text-blue-600" /> */}
                  <p>{t.instructionText}</p>
                </div>
              )}
            </>
          )}
        </section>

        <section className="summary-column">
          <SummaryCard
            data={summary}
            lang={lang}
            pastData={pastData}
            stateStats={stateStats}
          />
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            © {new Date().getFullYear()} {t.footerText}
          </div>
          <div className="footer-links">
            <a
              href="https://nrega.nic.in"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.officialWebsite}
            </a>
            <span className="divider">|</span>
            <a
              href="https://data.gov.in"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.dataSource}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
