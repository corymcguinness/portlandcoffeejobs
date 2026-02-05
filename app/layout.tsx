export const metadata = {
  title: "Portland Coffee Jobs",
  description: "Barista + Café Jobs In The Rose City"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif", margin: 0 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: 20 }}>
          {children}
          <footer style={{ marginTop: 48, fontSize: 12, opacity: 0.7 }}>
            Portland-only for now. List below!
          </footer>
        </div>
      </body>
    </html>
  );
}
