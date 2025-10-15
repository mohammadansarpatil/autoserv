import { useEffect, useState } from "react";
import { getServices } from "../lib/api";
import { formatMoney } from "../lib/format";

import "./ServiceList.css";

export default function ServiceList() {
    const [services, setServices] = useState([]);
    const [phase, setPhase] = useState("idle");
    const [error, setError] = useState("");

    useEffect(() => {
    let cancelled = false;
    async function load() {
      setPhase("loading");
      try {
        const data = await getServices();
        if (!cancelled) {
          setServices(Array.isArray(data) ? data : []);
          setPhase("success");
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setPhase("error");
          setError(err?.message || "Failed to load services");
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (phase === "loading") return <p className="state--loading">Loading services…</p>;
  if (phase === "error")   return <p className="state--error">Error: {error}</p>;
  if (phase === "success" && services.length === 0) return <p>No services available yet.</p>;

  return (
    <div className="service-list">
      {services.map(svc => (
        <article className="service-card" key={svc.id || svc._id}>
          <header className="service-card__header">
            <h3 className="service-card__title">{svc.name}</h3>
            <span className="service-card__price">{formatMoney(svc.basePrice)}</span>
          </header>
          {svc.description && (
            <p className="service-card__desc">{svc.description}</p>
          )}
          <p className="service-card__meta">Duration: {svc.durationMins} mins</p>
        </article>
      ))}
    </div>
  );

}