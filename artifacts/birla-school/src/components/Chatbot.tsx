import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function sendChat(messages: Message[]): Promise<string> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();
  return data.reply as string;
}

// ── Speech helpers ────────────────────────────────────────────────────────────

const SpeechRecognitionCtor =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

function speak(text: string, lang = "hi-IN") {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 1;
  utt.pitch = 1;
  window.speechSynthesis.speak(utt);
}

function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste! 🙏 Main BOMIS School Assistant hoon. Admissions, academics, facilities ya kisi bhi sawaal mein aapki madad kar sakta hoon. Aap type karein ya mic button dabaa ke bol sakte hain!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // voice states
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voiceSupported] = useState(() => !!SpeechRecognitionCtor);
  const recognitionRef = useRef<any>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      stopSpeaking();
    };
  }, []);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const newMessages: Message[] = [
        ...messages,
        { role: "user", content: trimmed },
      ];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        const reply = await sendChat(newMessages);
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        if (ttsEnabled) speak(reply);
      } catch {
        const errMsg =
          "Sorry, kuch technical issue aa gaya. Please thodi der baad try karein.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: errMsg },
        ]);
        if (ttsEnabled) speak(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, ttsEnabled]
  );

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ── Voice input ─────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!SpeechRecognitionCtor || listening) return;

    stopSpeaking(); // stop any ongoing TTS before listening

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "hi-IN"; // handles Hindi + English code-mix well in Chrome
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);

      // If final result, auto-send
      if (event.results[event.results.length - 1].isFinal) {
        recognition.stop();
        sendMessage(transcript);
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [listening, sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const toggleTts = () => {
    if (ttsEnabled) stopSpeaking();
    setTtsEnabled((v) => !v);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating robot button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-5 z-50 focus:outline-none group"
        aria-label="Open school assistant"
        style={{ background: "none", border: "none", padding: 0 }}
      >
        {/* Close X badge when open */}
        {open && (
          <span className="absolute -top-1 -left-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
            <X className="h-3 w-3" />
          </span>
        )}

        {/* 3D Robot SVG */}
        <svg
          viewBox="0 0 72 92"
          width="72"
          height="92"
          className="drop-shadow-2xl transition-transform duration-200 group-hover:-translate-y-1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Body gradient - white/silver 3D look */}
            <linearGradient id="bodyG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0f4f8" />
              <stop offset="60%" stopColor="#d0dde8" />
              <stop offset="100%" stopColor="#b0c0d0" />
            </linearGradient>
            {/* Head gradient */}
            <linearGradient id="headG" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#dce8f0" />
              <stop offset="100%" stopColor="#aabccc" />
            </linearGradient>
            {/* Eye outer glow */}
            <radialGradient id="eyeOuter" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="60%" stopColor="#0080e0" />
              <stop offset="100%" stopColor="#003880" />
            </radialGradient>
            {/* Eye inner shine */}
            <radialGradient id="eyeShine" cx="35%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            {/* Glow filter */}
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Body shadow filter */}
            <filter id="bodyShadow" x="-10%" y="-5%" width="120%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#7090a0" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* ── Antenna ── */}
          <rect x="34" y="2" width="4" height="10" rx="2" fill="#b0c0d0" />
          <circle cx="36" cy="2" r="4" fill="#00e5ff" filter="url(#glow)" />

          {/* ── Head ── */}
          <rect x="8" y="10" width="56" height="46" rx="18" fill="url(#headG)" filter="url(#bodyShadow)" />
          {/* Head highlight */}
          <ellipse cx="28" cy="18" rx="12" ry="5" fill="white" opacity="0.35" />

          {/* ── Eyes ── */}
          {/* Left eye glow halo */}
          <circle cx="24" cy="33" r="11" fill="#00cfff" opacity="0.18" />
          {/* Left eye */}
          <circle cx="24" cy="33" r="9" fill="url(#eyeOuter)" filter="url(#glow)" />
          {/* Left eye shine */}
          <circle cx="24" cy="33" r="9" fill="url(#eyeShine)" />
          {/* Left pupil */}
          <circle cx="24" cy="34" r="4" fill="#001840" opacity="0.6" />

          {/* Right eye glow halo */}
          <circle cx="48" cy="33" r="11" fill="#00cfff" opacity="0.18" />
          {/* Right eye */}
          <circle cx="48" cy="33" r="9" fill="url(#eyeOuter)" filter="url(#glow)" />
          {/* Right eye shine */}
          <circle cx="48" cy="33" r="9" fill="url(#eyeShine)" />
          {/* Right pupil */}
          <circle cx="48" cy="34" r="4" fill="#001840" opacity="0.6" />

          {/* ── Smile ── */}
          <path
            d="M 22 50 Q 36 60 50 50"
            stroke="#88aabb"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* ── Body ── */}
          <rect x="14" y="58" width="44" height="28" rx="12" fill="url(#bodyG)" filter="url(#bodyShadow)" />
          {/* Body chest panel */}
          <rect x="24" y="65" width="24" height="14" rx="5" fill="white" opacity="0.3" />
          {/* Body highlight */}
          <ellipse cx="36" cy="62" rx="14" ry="4" fill="white" opacity="0.25" />
        </svg>

        {/* "Chat" label */}
        {!open && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow">
            Chat karo!
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[340px] sm:w-[380px] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 bg-orange-500 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">BOMIS Assistant</p>
              <p className="text-xs text-orange-100">Type karein ya bol ke poochein 🎙️</p>
            </div>

            {/* TTS toggle */}
            <button
              onClick={toggleTts}
              title={ttsEnabled ? "Awaaz band karein" : "Awaaz on karein"}
              className="ml-auto text-white/80 hover:text-white p-1"
            >
              {ttsEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={() => { setOpen(false); stopSpeaking(); }}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-3 overflow-y-auto p-4 h-80">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    msg.role === "user" ? "bg-orange-100" : "bg-orange-500"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-orange-600" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-orange-500 text-white"
                      : "rounded-bl-sm bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Listening indicator */}
          {listening && (
            <div className="mx-3 mb-1 flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3 py-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-xs text-red-600 font-medium">Sun raha hoon… bol dijiye</span>
              <button
                onClick={stopListening}
                className="ml-auto text-xs text-red-500 hover:text-red-700 underline"
              >
                Rok dein
              </button>
            </div>
          )}

          {/* Input row */}
          <div className="border-t border-gray-100 p-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Apna sawaal likhein…"
              disabled={loading || listening}
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
            />

            {/* Mic button */}
            {voiceSupported && (
              <button
                onClick={listening ? stopListening : startListening}
                disabled={loading}
                title={listening ? "Sunna band karein" : "Bol ke poochein"}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                  listening
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {listening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Send button */}
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading || listening}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
