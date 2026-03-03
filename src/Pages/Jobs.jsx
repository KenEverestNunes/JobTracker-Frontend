import { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import api from "../api/axiosInstance";

const ROWS_PER_PAGE = 8;

export default function Jobs() {
  const params = useParams();
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedCard, setExpandedCard] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [page, setPage] = useState(1);

  // Add Job Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({
    company: "", role: "", status: "Applied", appliedOn: "",
    location: "", platform: "", resume: "", followUp: "",
    interviewDate: "", jobLink: "", feedback: "", contacts: [],
  });
  const [addingJob, setAddingJob] = useState(false);

  // Edit modal for table row
  const [editModalIdx, setEditModalIdx] = useState(null);

  const username = useMemo(
    () => params.username || localStorage.getItem("username") || "",
    [params.username]
  );

  const sanitizeJob = (j) => ({
    id: j.id ?? null,
    company: j.company ?? "",
    role: j.role ?? "",
    status: j.status ?? "Applied",
    appliedOn: j.appliedOn ?? "",
    location: j.location ?? "",
    platform: j.platform ?? "",
    resume: j.resume ?? "",
    followUp: j.followUp ?? "",
    interviewDate: j.interviewDate ?? "",
    jobLink: j.jobLink ?? "",
    feedback: j.feedback ?? "",
    contacts: Array.isArray(j.contacts)
      ? j.contacts.map((c) => ({
        id: c.id ?? null, name: c.name ?? "", role: c.role ?? "", email: c.email ?? "",
      }))
      : [],
  });

  useEffect(() => {
    if (!username) { setLoading(false); setLoadError("No username found."); return; }
    setLoading(true); setLoadError("");
    api.get(`/api/jobs/${encodeURIComponent(username)}`)
      .then((res) => setJobs(Array.isArray(res.data) ? res.data.map(sanitizeJob) : []))
      .catch((err) => setLoadError(err?.response?.data?.error || "Failed to load jobs."))
      .finally(() => setLoading(false));
  }, [username]);

  // Reset page when search/filter changes
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const openAddModal = () => {
    setNewJob({
      company: "", role: "", status: "Applied",
      appliedOn: new Date().toISOString().split("T")[0],
      location: "", platform: "", resume: "", followUp: "",
      interviewDate: "", jobLink: "", feedback: "", contacts: [],
    });
    setShowAddModal(true);
  };

  const submitNewJob = () => {
    if (!newJob.company.trim()) { alert("Please enter a company name."); return; }
    setAddingJob(true);
    api.post(`/api/jobs/${encodeURIComponent(username)}`, newJob)
      .then((res) => { setJobs((prev) => [...prev, sanitizeJob(res.data)]); setShowAddModal(false); })
      .catch((err) => alert(err?.response?.data?.error || "Error adding job"))
      .finally(() => setAddingJob(false));
  };

  const updateJob = (index, field, value) => {
    setJobs((prev) => {
      const next = structuredClone ? structuredClone(prev) : JSON.parse(JSON.stringify(prev));
      next[index][field] = value;
      return next;
    });
    const job = { ...jobs[index], [field]: value };
    if (!job.id) return;
    api.put(`/api/jobs/${job.id}`, job).catch((err) => alert(err?.response?.data?.error || "Error updating job"));
  };

  const deleteJob = (id) => {
    if (!window.confirm("Delete this job?")) return;
    api.delete(`/api/jobs/${id}`)
      .then(() => setJobs((prev) => prev.filter((j) => j.id !== id)))
      .catch((err) => alert(err?.response?.data?.error || "Error deleting job"));
  };

  const openContacts = (jobIdx) => setShowModal(jobIdx);

  const addContact = (jobIdx) => {
    const job = jobs[jobIdx];
    if (!job?.id) { alert("Save the job first."); return; }
    setJobs((prev) => {
      const next = structuredClone ? structuredClone(prev) : JSON.parse(JSON.stringify(prev));
      next[jobIdx].contacts.push({ id: null, name: "", role: "", email: "" });
      return next;
    });
    api.post(`/api/jobs/${job.id}/contacts`, { name: "", role: "", email: "" })
      .then((res) => {
        setJobs((prev) => {
          const next = structuredClone ? structuredClone(prev) : JSON.parse(JSON.stringify(prev));
          next[jobIdx].contacts[next[jobIdx].contacts.length - 1] = {
            id: res.data.id, name: res.data.name ?? "", role: res.data.role ?? "", email: res.data.email ?? "",
          };
          return next;
        });
      })
      .catch((err) => {
        alert(err?.response?.data?.error || "Error adding contact");
        setJobs((prev) => {
          const next = structuredClone ? structuredClone(prev) : JSON.parse(JSON.stringify(prev));
          next[jobIdx].contacts.pop();
          return next;
        });
      });
  };

  const updateContact = (jobIdx, cIdx, field, value) => {
    setJobs((prev) => {
      const next = structuredClone ? structuredClone(prev) : JSON.parse(JSON.stringify(prev));
      next[jobIdx].contacts[cIdx][field] = value;
      return next;
    });
    const contact = jobs[jobIdx]?.contacts?.[cIdx];
    if (!contact?.id) return;
    api.put(`/api/jobs/contacts/${contact.id}`, { ...contact, [field]: value })
      .catch((err) => alert(err?.response?.data?.error || "Error updating contact"));
  };

  const deleteContact = (jobIdx, cId) => {
    api.delete(`/api/jobs/contacts/${cId}`)
      .then(() => {
        setJobs((prev) => {
          const next = structuredClone ? structuredClone(prev) : JSON.parse(JSON.stringify(prev));
          next[jobIdx].contacts = next[jobIdx].contacts.filter((c) => c.id !== cId);
          return next;
        });
      })
      .catch((err) => alert(err?.response?.data?.error || "Error deleting contact"));
  };

  if (!username) return <Navigate to="/login" replace />;

  // Filter
  const filteredJobs = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchesSearch = j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedJobs = filteredJobs.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const getStatusClass = (s) => {
    const map = { Applied: "jc-status-applied", Interviewing: "jc-status-interviewing", Offer: "jc-status-offer", Rejected: "jc-status-rejected" };
    return map[s] || "jc-status-applied";
  };

  return (
    <div className="jobs-page">
      {/* Header */}
      <div className="jobs-header">
        <div className="jobs-header-left">
          <h1 className="jobs-title">My Jobs</h1>
          <span className="jobs-count">{filteredJobs.length} of {jobs.length}</span>
        </div>
        <div className="jobs-header-right">
          {/* View Toggle */}
          <div className="view-toggle">
            <button
              onClick={() => setViewMode("table")}
              className={`view-toggle-btn ${viewMode === "table" ? "view-active" : ""}`}
              title="Table View"
            >☰</button>
            <button
              onClick={() => setViewMode("grid")}
              className={`view-toggle-btn ${viewMode === "grid" ? "view-active" : ""}`}
              title="Grid View"
            >▦</button>
          </div>
          <button onClick={openAddModal} className="jobs-add-btn">+ Add Job</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="jobs-toolbar">
        <div className="jobs-search-wrapper">
          <span className="jobs-search-icon">🔍</span>
          <input
            type="text" placeholder="Search by company or role..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="jobs-search"
          />
        </div>
        <div className="jobs-filter-pills">
          {["All", "Applied", "Interviewing", "Offer", "Rejected"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`jobs-filter-pill ${statusFilter === s ? "pill-active" : ""}`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="jobs-empty">Loading jobs...</div>
      ) : loadError ? (
        <div className="jobs-empty jobs-error">{loadError}</div>
      ) : filteredJobs.length === 0 ? (
        <div className="jobs-empty">
          {jobs.length === 0 ? "No jobs yet. Click '+ Add Job' to get started!" : "No jobs match your search."}
        </div>
      ) : viewMode === "table" ? (
        /* ========== TABLE VIEW ========== */
        <div className="jobs-table-wrapper">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Location</th>
                <th>Platform</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedJobs.map((job) => {
                const idx = jobs.findIndex((j) => j.id === job.id);
                return (
                  <tr key={job.id ?? `row-${idx}`} className="jobs-table-row" onClick={() => setEditModalIdx(idx)} style={{ cursor: "pointer" }}>
                    <td className="td-company">{job.company || "—"}</td>
                    <td>{job.role || "—"}</td>
                    <td>
                      <span className={`jc-status ${getStatusClass(job.status)}`}>{job.status}</span>
                    </td>
                    <td className="td-date">{job.appliedOn ? new Date(job.appliedOn).toLocaleDateString() : "—"}</td>
                    <td>{job.location || "—"}</td>
                    <td>{job.platform || "—"}</td>
                    <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setEditModalIdx(idx)} className="jc-btn jc-btn-contacts" title="Edit">✏️</button>
                      <button onClick={() => openContacts(idx)} className="jc-btn jc-btn-contacts" title="Contacts">👥</button>
                      <button onClick={() => deleteJob(job.id)} className="jc-btn jc-btn-delete" title="Delete">✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ========== GRID VIEW ========== */
        <div className="jobs-grid">
          {paginatedJobs.map((job) => {
            const idx = jobs.findIndex((j) => j.id === job.id);
            return (
              <div key={job.id ?? `card-${idx}`} className="job-card" onClick={() => setEditModalIdx(idx)} style={{ cursor: "pointer" }}>
                <div className="jc-header">
                  <div className="jc-header-info">
                    <h3 className="jc-company">{job.company || "New Application"}</h3>
                    <p className="jc-role">{job.role || "Role not set"}</p>
                  </div>
                  <span className={`jc-status ${getStatusClass(job.status)}`}>{job.status}</span>
                </div>
                <div className="jc-summary">
                  {job.location && <span className="jc-tag">📍 {job.location}</span>}
                  {job.platform && <span className="jc-tag">🌐 {job.platform}</span>}
                  {job.appliedOn && <span className="jc-tag">📅 {new Date(job.appliedOn).toLocaleDateString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filteredJobs.length > ROWS_PER_PAGE && (
        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="pagination-btn">← Prev</button>
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`pagination-page ${p === safePage ? "pagination-active" : ""}`}
              >{p}</button>
            ))}
          </div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="pagination-btn">Next →</button>
        </div>
      )}

      {/* EDIT MODAL (from table row click) */}
      {editModalIdx !== null && jobs[editModalIdx] && (
        <div className="modal-overlay" onClick={() => setEditModalIdx(null)}>
          <div className="modal-content add-job-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-modal-header">
              <h2 className="modal-title">Edit Application</h2>
              <p className="add-modal-subtitle">{jobs[editModalIdx].company || "Untitled"} — {jobs[editModalIdx].role || "No role"}</p>
            </div>
            <div className="jc-form-grid" style={{ paddingTop: 0 }}>
              {[
                ["Company", "company", "text", "e.g. Google"],
                ["Role", "role", "text", "e.g. Software Engineer"],
                ["Status", "status", "select", ""],
                ["Applied On", "appliedOn", "date", ""],
                ["Location", "location", "text", "e.g. New York"],
                ["Platform", "platform", "text", "e.g. LinkedIn"],
                ["Resume", "resume", "text", "Version used"],
                ["Follow-up", "followUp", "date", ""],
                ["Interview", "interviewDate", "date", ""],
                ["Job Link", "jobLink", "text", "https://..."],
              ].map(([label, field, type, ph]) => (
                <label key={field} className="jc-field">
                  <span className="jc-label">{label}</span>
                  {type === "select" ? (
                    <select value={jobs[editModalIdx][field]} onChange={(e) => updateJob(editModalIdx, field, e.target.value)} className="jc-input">
                      <option>Applied</option><option>Interviewing</option>
                      <option>Offer</option><option>Rejected</option>
                    </select>
                  ) : (
                    <input type={type} value={jobs[editModalIdx][field] || ""} placeholder={ph}
                      onChange={(e) => updateJob(editModalIdx, field, e.target.value)} className="jc-input" />
                  )}
                </label>
              ))}
              <label className="jc-field jc-field-full">
                <span className="jc-label">Notes</span>
                <textarea value={jobs[editModalIdx].feedback} onChange={(e) => updateJob(editModalIdx, "feedback", e.target.value)}
                  className="jc-input jc-textarea" placeholder="Any notes..." rows={3} />
              </label>
            </div>
            <div className="add-modal-actions">
              <button onClick={() => openContacts(editModalIdx)} className="jc-btn jc-btn-contacts" style={{ padding: '10px 24px' }}>
                👥 Contacts ({jobs[editModalIdx].contacts.length})
              </button>
              <button onClick={() => setEditModalIdx(null)} className="jobs-add-btn" style={{ background: '#6366f1' }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* CONTACTS MODAL */}
      {showModal !== null && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Contacts — {jobs[showModal]?.company || "Job"}</h2>
            {(jobs[showModal]?.contacts || []).length === 0 ? (
              <p className="modal-empty">No contacts yet. Add one below.</p>
            ) : (
              <div className="contacts-list">
                {(jobs[showModal]?.contacts || []).map((c, cIdx) => (
                  <div key={c.id ?? `c-${cIdx}`} className="contact-card">
                    <input value={c.name} onChange={(e) => updateContact(showModal, cIdx, "name", e.target.value)} className="jc-input" placeholder="Name" />
                    <input value={c.role} onChange={(e) => updateContact(showModal, cIdx, "role", e.target.value)} className="jc-input" placeholder="Role" />
                    <input value={c.email} onChange={(e) => updateContact(showModal, cIdx, "email", e.target.value)} className="jc-input" placeholder="Email" />
                    <button onClick={() => deleteContact(showModal, c.id)} className="jc-btn jc-btn-delete">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <button onClick={() => addContact(showModal)} className="jc-btn jc-btn-contacts">+ Add Contact</button>
              <button onClick={() => setShowModal(null)} className="jc-btn jc-btn-close">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD JOB MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content add-job-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-modal-header">
              <h2 className="modal-title">Add New Application</h2>
              <p className="add-modal-subtitle">Track a new job you're applying to</p>
            </div>
            <div className="jc-form-grid" style={{ paddingTop: 0 }}>
              {[
                ["Company *", "company", "text", "e.g. Google"],
                ["Role *", "role", "text", "e.g. Software Engineer"],
                ["Status", "status", "select", ""],
                ["Applied On", "appliedOn", "date", ""],
                ["Location", "location", "text", "e.g. New York, NY"],
                ["Platform", "platform", "text", "e.g. LinkedIn"],
              ].map(([label, field, type, ph]) => (
                <label key={field} className="jc-field">
                  <span className="jc-label">{label}</span>
                  {type === "select" ? (
                    <select value={newJob[field]} onChange={(e) => setNewJob({ ...newJob, [field]: e.target.value })} className="jc-input">
                      <option>Applied</option><option>Interviewing</option>
                      <option>Offer</option><option>Rejected</option>
                    </select>
                  ) : (
                    <input type={type} value={newJob[field] || ""} placeholder={ph}
                      onChange={(e) => setNewJob({ ...newJob, [field]: e.target.value })} className="jc-input" autoFocus={field === "company"} />
                  )}
                </label>
              ))}
              <label className="jc-field jc-field-full">
                <span className="jc-label">Job Link</span>
                <input value={newJob.jobLink} onChange={(e) => setNewJob({ ...newJob, jobLink: e.target.value })} className="jc-input" placeholder="https://..." />
              </label>
              <label className="jc-field jc-field-full">
                <span className="jc-label">Notes</span>
                <textarea value={newJob.feedback} onChange={(e) => setNewJob({ ...newJob, feedback: e.target.value })}
                  className="jc-input jc-textarea" placeholder="Any notes about this application..." rows={2} />
              </label>
            </div>
            <div className="add-modal-actions">
              <button onClick={() => setShowAddModal(false)} className="jc-btn jc-btn-close" style={{ padding: '10px 24px' }}>Cancel</button>
              <button onClick={submitNewJob} disabled={addingJob} className="jobs-add-btn"
                style={{ opacity: addingJob ? 0.6 : 1 }}
              >{addingJob ? "Saving..." : "Add Application"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
