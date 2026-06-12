"use client";

import { useState, useEffect, useRef } from "react";
import { useSocketStore } from "@/store/socketStore";
import { useAuthStore } from "@/store/authStore";

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: Date;
}

export default function SOSChat({ incidentId }: { incidentId: string }) {
  const { socket, isConnected } = useSocketStore();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("join_incident_room", incidentId);

    socket.on("chat:receive", (data: any) => {
      setMessages((prev) => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        senderId: data.senderId,
        message: data.message,
        timestamp: new Date(data.timestamp),
      }]);
      // Scroll to bottom
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => {
      socket.off("chat:receive");
    };
  }, [socket, isConnected, incidentId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    socket.emit("chat:send", { incidentId, message: input.trim() });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <div className="bg-slate-800 p-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200">
          <span className="status-dot online mr-2" />
          Direct Dispatch Chat
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            Send a message to your responder...
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === user?.id;
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
                  }`}
                >
                  {m.message}
                  <div className={`text-[10px] mt-1 ${isMe ? "text-blue-200" : "text-slate-400"}`}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
