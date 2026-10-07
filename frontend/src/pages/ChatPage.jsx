import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as chatService from '../services/chatService';
import * as uploadService from '../services/uploadService';
import { connectSocket, getSocket } from '../services/socket';
import VerifiedBadge from '../components/VerifiedBadge';
import {
  MessageSquare,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Search,
  ArrowLeft,
  Loader2,
  Package,
  Clock,
  Circle,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  ExternalLink,
  Smile
} from 'lucide-react';

export default function ChatPage() {
  const { conversationId: paramConvId } = useParams();
  const [searchParams] = useSearchParams();
  const queryConvId = searchParams.get('id') || searchParams.get('conversationId');
  const targetConvId = paramConvId || queryConvId;

  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeConvRef = useRef(activeConv);

  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // 1. Initial Load: Fetch Conversations and Connect Socket
  useEffect(() => {
    if (!user) return;

    fetchConversations();
    const socket = connectSocket();

    // Socket Event Handlers
    socket.on('online_users_list', (usersList) => {
      setOnlineUsers(new Set(usersList));
    });

    socket.on('user_status_changed', ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === 'online') {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    socket.on('new_message', ({ conversationId, message }) => {
      const currentActive = activeConvRef.current;

      if (currentActive && currentActive._id === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        scrollToBottom(true);

        // Mark as read immediately since user is actively in conversation
        if (message.senderId?._id !== user._id) {
          chatService.markMessagesAsRead(conversationId);
          socket.emit('mark_read', { conversationId });
        }
      }

      // Update conversations sidebar list
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv._id === conversationId) {
            const isViewing = currentActive && currentActive._id === conversationId;
            const currentUnread = conv.unreadCounts?.[user._id] || 0;
            return {
              ...conv,
              lastMessage: {
                text: message.text || (message.attachments?.length ? 'Sent an attachment' : ''),
                senderId: message.senderId,
                createdAt: message.createdAt
              },
              unreadCounts: {
                ...conv.unreadCounts,
                [user._id]: isViewing ? 0 : currentUnread + 1
              },
              updatedAt: new Date().toISOString()
            };
          }
          return conv;
        });

        // Re-sort with most recent first
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });

    socket.on('user_typing', ({ conversationId, userId }) => {
      if (activeConvRef.current && activeConvRef.current._id === conversationId && userId !== user._id) {
        setIsPeerTyping(true);
      }
    });

    socket.on('user_stopped_typing', ({ conversationId, userId }) => {
      if (activeConvRef.current && activeConvRef.current._id === conversationId && userId !== user._id) {
        setIsPeerTyping(false);
      }
    });

    socket.on('messages_read', ({ conversationId }) => {
      if (activeConvRef.current && activeConvRef.current._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId?._id === user._id || m.senderId === user._id
              ? { ...m, read: true }
              : m
          )
        );
      }
    });

    return () => {
      socket.off('online_users_list');
      socket.off('user_status_changed');
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
      socket.off('messages_read');
    };
  }, [user]);

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      setLoadingConvs(true);
      const res = await chatService.getUserConversations();
      const list = res.data?.conversations || [];
      setConversations(list);

      // Auto-select conversation if targetConvId provided
      if (targetConvId) {
        const found = list.find((c) => c._id === targetConvId);
        if (found) {
          selectConversation(found);
        } else {
          // If conversation is newly created or not in list, fetch directly
          fetchSingleConversation(targetConvId);
        }
      } else if (list.length > 0 && window.innerWidth >= 768 && !activeConv) {
        // On desktop, auto-open the first conversation
        selectConversation(list[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const fetchSingleConversation = async (convId) => {
    try {
      const res = await chatService.getConversationById(convId);
      if (res.data?.conversation) {
        const conv = res.data.conversation;
        setConversations((prev) => [conv, ...prev.filter((c) => c._id !== conv._id)]);
        selectConversation(conv);
      }
    } catch (err) {
      console.error('Failed to load single conversation:', err);
    }
  };

  // Select a conversation
  const selectConversation = async (conv) => {
    if (activeConv && activeConv._id === conv._id) return;

    const socket = getSocket();
    if (activeConv) {
      socket.emit('leave_conversation', { conversationId: activeConv._id });
    }

    setActiveConv(conv);
    setIsPeerTyping(false);
    socket.emit('join_conversation', { conversationId: conv._id });

    // Load messages
    try {
      setLoadingMessages(true);
      const res = await chatService.getMessages(conv._id);
      setMessages(res.data?.messages || []);

      // Mark read
      await chatService.markMessagesAsRead(conv._id);
      socket.emit('mark_read', { conversationId: conv._id });

      // Reset unread count locally
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conv._id
            ? { ...c, unreadCounts: { ...c.unreadCounts, [user._id]: 0 } }
            : c
        )
      );

      setTimeout(() => scrollToBottom(false), 50);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Typing event emission
  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    if (!activeConv) return;
    const socket = getSocket();

    socket.emit('typing', { conversationId: activeConv._id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: activeConv._id });
    }, 1500);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!messageText.trim() && attachedFiles.length === 0) || !activeConv) return;

    const textToSend = messageText.trim();
    const filesToSend = [...attachedFiles];

    setMessageText('');
    setAttachedFiles([]);

    const socket = getSocket();
    socket.emit('stop_typing', { conversationId: activeConv._id });

    try {
      // Send via socket first, fallback to REST
      if (socket && socket.connected) {
        socket.emit(
          'send_message',
          {
            conversationId: activeConv._id,
            text: textToSend,
            attachments: filesToSend
          },
          (res) => {
            if (!res?.success) {
              // fallback to REST if socket failed
              fallbackRestSend(textToSend, filesToSend);
            }
          }
        );
      } else {
        await fallbackRestSend(textToSend, filesToSend);
      }
    } catch {
      fallbackRestSend(textToSend, filesToSend);
    }
  };

  const fallbackRestSend = async (text, attachments) => {
    try {
      const res = await chatService.sendMessage({
        conversationId: activeConv._id,
        text,
        attachments
      });
      if (res.data?.message) {
        setMessages((prev) => [...prev, res.data.message]);
        scrollToBottom(true);
      }
    } catch (err) {
      alert('Failed to send message: ' + (err.message || 'Error occurred'));
    }
  };

  // Handle file attachment upload via ImageKit
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingFiles(true);
      const res = await uploadService.uploadDeliveryFiles(files);
      const urls = res.data?.data?.urls || [];
      const newAttachments = urls.map((url, i) => ({
        url,
        name: files[i]?.name || `attachment_${i + 1}`,
        fileType: files[i]?.type?.includes('image') ? 'image' : 'file'
      }));
      setAttachedFiles((prev) => [...prev, ...newAttachments]);
    } catch (err) {
      alert('File upload failed: ' + (err.message || 'Error'));
    } finally {
      setUploadingFiles(false);
    }
  };

  // Helper to extract the other peer in conversation
  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants) return {};
    return conv.participants.find((p) => p._id !== user?._id) || conv.participants[0] || {};
  };

  // Filtered conversations by search
  const filteredConversations = conversations.filter((c) => {
    const other = getOtherParticipant(c);
    const name = other.name || '';
    const college = other.collegeName || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || college.toLowerCase().includes(query);
  });

  const activePeer = getOtherParticipant(activeConv);
  const isPeerOnline = activePeer?._id && onlineUsers.has(activePeer._id.toString());

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-100 flex overflow-hidden">
      <div className="max-w-7xl w-full mx-auto flex h-full shadow-lg bg-white overflow-hidden sm:my-3 sm:rounded-3xl sm:border border-slate-200">
        {/* LEFT COLUMN: Conversations List */}
        <div
          className={`${
            activeConv ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 bg-white shrink-0`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">Messages</h1>
                <p className="text-xs text-slate-400">Campus peer direct chat</p>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search peers or colleges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {loadingConvs ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                <span className="text-xs">Loading conversations...</span>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = activeConv?._id === conv._id;
                const isOnline = other._id && onlineUsers.has(other._id.toString());
                const unread = conv.unreadCounts?.[user?._id] || 0;

                const timeStr = conv.lastMessage?.createdAt
                  ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '';

                return (
                  <button
                    key={conv._id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-r-4 border-indigo-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Peer Avatar with status badge */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white font-bold text-sm flex items-center justify-center overflow-hidden">
                        {other.profileImage ? (
                          <img
                            src={other.profileImage}
                            alt={other.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{other.name?.charAt(0).toUpperCase() || 'U'}</span>
                        )}
                      </div>
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Metadata & Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {other.name || 'Student Peer'}
                          </span>
                          {other.isVerifiedStudent && <VerifiedBadge size="sm" />}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {timeStr}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 truncate mb-1">
                        {other.collegeName}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${unread > 0 ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                          {conv.lastMessage?.text || 'No messages yet'}
                        </p>
                        {unread > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-full shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No conversations found</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Browse gigs in the marketplace or check your orders to start chatting with campus peers!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Panel */}
        <div
          className={`${
            activeConv ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col bg-slate-50/50 h-full overflow-hidden`}
        >
          {activeConv ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setActiveConv(null)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white font-bold text-sm flex items-center justify-center overflow-hidden">
                      {activePeer.profileImage ? (
                        <img
                          src={activePeer.profileImage}
                          alt={activePeer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{activePeer.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    {isPeerOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/profile/${activePeer._id}`}
                        className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition truncate"
                      >
                        {activePeer.name}
                      </Link>
                      {activePeer.isVerifiedStudent && <VerifiedBadge size="sm" />}
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400 truncate">{activePeer.collegeName}</span>
                      <span className="text-slate-300">•</span>
                      <span
                        className={`font-semibold flex items-center gap-1 ${
                          isPeerOnline ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        <Circle className="w-2 h-2 fill-current" />
                        {isPeerOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right context actions: Related gig or order */}
                <div className="flex items-center gap-2 shrink-0">
                  {activeConv.orderId && (
                    <Link
                      to={`/orders/${activeConv.orderId._id || activeConv.orderId}`}
                      className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View Order</span>
                    </Link>
                  )}
                  {activeConv.serviceId && (
                    <Link
                      to={`/services/${activeConv.serviceId._id || activeConv.serviceId}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">View Gig</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Message History List */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {loadingMessages ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                    <span className="text-xs">Loading message history...</span>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                    const time = new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl text-xs sm:text-sm shadow-xs ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                          }`}
                        >
                          {/* Message Text */}
                          {msg.text && (
                            <p className="whitespace-pre-wrap leading-relaxed break-words">
                              {msg.text}
                            </p>
                          )}

                          {/* Attachments if any */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              {msg.attachments.map((att, aIdx) => (
                                <a
                                  key={aIdx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-2 rounded-xl text-xs transition ${
                                    isMe
                                      ? 'bg-white/10 hover:bg-white/20 text-white'
                                      : 'bg-slate-100 hover:bg-slate-200 text-indigo-700 font-semibold'
                                  }`}
                                >
                                  {att.fileType === 'image' ? (
                                    <ImageIcon className="w-4 h-4 shrink-0" />
                                  ) : (
                                    <FileText className="w-4 h-4 shrink-0" />
                                  )}
                                  <span className="truncate max-w-[180px]">{att.name || 'Attachment'}</span>
                                  <ExternalLink className="w-3 h-3 ml-auto opacity-70 shrink-0" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message Timestamp & Read Status */}
                        <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400">
                          <span>{time}</span>
                          {isMe && (
                            <span>
                              {msg.read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-sky-500 inline" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400 inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <MessageSquare className="w-10 h-10 text-indigo-200 mb-2" />
                    <h4 className="text-sm font-bold text-slate-700">No messages yet</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Say hello to {activePeer.name}! Discuss project specifications, requirements, or delivery details.
                    </p>
                  </div>
                )}

                {/* Peer Typing Indicator Bubble */}
                {isPeerTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                      {activePeer.name?.charAt(0)}
                    </div>
                    <span className="italic">{activePeer.name} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Attached Files Staging Area */}
              {attachedFiles.length > 0 && (
                <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
                  <span className="font-semibold text-slate-600">Attached:</span>
                  {attachedFiles.map((file, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-indigo-700 flex items-center gap-1"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button
                        onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-500 ml-1 font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Message Input Bar */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  {/* File Upload via ImageKit */}
                  <label className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition cursor-pointer shrink-0">
                    {uploadingFiles ? (
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    ) : (
                      <Paperclip className="w-5 h-5" />
                    )}
                    <input
                      type="file"
                      multiple
                      disabled={uploadingFiles}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={messageText}
                    onChange={handleInputChange}
                    placeholder={`Message ${activePeer.name || 'peer'}...`}
                    className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={(!messageText.trim() && attachedFiles.length === 0) || uploadingFiles}
                    className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-100 transition cursor-pointer disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Your Campus Messages</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select an existing conversation from the list, or contact a freelancer from their gig page to start collaborating.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
