"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const METROS: Record<string, { city: string; state: string; title: string }> = {
  "portland-or": { city: "Portland", state: "OR", title: "Portland Coffee Jobs" }
};

type Job = {
  id: string;
  metro_slug: string;
  cafe_name: string;
  role: string;
  pay: string;
  hours: string | null;
  neighborhood: string | null;
  pinned: boolean;
  pinned_until: string | null;
  created_at: string;
  apply_url: string | null;
  apply_email: string | null;
  description: string | null;
};

function isPinnedNow(j: Job) {
  if (!j.pinned) return false;
  if (!j.pinned_until) return true; // legacy/always pinned
  return new Date(j.pinned_until) > new Date();
}

function sortJobs(a: Job, b: Job) {
  const ap = isPinnedNow(a) ? 1 : 0;
  const bp = isPinnedNow(b) ? 1 : 0;
  if (ap !== bp) return bp - ap; // pinned first

  const at = Date.parse(a.created_at);
  const bt = Date.parse(b.created_at);
  if (Number.isFinite(at) && Number.isFinite(bt) && at !== bt) return bt - at; // newest first

  return String(b.id).localeCompare(String(a.id)); // stable-ish tie break
}

export default function MetroClient({ metro }: { metro: string }) {
  const metroInfo = METROS[metro];
  const searchParams = useSearchParams();
  const paid = searchParams.get("paid") === "1";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const title = useMemo(() => metroInfo?.title ?? "Not found", [metroInfo]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!metroInfo) return;
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("metro_slug", metro)
        .order("created_at", { ascending: false }); // we’ll do pinned logic locally

      if (cancelled) return;

      if (error) {
        setErrorMsg(error.message);
        setJobs([]);
      } else {
        const rows = ((data ?? []) as Job[]).slice().sort(sortJobs);
        setJobs(rows);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [metro, metroInfo]);

  if (!metroInfo) {
    return (
      <main>
        <h1>Not found</h1>
        <p>This metro isn’t live yet.</p>
      </main>
    );
  }

  return (
    <main>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
        <div>
          <h1 style={{ margin: 0 }}>{title}</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>Barista + café jobs. Pay required.</p>
        </div>
        <a href={`/${metro}/post`} style={{ fontWeight: 600 }}>
          Post a job
        </a>
      </header>

      {paid && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            border: "1px solid #e6e6e6",
            borderRadius: 12,
            background: "#fafafa"
          }}
        >
          <div style={{ fontWeight: 800 }}>✅ Payment received</div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Your job post is now <b>pending review</b>. If approved, we’ll publish it shortly.
          </div>
        </div>
      )}

      {errorMsg && <p style={{ marginTop: 20 }}>Error loading jobs: {errorMsg}</p>}

      <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
        {loading ? (
          <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>Loading…</div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
            No jobs posted yet. Be the first.
          </div>
        ) : (
          jobs.map((j) => {
            const pinnedNow = isPinnedNow(j);

            return (
              <article key={j.id} style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                      {j.role} — {j.cafe_name}{" "}
                      {pinnedNow && <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.8 }}>📌 Pinned</span>}
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.85 }}>
                      {j.pay}
                      {j.hours ? ` · ${j.hours}` : ""}
                      {j.neighborhood ? ` · ${j.neighborhood}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12, opacity: 0.7 }}>
                    Posted {new Date(j.created_at).toLocaleDateString("en-US")}
                  </div>
                </div>

                {(j.apply_url || j.apply_email) && (
                  <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {j.apply_url && (
                      <a href={j.apply_url} target="_blank" rel="noreferrer">
                        Apply link
                      </a>
                    )}
                    {j.apply_email && <a href={`mailto:${j.apply_email}`}>Email</a>}
                  </div>
                )}

                {j.description && (
                  <p style={{ marginTop: 10, opacity: 0.9, whiteSpace: "pre-wrap" }}>{j.description}</p>
                )}
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
