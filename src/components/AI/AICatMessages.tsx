// 
import { useState } from "react";

// Define navigation type
type AIView = 'menu' | 'catMessages' | 'dailySummary' | 'chatCat'

interface AICatMessagesProps {
  onNavigate?: (view: AIView) => void
}

async function checkAvailability(): Promise<string> {
  try {
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

// 🔹 Function to create / download the model
async function createModel(
  onProgress: (percent: number) => void
): Promise<any> {
  try {
    const modelClass =
      (window as any).LanguageModel || (window as any).ai?.languageModel;
    if (!modelClass) throw new Error("LanguageModel API not found");

    const session = await modelClass.create({
      monitor(monitor: any) {
        monitor.addEventListener("downloadprogress", (e: any) => {
          const percent = Math.round(e.loaded * 100);
          console.log(`Downloaded ${percent}%`);
          onProgress(percent);
        });
      },
    });

    console.log("✅ Gemini Nano model created successfully:", session);
    return session;
  } catch (err) {
    console.error("Error creating model:", err);
    throw err;
  }
}

export default function AICatMessages({ onNavigate }: AICatMessagesProps) {
  const [availability, setAvailability] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      {/* --- Check Availability Button --- */}
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

      {/* --- Download / Create Model Button --- */}
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

      <div style={{ marginTop: "1rem" }}>
        {availability === null ? (
          <p>Click the button to check Gemini Nano availability.</p>
        ) : goodStates.includes(availability) ? (
          <p>✅ Available state: <strong>{availability}</strong></p>
        ) : (
          <p>❌ Not Available ({availability})</p>
        )}

        {progress !== null && progress < 100 && (
          <p>⬇️ Downloading Model: {progress}%</p>
        )}

        {progress === 100 && !sessionReady && (
          <p>🧠 Finishing initialization…</p>
        )}

        {sessionReady && <p>✅ Model is ready to use!</p>}
      </div>

     {session && (
       <button 
         onClick={() => onNavigate?.('chatCat')}
         style={{
           padding: "0.5rem 1rem",
           borderRadius: "8px",
           cursor: "pointer",
           backgroundColor: "#FF6B35",
           color: "white",
           border: "none",
           marginTop: "1rem"
         }}
       >
         Chat Now
       </button>
     )}
    </div>
  );
}
