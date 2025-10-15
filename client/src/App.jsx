import ServiceList from "./components/ServiceList";


function App() {
  const apiBase = import.meta.env.VITE_API_URL;

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, lineHeight: 1.6, maxWidth: 820, margin: "0 auto" }}>
      <h1>AutoServe (React)</h1>
      <p style={{ marginTop: 0 }}><strong>API base:</strong> {apiBase || "(missing VITE_API_URL)"}</p>

      <h2 style={{ marginTop: 24 }}>Available Services</h2>
      <p style={{ marginTop: 0, color: "#6b7280" }}>
        Data comes from <code>/api/services</code> (Mongo → Mongoose → Express → React).
      </p>

      <ServiceList />
    </div>
  );
}
export default App;