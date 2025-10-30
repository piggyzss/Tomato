import { useState } from "react";

async function checkAvailability(): Promise<string> {
  try {
    // Try both possible global references (depending on Chrome version)
    const avail =
      (await (window as any).LanguageModel?.availability?.()) ??
      (await (window as any).ai?.languageModel?.availability?.());

    console.log("Gemini Nano availability:", avail);
    return avail || "unavailable";
  } catch (err) {
    console.error("Error checking availability:", err);
    return "error";
  }
}

export default function AICatMessages() {
  const [availability, setAvailability] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    const result = await checkAvailability();
    setAvailability(result);
    setLoading(false);
  };

  const goodStates = ["downloadable", "available", "downloading"];

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>AICatMessages Component</h2>

      <button
        onClick={handleCheck}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          cursor: "pointer",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
        }}
      >
        {loading ? "Checking..." : "Check Gemini Nano Availability"}
      </button>

      <div style={{ marginTop: "1rem" }}>
        {availability === null ? (
          <p>Click the button to check Gemini Nano availability.</p>
        ) : goodStates.includes(availability) ? (
          <p>✅ Available ({availability})</p>
        ) : (
          <p>❌ Not Available ({availability})</p>
        )}
      </div>
    </div>
  );
}
