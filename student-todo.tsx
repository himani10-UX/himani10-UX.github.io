import { useState, useEffect } from "react";

const PRIORITIES = ["High", "Medium", "Low"];
const PRIORITY_COLORS = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };
const PRIORITY_BG = { High: "#fef2f2", Medium: "#fffbeb", Low: "#f0fdf4" };

function getStatus(due) {
  if (!due) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(due); d.setHours(0,0,0,0);
  if (d < today) return "overdue";
  if (d.getTime() === today.getTime()) return "today";
  return "upcoming";
}

const STATUS_LABEL = { overdue: "⚠️ Overdue", today: "📅 Due Today", upcoming: null };
const STATUS_COLOR = { overdue: "#ef4444", today: "#f59e0b", upcoming: "#6b7280" };

const defaultTasks = [];

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("student_tasks") || "[]"); } catch { return defaultTasks; }
  });
  const [form, setForm] = useState({ title: "", subject: "", due: "", priority: "Medium" });
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try { localStorage.setItem("student_tasks", JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  const completed = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  function addTask() {
    if (!form.title.trim()) { setError("Please enter a task title."); return; }
    setTasks(prev => [...prev, { id: Date.now(), ...form, done: false }]);
    setForm({ title: "", subject: "", due: "", priority: "Medium" });
    setError("");
    setShowForm(false);
  }

  function toggle(id) { setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  function remove(id) { setTasks(prev => prev.filter(t => t.id !== id)); }

  const filtered = tasks.filter(t => {
    if (filter === "Active") return !t.done;
    if (filter === "Completed") return t.done;
    return true;
  }).sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const pd = { High: 0, Medium: 1, Low: 2 };
    return pd[a.priority] - pd[b.priority];
  });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "24px 16px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: 0 }}>📚 Student Tasks</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: "6px 0 0", fontSize: 14 }}>Stay on top of your assignments</p>
        </div>

        {/* Progress Card */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", marginBottom: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 15 }}>Overall Progress</span>
            <span style={{ fontWeight: 700, color: "#667eea", fontSize: 18 }}>{pct}%</span>
          </div>
          <div style={{ background: "#e5e7eb", borderRadius: 99, height: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #667eea, #764ba2)", borderRadius: 99, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{completed} completed</span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{total - completed} remaining</span>
          </div>
        </div>

        {/* Add Task Button */}
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={{ width: "100%", padding: "14px", background: "#fff", border: "2px dashed #a5b4fc", borderRadius: 12, color: "#667eea", fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 16, transition: "all 0.2s" }}>
            + Add New Task
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 16px", color: "#1e1b4b", fontSize: 16 }}>New Task</h3>
            {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{error}</div>}
            <input placeholder="Task title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" }} />
            <input placeholder="Subject / Course" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" }} />
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Due Date</label>
                <input type="date" value={form.due} onChange={e => setForm(f => ({ ...f, due: e.target.value }))}
                  style={{ padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  style={{ padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={addTask} style={{ flex: 1, padding: "11px", background: "linear-gradient(90deg,#667eea,#764ba2)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Add Task</button>
              <button onClick={() => { setShowForm(false); setError(""); }} style={{ flex: 1, padding: "11px", background: "#f3f4f6", border: "none", borderRadius: 8, color: "#6b7280", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["All", "Active", "Completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ flex: 1, padding: "9px", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", background: filter === f ? "#fff" : "rgba(255,255,255,0.2)", color: filter === f ? "#667eea" : "#fff", boxShadow: filter === f ? "0 2px 8px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
              {f}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 32, textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
              <div style={{ fontWeight: 600 }}>{filter === "Completed" ? "No completed tasks yet." : "No tasks here!"}</div>
            </div>
          )}
          {filtered.map(t => {
            const st = getStatus(t.due);
            return (
              <div key={t.id} style={{ background: t.done ? "#f9fafb" : "#fff", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", display: "flex", alignItems: "flex-start", gap: 12, borderLeft: `4px solid ${t.done ? "#d1d5db" : PRIORITY_COLORS[t.priority]}`, opacity: t.done ? 0.7 : 1, transition: "all 0.2s" }}>
                <button onClick={() => toggle(t.id)} style={{ marginTop: 2, width: 22, height: 22, borderRadius: "50%", border: `2px solid ${t.done ? "#22c55e" : PRIORITY_COLORS[t.priority]}`, background: t.done ? "#22c55e" : "#fff", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                  {t.done ? "✓" : ""}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: t.done ? "#9ca3af" : "#1e1b4b", textDecoration: t.done ? "line-through" : "none" }}>{t.title}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5 }}>
                    {t.subject && <span style={{ background: "#ede9fe", color: "#7c3aed", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99 }}>{t.subject}</span>}
                    <span style={{ background: PRIORITY_BG[t.priority], color: PRIORITY_COLORS[t.priority], fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99 }}>Priority: {t.priority}</span>
                    {t.due && st && STATUS_LABEL[st] && (
                      <span style={{ background: "#fff3f3", color: STATUS_COLOR[st], fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99 }}>{STATUS_LABEL[st]}</span>
                    )}
                    {t.due && st === "today" && <span style={{ background: "#fffbeb", color: "#f59e0b", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99 }}>📅 Due Today</span>}
                    {t.due && !STATUS_LABEL[st] && st === "upcoming" && <span style={{ color: "#9ca3af", fontSize: 11, padding: "2px 0" }}>📅 Due: {new Date(t.due + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                  </div>
                </div>
                <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", fontSize: 18, padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
