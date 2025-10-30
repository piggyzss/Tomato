import { useEffect, useState } from "react";
import { Send, Cat, User } from "lucide-react";
import { createChatSession, sendChatMessage } from "./service.ts";

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

  // ✅ Initialize session once
  useEffect(() => {
    const initSession = async () => {
      try {
        const s = await createChatSession();
        setSession(s);
      } catch (err) {
        console.error("Failed to initialize ChatCat:", err);
      }
    };
    initSession();
  }, []);

  // 🚀 Send message handler
  const handleSend = async () => {
    if (!inputMessage.trim() || !session) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const aiReply = await sendChatMessage(session, inputMessage);
    setMessages((prev) => [...prev, aiReply]);

    setIsLoading(false);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 ">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.type === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.type === "ai" && (
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Cat size={16} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg ${
                m.type === "user" ? "bg-white text-gray-800" : "bg-black/20 text-white"
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
          onClick={handleSend}
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
