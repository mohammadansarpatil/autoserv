import { useEffect, useState } from "react";
import { apiGet } from "./lib/api";

function App() {
  const [status, setStatus] = useState("checking...");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiGet("/api/health");
        if (!cancelled) {
          setStatus(data.status ?? "unknown");
          setTime(data.time ?? "");
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("unreachable");
          setTime("");
          setError(err.message || "Request failed");
        }
      }
    }
    load();

    // cleanup if component unmounts during a pending fetch
    return () => { cancelled = true; };
  }, []);

  const apiBase = import.meta.env.VITE_API_URL;

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, lineHeight: 1.6 }}>
      <h1>AutoServe (React)</h1>

      <p><strong>API base:</strong> {apiBase || "(missing VITE_API_URL)"}</p>

      <h2>Server health</h2>
      <p>
        Status: <strong>{status}</strong>
        {time && <> | Time: <code>{time}</code></>}
      </p>

      {error && (
        <p style={{ color: "crimson" }}>
          Error: {error}
        </p>
      )}

      <p style={{ fontSize: 13, color: "#555" }}>
        Tip: If you change <code>client/.env</code>, restart <code>npm run dev</code>.
      </p>
    </div>
  );
}

export default App;
