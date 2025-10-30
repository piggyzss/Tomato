// components/AICatMessages.tsx
import { useState } from "react";
import { checkAvailability, createModel } from "./service.ts";

type AIView = "menu" | "catMessages" | "dailySummary" | "chatCat";

interface AICatMessagesProps {
  onNavigate?: (view: AIView) => void;
}

export default function AICatMessages({ onNavigate }: AICatMessagesProps) {
  const [availability, setAvailability] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [session, setSession] = useState<any | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    const result = await checkAvailability();
    setAvailability(result);
    setLoading(false);
  };

  const handleDownload = async () => {
    setProgress(0);
    try {
      const newSession = await createModel(setProgress);
      setSession(newSession);
      setSessionReady(true);
    } catch {
      setSessionReady(false);
    }
  };

  const goodStates = ["downloadable", "available", "downloading"];

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>AICatMessages Component</h2>

      {/* --- Check Availability --- */}
      <button
        onClick={handleCheck}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          cursor: "pointer",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          marginRight: "0.5rem",
        }}
      >
        {loading ? "Checking..." : "Check Gemini Nano Availability"}
      </button>

      {/* --- Download Model --- */}
      {goodStates.includes(availability || "") && !sessionReady && (
        <button
          onClick={handleDownload}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
          }}
        >
          Download & Initialize Model
        </button>
      )}

      {/* --- Status --- */}
      <div style={{ marginTop: "1rem" }}>
        {availability === null ? (
          <p>Click the button to check Gemini Nano availability.</p>
        ) : goodStates.includes(availability) ? (
          <p>
            ✅ Available state: <strong>{availability}</strong>
          </p>
        ) : (
          <p>❌ Not Available ({availability})</p>
        )}

        {progress !== null && progress < 100 && <p>⬇️ Downloading Model: {progress}%</p>}

        {progress === 100 && !sessionReady && <p>🧠 Finishing initialization…</p>}

        {sessionReady && <p>✅ Model is ready to use!</p>}
      </div>

      {/* --- Navigate to Chat --- */}
      {session && (
        <button
          onClick={() => onNavigate?.("chatCat")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "#FF6B35",
            color: "white",
            border: "none",
            marginTop: "1rem",
          }}
        >
          Chat Now
        </button>
      )}
    </div>
  );
}
