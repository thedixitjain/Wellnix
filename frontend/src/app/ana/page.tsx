'use client';

import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import type { ChatMessage as ChatMsg } from '@/lib/types';
import ChatMessage from '@/components/ana/ChatMessage';
import ChatInput from '@/components/ana/ChatInput';
import ChatSuggestions from '@/components/ana/ChatSuggestions';

export default function AnaPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput('');

    const userMsg: ChatMsg = { role: 'user', content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setSending(true);

    try {
      const res = await apiFetch<{ reply: string }>('/ana/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: msg,
          history: updated.slice(-10),
        }),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, something went wrong: ${err.message || 'Unknown error'}` },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-130px)] max-w-3xl flex-col px-4 py-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3z" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-lg font-bold">Ana</h1>
          <p className="text-xs text-text-tertiary">Your Nutrition Assistant</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <ChatSuggestions onSelect={(t) => sendMessage(t)} />
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <ChatMessage key={i} role={m.role} content={m.content} />
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-bg-tertiary px-5 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-text-tertiary [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-text-tertiary [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-text-tertiary [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border pt-4">
        <ChatInput value={input} onChange={setInput} onSend={() => sendMessage()} disabled={sending} />
      </div>
    </div>
  );
}
