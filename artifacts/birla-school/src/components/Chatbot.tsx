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
  const [position, setPosition] = useState(() => {
    try {
      const saved = window.localStorage.getItem("bomIS-chatbot-position");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Number.isFinite(parsed?.right) &&
          Number.isFinite(parsed?.bottom)
        ) {
          return { right: parsed.right, bottom: parsed.bottom };
        }
      }
    } catch {
      // Use the default position when localStorage is unavailable or invalid.
    }
    return { right: 20, bottom: 16 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste! 🙏 Main Bright Open Minds School Assistant hoon. Admissions, academics, facilities ya kisi bhi sawaal mein aapki madad kar sakta hoon. Aap type karein ya mic button dabaa ke bol sakte hain!",
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
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startRight: number;
    startBottom: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  // Auto-scroll
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Remember the visitor's preferred position across page navigation and reloads.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        "bomIS-chatbot-position",
        JSON.stringify(position),
      );
    } catch {
      // Persistence is a convenience; dragging still works if storage is blocked.
    }
  }, [position]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      stopSpeaking();
    };
  }, []);

  // Keep the widget inside the viewport while it is being dragged. The
  // position is shared by the launcher and chat panel so they move together.
  const handleDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startRight: position.right,
      startBottom: position.bottom,
      moved: false,
    };
    setIsDragging(true);
  };

  const handleDragMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      drag.moved = true;
    }

    const maxRight = Math.max(8, window.innerWidth - 88);
    const maxBottom = Math.max(8, window.innerHeight - 116);
    setPosition({
      right: Math.min(maxRight, Math.max(8, drag.startRight - deltaX)),
      bottom: Math.min(maxBottom, Math.max(8, drag.startBottom - deltaY)),
    });
  };

  const handleDragEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    setIsDragging(false);
  };

  const toggleOpen = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setOpen((value) => !value);
  };

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
        onClick={toggleOpen}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        className={`fixed z-50 focus:outline-none group touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{
          right: position.right,
          bottom: position.bottom,
          background: "none",
          border: "none",
          padding: 0,
        }}
        aria-label="Open school assistant"
      >
        {/* Close X badge when open */}
        {open && (
          <span className="absolute -top-1 -left-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
            <X className="h-3 w-3" />
          </span>
        )}

        {/* 3D Robot SVG — matches reference image */}
        <svg
          viewBox="0 0 80 100"
          width="80"
          height="100"
          className="transition-transform duration-200 group-hover:-translate-y-1"
          style={{ filter: "drop-shadow(0 8px 24px rgba(0,180,255,0.25)) drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Silver/white body gradient */}
            <linearGradient id="rBodyG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#dde8f0" />
              <stop offset="100%" stopColor="#9eb8cc" />
            </linearGradient>
            {/* Head gradient */}
            <linearGradient id="rHeadG" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#e8f2f8" />
              <stop offset="100%" stopColor="#a8c0d0" />
            </linearGradient>
            {/* Eye dark background */}
            <radialGradient id="rEyeBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#001428" />
              <stop offset="100%" stopColor="#000810" />
            </radialGradient>
            {/* Eye glow core — bright cyan */}
            <radialGradient id="rEyeCore" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#80ffff" />
              <stop offset="35%" stopColor="#00cfff" />
              <stop offset="75%" stopColor="#0070e0" />
              <stop offset="100%" stopColor="#003090" />
            </radialGradient>
            {/* Eye shine */}
            <radialGradient id="rEyeShine" cx="35%" cy="28%" r="45%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            {/* Eye outer halo blur */}
            <filter id="rEyeGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* Antenna glow */}
            <filter id="rAntGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* Neck shadow */}
            <linearGradient id="rNeckG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9eb8cc" />
              <stop offset="50%" stopColor="#c8dce8" />
              <stop offset="100%" stopColor="#9eb8cc" />
            </linearGradient>
          </defs>

          {/* ── Antenna stem ── */}
          <rect x="37" y="3" width="6" height="14" rx="3" fill="url(#rNeckG)" />
          {/* Antenna ball with glow */}
          <circle cx="40" cy="3" r="5" fill="#00e8ff" filter="url(#rAntGlow)" />
          <circle cx="40" cy="3" r="3.5" fill="#80ffff" />
          <circle cx="39" cy="2" r="1.2" fill="white" opacity="0.9" />

          {/* ── Head ── */}
          <rect x="6" y="14" width="68" height="52" rx="20" fill="url(#rHeadG)" />
          {/* Head top highlight (3D sheen) */}
          <ellipse cx="30" cy="20" rx="18" ry="6" fill="white" opacity="0.45" />
          {/* Head bottom shadow */}
          <ellipse cx="40" cy="64" rx="22" ry="5" fill="#7090a8" opacity="0.15" />

          {/* ── LEFT EYE ── */}
          {/* Outer ambient glow (very soft) */}
          <circle cx="25" cy="38" r="16" fill="#00aaff" opacity="0.12" />
          {/* Eye socket dark background */}
          <circle cx="25" cy="38" r="13" fill="url(#rEyeBg)" />
          {/* Eye iris glow */}
          <circle cx="25" cy="38" r="11" fill="url(#rEyeCore)" filter="url(#rEyeGlow)" />
          {/* Eye rim */}
          <circle cx="25" cy="38" r="11" fill="none" stroke="#00e8ff" strokeWidth="0.8" opacity="0.6" />
          {/* Eye shine highlight */}
          <circle cx="25" cy="38" r="11" fill="url(#rEyeShine)" />
          {/* Small sparkle */}
          <circle cx="20" cy="32" r="2.5" fill="white" opacity="0.85" />
          <circle cx="22" cy="30" r="1" fill="white" opacity="0.5" />

          {/* ── RIGHT EYE ── */}
          {/* Outer ambient glow */}
          <circle cx="55" cy="38" r="16" fill="#00aaff" opacity="0.12" />
          {/* Eye socket */}
          <circle cx="55" cy="38" r="13" fill="url(#rEyeBg)" />
          {/* Eye iris glow */}
          <circle cx="55" cy="38" r="11" fill="url(#rEyeCore)" filter="url(#rEyeGlow)" />
          {/* Eye rim */}
          <circle cx="55" cy="38" r="11" fill="none" stroke="#00e8ff" strokeWidth="0.8" opacity="0.6" />
          {/* Eye shine */}
          <circle cx="55" cy="38" r="11" fill="url(#rEyeShine)" />
          {/* Sparkle */}
          <circle cx="50" cy="32" r="2.5" fill="white" opacity="0.85" />
          <circle cx="52" cy="30" r="1" fill="white" opacity="0.5" />

          {/* ── Smile ── */}
          <path
            d="M 22 58 Q 40 70 58 58"
            stroke="#7a9db0"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Cheek blush left */}
          <ellipse cx="14" cy="50" rx="6" ry="4" fill="#ffb0c0" opacity="0.25" />
          {/* Cheek blush right */}
          <ellipse cx="66" cy="50" rx="6" ry="4" fill="#ffb0c0" opacity="0.25" />

          {/* ── Neck ── */}
          <rect x="30" y="66" width="20" height="8" rx="4" fill="url(#rNeckG)" />

          {/* ── Body ── */}
          <rect x="10" y="72" width="60" height="26" rx="14" fill="url(#rBodyG)" />
          {/* Body top highlight */}
          <ellipse cx="40" cy="74" rx="20" ry="5" fill="white" opacity="0.4" />
          {/* Chest panel */}
          <rect x="26" y="79" width="28" height="13" rx="6" fill="white" opacity="0.22" />
          {/* Chest panel inner line */}
          <rect x="31" y="83" width="18" height="2" rx="1" fill="#a0c0d8" opacity="0.5" />
          <rect x="31" y="87" width="12" height="2" rx="1" fill="#a0c0d8" opacity="0.35" />
          {/* Body bottom edge shadow */}
          <ellipse cx="40" cy="97" rx="22" ry="4" fill="#6080a0" opacity="0.12" />
        </svg>

        {/* "Chat" label */}
        {!open && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow">
            Drag karke move karein
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed z-50 flex w-[min(380px,calc(100vw-24px))] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
          style={{ right: position.right, bottom: position.bottom + 112 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-orange-500 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Bright Open Minds Assistant</p>
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
