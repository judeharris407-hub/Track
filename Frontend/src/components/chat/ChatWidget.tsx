'use client';

import { useEffect, useState, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Headphones,
  User,
  Package,
  Clock,
  Sparkles,
  Minimize2,
} from 'lucide-react';
import socket from '@/lib/socket';
import { getOrCreateGuestId } from '@/lib/guest';

interface ChatMessage {
  id?: number;
  thread_id?: number;
  sender_type: 'guest' | 'support' | 'system';
  message: string;
  created_at?: string;
}

interface ChatWidgetProps {
  trackingNumber?: string | null;
  defaultOpen?: boolean;
}

export default function ChatWidget({ trackingNumber = null, defaultOpen = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [guestId, setGuestId] = useState<string>('');
  const [threadId, setThreadId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize guest ID
  useEffect(() => {
    const id = getOrCreateGuestId();
    setGuestId(id);
  }, []);

  // Connect socket and join thread when opened or when guestId/trackingNumber change
  useEffect(() => {
    if (!guestId) return;

    // Join or create thread for this guest
    socket.emit('join_thread', {
      guestId,
      trackingNumber,
      channel: 'web',
    });

    const handleThreadHistory = (data: { thread: { id: number }; messages: ChatMessage[] }) => {
      if (data?.thread) {
        setThreadId(data.thread.id);
      }
      if (data?.messages) {
        setMessages(data.messages);
      }
    };

    const handleReceiveMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      if (!isOpen && msg.sender_type === 'support') {
        setUnreadCount((c) => c + 1);
      }
    };

    socket.on('thread_history', handleThreadHistory);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('thread_history', handleThreadHistory);
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [guestId, trackingNumber, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    if (!isOpen) {
      setUnreadCount(0);
    }
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !threadId) return;

    socket.emit('send_message', {
      threadId,
      senderType: 'guest',
      message: inputMessage.trim(),
    });

    setInputMessage('');
  };

  return (
    <>
      {/* 1. Blue Circular Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-600/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group border-2 border-white"
          aria-label="Open live support chat"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6 group-hover:scale-105 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
        </button>
      )}

      {/* 2. Chat Drawer Window (Clean Bright Styling) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] z-50 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">Chat with us</h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  We typically reply within minutes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleChat}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                title="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggleChat}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tracking context chip if bound */}
          {trackingNumber && (
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-800">
              <span className="font-medium flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-600" />
                Tracking: <strong className="font-mono">{trackingNumber}</strong>
              </span>
            </div>
          )}

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
            {/* Welcome message bubble */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 shadow-sm leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">Welcome to ShipNGo Support! 👋</p>
              <p>How can we assist you with your package tracking, rates, or delivery dispatch today?</p>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <Clock className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
                <span>Send a message below to start a live conversation.</span>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isGuest = msg.sender_type === 'guest';
                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col ${isGuest ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 px-1">
                      {isGuest ? (
                        <span>You</span>
                      ) : (
                        <span className="font-semibold text-blue-600">ShipNGo Support</span>
                      )}
                      {msg.created_at && (
                        <span>
                          • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        isGuest
                          ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-full text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/30 shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
