import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Send, Paperclip } from "lucide-react";

interface Message {
  id: number;
  from: "clinic" | "patient";
  text: string;
  time: string;
}

const MOCK_THREADS: Record<string, Message[]> = {
  "AH": [
    { id: 1, from: "patient", text: "Hej! Jag undrar om ni kan ta emot mig snart? Tanden har börjat göra ont.", time: "igår 09:14" },
    { id: 2, from: "clinic", text: "Hej Anna! Vi kan erbjuda tid redan nästa vecka. Jag skickar en offert så snart jag tittat på dina bilder.", time: "igår 10:30" },
    { id: 3, from: "patient", text: "Tack, det låter bra! Ser fram emot offerten.", time: "igår 10:45" },
  ],
  "ML": [
    { id: 1, from: "patient", text: "Hej, jag vill gärna diskutera implantat-alternativ. Finns det olika prisklasser?", time: "igår 14:30" },
  ],
  "ES": [
    { id: 1, from: "patient", text: "Hej! Jag accepterade er offert. När kan jag komma in?", time: "idag 08:00" },
    { id: 2, from: "clinic", text: "Fantastiskt! Vi har en lucka imorgon kl 14:00. Passar det?", time: "idag 08:15" },
    { id: 3, from: "patient", text: "Perfekt, jag bokar den!", time: "idag 08:22" },
  ],
};

interface Props {
  requestId: string | null;
  patientInitials: string | null;
  onClose: () => void;
}

export default function ClinicPortalChat({ requestId, patientInitials, onClose }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (patientInitials) {
      setMessages(MOCK_THREADS[patientInitials] ?? []);
      setInput("");
    }
  }, [patientInitials]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "clinic", text: input.trim(), time: "Just nu" },
    ]);
    setInput("");
  };

  if (!requestId || !patientInitials) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[600px] animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div>
            <h3 className="font-semibold text-sm text-zinc-900">Patient {patientInitials}</h3>
            <p className="text-[10px] text-zinc-400">Förfrågan {requestId}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-zinc-50/50">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-zinc-400">Inga meddelanden ännu.</p>
              <p className="text-xs text-zinc-400 mt-1">Skriv ditt meddelande nedan.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.from === "clinic" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed",
                msg.from === "clinic"
                  ? "bg-amber-600 text-white rounded-br-md"
                  : "bg-white border border-zinc-200 text-zinc-700 rounded-bl-md shadow-sm"
              )}>
                <p>{msg.text}</p>
                <p className={cn(
                  "text-[9px] mt-1.5",
                  msg.from === "clinic" ? "text-amber-200" : "text-zinc-400"
                )}>{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-zinc-100 bg-white rounded-b-2xl">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
              <Paperclip className="w-4 h-4 text-zinc-400" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Skriv ett meddelande..."
              className="flex-1 text-xs bg-zinc-100 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-200 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                "p-2.5 rounded-full transition-colors",
                input.trim() ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-zinc-100 text-zinc-300"
              )}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
