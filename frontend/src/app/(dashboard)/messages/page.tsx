// ============================================
// MESSAGES PAGE - QUEST_LOG.EXE PIXEL DESIGN
// ============================================

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MoreVertical,
  Send,
  ArrowLeft,
  ArrowRight,
  X
} from 'lucide-react'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { ProfileModal } from '@/components/ui/ProfileModal'
import { apiClient } from '@/lib/api-client'
import type { ConversationWithDetails, Message as MessageType } from '@/types/api'
import { useMultipleProfileUpdates } from '@/hooks/useProfileUpdates'
import { useAuth } from '@/contexts/AuthContext'
import { io, Socket } from 'socket.io-client'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const currentUserId = user?.id || ''

  const MAX_MESSAGE_LENGTH = 500

  useEffect(() => {
    loadConversations()

    // Initialize Socket.IO
    const apiURL = apiClient.getBaseURL()
    const socketPath = '/socket.io'

    console.log('Connecting to socket at:', apiURL, 'with path:', socketPath)

    const newSocket = io(apiURL, {
      path: socketPath,
      transports: ['websocket', 'polling'], // Allow polling as fallback
      autoConnect: true,
      reconnection: true,
    })

    newSocket.on('connect', () => {
      console.log('Socket.IO connected')
      setIsConnected(true)

      // Identify this connection with the user ID
      if (currentUserId) {
        console.log('Identifying as user:', currentUserId)
        newSocket.emit('identify', currentUserId)
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Socket.IO disconnected')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err)
    })

    newSocket.on('receive-message', (payload: any) => {
      console.log('Socket.IO received message:', payload)

      // If we are the sender, we might ignore this or use it to confirm
      // But usually we filter by ID or content to avoid duplicates from optimistic UI

      const msg: MessageType = {
        id: payload.id || `ws-${Date.now()}`,
        conversation_id: payload.roomId,
        sender_id: payload.userId,
        content: payload.message,
        is_read: false,
        created_at: new Date(payload.timestamp).toISOString(),
      }

      setMessages((prev) => {
        // Avoid duplicates (especially for the sender)
        if (prev.some(m =>
          (m.id === msg.id) ||
          (m.content === msg.content && m.sender_id === msg.sender_id && Math.abs(new Date(m.created_at).getTime() - new Date(msg.created_at).getTime()) < 2000)
        )) {
          return prev
        }
        return [...prev, msg]
      })

      // Update conversations list for the last message preview and unread count
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === payload.roomId) {
            const isSelected = selectedConversation?.id === conv.id
            const isFromMe = payload.userId === currentUserId

            return {
              ...conv,
              last_message: payload.message,
              updated_at: new Date(payload.timestamp).toISOString(),
              unread_count: (!isSelected && !isFromMe) ? (conv.unread_count || 0) + 1 : (conv.unread_count || 0)
            }
          }
          return conv
        })

        return [...updated].sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      })
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)

      if (socket && isConnected) {
        console.log('Joining room:', selectedConversation.id)
        socket.emit('join-room', selectedConversation.id)
      }
    } else {
      setMessages([])
    }
  }, [selectedConversation, socket, isConnected])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Subscribe to profile updates for real-time avatar refresh
  const userIds = conversations.map(c => c.other_participant.id)
  useMultipleProfileUpdates(userIds, async (userId) => {
    // Refetch conversations when any participant's profile is updated
    const data = await apiClient.getConversations()
    setConversations(data || [])

    // If the updated user is in the selected conversation, update that too
    if (selectedConversation && selectedConversation.other_participant.id === userId) {
      const updatedConv = data?.find(c => c.id === selectedConversation.id)
      if (updatedConv) {
        setSelectedConversation(updatedConv)
      }
    }
  })

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getConversations()
      setConversations(data || [])
      if (data && data.length > 0 && !selectedConversation) {
        if (window.innerWidth >= 1024) {
          setSelectedConversation(data[0])
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response: any = await apiClient.getMessages(conversationId)
      setMessages(Array.isArray(response) ? response : (response.data || []))
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const messageContent = newMessage.trim()
    const convoId = selectedConversation.id

    // Clear input immediately for better UX
    setNewMessage('')

    try {
      // Optimistic update
      const optimisticId = `optimistic-${Date.now()}`
      const optimisticMsg: MessageType = {
        id: optimisticId,
        conversation_id: convoId,
        sender_id: currentUserId,
        content: messageContent,
        is_read: false,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimisticMsg])

      // 1. Send via HTTP (Reliable, handles Auth)
      const msg = await apiClient.sendMessage(convoId, { content: messageContent })

      // 2. Update the optimistic message with real server data (ID, Correct Date)
      setMessages((prev) => prev.map(m => m.id === optimisticId ? msg : m))

      // 3. Also update conversations list locally for sorting
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === convoId) {
            return {
              ...conv,
              last_message: messageContent,
              updated_at: msg.created_at,
            }
          }
          return conv
        })
        return [...updated].sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      // Optional: Remove optimistic message or show error status
    }
  }

  const selectConversation = (conv: ConversationWithDetails) => {
    setSelectedConversation(conv)
    setMobileView('chat')
  }

  const filteredConversations = conversations.filter(conv =>
    `${conv.other_participant.first_name} ${conv.other_participant.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (dayDiff === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    } else if (dayDiff < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const getStatusColor = (conv: ConversationWithDetails) => {
    if (conv.other_participant.online) return 'bg-green-500'
    if (conv.unread_count > 0) return 'bg-yellow-400'
    return 'bg-gray-400'
  }

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] w-full overflow-hidden pixel-grid-pattern">
      {/* 1. LEFT SIDEBAR: ACTIVE SPELLS */}
      <div className={`
        ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
        w-full md:w-80 lg:w-[380px] flex-col border-r-4 border-[var(--retro-navy)] bg-[var(--retro-white)] z-20
      `}>
        {/* Sidebar Header - ACTIVE SPELLS */}
        <div className="p-4 border-b-4 border-[var(--retro-navy)] bg-[var(--retro-yellow)]">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-lg font-bold pixel-font tracking-wider text-[var(--retro-navy)]">
              ACTIVE SPELLS
            </h1>
            <button className="p-1 border-2 border-[var(--retro-navy)] retro-window-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              <MoreVertical size={18} className="text-[var(--retro-navy)]" />
            </button>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--retro-navy)]">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="FIND SPELL..."
              className="w-full bg-white border-4 border-[var(--retro-navy)] py-2 pl-10 pr-4 text-sm pixel-font-body text-[var(--retro-navy)] focus:outline-none focus:retro-window-shadow transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Active Users Status Indicators */}
        <div className="px-4 py-3 bg-[var(--retro-cream)] border-b-2 border-[var(--retro-navy)]">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-green-500 border-2 border-[var(--retro-navy)]"></div>
                <span className="text-xs pixel-font text-[var(--retro-navy)]">ACTIVE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-yellow-400 border-2 border-[var(--retro-navy)]"></div>
                <span className="text-xs pixel-font text-[var(--retro-navy)]">NEW</span>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full border-2 border-[var(--retro-navy)] ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-[10px] font-bold pixel-font text-[var(--retro-navy)] uppercase">
                {isConnected ? 'Sync: ON' : 'Sync: OFF'}
              </span>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-40">
              <div className="animate-spin mb-3">
                <PixelIcon name="smiley" size={32} />
              </div>
              <span className="text-xs font-bold pixel-font">SYNCING...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-10 text-center opacity-40">
              <PixelIcon name="bubble" size={48} className="mx-auto mb-4" />
              <p className="text-sm font-medium pixel-font">NO SPELLS FOUND</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`
                  flex items-center gap-3 p-3 mx-2 mt-2 cursor-pointer border-4 border-[var(--retro-navy)] retro-window-shadow
                  ${selectedConversation?.id === conv.id
                    ? 'bg-[var(--retro-yellow)]'
                    : 'bg-white hover:bg-[var(--retro-cream)]'
                  }
                  transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none
                `}
              >
                {/* Status Square */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 border-4 border-[var(--retro-navy)] retro-window-shadow flex items-center justify-center ${getStatusColor(conv)}`}>
                    <PixelIcon name="smiley" size={20} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold pixel-font text-[var(--retro-navy)] truncate">
                      {conv.other_participant.first_name} {conv.other_participant.last_name}
                    </h4>
                    <span className="text-[10px] font-bold pixel-font text-[var(--retro-navy)] ml-2">
                      {conv.updated_at ? formatTime(conv.updated_at) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs truncate pixel-font-body text-[var(--retro-navy)]">
                      {conv.last_message || "START QUEST..."}
                    </p>
                    {conv.unread_count > 0 && (
                      <div className="bg-[var(--retro-magenta)] text-white w-6 h-6 border-2 border-[var(--retro-navy)] retro-window-shadow flex items-center justify-center text-xs font-bold pixel-font">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. CENTER: Chat Window - QUEST_LOG.EXE */}
      <div className={`
        ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
        flex-1 flex-col relative
      `}>
        {selectedConversation ? (
          <div className="flex flex-col h-full border-4 border-[var(--retro-navy)] retro-window-shadow bg-white">
            {/* Chat Header - QUEST_LOG.EXE */}
            <header className="h-16 flex items-center justify-between px-4 bg-black border-b-4 border-[var(--retro-navy)]">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-2 -ml-2 border-2 border-white bg-[var(--retro-yellow)] retro-window-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <ArrowLeft size={18} className="text-black" />
                </button>
                <div
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                  onClick={() => setProfileModalUserId(selectedConversation.other_participant.id)}
                >
                  <div className="w-10 h-10 border-2 border-[var(--retro-cyan)] bg-[var(--retro-cyan)] flex items-center justify-center">
                    <PixelIcon name="smiley" size={16} className="text-black" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold pixel-font text-white leading-tight">
                        {selectedConversation.other_participant.first_name}
                      </h3>
                      <span className="text-xs font-bold pixel-font text-[var(--retro-yellow)]">
                        Lvl 99
                      </span>
                    </div>
                    <p className="text-[10px] font-bold pixel-font text-[var(--retro-cyan)] uppercase">
                      {selectedConversation.other_participant.online ? "ONLINE" : "OFFLINE"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-2">
                <button className="w-6 h-6 border-2 border-white bg-[var(--retro-red)]"></button>
                <button className="w-6 h-6 border-2 border-white bg-[var(--retro-yellow)]"></button>
                <button className="w-6 h-6 border-2 border-white bg-[var(--retro-cyan)]"></button>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth custom-scrollbar bg-[var(--retro-cream)]">
              <div className="flex flex-col max-w-4xl mx-auto space-y-3">
                {/* Profile Header */}
                <div className="flex flex-col items-center py-6 mb-4 border-4 border-[var(--retro-navy)] retro-window-shadow bg-white">
                  <div className="w-20 h-20 border-4 border-[var(--retro-navy)] bg-[var(--retro-cyan)] flex items-center justify-center mb-3 retro-window-shadow">
                    <PixelIcon name="smiley" size={32} className="text-black" />
                  </div>
                  <h2 className="text-lg font-bold pixel-font text-[var(--retro-navy)]">
                    {selectedConversation.other_participant.first_name}
                  </h2>
                  <p className="text-sm pixel-font-body text-[var(--retro-navy)] mt-1">WIZARD SOCIAL NETWORKS</p>
                  <button
                    onClick={() => setProfileModalUserId(selectedConversation.other_participant.id)}
                    className="mt-3 px-4 py-2 bg-[var(--retro-yellow)] text-[var(--retro-navy)] text-xs font-bold pixel-font border-4 border-[var(--retro-navy)] retro-window-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                  >
                    VIEW PROFILE
                  </button>
                </div>

                {messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender_id === currentUserId
                    const prevMsg = messages[idx - 1]
                    const nextMsg = messages[idx + 1]
                    const isFirstInGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id
                    const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id
                    const timeDiff = prevMsg ? (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) / 60000 : 0
                    const showTimestamp = isFirstInGroup && timeDiff > 15

                    return (
                      <div key={msg.id} className="w-full">
                        {showTimestamp && (
                          <div className="flex justify-center my-4">
                            <p className="text-[10px] font-bold pixel-font text-[var(--retro-navy)] uppercase tracking-wider border-2 border-[var(--retro-navy)] px-3 py-1 bg-white">
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-end gap-2 mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {/* Avatar - Show for first message in group */}
                          {isFirstInGroup && (
                            <div className={`w-10 h-10 flex-shrink-0 border-2 border-[var(--retro-navy)] overflow-hidden ${isMe ? 'order-2' : ''} ${isMe ? 'bg-[var(--retro-magenta)]' : 'bg-[var(--retro-cyan)]'} flex items-center justify-center`}>
                              {isMe ? (
                                <PixelIcon name="smiley" size={20} className="text-white" />
                              ) : (
                                <PixelIcon name="smiley" size={20} className="text-black" />
                              )}
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`
                              max-w-[70%] px-4 py-3 text-sm transition-all border-4 border-[var(--retro-navy)] retro-window-shadow
                              ${isMe
                                ? 'bg-[var(--retro-magenta)] text-white'
                                : 'bg-[var(--retro-cyan)] text-black'
                              }
                            `}
                          >
                            {/* Name Badge - Only show for first message in group */}
                            {isFirstInGroup && (
                              <div className={`flex items-center gap-2 mb-2 ${isMe ? 'justify-end' : ''}`}>
                                <span className="text-[11px] font-bold pixel-font">
                                  {isMe ? 'YOU' : selectedConversation.other_participant.first_name}
                                </span>
                                <span className="text-[9px] font-bold pixel-font bg-white text-black px-2 py-0.5 border-2 border-black">
                                  Lvl {isMe ? '99' : '4'}
                                </span>
                              </div>
                            )}
                            <p className="leading-relaxed whitespace-pre-wrap pixel-font-body text-[14px]">{msg.content}</p>
                            <p className={`text-[10px] font-bold pixel-font mt-2 ${isMe ? 'text-white/70' : 'text-black/70'}`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-40">
                    <PixelIcon name="bubble" size={80} />
                    <p className="text-sm font-bold mt-4 pixel-font uppercase tracking-widest">NO TRANSMISSIONS</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t-4 border-[var(--retro-navy)]">
              <div className="max-w-4xl mx-auto border-4 border-[var(--retro-navy)] retro-window-shadow bg-white p-3">
                <div className="flex items-end gap-3">
                  <textarea
                    rows={1}
                    placeholder="ENTER MESSAGE..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] resize-none pixel-font-body text-[var(--retro-navy)] placeholder:text-gray-400 min-h-[44px]"
                    value={newMessage}
                    maxLength={MAX_MESSAGE_LENGTH}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                        e.currentTarget.style.height = 'auto'
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !selectedConversation || !socket}
                    className={`px-6 py-3 text-black font-bold pixel-font border-4 border-[var(--retro-navy)] retro-window-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 ${!newMessage.trim() || !selectedConversation || !socket
                      ? 'bg-gray-200 cursor-not-allowed'
                      : isConnected
                        ? 'bg-[var(--retro-yellow)]'
                        : 'bg-orange-300'
                      }`}
                  >
                    <span>{isConnected ? 'SEND' : 'SYNC...'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <span className="text-xs pixel-font text-[var(--retro-navy)]">
                    {newMessage.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white border-4 border-[var(--retro-navy)] retro-window-shadow">
            <div className="w-24 h-24 border-4 border-[var(--retro-navy)] bg-[var(--retro-yellow)] flex items-center justify-center mb-6 retro-window-shadow">
              <PixelIcon name="bubble" size={48} className="text-[var(--retro-navy)]" />
            </div>
            <h2 className="text-xl font-bold pixel-font text-[var(--retro-navy)] mb-2">SELECT A QUEST</h2>
            <p className="text-sm pixel-font-body text-[var(--retro-navy)] max-w-xs text-center">
              CHOOSE A CONVERSATION TO BEGIN YOUR ADVENTURE
            </p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {profileModalUserId && (
        <ProfileModal
          userId={profileModalUserId}
          onClose={() => setProfileModalUserId(null)}
        />
      )}

      {/* Custom Styles for Scrollers */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #FFFBEB;
          border-right: 2px solid var(--retro-navy);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--retro-navy);
          border: 2px solid #000000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1e40af;
        }
      `}</style>
    </div>
  )
}
