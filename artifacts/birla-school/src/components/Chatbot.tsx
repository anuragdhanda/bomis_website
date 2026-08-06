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
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-300"
        aria-label="Open school assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
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
