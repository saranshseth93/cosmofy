import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{ padding: '20px', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>Cosmofy</h1>
      <p>Space exploration platform is now working!</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
