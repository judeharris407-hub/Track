'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Headphones,
  Package,
  Clock,
  Minimize2,
  ExternalLink,
  Phone,
  SendHorizontal,
  Wifi,
  WifiOff,
} from 'lucide-react';
import socket from '@/lib/socket';
import { getOrCreateGuestId } from '@/lib/guest';

interface ChatMessage {
  id?: number;
  thread_id?: number;
  sender_type: 'guest' | 'support' | 'system';
  message: string;
  created_at?: string;
  isPending?: boolean;
}

interface ChatWidgetProps {
  trackingNumber?: string | null;
  defaultOpen?: boolean;
}

export default function ChatWidget({ trackingNumber = null, defaultOpen = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'web' | 'whatsapp' | 'telegram'>('web');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [guestId, setGuestId] = useState<string>('');
  const [threadId, setThreadId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WhatsApp & Telegram configuration (with fallbacks)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+14155238886';
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const telegramBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ShipNGoSupportBot';

  const defaultSupportMessage = trackingNumber
    ? `Hello ShipNGo Support, I need assistance with my tracking number: ${trackingNumber}`
    : 'Hello ShipNGo Support, I need assistance with my package.';

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultSupportMessage)}`;
  const telegramUrl = `https://t.me/${telegramBotUsername}?start=${encodeURIComponent(trackingNumber || 'support')}`;

  // Initialize guest ID
  useEffect(() => {
    const id = getOrCreateGuestId();
    setGuestId(id);
  }, []);

  // Join or rejoin room
  const joinChatThread = useCallback(() => {
    if (!guestId) return;
    socket.emit('join_thread', {
      guestId,
      trackingNumber,
      channel: 'web',
    });
  }, [guestId, trackingNumber]);

  // Track socket connection status and attach listeners
  useEffect(() => {
    const syncStatus = () => {
      setIsConnected(Boolean(socket && socket.connected));
    };

    const onConnect = () => {
      console.log('[Socket] Connected to backend successfully. ID:', socket.id);
      setIsConnected(true);
      joinChatThread();
    };

    const onConnectError = (error: Error) => {
      console.error('[Socket] Connection error:', error.message || error);
      setIsConnected(false);
    };

    const onDisconnect = (reason: string) => {
      console.warn('[Socket] Disconnected from server. Reason:', reason);
      setIsConnected(false);
    };

    const handleThreadHistory = (data: { thread: { id: number }; messages: ChatMessage[] }) => {
      if (data?.thread?.id) {
        setThreadId(data.thread.id);
      }
      if (data?.messages) {
        setMessages(data.messages);
      }
    };

    const handleReceiveMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        // Replace optimistic pending message if matched
        const filtered = prev.filter((m) => !(m.isPending && m.message === msg.message));
        return [...filtered, msg];
      });
      if (!isOpen && msg.sender_type === 'support') {
        setUnreadCount((c) => c + 1);
      }
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);
    socket.on('thread_history', handleThreadHistory);
    socket.on('receive_message', handleReceiveMessage);

    syncStatus();
    const statusInterval = setInterval(syncStatus, 1000);

    if (socket.connected) {
      setIsConnected(true);
      joinChatThread();
    }

    return () => {
      clearInterval(statusInterval);
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
      socket.off('thread_history', handleThreadHistory);
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [joinChatThread, isOpen]);

  // Scroll to bottom when messages or open state changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  const toggleChat = () => {
    if (!isOpen) {
      setUnreadCount(0);
      joinChatThread();
    }
    setIsOpen(!isOpen);
  };

  // Robust send message handler with optimistic rendering
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text) return;

    // Optimistic UI update
    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      thread_id: threadId || undefined,
      sender_type: 'guest',
      message: text,
      created_at: new Date().toISOString(),
      isPending: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage('');
    setIsSending(true);

    if (!socket.connected) {
      socket.connect();
    }

    // Emit send_message with threadId, guestId, and trackingNumber for robust backend fallback
    socket.emit(
      'send_message',
      {
        threadId: threadId || null,
        guestId: guestId || getOrCreateGuestId(),
        trackingNumber: trackingNumber || null,
        channel: 'web',
        senderType: 'guest',
        message: text,
      },
      (res: { success: boolean; data?: ChatMessage; error?: string }) => {
        setIsSending(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMsg.id
              ? { ...(res?.data || m), isPending: false }
              : m
          )
        );
      }
    );

    // Fallback timer to remove sending indicator after network delay
    setTimeout(() => {
      setIsSending(false);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? { ...m, isPending: false } : m))
      );
    }, 1500);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-600/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group border-2 border-white cursor-pointer"
          aria-label="Open live customer support chat"
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

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[520px] max-h-[85vh] z-50 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">ShipNGo Support</h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-300'
                    }`}
                  />
                  {isConnected ? 'Live Agent Connected' : 'Connecting to Server...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleChat}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggleChat}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Multi-Channel Tabs (Web Chat, WhatsApp, Telegram) */}
          <div className="bg-slate-100 px-3 pt-2 pb-1 border-b border-slate-200 flex gap-2">
            <button
              onClick={() => setActiveTab('web')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'web'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Web Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveTab('telegram')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'telegram'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-sky-600 hover:bg-sky-50'
              }`}
            >
              <SendHorizontal className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>
          </div>

          {/* Tracking Context Chip */}
          {trackingNumber && (
            <div className="px-4 py-1.5 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between text-xs text-blue-800">
              <span className="font-medium flex items-center gap-1.5 truncate">
                <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                Tracking: <strong className="font-mono">{trackingNumber}</strong>
              </span>
            </div>
          )}

          {/* Tab 1: Web Chat Interface */}
          {activeTab === 'web' && (
            <>
              {/* Messages Viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
                {/* Welcome Card */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 shadow-sm leading-relaxed">
                  <p className="font-semibold text-slate-900 mb-1">Welcome to ShipNGo Support! 👋</p>
                  <p>How can we assist you with your package tracking, rates, or delivery dispatch today?</p>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
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
                          {msg.isPending && <span className="text-amber-500 italic">• sending...</span>}
                        </div>
                        <div
                          className={`max-w-[84%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed break-words ${
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

              {/* Message Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-full text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/30 shrink-0 cursor-pointer"
                  aria-label="Send Message"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </>
          )}

          {/* Tab 2: WhatsApp Channel Card */}
          {activeTab === 'whatsapp' && (
            <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-emerald-50/50 to-white text-center">
              <div className="space-y-4 pt-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <Phone className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Chat on WhatsApp</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                    Connect directly with our 24/7 customer support team via official WhatsApp.
                  </p>
                </div>

                <div className="p-3 bg-white border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-left space-y-1 shadow-sm">
                  <p className="font-semibold">WhatsApp Number:</p>
                  <p className="font-mono text-slate-700">{whatsappNumber}</p>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Phone className="w-4 h-4" />
                <span>Open WhatsApp Chat</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Tab 3: Telegram Channel Card */}
          {activeTab === 'telegram' && (
            <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-sky-50/50 to-white text-center">
              <div className="space-y-4 pt-4">
                <div className="w-16 h-16 rounded-full bg-sky-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/30">
                  <SendHorizontal className="w-8 h-8 ml-0.5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Chat on Telegram</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                    Get instant dispatch updates and live assistance through our Telegram Support Bot.
                  </p>
                </div>

                <div className="p-3 bg-white border border-sky-200 rounded-2xl text-xs text-sky-900 text-left space-y-1 shadow-sm">
                  <p className="font-semibold">Telegram Bot:</p>
                  <p className="font-mono text-slate-700">@{telegramBotUsername}</p>
                </div>
              </div>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <SendHorizontal className="w-4 h-4" />
                <span>Open Telegram Bot</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
