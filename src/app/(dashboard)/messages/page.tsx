// ============================================
// MESSAGES PAGE - PIXEL CONCEPT DESIGN
// Dreamy vaporwave messaging experience
// ============================================

'use client'

import { useState } from 'react'
import { ParallaxBackground, ScanlineEffect } from '@/components/effects/ParallaxBackground'
import { ParticleEffects } from '@/components/effects/ParticleEffects'

// Mock data for conversations
const mockConversations = [
  {
    id: '1',
    matchId: '1',
    name: 'Maria Santos',
    avatar: '👩‍💻',
    lastMessage: 'That sounds great! When are you free?',
    unreadCount: 2,
    timestamp: '10:30 AM',
    online: true,
  },
  {
    id: '2',
    matchId: '2',
    name: 'Jose Reyes',
    avatar: '👨‍💻',
    lastMessage: 'Thanks for the message!',
    unreadCount: 0,
    timestamp: 'Yesterday',
    online: false,
  },
]

// Mock messages for a conversation
const mockMessages = [
  {
    id: '1',
    senderId: 'other',
    content: 'Hi! I saw we matched! 😊',
    timestamp: '10:15 AM',
  },
  {
    id: '2',
    senderId: 'me',
    content: 'Hey! Nice to meet you! How are you?',
    timestamp: '10:18 AM',
  },
  {
    id: '3',
    senderId: 'other',
    content: 'I\'m good! Just finished my CS class. What about you?',
    timestamp: '10:20 AM',
  },
  {
    id: '4',
    senderId: 'me',
    content: 'Same! We should grab coffee sometime ☕',
    timestamp: '10:25 AM',
  },
  {
    id: '5',
    senderId: 'other',
    content: 'That sounds great! When are you free?',
    timestamp: '10:30 AM',
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<typeof mockConversations[0] | null>(mockConversations[0])
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In production, this would send via Supabase
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  return (
    <main className="min-h-screen relative">
      {/* Premium Background Effects */}
      <ParallaxBackground />
      <ParticleEffects type="hearts" density="10" className="opacity-25" />
      <ScanlineEffect />

      <div className="relative z-10 py-10 px-4" style={{
        background: 'linear-gradient(180deg, rgba(232, 245, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)'
      }}>
        <div className="pixel-container max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mb-5 flex items-center justify-center gap-4">
              <span className="text-4xl pixel-bounce">💬</span>
              <span className="text-3xl pixel-float" style={{ animationDelay: '0.3s' }}>✨</span>
              <span className="text-4xl pixel-bounce" style={{ animationDelay: '0.6s' }}>💕</span>
            </div>
            <h1 className="pixel-text-shadow-glow gradient-text-animated pixel-font-heading text-3xl md:text-4xl font-bold mb-4 leading-relaxed">
              Messages
            </h1>
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="pixel-divider-pink flex-1 max-w-24" style={{ height: '4px', margin: '0' }}></div>
              <span className="text-xl">🪄</span>
              <div className="pixel-divider-pink flex-1 max-w-24" style={{ height: '4px', margin: '0' }}></div>
            </div>
            <p className="pixel-font-body text-lg" style={{ color: '#34495E' }}>
              Chat with your matches! Messaging is open Feb 11-13 ✨
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ height: '550px' }}>
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <div className="pixel-card hover-lift pixel-shine-effect h-full flex flex-col" style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 100%)'
              }}>
                <div className="flex items-center gap-2 mb-4 pb-4" style={{ borderBottom: '4px solid #2C3E50' }}>
                  <span className="text-lg">💬</span>
                  <h2 className="pixel-font-heading text-sm font-bold" style={{ color: '#00D4FF' }}>
                    Conversations
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  {mockConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`pixel-border-thin p-3 cursor-pointer transition-all hover:scale-[1.02] hover-lift ${selectedConversation?.id === conv.id
                          ? ''
                          : ''
                        }`}
                      style={{
                        background: selectedConversation?.id === conv.id
                          ? 'linear-gradient(135deg, #FFE8F0 0%, #E8F5FF 100%)'
                          : 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 100%)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="text-2xl pixel-bounce">{conv.avatar}</div>
                          {conv.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="pixel-font-heading font-bold text-xs truncate" style={{ color: '#34495E' }}>
                              {conv.name}
                            </h3>
                            <span className="pixel-font-body text-xs" style={{ color: '#7F8C8D' }}>{conv.timestamp}</span>
                          </div>
                          <p className="pixel-font-body text-xs truncate" style={{ color: '#7F8C8D' }}>{conv.lastMessage}</p>
                        </div>

                        {/* Unread Badge */}
                        {conv.unreadCount > 0 && (
                          <div
                            className="w-5 h-5 flex items-center justify-center text-white text-xs font-bold pixel-border"
                            style={{
                              background: 'linear-gradient(180deg, #FF6B9D 0%, #E54580 100%)',
                              minWidth: '20px',
                              fontSize: '9px'
                            }}
                          >
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <div className="pixel-card hover-lift pixel-shine-effect h-full flex flex-col" style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 100%)'
                }}>
                  {/* Chat Header */}
                  <div className="pb-3" style={{ borderBottom: '4px solid #2C3E50' }}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="text-3xl pixel-bounce">{selectedConversation.avatar}</div>
                        {selectedConversation.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="pixel-font-heading font-bold text-sm" style={{ color: '#00D4FF' }}>
                          {selectedConversation.name}
                        </h3>
                        <p className="pixel-font-body text-xs" style={{ color: '#7F8C8D' }}>
                          {selectedConversation.online ? '🟢 Online' : '⚫ Offline'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {mockMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${msg.senderId === 'me' ? 'order-2' : 'order-1'}`}>
                          <div
                            className="pixel-border-thin p-3"
                            style={{
                              background: msg.senderId === 'me'
                                ? 'linear-gradient(135deg, #FF6B9D 0%, #9B59B6 100%)'
                                : 'linear-gradient(180deg, #FFFFFF 0%, #F0F8FF 100%)',
                              color: msg.senderId === 'me' ? '#FFFFFF' : '#34495E'
                            }}
                          >
                            <p className="pixel-font-body text-xs">{msg.content}</p>
                          </div>
                          <p className={`pixel-font-body text-xs mt-1 ${msg.senderId === 'me' ? 'text-right' : 'text-left'}`} style={{ color: '#7F8C8D' }}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="pt-3" style={{ borderTop: '4px solid #2C3E50' }}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="pixel-input flex-1"
                        style={{ fontSize: '13px' }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="pixel-btn pixel-btn-primary pixel-ripple disabled:opacity-50 disabled:cursor-not-allowed text-xs px-4"
                      >
                        📨 Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pixel-card hover-lift h-full flex items-center justify-center" style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFF 100%)'
                }}>
                  <div className="text-center">
                    <div className="text-5xl mb-4 pixel-bounce">💬</div>
                    <h3 className="pixel-font-heading font-bold text-sm mb-2" style={{ color: '#00D4FF' }}>
                      Select a Conversation
                    </h3>
                    <p className="pixel-font-body text-xs" style={{ color: '#7F8C8D' }}>
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 pixel-card hover-lift" style={{
            background: 'linear-gradient(180deg, #E8F5FF 0%, #D4F0FF 100%)'
          }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📅</span>
              <h3 className="pixel-font-heading font-bold text-sm" style={{ color: '#00D4FF' }}>
                Messaging Schedule
              </h3>
            </div>
            <p className="pixel-font-body text-xs" style={{ color: '#34495E' }}>
              Messaging is only available from <strong style={{ color: '#FF6B9D' }}>February 11-13, 2026</strong>.
              Use this time to connect with your matches before the public Valentine's Day reveal!
              After Feb 13, messaging will remain open but focus on the reveal event. 💕
            </p>
          </div>

          {/* Cute characters at bottom */}
          <div className="flex justify-center items-center gap-6 mt-6">
            <div className="text-3xl pixel-bounce opacity-70">🐣</div>
            <div className="text-xl pixel-float opacity-60" style={{ animationDelay: '0.2s' }}>💕</div>
            <div className="text-3xl pixel-bounce opacity-70" style={{ animationDelay: '0.4s' }}>🐤</div>
          </div>
        </div>
      </div>
    </main>
  )
}
