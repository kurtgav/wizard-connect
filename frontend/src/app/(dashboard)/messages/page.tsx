// ============================================
// MESSAGES PAGE - PIXEL CONCEPT DESIGN
// Dreamy vaporwave messaging experience with real-time updates
// ============================================

'use client'

import { useState, useEffect, useRef } from 'react'
import { PixelIcon } from '@/components/ui/PixelIcon'
import { ProfileModal } from '@/components/ui/ProfileModal'
import { createClient } from '@/lib/supabase/client'
import { apiClient } from '@/lib/api-client'
import type { ConversationWithDetails, Message } from '@/types/api'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetails, setShowDetails] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelsRef = useRef<Map<string, any>>(new Map())
  const supabase = createClient()

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
    return () => {
      // Cleanup all subscriptions on unmount
      channelsRef.current.forEach((channel) => {
        if (channel) {
          supabase.removeChannel(channel)
        }
      })
      channelsRef.current.clear()
    }
  }, [])

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      subscribeToMessages(selectedConversation.id)
      subscribeToConversationUpdates()
    } else {
      setMessages([])
    }

    // Cleanup subscription when changing conversation
    return () => {
      const messageChannel = channelsRef.current.get('messages')
      if (messageChannel) {
        supabase.removeChannel(messageChannel)
        channelsRef.current.delete('messages')
      }
      const conversationChannel = channelsRef.current.get('conversations')
      if (conversationChannel) {
        supabase.removeChannel(conversationChannel)
        channelsRef.current.delete('conversations')
      }
    }
  }, [selectedConversation])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getConversations()
      setConversations(data || [])
      if (data && data.length > 0 && !selectedConversation) {
        // Desktop default: select first conversation
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
      setCurrentUserId(response.current_user_id || '')
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  // Subscribe to new messages for the current conversation
  const subscribeToMessages = (conversationId: string) => {
    const channelName = `messages:${conversationId}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: any) => {
          const newMessage = payload.new as Message
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev
            }
            return [...prev, newMessage]
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to messages for conversation:', conversationId)
        }
      })

    channelsRef.current.set('messages', channel)
  }

  // Subscribe to conversation updates (for last message and unread count)
  const subscribeToConversationUpdates = () => {
    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        async () => {
          // Reload conversations to get updated last_message and unread counts
          const data = await apiClient.getConversations()
          setConversations(data || [])
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to conversation updates')
        }
      })

    channelsRef.current.set('conversations', channel)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) {
      return
    }

    try {
      setSendingMessage(true)
      const message = await apiClient.sendMessage(selectedConversation.id, { content: newMessage })
      setMessages((prev) => [...prev, message])
      setNewMessage('')

      // Refresh conversations to update last_message
      const data = await apiClient.getConversations()
      setConversations(data || [])
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleProfileClick = (userId: string) => {
    setProfileModalUserId(userId)
  }

  const selectConversation = (conv: ConversationWithDetails) => {
    setSelectedConversation(conv)
    setMobileView('chat')
  }

  const goBackToList = () => {
    setMobileView('list')
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const filteredConversations = conversations.filter(conv =>
    `${conv.other_participant.first_name} ${conv.other_participant.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] border-4 border-[var(--retro-navy)] bg-[var(--retro-cream)] relative overflow-hidden shadow-[12px_12px_0_0_rgba(0,0,0,0.1)]">

        {/* Messenger Layout Container */}
        <div className="flex flex-1 overflow-hidden">

          {/* 1. LEFT SIDEBAR: Conversation List */}
          <div className={`
            ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
            w-full md:w-[320px] lg:w-[380px] border-r-4 border-[var(--retro-navy)] flex-col bg-white
          `}>
            {/* Sidebar Header */}
            <div className="p-4 border-b-4 border-[var(--retro-navy)] bg-[var(--retro-white)]">
              <h2 className="pixel-font text-xl mb-4 text-[var(--retro-navy)] uppercase">Chats</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search players..."
                  className="pixel-input w-full pl-10 pr-4 py-2 text-sm bg-[var(--retro-cream)]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
                  <PixelIcon name="smiley" size={16} />
                </div>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-32 opacity-50">
                  <div className="animate-bounce mb-2">
                    <PixelIcon name="smiley" size={24} />
                  </div>
                  <p className="pixel-font text-xs">LOADING...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center opacity-50">
                  <p className="pixel-font-body text-sm">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`
                      flex items-center gap-3 p-4 border-b-2 border-transparent cursor-pointer transition-all
                      ${selectedConversation?.id === conv.id
                        ? 'bg-[var(--retro-yellow)] border-y-2 border-y-[var(--retro-navy)]'
                        : 'hover:bg-[var(--retro-cream)]'
                      }
                    `}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 border-2 border-[var(--retro-navy)] bg-white overflow-hidden">
                        {conv.other_participant.avatar_url ? (
                          <img
                            src={conv.other_participant.avatar_url}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[var(--retro-blue)] text-white">
                            <PixelIcon name="smiley" size={24} />
                          </div>
                        )}
                      </div>
                      {conv.other_participant.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[var(--retro-navy)] rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="pixel-font text-xs truncate">
                          {conv.other_participant.first_name} {conv.other_participant.last_name}
                        </h4>
                        <span className="text-[10px] opacity-50 font-mono">
                          {conv.updated_at ? formatTime(conv.updated_at) : ""}
                        </span>
                      </div>
                      <p className={`pixel-font-body text-xs truncate ${conv.unread_count > 0 ? 'font-bold' : 'opacity-60'}`}>
                        {conv.last_message || "Start a conversation"}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="w-5 h-5 bg-[var(--retro-red)] border-2 border-[var(--retro-navy)] flex items-center justify-center text-[10px] text-white pixel-font">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. CENTER: Chat Window */}
          <div className={`
            ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
            flex-1 flex-col bg-white overflow-hidden
          `}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b-4 border-[var(--retro-navy)] flex justify-between items-center bg-[var(--retro-cream)]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={goBackToList}
                      className="md:hidden p-2 hover:bg-[var(--retro-navy)] hover:text-white border-2 border-transparent hover:border-[var(--retro-navy)] transition-all"
                    >
                      <PixelIcon name="smiley" size={20} className="rotate-180" />
                    </button>
                    <div
                      className="flex items-center gap-3 cursor-pointer hover:opacity-70"
                      onClick={() => handleProfileClick(selectedConversation.other_participant.id)}
                    >
                      <div className="w-10 h-10 border-2 border-[var(--retro-navy)] overflow-hidden bg-white">
                        {selectedConversation.other_participant.avatar_url ? (
                          <img src={selectedConversation.other_participant.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[var(--retro-blue)] text-white">
                            <PixelIcon name="smiley" size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="pixel-font text-sm">{selectedConversation.other_participant.first_name} {selectedConversation.other_participant.last_name}</h3>
                        <p className="text-[10px] uppercase font-bold text-green-600 opacity-80">
                          {selectedConversation.other_participant.online ? "ACTIVE NOW" : "OFFLINE"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className={`pixel-btn px-2 py-1 hidden lg:block ${showDetails ? 'bg-[var(--retro-yellow)]' : ''}`}
                    >
                      INFO
                    </button>
                    <button onClick={() => handleProfileClick(selectedConversation.other_participant.id)} className="pixel-btn px-2 py-1">
                      VIEW
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white custom-scrollbar pattern-dots">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
                      <PixelIcon name="smiley" size={64} />
                      <p className="pixel-font text-sm mt-4 uppercase">No transmissions found</p>
                      <p className="pixel-font-body text-xs mt-2">Break the ice!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender_id === currentUserId;
                      const showDate = idx === 0 || new Date(msg.created_at).getTime() - new Date(messages[idx - 1].created_at).getTime() > 30 * 60 * 1000;

                      return (
                        <div key={msg.id} className="space-y-2">
                          {showDate && (
                            <div className="flex justify-center my-8">
                              <span className="bg-[var(--retro-cream)] border-2 border-[var(--retro-navy)] px-3 py-1 pixel-font text-[8px] uppercase opacity-70">
                                {new Date(msg.created_at).toLocaleDateString()} at {formatTime(msg.created_at)}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                              <div className="w-8 h-8 flex-shrink-0 mr-2 mt-auto self-end border-2 border-[var(--retro-navy)] overflow-hidden bg-white">
                                {selectedConversation.other_participant.avatar_url ? (
                                  <img src={selectedConversation.other_participant.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-[var(--retro-blue)] text-white">
                                    <PixelIcon name="smiley" size={16} />
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="group relative max-w-[75%] md:max-w-[65%]">
                              <div className={`
                                p-3 border-2 border-[var(--retro-navy)]
                                ${isMe
                                  ? 'bg-[var(--retro-navy)] text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]'
                                  : 'bg-[var(--retro-white)] text-[var(--retro-navy)] shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]'
                                }
                              `}>
                                <p className="pixel-font-body text-sm leading-relaxed">{msg.content}</p>
                              </div>
                              <div className={`
                                absolute -bottom-5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                                ${isMe ? 'right-0' : 'left-0'}
                              `}>
                                <span className="text-[9px] uppercase font-bold text-[var(--retro-navy)]">{formatTime(msg.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t-4 border-[var(--retro-navy)] bg-[var(--retro-cream)]">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                      <textarea
                        rows={1}
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        placeholder="Aa"
                        className="pixel-input w-full py-2 px-4 text-sm bg-white resize-none max-h-32"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                            (e.target as HTMLTextAreaElement).style.height = 'auto';
                          }
                        }}
                        disabled={sendingMessage}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="pixel-btn h-[42px] px-6 disabled:opacity-50 flex items-center gap-2"
                    >
                      <span className="hidden sm:inline">SEND</span>
                      <PixelIcon name="smiley" size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[var(--retro-white)] pattern-dots opacity-40">
                <div className="w-32 h-32 border-4 border-[var(--retro-navy)] border-dashed flex items-center justify-center bg-[var(--retro-cream)]">
                  <PixelIcon name="smiley" size={48} />
                </div>
                <h3 className="pixel-font text-sm mt-6 uppercase">Encrypted Connection Ready</h3>
                <p className="pixel-font-body text-xs mt-2 text-center max-w-xs">
                  Select a transmission channel from the left to begin your conversation.
                </p>
              </div>
            )}
          </div>

          {/* 3. RIGHT SIDEBAR: Details (Desktop only) */}
          {selectedConversation && showDetails && (
            <div className="hidden lg:flex w-[300px] border-l-4 border-[var(--retro-navy)] flex-col bg-[var(--retro-white)] overflow-y-auto">
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 border-4 border-[var(--retro-navy)] bg-white overflow-hidden shadow-[4px_4px_0_0_var(--retro-navy)] mb-6">
                  {selectedConversation.other_participant.avatar_url ? (
                    <img src={selectedConversation.other_participant.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--retro-blue)] text-white">
                      <PixelIcon name="smiley" size={48} />
                    </div>
                  )}
                </div>
                <h2 className="pixel-font text-sm font-bold border-b-2 border-[var(--retro-navy)] pb-2 lowercase">
                  {selectedConversation.other_participant.first_name} {selectedConversation.other_participant.last_name}
                </h2>
                <div className="w-full mt-8 space-y-4">
                  <div className="bg-[var(--retro-cream)] p-3 border-2 border-[var(--retro-navy)] text-left">
                    <p className="pixel-font text-[10px] uppercase opacity-60 mb-1">Status</p>
                    <p className="pixel-font-body text-xs font-bold">
                      {selectedConversation.other_participant.online ? "🟢 Active Now" : "⚪ Offline"}
                    </p>
                  </div>
                  <div className="bg-[var(--retro-cream)] p-3 border-2 border-[var(--retro-navy)] text-left">
                    <p className="pixel-font text-[10px] uppercase opacity-60 mb-1">Bio</p>
                    <p className="pixel-font-body text-xs italic">
                      "{selectedConversation.other_participant.bio || "No bio set..."}"
                    </p>
                  </div>
                  <div className="bg-[var(--retro-cream)] p-3 border-2 border-[var(--retro-navy)] text-left">
                    <p className="pixel-font text-[10px] uppercase opacity-60 mb-1">Location</p>
                    <p className="pixel-font-body text-xs">
                      {selectedConversation.other_participant.major || "Unknown Dept"}
                    </p>
                  </div>
                </div>

                <div className="w-full mt-12 space-y-2">
                  <button
                    onClick={() => handleProfileClick(selectedConversation.other_participant.id)}
                    className="pixel-btn w-full py-2 flex items-center justify-center gap-2"
                  >
                    FULL PROFILE
                  </button>
                  <button className="pixel-btn pixel-btn-secondary w-full py-2 opacity-50 cursor-not-allowed">
                    MUTE NOTIFICATIONS
                  </button>
                  <button className="pixel-btn pixel-btn-secondary w-full py-2 text-[var(--retro-red)]">
                    BLOCK PLAYER
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {profileModalUserId && (
        <ProfileModal
          userId={profileModalUserId}
          onClose={() => setProfileModalUserId(null)}
        />
      )}
    </div>
  )
}
