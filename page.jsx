"use client";
import { useState } from "react";

const SECTORS = ["Arts", "Local Government", "Healthcare", "Not-for-profit", "Higher Education", "Tourism", "Environment", "Sport & Recreation", "Architecture", "Legal"];
const REGIONS = ["Australia", "New Zealand", "United Kingdom", "United States", "Canada", "Europe"];
const TYPES = ["RFP", "Tender", "EOI", "Design Brief", "RFQ"];

const STATUS_STYLES = {
  Open:          { bg: "#e6f4ea", color: "#2d7a3a" },
  New:           { bg: "#e8f0fe", color: "#1a56a0" },
  "Closing Soon":{ bg: "#fff3e0", color: "#b45309" },
  Closed:        { bg: "#f3f4f6", color: "#6b7280" },
};

export default function Home() {
  const [sector, setSector]         = useState("");
  const [region, setRegion]         = useState("Australia");
  const [typeFilter, setTypeFilter] = useState("");
  const [email, setEmail]           = useState("");
  const [scheduleOn, setScheduleOn] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [sending, setSending]       = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [results, setResults]       = useState(null);
  const [note, setNote]             = useState("");
  const [error, setError]           = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [subStatus, setSubStatus]   = useState("");
  const [activeTab, setActiveTab]   = useState("scan");

  /* ── Scan ── */
  const handleScan = async () => {
    if (!sector.trim()) { setError("Please enter or select a sector."); return; }
    setError(""); setResults(null); setNote(""); setEmailStatus("");
    setLoading(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector, region, type: typeFilter }),
      });

      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned an unexpected response. Check your terminal for details. (Raw: ${text.slice(0, 100)})`);
      }

      if (!res.ok) throw new Error(data.error || "Scan failed");
      setResults(data.opportunities || []);
      setNote(data.note || "");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  /* ── Email results now ── */
  const handleSendEmail = async () => {
    if (!email) { setEmailStatus("error:Please enter your email address first."); return; }
    if (!results?.length) { setEmailStatus("error:Run a scan first to get results."); return; }
    setSending(true); setEmailStatus("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, opportunities: results, sector, region, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      setEmailStatus("success:Email sent! Check your inbox.");
    } catch (err) {
      setEmailStatus("error:" + err.message);
    }
    setSending(false);
  };

  /* ── Subscribe to daily digest ── */
  const handleSubscribe = async () => {
    if (!email) { setSubStatus("error:Please enter your email address."); return; }
    if (!sector.trim()) { setSubStatus("error:Please enter a sector."); return; }
    setSubscribing(true); setSubStatus("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sector, region, type: typeFilter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription failed");
      setScheduleOn(true);
      setSubStatus("success:Subscribed! You'll receive a daily digest at 8am. " + (data.instructions || ""));
    } catch (err) {
      setSubStatus("error:" + err.message);
    }
    setSubscribing(false);
  };

  const statusMsg = (str) => {
    if (!str) return null;
    const [type, ...rest] = str.split(":");
    return { type, msg: rest.join(":") };
  };

  /* ── Styles ── */
  const s = {
    wrap:        { minHeight: "100vh", background: "#0f0f0f", color: "#f0ede8", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" },
    header:      { borderBottom: "1px solid #1e1e1e", padding: "0 40px" },
    headerInner: { maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 },
    logo:        { display: "flex", alignItems: "center", gap: 10 },
    logoDot:     { width: 28, height: 28, borderRadius: "50%", background: "#c8f060", display: "flex", alignItems: "center", justifyContent: "center" },
    logoText:    { fontSize: 18, fontWeight: 600, letterSpacing: "-0.03em" },
    logoBadge:   { fontSize: 11, background: "#1a1a1a", color: "#666", padding: "2px 8px", borderRadius: 100, border: "1px solid #2a2a2a" },
    main:        { maxWidth: 1100, margin: "0 auto", padding: "40px 40px 80px" },
    card:        { background: "#161616", border: "1px solid #222", borderRadius: 16, padding: "28px 32px", marginBottom: 24 },
    label:       { fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", marginBottom: 8, display: "block" },
    bigInput:    { width: "100%", boxSizing: "border-box", fontSize: 17, padding: "12px 16px", borderRadius: 10, border: "1.5px solid #2a2a2a", background: "#111", color: "#f0ede8", outline: "none", fontFamily: "inherit" },
    input:       { width: "100%", boxSizing: "border-box", fontSize: 14, padding: "10px 14px", borderRadius: 8, border: "1px solid #2a2a2a", background: "#111", color: "#f0ede8", outline: "none", fontFamily: "inherit" },
    select:      { width: "100%", boxSizing: "border-box", fontSize: 14, padding: "10px 14px", borderRadius: 8, border: "1px solid #2a2a2a", background: "#111", color: "#f0ede8", outline: "none", fontFamily: "inherit", cursor: "pointer" },
    row:         { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 20 },
    pillRow:     { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 },
    pill:        (active) => ({ background: active ? "#c8f060" : "#1a1a1a", color: active ? "#0f0f0f" : "#888", border: "1px solid " + (active ? "#c8f060" : "#2a2a2a"), borderRadius: 100, padding: "5px 14px", fontSize: 13, cursor: "pointer", fontWeight: active ? 500 : 400 }),
    primaryBtn:  (disabled) => ({ background: disabled ? "#1a1a1a" : "#c8f060", color: disabled ? "#444" : "#0f0f0f", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }),
    secondaryBtn:(disabled) => ({ background: "transparent", color: disabled ? "#444" : "#f0ede8", border: "1px solid " + (disabled ? "#222" : "#333"), borderRadius: 10, padding: "11px 20px", fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", fontFamily: "inherit" }),
    accentBtn:   (on) => ({ background: on ? "#1a3a1a" : "transparent", color: on ? "#4ade80" : "#888", border: "1px solid " + (on ? "#2a4a2a" : "#2a2a2a"), borderRadius: 10, padding: "11px 20px", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }),
    tableWrap:   { overflowX: "auto", borderRadius: 12, border: "1px solid #222" },
    table:       { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th:          { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "#555", borderBottom: "1px solid #1e1e1e", background: "#111", whiteSpace: "nowrap" },
    td:          { padding: "11px 14px", borderBottom: "1px solid #1a1a1a", verticalAlign: "top", color: "#c8c4be" },
    link:        { color: "#c8f060", textDecoration: "none", fontSize: 12 },
    statusPill:  (st) => ({ background: STATUS_STYLES[st]?.bg || "#f3f4f6", color: STATUS_STYLES[st]?.color || "#555", padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 500, display: "inline-block" }),
    divider:     { borderTop: "1px solid #1e1e1e", margin: "24px 0" },
    sectionTitle:{ fontSize: 15, fontWeight: 500, color: "#f0ede8", marginBottom: 4 },
    sectionSub:  { fontSize: 13, color: "#555", marginBottom: 20 },
    twoCol:      { display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" },
    alert:       (type) => ({ background: type === "success" ? "#0d2a10" : "#2a0d0d", border: "1px solid " + (type === "success" ? "#1a4a1a" : "#4a1a1a"), borderRadius: 8, padding: "10px 14px", fontSize: 13, color: type === "success" ? "#4ade80" : "#f87171", marginTop: 10 }),
    scheduleBox: { background: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: 10, padding: "14px 18px", marginTop: 16, display: "flex", alignItems: "center", gap: 12 },
  };

  const emailNotice = statusMsg(emailStatus);
  const subNotice   = statusMsg(subStatus);

  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <div style={s.logoDot}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <span style={s.logoText}>OpportunityScanner</span>
            <span style={s.logoBadge}>Website projects only</span>
          </div>
          <div style={{ fontSize: 13, color: "#444" }}>Powered by Claude</div>
        </div>
      </div>

      <div style={s.main}>

        {/* Search card */}
        <div style={s.card}>
          <div style={{ marginBottom: 20 }}>
            <span style={s.label}>Sector</span>
            <input
              style={s.bigInput}
              placeholder="e.g. Arts, Healthcare, Local Government…"
              value={sector}
              onChange={e => setSector(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleScan()}
            />
            <div style={s.pillRow}>
              {SECTORS.map(sec => (
                <button key={sec} style={s.pill(sector === sec)} onClick={() => setSector(sec)}>{sec}</button>
              ))}
            </div>
          </div>

          <div style={s.row}>
            <div>
              <span style={s.label}>Region</span>
              <select style={s.select} value={region} onChange={e => setRegion(e.target.value)}>
                <option value="">Any region</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <span style={s.label}>Opportunity type</span>
              <select style={s.select} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">All types</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button style={s.primaryBtn(loading || !sector)} disabled={loading || !sector} onClick={handleScan}>
                {loading ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Scanning…</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Scan for opportunities</>
                )}
              </button>
            </div>
          </div>
          {error && <div style={s.alert("error")}>{error}</div>}
        </div>

        {/* Email + Schedule card */}
        <div style={s.card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

            {/* Send email */}
            <div>
              <div style={s.sectionTitle}>Email results</div>
              <div style={s.sectionSub}>Send the current scan results to your inbox</div>
              <div style={s.twoCol}>
                <div>
                  <span style={s.label}>Email address</span>
                  <input style={s.input} type="email" placeholder="you@studio.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <button style={s.secondaryBtn(sending || !results?.length)} disabled={sending || !results?.length} onClick={handleSendEmail}>
                  {sending ? "Sending…" : (
                    <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> Send now</>
                  )}
                </button>
              </div>
              {emailNotice && <div style={s.alert(emailNotice.type)}>{emailNotice.msg}</div>}
            </div>

            {/* Daily digest */}
            <div>
              <div style={s.sectionTitle}>Daily digest</div>
              <div style={s.sectionSub}>Receive a fresh scan every morning at 8am</div>
              <div style={s.twoCol}>
                <div>
                  <span style={s.label}>Your email</span>
                  <input style={s.input} type="email" placeholder="you@studio.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <button style={s.accentBtn(scheduleOn)} onClick={handleSubscribe} disabled={subscribing}>
                  {subscribing ? "Saving…" : scheduleOn ? (
                    <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg> Subscribed</>
                  ) : (
                    <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> Subscribe</>
                  )}
                </button>
              </div>
              {scheduleOn && (
                <div style={s.scheduleBox}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
                  <span style={{ fontSize: 13, color: "#4ade80" }}>Daily digest active · {sector}{region ? ` / ${region}` : ""} · 8am</span>
                </div>
              )}
              {subNotice && <div style={s.alert(subNotice.type)}>{subNotice.msg}</div>}
            </div>

          </div>
        </div>

        {/* Results */}
        {results && (
          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={s.sectionTitle}>{results.length} opportunities found</div>
                <div style={s.sectionSub}>{sector}{region ? ` · ${region}` : ""}{typeFilter ? ` · ${typeFilter}` : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Open","New","Closing Soon"].map(st => {
                  const count = results.filter(r => r.status === st).length;
                  if (!count) return null;
                  return <span key={st} style={{ ...s.statusPill(st), fontSize: 12, padding: "4px 12px" }}>{count} {st}</span>;
                })}
              </div>
            </div>

            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["Organisation","Location","Website","Tender","Project scope","Contact","Published","Due date","Status"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((o, i) => (
                    <tr key={i}>
                      <td style={s.td}>
                        <div style={{ fontWeight: 500, color: "#f0ede8", fontSize: 13 }}>{o.organisation}</div>
                        <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{o.type}</div>
                      </td>
                      <td style={{ ...s.td, fontSize: 12, color: "#666" }}>{o.location}</td>
                      <td style={s.td}>
                        {o.website ? <a href={o.website} target="_blank" rel="noopener" style={s.link}>Visit ↗</a> : <span style={{ color: "#333" }}>—</span>}
                      </td>
                      <td style={s.td}>
                        {o.tender_link ? <a href={o.tender_link} target="_blank" rel="noopener" style={s.link}>View brief ↗</a> : <span style={{ color: "#333" }}>—</span>}
                      </td>
                      <td style={{ ...s.td, fontSize: 12, maxWidth: 200 }}>{o.project_scope}</td>
                      <td style={s.td}>
                        <div style={{ color: "#c8c4be", fontSize: 13 }}>{o.contact_name}</div>
                        <div style={{ fontSize: 11, color: "#555" }}>{o.contact_title}</div>
                      </td>
                      <td style={{ ...s.td, fontSize: 12, color: "#555", whiteSpace: "nowrap" }}>{o.published}</td>
                      <td style={{ ...s.td, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>{o.due_date}</td>
                      <td style={s.td}><span style={s.statusPill(o.status)}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {note && (
              <div style={{ marginTop: 14, fontSize: 12, color: "#555", padding: "10px 14px", background: "#111", borderRadius: 8, border: "1px solid #1e1e1e" }}>
                ⚠ {note}
              </div>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #444; }
        input:focus, select:focus { border-color: #444 !important; }
        button:hover { opacity: 0.9; }
        a:hover { opacity: 0.8; }
        * { -webkit-font-smoothing: antialiased; }
      `}</style>
    </div>
  );
}
