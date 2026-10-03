import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Volume2, RotateCcw, Bot, User, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: number;
  modelUsed?: string;
}

type ChatModel = "gemini-3.5-flash" | "gemini-3.5-pro";
type ChatRole = "buddy" | "hero" | "guide";

interface ChatCompanionProps {
  isOpen: boolean;
  onClose: () => void;
  currentStoryTitle?: string;
  mainCharacter?: string;
  currentPageText?: string;
  storySummary?: string;
  selectedVoice: string;
  selectedTone: string;
}

const QUICK_SUGGESTIONS = [
  "What's the lesson of this story?",
  "Tell me a funny joke about the hero!",
  "What happens next in the adventure?",
  "Can you explain a tricky word on this page?",
];

export const ChatCompanion: React.FC<ChatCompanionProps> = ({
  isOpen,
  onClose,
  currentStoryTitle,
  mainCharacter,
  currentPageText,
  storySummary,
  selectedVoice,
  selectedTone,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "model",
      content: `Hoot hoot! I'm Barnaby, your Story Buddy! Ask me anything about "${currentStoryTitle || "your story"}" or click a button below to chat! 🦉✨`,
      timestamp: Date.now(),
      modelUsed: "gemini-3.5-flash",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [chatRole, setChatRole] = useState<ChatRole>("buddy");
  const [chatModel, setChatModel] = useState<ChatModel>("gemini-3.5-flash");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          chatRole,
          chatModel,
          storyContext: {
            title: currentStoryTitle || "Untitled Story",
            mainCharacter: mainCharacter || "Hero",
            summary: storySummary || "",
            currentPageText: currentPageText || "",
          },
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to get response");
      }

      const modelMsg: ChatMessage = {
        id: "model-" + Date.now(),
        role: "model",
        content: data.reply,
        timestamp: Date.now(),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "model",
          content: "Oopsie! My magical feather got tangled. Let's try asking again! 🦉",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  const speakMessage = async (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msgId);
    try {
      const res = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceName: selectedVoice,
          tone: selectedTone,
        }),
      });

      const data = await res.json();
      if (data.success && data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.onended = () => setSpeakingMsgId(null);
        audio.onerror = () => setSpeakingMsgId(null);
        await audio.play();
      } else {
        setSpeakingMsgId(null);
      }
    } catch (err) {
      console.error("Failed to read chat aloud:", err);
      setSpeakingMsgId(null);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "model",
        content: "New chat started! What story secret shall we discover together? 🌟",
        timestamp: Date.now(),
      },
    ]);
  };
  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-amber-50 border-l border-amber-300/80 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-900 to-indigo-950 text-indigo-50 border-b border-indigo-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-amber-950 font-bold shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-950" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-serif flex items-center gap-1.5">
              <span>Story Companion</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-indigo-800 text-indigo-200 rounded-md font-sans">
                Gemini Multi-Turn
              </span>
            </h3>
            <p className="text-[11px] text-indigo-200/80">Ask questions, roleplay, or explore lessons</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            title="Reset Chat"
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-800/60 rounded-lg transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-800/60 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Role & Model Control Panel */}
      <div className="p-3 bg-amber-100/90 border-b border-amber-200 space-y-2 text-xs">
        {/* Role Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase text-amber-900 tracking-wider mb-1">
            Chatbot Persona / Role
          </label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setChatRole("buddy")}
              className={`px-2 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
                chatRole === "buddy"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-200/50"
              }`}
            >
              <span>🦉 Owl Buddy</span>
            </button>
            <button
              onClick={() => setChatRole("hero")}
              className={`px-2 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
                chatRole === "hero"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-200/50"
              }`}
            >
              <span>🎭 Hero</span>
            </button>
            <button
              onClick={() => setChatRole("guide")}
              className={`px-2 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
                chatRole === "guide"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-200/50"
              }`}
            >
              <span>🌙 Guide</span>
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase text-amber-900 tracking-wider mb-1">
            Gemini Engine Backend
          </label>
          <select
            value={chatModel}
            onChange={(e) => setChatModel(e.target.value as ChatModel)}
            className="w-full bg-amber-50 text-amber-950 border border-amber-200 rounded-lg p-1.5 font-sans font-medium outline-none focus:border-indigo-500"
          >
            <option value="gemini-3.5-flash">Gemini 3.5 Flash (Fast Buddy)</option>
            <option value="gemini-3.5-pro">Gemini 3.5 Pro (Deep Thinker)</option>
          </select>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-amber-50 to-amber-100/40">
        {messages.map((msg) => {
          const isModel = msg.role === "model";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                isModel ? "self-start" : "self-end flex-row-reverse ml-auto"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs shadow-xs ${
                  isModel ? "bg-amber-400 text-amber-950" : "bg-indigo-600 text-white"
                }`}
              >
                {isModel ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              
              <div className="space-y-1">
                <div
                  className={`p-3 rounded-2xl shadow-xs text-sm leading-relaxed ${
                    isModel
                      ? "bg-white text-slate-800 border border-amber-200 rounded-tl-none"
                      : "bg-indigo-600 text-white rounded-tr-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {isModel && (
                  <div className="flex items-center gap-2 pl-1">
                    <button
                      onClick={() => speakMessage(msg.id, msg.content)}
                      className={`p-1 rounded-md transition hover:bg-amber-200/60 ${
                        speakingMsgId === msg.id ? "text-green-600 animate-pulse" : "text-slate-400"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    {msg.modelUsed && (
                      <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider font-semibold">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-start gap-2.5 max-w-[85%] self-start animate-pulse">
            <div className="w-7 h-7 rounded-lg bg-amber-200 flex items-center justify-center text-amber-950 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
            </div>
            <div className="p-3 bg-white border border-amber-200 rounded-2xl rounded-tl-none shadow-xs text-xs text-slate-400 italic">
              Barnaby is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions & Input Footer */}
      <div className="p-3 bg-white border-t border-amber-200 space-y-2.5">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 rounded-full px-2.5 py-1 transition cursor-pointer text-left truncate max-w-full"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your story question here..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 placeholder-slate-400 font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
