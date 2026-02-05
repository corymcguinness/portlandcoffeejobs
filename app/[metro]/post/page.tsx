"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const METROS: Record<string, { city: string; state: string; title: string }> = {
  "portland-or": { city: "Portland", state: "OR", title: "Post a Portland Coffee Job" }
};

export default function PostJob({ params }: { params: { metro: string } }) {
  const metro = params.metro;

  const metroInfo = METROS[metro];

  const [form, setForm] = useState({
    cafe_name: "",
    role: "Barista",
    pay: "",
    hours: "",
    neighborhood: "",
    apply_url: "",
    apply_email: "",
    description: "",
    contact_email: "",
    requested_pinned: false
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const canSubmit = useMemo(() => {
    if (!metroInfo) return false;
    if (!form.cafe_name.trim()) return false;
    if (!form.role.trim()) return false;
    if (!form.pay.trim()) return false; // pay required
    if (!form.apply_url.trim() && !form.apply_email.trim()) return false;
    return true;
  }, [form, metroInfo]);

  if (!metroInfo) {
    return (
      <main>
        <h1>Not found</h1>
        <p>This metro isn’t live yet.</p>
      </main>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");
    setMsg("");

    const payload = {
      metro_slug: metro,
      city: metroInfo.city,
      state: metroInfo.state,

      cafe_name: form.cafe_name.trim(),
      role: form.role.trim(),
      pay: form.pay.trim(),
      hours: form.hours.trim() || null,
      neighborhood: form.neighborhood.trim() || null,

      apply_url: form.apply_url.trim() || null,
      apply_email: form.apply_email.trim() || null,
      description: form.description.trim() || null,

      contact_email: form.contact_email.trim() || null,
      requested_pinned: form.requested_pinned
    };

    const { error } = await supabase.from("job_submissions").insert(payload);

    if (error) {
      setStatus("error");
      setMsg(error.message);
      return;
    }

    setStatus("success");
    setMsg("Submitted! We’ll review it shortly and post it if it fits (Portland coffee jobs only, pay required).");
    setForm({
      cafe_name: "",
      role: "Barista",
      pay: "",
      hours: "",
      neighborhood: "",
      apply_url: "",
      apply_email: "",
      description: "",
      contact_email: "",
      requested_pinned: false
    });
  }

  return (
    <main>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
        <div>
          <h1 style={{ margin: 0 }}>{metroInfo.title}</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>
            Standard $5–10 · Pinned request $20. We’ll reply with payment instructions after review.
          </p>
        </div>
        <a href={`/${metro}`} style={{ fontWeight: 600 }}>← Back</a>
      </header>

      <form onSubmit={onSubmit} style={{ marginTop: 20, display: "grid", gap: 12 }}>
        <Field label="Café name *">
          <input value={form.cafe_name} onChange={(e) => setForm({ ...form, cafe_name: e.target.value })} />
        </Field>

        <Field label="Role *">
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option>Barista</option>
            <option>Lead Barista</option>
            <option>Shift Lead</option>
            <option>Café Manager</option>
            <option>Roaster</option>
            <option>Other</option>
          </select>
        </Field>

        <Field label="Pay * (required)">
          <input placeholder="$18/hr + tips" value={form.pay} onChange={(e) => setForm({ ...form, pay: e.target.value })} />
        </Field>

        <Field label="Hours (optional)">
          <input placeholder="PT / FT / 20–30 hrs/wk" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
        </Field>

        <Field label="Neighborhood (optional)">
          <input placeholder="SE / Alberta / St. Johns…" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
        </Field>

        <Field label="Apply URL (either URL or email required) *">
          <input placeholder="https://…" value={form.apply_url} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} />
        </Field>

        <Field label="Apply email (either URL or email required) *">
          <input placeholder="hiring@cafe.com" value={form.apply_email} onChange={(e) => setForm({ ...form, apply_email: e.target.value })} />
        </Field>

        <Field label="Short description (optional)">
          <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>

        <Field label="Your email (optional, for questions)">
          <input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
        </Field>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={form.requested_pinned}
            onChange={(e) => setForm({ ...form, requested_pinned: e.target.checked })}
          />
          Request pinned placement ($20) — subject to approval (limited slots)
        </label>

        <button
          type="submit"
          disabled={!canSubmit || status === "submitting"}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #111",
            background: status === "submitting" ? "#eee" : "#111",
            color: status === "submitting" ? "#111" : "#fff",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {status === "submitting" ? "Submitting…" : "Submit for approval"}
        </button>

        {msg && (
          <p style={{ marginTop: 6, color: status === "error" ? "crimson" : "inherit" }}>{msg}</p>
        )}

        <p style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
          Rules: Portland coffee/café jobs only. Pay required. No recruiters. We may decline anything that doesn’t fit.
        </p>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "grid" }}>{children}</div>
      <style jsx>{`
        input, select, textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 12px;
          font-size: 14px;
        }
      `}</style>
    </label>
  );
}
