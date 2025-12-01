import React, { useState } from "react";

function App() {
  const [serverMessage, setServerMessage] = useState("");

  const callBackend = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/ping`);
      console.log("Raw response:", response);
      const data = await response.json();
      console.log("Parsed JSON:", data);
      setServerMessage(data.message);
    } catch (error) {
      console.error("Error:", error);
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
