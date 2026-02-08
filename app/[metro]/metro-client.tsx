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
  created_at: string;
  apply_url: string | null;
  apply_email: string | null;
  description: string | null;
  pinned_until?: string | null;
};

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
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setErrorMsg(error.message);
        setJobs([]);
      } else {
        setJobs((data ?? []) as Job[]);
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
      <main style={shell}>
        <div style={container}>
          <h1 style={{ margin: 0 }}>Not found</h1>
          <p style={{ marginTop: 8, opacity: 0.8 }}>This metro isn’t live yet.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={shell}>
      <div style={container}>
        <header style={headerRow}>
          <div>
            <h1 style={{ margin: 0, fontSize: 44, letterSpacing: -0.6 }}>{title}</h1>
         <p style={{ marginTop: 8, opacity: 0.8, fontSize: 16 }}>
  Barista + Coffee Industry Jobs. Curated listings only
  <InfoTooltip
    text="Charging to post keeps listings intentional, up-to-date, and spam-free. If we decline a post, we refund it."
  />
</p>
          </div>
          <a href={`/${metro}/post`} style={ctaLink}>
            Post a job →
          </a>
        </header>

        {paid && (
          <div style={notice}>
            <div style={{ fontWeight: 800 }}>✅ Payment received</div>
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              Your post is <b>pending review</b>. If approved, we’ll publish it shortly.
            </div>
          </div>
        )}

        {errorMsg && <p style={{ marginTop: 18 }}>Error loading jobs: {errorMsg}</p>}

        <section style={{ marginTop: 20 }}>
          {loading ? (
            <div style={card}>Loading…</div>
          ) : jobs.length === 0 ? (
            <div style={empty}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>No jobs posted yet.</div>
              <div style={{ marginTop: 6, opacity: 0.85 }}>
                Be the first — it takes about a minute.
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href={`/${metro}/post`} style={button}>
                  Post the first job
                </a>
                <a href={whyHref(metro)} style={secondaryLink} title="Why is posting paid?">
                  Why paid?
                </a>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {jobs.map((j) => (
                <article key={j.id} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>
                        {j.role} — {j.cafe_name}{" "}
                        {j.pinned && (
                          <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.75 }}>
                            📌 Pinned
                            {j.pinned_until ? ` · until ${fmtDate(j.pinned_until)}` : ""}
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: 6, opacity: 0.85 }}>
                        {j.pay}
                        {j.hours ? ` · ${j.hours}` : ""}
                        {j.neighborhood ? ` · ${j.neighborhood}` : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12, opacity: 0.7 }}>
                      Posted {fmtDate(j.created_at)}
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
              ))}
            </div>
          )}
        </section>

        <footer style={footer}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={{ opacity: 0.85 }}>Portland-only for now.</span>
              <a href={whyHref(metro)} style={footerLink}>
                Why we charge
              </a>
              <a href={`mailto:hello@portlandcoffeejobs.com`} style={footerLink}>
                Contact
              </a>
            </div>

            <div style={{ opacity: 0.7, fontSize: 12 }}>
              Curated listings · No recruiters · Community run
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ---------------------------
   Styles + helpers
---------------------------- */

const shell: React.CSSProperties = {
  minHeight: "100vh",
  padding: "48px 18px",
  background: "#fff"
};

const container: React.CSSProperties = {
  maxWidth: 880,
  margin: "0 auto"
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "baseline"
};

const ctaLink: React.CSSProperties = {
  fontWeight: 800,
  textDecoration: "underline",
  textUnderlineOffset: 4
};

const notice: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  border: "1px solid #e6e6e6",
  borderRadius: 14,
  background: "#fafafa"
};

const card: React.CSSProperties = {
  padding: 16,
  border: "1px solid #eee",
  borderRadius: 14
};

const empty: React.CSSProperties = {
  padding: 22,
  border: "1px solid #eee",
  borderRadius: 16,
  background: "#fafafa"
};

const button: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  fontWeight: 800,
  textDecoration: "none"
};

const secondaryLink: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 0",
  fontWeight: 700,
  opacity: 0.9
};

const footer: React.CSSProperties = {
  marginTop: 38,
  paddingTop: 18,
  borderTop: "1px solid #eee"
};

const footerLink: React.CSSProperties = {
  opacity: 0.85
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// For now this just links to the post page with an anchor you can add later.
// If you want, we can make a real /why page next.
function whyHref(metro: string) {
  return `/${metro}/post#why-paid`;
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          marginLeft: 6,
          cursor: "help",
          fontWeight: 700,
          opacity: 0.7
        }}
      >
        ⓘ
      </span>
      <span className="tooltip">{text}</span>

      <style jsx>{`
        .tooltip {
          position: absolute;
          bottom: 140%;
          left: 50%;
          transform: translateX(-50%);
          width: 260px;
          padding: 10px 12px;
          background: #111;
          color: #fff;
          font-size: 12px;
          line-height: 1.4;
          border-radius: 10px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease;
          z-index: 10;
        }

        span:hover + .tooltip {
          opacity: 1;
        }
      `}</style>
    </span>
  );
}

