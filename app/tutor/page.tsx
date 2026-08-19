"use client";
import { useState } from "react";
import { aiApi } from "@/lib/api";
import { AppShell, Button } from "@/components/ui";

type Message = { role: "tutor" | "student"; text: string };

export default function TutorPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "tutor", text: "Hi Alex. What are you working through today? I can explain a concept, quiz you, or help you make a plan." }]);

  async function sendMessage() {
    const message = input.trim();
    if (!message || loading) return;
    setError("");
    setInput("");
    const nextMessages = [...messages, { role: "student" as const, text: message }];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const response = await aiApi.tutor({ message, history: messages.map(({ role, text }) => ({ role, message: text })) });
      setMessages([...nextMessages, { role: "tutor", text: response.reply }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The tutor is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return <AppShell title="AI tutor" description="A patient study partner for the moments that need another angle."><div className="mx-auto max-w-4xl"><div className="panel overflow-hidden"><div className="flex items-center gap-3 border-b border-slate-700/70 p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/20 text-blue-300">✦</span><div><p className="text-sm font-semibold">StudyMate tutor</p><p className="mt-1 text-xs text-emerald-300">{loading ? "Thinking..." : "Ready to help"}</p></div></div><div className="min-h-[420px] space-y-5 p-5 sm:p-8">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === "student" ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "student" ? "bg-blue-500 text-white" : "border border-slate-700/70 bg-slate-950/40 text-slate-300"}`}>{message.text}</div></div>)}{loading && <p className="text-sm text-slate-500">The tutor is thinking...</p>}{error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}</div><div className="border-t border-slate-700/70 p-4"><div className="flex gap-3"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(); }} placeholder="Ask about a concept..." className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400" /><Button onClick={() => void sendMessage()}>{loading ? "Thinking..." : "Send"} {!loading && <span>↑</span>}</Button></div><p className="mt-3 text-center text-xs text-slate-600">Powered by the StudyMate AI backend</p></div></div></div></AppShell>;
}
