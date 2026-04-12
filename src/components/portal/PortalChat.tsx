import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Send, Paperclip } from "lucide-react";

interface Message {
  id: number;
  from: "patient" | "clinic";
  text: string;
  time: string;
}

const MOCK_THREADS: Record<string, Message[]> = {
  "Folktandvården Vasastan": [
    { id: 1, from: "clinic", text: "Hej Anna! Tack för att du valde oss. Vi kan erbjuda tid redan nästa vecka. Passar tisdag 25 mars kl 10:00?", time: "igår 14:32" },
    { id: 2, from: "patient", text: "Hej! Det låter bra. Hur lång tid tar behandlingen?", time: "igår 15:10" },
    { id: 3, from: "clinic", text: "Kronan tar ca 2 besök. Första besöket ~45 min för avtryck, andra ~30 min för cementering. Vi bokar in båda direkt om du vill!", time: "igår 15:24" },
  ],
  "Distriktstandvården Sveavägen": [
    { id: 1, from: "clinic", text: "Hej! Vi har tagit emot din förfrågan och lämnat en offert på 6 200 kr. Hör av dig om du har frågor.", time: "2 dagar sedan" },
  ],
  "Tandläkare Karin Olebratt": [
    { id: 1, from: "clinic", text: "Hej Anna, din bokade tid imorgon kl 10:00 kvarstår. Kom gärna 5 min innan. Välkommen!", time: "igår 09:00" },
    { id: 2, from: "patient", text: "Tack! Jag kommer. Behöver jag tänka på något speciellt innan?", time: "igår 09:15" },
    { id: 3, from: "clinic", text: "Nej, bara borsta som vanligt. Vi ses imorgon!", time: "igår 09:22" },
  ],
};

interface Props {
  clinicName: string | null;
  onClose: () => void;
}

export default function PortalChat({ clinicName, onClose }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (clinicName) {
      setMessages(MOCK_THREADS[clinicName] ?? []);
      setInput("");
    }
  }, [clinicName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "patient", text: input.trim(), time: "Just nu" },
    ]);
    setInput("");
  };

  if (!clinicName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[600px] animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div>
            <h3 className="font-semibold text-sm text-zinc-900">{clinicName}</h3>
            <p className="text-[10px] text-zinc-400">Svarar vanligtvis inom 2 timmar</p>
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
            <div key={msg.id} className={cn("flex", msg.from === "patient" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed",
                msg.from === "patient"
                  ? "bg-amber-600 text-white rounded-br-md"
                  : "bg-white border border-zinc-200 text-zinc-700 rounded-bl-md shadow-sm"
              )}>
                <p>{msg.text}</p>
                <p className={cn(
                  "text-[9px] mt-1.5",
                  msg.from === "patient" ? "text-amber-200" : "text-zinc-400"
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
