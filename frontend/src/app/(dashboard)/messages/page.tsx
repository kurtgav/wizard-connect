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
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null)
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
        setSelectedConversation(data[0])
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="pixel-font text-3xl md:text-5xl font-bold mb-4 text-[var(--retro-navy)] uppercase tracking-tighter">
          Server <span className="text-[var(--retro-yellow)] text-shadow-md">Chat</span>
        </h1>
        <div className="inline-block px-4 py-1 border-b-4 border-[var(--retro-green)]">
          <p className="pixel-font-body font-bold text-[var(--retro-navy)]">
            ONLINE STATUS: <span className="text-green-600">CONNECTED</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Sidebar: User List */}
        <div className="lg:col-span-1 pixel-card flex flex-col p-0 overflow-hidden">
          <div className="p-4 bg-[var(--retro-navy)] text-white border-b-4 border-[var(--retro-navy)]">
            <h2 className="pixel-font text-sm">
              Active Players ({conversations.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[var(--retro-white)]">
            {loading ? (
              <div className="text-center py-8 opacity-50">
                <p className="pixel-font text-sm">LOADING...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                <p className="pixel-font text-sm">NO CONVERSATIONS</p>
                <p className="pixel-font-body text-xs mt-2">Match with someone to start chatting!</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`
                    cursor-pointer p-3 border-2 transition-all relative
                    ${selectedConversation?.id === conv.id
                      ? 'bg-[var(--retro-yellow)] border-[var(--retro-navy)] shadow-[2px_2px_0_0_var(--retro-navy)]'
                      : 'bg-white border-transparent hover:border-[var(--retro-navy)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 bg-[var(--retro-cream)] border-2 border-[var(--retro-navy)] flex items-center justify-center text-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[var(--retro-blue)] transition-all"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleProfileClick(conv.other_participant.id)
                      }}
                      title="Click to view profile"
                    >
                      {conv.other_participant.avatar_url ? (
                        <img src={conv.other_participant.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <PixelIcon name="smiley" size={32} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="flex justify-between items-center mb-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProfileClick(conv.other_participant.id)
                        }}
                      >
                        <h3 className="pixel-font text-xs text-[var(--retro-navy)] truncate cursor-pointer hover:text-[var(--retro-blue)]">
                          {conv.other_participant.first_name} {conv.other_participant.last_name}
                        </h3>
                        {conv.unread_count > 0 && (
                          <div className="bg-[var(--retro-red)] text-white text-[10px] px-2 py-0.5 rounded-full border border-[var(--retro-navy)]">
                            {conv.unread_count}
                          </div>
                        )}
                      </div>
                      <p className="pixel-font-body text-sm truncate opacity-80">
                        {conv.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 pixel-card flex flex-col p-0 overflow-hidden relative">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-[var(--retro-blue)] border-b-4 border-[var(--retro-navy)] flex justify-between items-center text-white">
                <div
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleProfileClick(selectedConversation.other_participant.id)}
                  title="Click to view profile"
                >
                  <div className="w-8 h-8 bg-white border-2 border-[var(--retro-navy)] flex items-center justify-center overflow-hidden">
                    {selectedConversation.other_participant.avatar_url ? (
                      <img src={selectedConversation.other_participant.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <PixelIcon name="smiley" size={24} className="text-[var(--retro-navy)]" />
                    )}
                  </div>
                  <div>
                    <h3 className="pixel-font text-sm hover:underline">
                      {selectedConversation.other_participant.first_name} {selectedConversation.other_participant.last_name}
                    </h3>
                    <p className="pixel-font-body text-xs opacity-90">
                      {selectedConversation.other_participant.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleProfileClick(selectedConversation.other_participant.id)}
                  className="pixel-btn pixel-btn-secondary px-2 py-1 text-[10px]"
                  title="View full profile"
                >
                  PROFILE
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--retro-white)]">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center opacity-50">
                    <div className="text-center">
                      <p className="pixel-font text-sm">START THE CONVERSATION</p>
                      <p className="pixel-font-body text-xs mt-2">Send your first message!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                              max-w-[70%] p-3 border-2 border-[var(--retro-navy)] shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]
                              ${isMe
                            ? 'bg-[var(--retro-navy)] text-white'
                            : 'bg-[var(--retro-cream)] text-[var(--retro-navy)]'
                          }
                           `}>
                          <p className="pixel-font-body text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-[var(--retro-cream)] border-t-4 border-[var(--retro-navy)]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="pixel-input flex-1 border-2"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="pixel-btn px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? '...' : 'SEND'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[var(--retro-cream)]">
              <div className="text-center opacity-50">
                <p className="pixel-font text-[var(--retro-navy)] mb-2">NO SIGNAL...</p>
                <p className="pixel-font-body">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {profileModalUserId && (
        <ProfileModal
          userId={profileModalUserId}
          onClose={() => setProfileModalUserId(null)}
        />
      )}
    </div>
  )
}
