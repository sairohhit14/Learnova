import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const stripMarkdown = (md: string) =>
  md.replace(/[#*_`~\[\]()>!|-]/g, "").replace(/\n+/g, ". ").trim();

const ChatTutor = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
      if (event.results[0].isFinal) {
        setListening(false);
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
    } else {
      setInput("");
      recognitionRef.current.start();
      setListening(true);
    }
  }, [listening]);

  const speakText = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: { messages: newMessages, feature: "chat" },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }

      const assistantMsg: Message = { role: "assistant", content: data.content };
      setMessages([...newMessages, assistantMsg]);

      // Auto-speak the response
      if (autoSpeak) {
        speakText(data.content);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  // Auto-send when speech recognition finalizes
  useEffect(() => {
    if (!listening && input.trim() && recognitionRef.current) {
      // small delay so user sees the transcribed text
      const t = setTimeout(() => sendMessage(), 400);
      return () => clearTimeout(t);
    }
  }, [listening]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
          <Bot className="h-5 w-5 text-violet-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-foreground">AI Chat Tutor</h1>
          <p className="text-xs text-muted-foreground">Ask anything — type or speak 🎤</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setAutoSpeak(!autoSpeak);
            if (speaking) stopSpeaking();
          }}
          className={autoSpeak ? "text-violet-400" : "text-muted-foreground"}
          title={autoSpeak ? "Auto-speak ON" : "Auto-speak OFF"}
        >
          {autoSpeak ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Ask me any question — type or tap the mic!</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {["Explain binary search", "What is photosynthesis?", "Solve: 2x + 5 = 15"].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-violet-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "gradient-primary text-primary-foreground"
                  : "glass-card text-foreground"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
            {msg.role === "user" && (
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
            {msg.role === "assistant" && (
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8"
                onClick={() => speaking ? stopSpeaking() : speakText(msg.content)}
                title="Read aloud"
              >
                {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />}
              </Button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
            </div>
            <div className="glass-card rounded-2xl px-4 py-3 text-sm text-muted-foreground">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-border p-4 flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleListening}
          className={listening ? "text-red-400 animate-pulse bg-red-500/10" : "text-muted-foreground"}
          disabled={loading}
          title={listening ? "Stop listening" : "Speak your question"}
        >
          {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? "Listening..." : "Ask a question..."}
          className="bg-secondary border-border"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()} className="gradient-primary text-primary-foreground">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatTutor;
