import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

const Home = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const isLoggedIn = !!localStorage.getItem("token");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !username) return;
    setLoading(true);
    api
      .get(`/api/jobs/${encodeURIComponent(username)}`)
      .then((res) => setJobs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn, username]);

  const handleGetStarted = () => {
    if (username) navigate(`/${username}/jobs`);
    else navigate("/login");
  };

  // Compute stats
  const total = jobs.length;
  const applied = jobs.filter((j) => j.status === "Applied").length;
  const interviewing = jobs.filter((j) => j.status === "Interviewing").length;
  const offers = jobs.filter((j) => j.status === "Offer").length;
  const rejected = jobs.filter((j) => j.status === "Rejected").length;

  // Monthly data for bar chart (last 6 months)
  const getMonthlyData = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short" });
      const count = jobs.filter((j) => {
        if (!j.appliedOn) return false;
        const jd = new Date(j.appliedOn);
        return jd.getMonth() === d.getMonth() && jd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ label, count });
    }
    return months;
  };
  const monthlyData = getMonthlyData();
  const maxMonthly = Math.max(...monthlyData.map((m) => m.count), 1);

  // Donut chart percentages
  const donutData = [
    { label: "Applied", count: applied, color: "#3b82f6" },
    { label: "Interviewing", count: interviewing, color: "#f59e0b" },
    { label: "Offer", count: offers, color: "#10b981" },
    { label: "Rejected", count: rejected, color: "#ef4444" },
  ];

  const buildConicGradient = () => {
    if (total === 0) return "conic-gradient(#374151 0% 100%)";
    let segments = [];
    let cumulative = 0;
    donutData.forEach(({ count, color }) => {
      const pct = (count / total) * 100;
      segments.push(`${color} ${cumulative}% ${cumulative + pct}%`);
      cumulative += pct;
    });
    return `conic-gradient(${segments.join(", ")})`;
  };

  // Recent jobs (last 5)
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.appliedOn || 0) - new Date(a.appliedOn || 0))
    .slice(0, 5);

  // Not logged in - show hero
  if (!isLoggedIn) {
    return (
      <main className="dashboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Take Control of Your Job Search <span className="hero-emoji">💼</span>
          </h1>
          <p className="hero-subtitle">
            Job Tracker is your personal career command center. Keep every application,
            interview, and offer organized in one place.
          </p>
          <button onClick={handleGetStarted} className="hero-cta">
            Get Started Now 🚀
          </button>
        </div>

        <div className="hero-features">
          <div className="feature-card">
            <span className="feature-icon">📌</span>
            <h3>Smart Tracking</h3>
            <p>Organize jobs, contacts, and timelines effortlessly</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Visual Dashboard</h3>
            <p>See your progress with charts and statistics</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔐</span>
            <h3>Secure & Private</h3>
            <p>JWT authentication keeps your data safe</p>
          </div>
        </div>
      </main>
    );
  }

  // Logged in - show dashboard
  return (
    <main className="dashboard">
      <h1 className="dashboard-title">
        Welcome back, <span className="dashboard-username">{username}</span> 👋
      </h1>

      {loading ? (
        <div className="dashboard-loading">Loading your dashboard...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="stat-cards">
            <div className="stat-card stat-total">
              <div className="stat-number">{total}</div>
              <div className="stat-label">Total Applications</div>
            </div>
            <div className="stat-card stat-interview">
              <div className="stat-number">{interviewing}</div>
              <div className="stat-label">Interviewing</div>
            </div>
            <div className="stat-card stat-offer">
              <div className="stat-number">{offers}</div>
              <div className="stat-label">Offers</div>
            </div>
            <div className="stat-card stat-rejected">
              <div className="stat-number">{rejected}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            {/* Donut Chart */}
            <div className="chart-container">
              <h3 className="chart-title">Application Status</h3>
              <div className="donut-wrapper">
                <div
                  className="donut-chart"
                  style={{ background: buildConicGradient() }}
                >
                  <div className="donut-hole">
                    <span className="donut-total">{total}</span>
                    <span className="donut-text">Total</span>
                  </div>
                </div>
                <div className="donut-legend">
                  {donutData.map((d) => (
                    <div key={d.label} className="legend-item">
                      <span className="legend-dot" style={{ backgroundColor: d.color }}></span>
                      <span className="legend-label">{d.label}</span>
                      <span className="legend-count">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="chart-container">
              <h3 className="chart-title">Monthly Applications</h3>
              <div className="bar-chart">
                {monthlyData.map((m, i) => (
                  <div key={i} className="bar-group">
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ height: `${(m.count / maxMonthly) * 100}%` }}
                      >
                        {m.count > 0 && <span className="bar-value">{m.count}</span>}
                      </div>
                    </div>
                    <span className="bar-label">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="chart-container recent-activity">
            <h3 className="chart-title">Recent Applications</h3>
            {recentJobs.length === 0 ? (
              <p className="no-activity">No applications yet. Start tracking your jobs!</p>
            ) : (
              <div className="activity-list">
                {recentJobs.map((job, i) => (
                  <div key={job.id || i} className="activity-item">
                    <div className="activity-dot-wrapper">
                      <div className={`activity-dot status-dot-${(job.status || "Applied").toLowerCase()}`}></div>
                      {i < recentJobs.length - 1 && <div className="activity-line"></div>}
                    </div>
                    <div className="activity-info">
                      <div className="activity-company">{job.company || "Untitled"}</div>
                      <div className="activity-role">{job.role || "No role specified"}</div>
                      <div className="activity-meta">
                        <span className={`status-pill pill-${(job.status || "Applied").toLowerCase()}`}>
                          {job.status || "Applied"}
                        </span>
                        {job.appliedOn && (
                          <span className="activity-date">
                            {new Date(job.appliedOn).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action */}
          <div className="dashboard-cta">
            <button onClick={handleGetStarted} className="hero-cta">
              Go to Jobs Board →
            </button>
          </div>
        </>
      )}
    </main>
  );
};

export default Home;
