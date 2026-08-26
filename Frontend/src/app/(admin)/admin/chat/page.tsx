'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  User,
  Headphones,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Package,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import api from '@/lib/api';
import socket from '@/lib/socket';

interface ChatThread {
  id: number;
  guest_id: string;
  tracking_number: string | null;
  channel: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_sender?: string;
  last_message_time?: string;
  total_messages?: number;
}

interface ChatMessage {
  id: number;
  thread_id: number;
  sender_type: 'guest' | 'support' | 'system';
  message: string;
  created_at: string;
}

export default function AdminLiveChatDeskPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [statusFilter, setStatusFilter] = useState('open');
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch threads list
  const fetchThreads = async () => {
    setLoadingThreads(true);
    try {
      const response = await api.get(`/admin/chat/threads?status=${statusFilter === 'ALL' ? '' : statusFilter}`);
      if (response.data?.success) {
        const fetchedThreads = response.data.data || [];
        setThreads(fetchedThreads);
        if (!selectedThread && fetchedThreads.length > 0) {
          selectThread(fetchedThreads[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load threads:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [statusFilter]);

  // Select a thread and join via Socket.IO
  const selectThread = async (thread: ChatThread) => {
    setSelectedThread(thread);
    setLoadingMessages(true);

    try {
      const response = await api.get(`/admin/chat/threads/${thread.id}`);
      if (response.data?.success) {
        setMessages(response.data.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch thread messages:', err);
    } finally {
      setLoadingMessages(false);
    }

    // Join room as support agent
    socket.emit('agent_join_thread', { threadId: thread.id });
  };

  // Socket listener for real-time messages
  useEffect(() => {
    const handleReceiveMessage = (msg: ChatMessage) => {
      // If message belongs to currently open thread, append it
      if (selectedThread && msg.thread_id === selectedThread.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }

      // Update last message preview in threads list
      setThreads((prev) =>
        prev.map((t) =>
          t.id === msg.thread_id
            ? {
                ...t,
                last_message: msg.message,
                last_message_sender: msg.sender_type,
                last_message_time: msg.created_at,
                updated_at: msg.created_at,
              }
            : t
        )
      );
    };

    const handleThreadUpdated = (updatedThread: ChatThread) => {
      setThreads((prev) =>
        prev.map((t) => (t.id === updatedThread.id ? { ...t, ...updatedThread } : t))
      );
      if (selectedThread && selectedThread.id === updatedThread.id) {
        setSelectedThread((prev) => (prev ? { ...prev, ...updatedThread } : null));
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('admin_thread_updated', handleThreadUpdated);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('admin_thread_updated', handleThreadUpdated);
    };
  }, [selectedThread]);

  // Scroll messages to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedThread]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedThread) return;

    socket.emit('send_message', {
      threadId: selectedThread.id,
      senderType: 'support',
      message: inputMessage.trim(),
    });

    setInputMessage('');
  };

  const handleCloseThread = async () => {
    if (!selectedThread) return;

    try {
      const response = await api.put(`/admin/chat/threads/${selectedThread.id}/status`, {
        status: selectedThread.status === 'open' ? 'closed' : 'open',
      });

      if (response.data?.success) {
        const updated = response.data.data;
        setSelectedThread((prev) => (prev ? { ...prev, status: updated.status } : null));
        fetchThreads();
      }
    } catch (err) {
      console.error('Failed to change thread status:', err);
    }
  };

  const filteredThreads = threads.filter((t) => {
    const q = searchFilter.toLowerCase();
    return (
      t.guest_id.toLowerCase().includes(q) ||
      (t.tracking_number && t.tracking_number.toLowerCase().includes(q)) ||
      (t.last_message && t.last_message.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Agent Live Chat Desk</h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Resolve customer shipment inquiries with real-time bidirectional WebSocket messaging
          </p>
        </div>

        <button
          onClick={fetchThreads}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Refresh threads"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Main Chat Interface Split View */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: Active Threads List */}
        <div className="md:col-span-4 lg:col-span-4 glass-card rounded-3xl flex flex-col overflow-hidden border border-slate-800">
          {/* Filters & Search */}
          <div className="p-3.5 border-b border-slate-800 space-y-2.5 bg-slate-950/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search guest ID, tracking..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-1.5">
              {['open', 'closed', 'ALL'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold uppercase transition-all ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Threads Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {loadingThreads ? (
              <div className="p-10 text-center text-xs text-slate-500">
                <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                <span>Loading active threads...</span>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <span>No chat threads found.</span>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = selectedThread?.id === thread.id;
                const isOpen = thread.status === 'open';
                return (
                  <button
                    key={thread.id}
                    onClick={() => selectThread(thread)}
                    className={`w-full text-left p-4 transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-l-4 border-indigo-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm">
                        <User className="w-4 h-4" />
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${
                          isOpen ? 'bg-emerald-400' : 'bg-slate-600'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-white truncate">
                          {thread.guest_id}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {thread.last_message_time
                            ? new Date(thread.last_message_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      {thread.tracking_number && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px] font-mono font-semibold mb-1 border border-indigo-500/20">
                          <Package className="w-2.5 h-2.5" />
                          {thread.tracking_number}
                        </span>
                      )}

                      <p className="text-xs text-slate-400 truncate leading-relaxed">
                        {thread.last_message || 'Thread initiated'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Window */}
        <div className="md:col-span-8 lg:col-span-8 glass-card rounded-3xl flex flex-col overflow-hidden border border-slate-800 shadow-2xl">
          {selectedThread ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-500/20">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white font-mono">
                        {selectedThread.guest_id}
                      </h2>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          selectedThread.status === 'open'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-700/40 text-slate-400 border-slate-600'
                        }`}
                      >
                        {selectedThread.status.toUpperCase()}
                      </span>
                    </div>

                    {selectedThread.tracking_number && (
                      <Link
                        href={`/track/${selectedThread.tracking_number}`}
                        target="_blank"
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1 mt-0.5 group"
                      >
                        <span>Bound Shipment: {selectedThread.tracking_number}</span>
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCloseThread}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm ${
                    selectedThread.status === 'open'
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {selectedThread.status === 'open' ? 'Resolve & Close Thread' : 'Reopen Thread'}
                </button>
              </div>

              {/* Message History Viewport */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/40">
                {loadingMessages ? (
                  <div className="p-10 text-center text-xs text-slate-500">
                    <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading conversation history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-indigo-400 opacity-40" />
                    <span>No messages in this thread yet. Send a response below!</span>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isSupport = msg.sender_type === 'support';
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col ${isSupport ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
                          {isSupport ? (
                            <>
                              <span className="text-indigo-400 font-bold">You (Support Agent)</span>
                              <Headphones className="w-3 h-3 text-indigo-400" />
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="font-semibold text-slate-300">
                                Guest ({selectedThread.guest_id})
                              </span>
                            </>
                          )}
                          <span className="font-mono text-slate-600">
                            {msg.created_at
                              ? new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>

                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            isSupport
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none shadow-md shadow-indigo-600/25'
                              : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
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

              {/* Reply Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center gap-2.5 shrink-0"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type an official logistics support response..."
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700/60 rounded-2xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4 shadow-inner">
                <MessageSquare className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-base font-bold text-slate-300 mb-1">No Active Thread Selected</h3>
              <p className="text-xs max-w-xs text-slate-500 leading-relaxed">
                Choose a customer conversation from the left queue to respond and resolve inquiries in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
