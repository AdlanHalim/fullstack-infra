import React, { useState } from "react";

function App() {
  const [serverMessage, setServerMessage] = useState("");

  const callBackend = async () => {
    try {
      const response = await fetch("http://localhost:5000/ping");

      // Check if backend returned success
      if (!response.ok) {
        throw new Error("Backend returned error status");
      }

      const data = await response.json();
      console.log("Backend Response:", data);

      setServerMessage(data.message || "No message returned");
    } catch (error) {
      console.error("Error calling backend:", error);
      setServerMessage("Failed to reach backend.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>React ↔ Flask API Test</h1>

      <button onClick={callBackend}>Click to Call Backend</button>

      <p>Response: {serverMessage}</p>
    </div>
  );
}

export default App;
