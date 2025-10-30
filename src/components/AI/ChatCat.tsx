import { useEffect, useState } from "react";
import { Send, Cat, User } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function ChatCat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Meow! 🐱 Welcome to Chat Cat! I'm your productivity companion. How can I help you today?",
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any | null>(null);

  // ✅ Create Gemini Nano session once (after availability check)
  useEffect(() => {
    const init = async () => {
      try {
        const modelClass =
          (window as any).LanguageModel || (window as any).ai?.languageModel;

        if (!modelClass) throw new Error("LanguageModel API not found");

        // Get model params for good defaults
        const params = await modelClass.params();
        console.log(params.defaultTemperature, params.defaultTopK);
        const s = await modelClass.create({
          expectedOutputs: [{ type: "text", languages: ["en"] }],
          initialPrompts: [
            {
              role: "system",
              content:
                "You are Chat Cat 🐱, a warm, concise productivity companion who answers helpfully and keeps messages short.",
            },
            { role: 'user', content: 'Can you say something to motivate me?' },
    { role: 'assistant', content: 'You work so hard! Good job!' },
    { role: 'user', content: 'I am so tired' },
    {
      role: 'assistant',
      content: 'Have a short break and stretch! Even cats need rest. 😸',
    },
          ],
        //   temperature: params.defaultTemperature
        //   topK: params.defaultTopK,
        });
        

        console.log("✅ Gemini Nano session ready:", s);
        setSession(s);
      } catch (err) {
        console.error("Error creating session:", err);
      }
    };

    init();
  }, []);

  // 🚀 Send message to AI
  const sendMessage = async () => {
    if (!inputMessage.trim() || !session) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const promptResponse = await session.prompt([
        { role: "user", content: inputMessage },
      ]);

      console.log("Prompt response:", promptResponse);

      const aiText =
        promptResponse ||
        "Hmm... something went wrong 🐾";
        console.log("AI Response:", aiText);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Prompt error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "ai",
          content: "😿 I ran into an error talking to my brain.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-96">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-80">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${
              m.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.type === "ai" && (
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Cat size={16} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg ${
                m.type === "user"
                  ? "bg-white text-gray-800"
                  : "bg-black/20 text-white"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
            {m.type === "user" && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Cat size={16} className="text-white" />
            </div>
            <div className="bg-black/20 text-white px-3 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask Chat Cat anything..."
          className="flex-1 px-3 py-2 bg-black/20 text-white placeholder-white/50 rounded-lg border border-white/20 focus:border-white/40 focus:outline-none text-sm"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || isLoading || !session}
          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>

      <div className="mt-2 text-center text-xs text-white/60">
        🐱 Chat Cat powered by Gemini Nano
      </div>
    </div>
  );
}
