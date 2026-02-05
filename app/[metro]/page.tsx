import { supabase } from "@/lib/supabase";

export const dynamic = "force-static";
export const revalidate = 300;

const METROS: Record<string, { city: string; state: string; title: string }> = {
  "portland-or": { city: "Portland", state: "OR", title: "Portland Coffee Jobs" }
};

export default async function MetroPage({ params }: { params: { metro: string } }) {
  const metro = params.metro;

  if (!METROS[metro]) {
    return (
      <main>
        <h1>Not found</h1>
        <p>This metro isn’t live yet.</p>
      </main>
    );
  }

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("metro_slug", metro)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <main>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
        <div>
          <h1 style={{ margin: 0 }}>{METROS[metro].title}</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>Barista + café jobs. Pay required.</p>
        </div>
        <a href={`/${metro}/post`} style={{ fontWeight: 600 }}>Post a job</a>
      </header>

      <section style={{ marginTop: 20, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <div style={{ fontSize: 14 }}>
          <strong>Pricing:</strong> Standard $5–10 · Pinned $20 (requested, subject to approval)
        </div>
      </section>

      {error && (
        <p style={{ marginTop: 20 }}>
          Error loading jobs: {error.message}
        </p>
      )}

      <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
        {(jobs ?? []).length === 0 ? (
          <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
            No jobs posted yet. Be the first.
          </div>
        ) : (
          (jobs ?? []).map((j) => (
            <article key={j.id} style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {j.role} — {j.cafe_name}{" "}
                    {j.pinned && <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.8 }}>📌 Pinned</span>}
                  </div>
                  <div style={{ marginTop: 6, opacity: 0.85 }}>
                    {j.pay}{j.hours ? ` · ${j.hours}` : ""}{j.neighborhood ? ` · ${j.neighborhood}` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: 12, opacity: 0.7 }}>
                  Posted {new Date(j.created_at).toLocaleDateString("en-US")}
                </div>
              </div>

              {(j.apply_url || j.apply_email) && (
                <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {j.apply_url && <a href={j.apply_url} target="_blank" rel="noreferrer">Apply link</a>}
                  {j.apply_email && <a href={`mailto:${j.apply_email}`}>Email</a>}
                </div>
              )}

              {j.description && (
                <p style={{ marginTop: 10, opacity: 0.9, whiteSpace: "pre-wrap" }}>{j.description}</p>
              )}
            </article>
          ))
        )}
      </div>
    </main>
  );
}
