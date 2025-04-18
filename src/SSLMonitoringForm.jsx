import { useState } from "react";

export default function SSLMonitoringForm() {
  const [formData, setFormData] = useState({
    domain: "",
    email: ""
  });
  const [status, setStatus] = useState(null);
  const [planLimit, setPlanLimit] = useState(null);
  const [usage, setUsage] = useState(0);

  const fetchLimit = async (email) => {
    try {
      const res = await fetch(`https://your-backend-url.onrender.com/user-limit?email=${email}`);
      const data = await res.json();
      if (res.ok) {
        setPlanLimit(data.limit);
        setUsage(data.usage);
      }
    } catch (error) {
      console.error("Failed to fetch user plan limit", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "email") fetchLimit(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (planLimit !== null && usage >= planLimit) {
      setStatus("❌ You have reached your monitoring limit for this email.");
      return;
    }

    setStatus("Registering...");
    try {
      const response = await fetch("https://your-backend-url.onrender.com/register-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setUsage((prev) => prev + 1);
        setStatus(`✅ ${data.status} for ${data.domain}`);
      } else {
        setStatus(`❌ ${data.message || "Registration failed"}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>SSL Monitor</h2>
      <form onSubmit={handleSubmit}>
        <input name="domain" placeholder="Domain (example.com)" onChange={handleChange} required style={{ display: "block", width: "100%", marginBottom: "10px" }} />
        <input name="email" placeholder="Notification Email" onChange={handleChange} required style={{ display: "block", width: "100%", marginBottom: "10px" }} />
        <button type="submit">Enable Monitoring</button>
        {status && <p style={{ marginTop: "1rem" }}>{status}</p>}
        {planLimit !== null && (
          <p style={{ fontSize: "0.9rem", color: "gray" }}>
            {usage}/{planLimit} monitored domains used
          </p>
        )}
      </form>
    </div>
  );
}
