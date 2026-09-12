import React, { useState, useEffect, useRef } from 'react';
import { useBentoStore } from '../store';
import { aiService } from '../services/ai';
import { Send, Plus, MessageSquare, Settings2, Trash2, Bot, User } from 'lucide-react';
import './AIPage.css';

export const AIPage: React.FC = () => {
  const { conversations, settings, addConversation, addMessage, deleteConversation } = useBentoStore();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConvId]);

  const activeConv = conversations.find(c => c.id === activeConvId);

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeConvId) return;

    setInput('');
    // User message
    await addMessage(activeConvId, {
      role: 'user',
      content: text
    });

    setIsTyping(true);

    const conv = useBentoStore.getState().conversations.find(c => c.id === activeConvId);
    if (!conv) return;

    const responseText = await aiService.sendMessage(conv.messages, settings);
    
    await addMessage(activeConvId, {
      role: 'assistant',
      content: responseText
    });

    setIsTyping(false);
  };

  const SUGGESTIONS = [
    "Plan my day",
    "Break down a goal",
    "Review overdue tasks",
    "Summarize my week"
  ];

  return (
    <div className="ai-page">
      <div className="ai-sidebar">
        <div className="sidebar-header">
          <h2>Conversations</h2>
          <button className="btn-icon" onClick={async () => {
            const conv = await addConversation();
            if (conv) setActiveConvId(conv.id);
          }}>
            <Plus size={18} />
          </button>
        </div>
        
        <div className="conversation-list">
          {conversations.map(conv => (
            <div 
              key={conv.id} 
              className={`conv-item ${activeConvId === conv.id ? 'active' : ''}`}
              onClick={() => setActiveConvId(conv.id)}
            >
              <MessageSquare size={16} />
              <span className="conv-title truncate">{conv.title}</span>
              <button 
                className="btn-icon text-red delete-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                  if (activeConvId === conv.id) setActiveConvId(null);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="empty-sidebar">No conversations</div>
          )}
        </div>
      </div>

      <div className="ai-chat-area">
        {!activeConv ? (
          <div className="empty-chat-state">
            <Bot size={48} className="empty-icon text-primary" />
            <h3>Your Personal Planner AI</h3>
            <p>Start a new conversation to get intelligent insights and help planning your work.</p>
            <button className="btn-primary mt-4" onClick={async () => {
              const conv = await addConversation();
              if (conv) setActiveConvId(conv.id);
            }}>
              <Plus size={16} /> New Conversation
            </button>
          </div>
        ) : (
          <>
            <div className="chat-messages">
              {activeConv.messages.length === 0 ? (
                <div className="empty-conversation">
                  <Bot size={40} className="text-primary mb-4" />
                  <h3>How can I help you plan today?</h3>
                  {!settings.aiProvider && (
                    <div className="warning-box mt-4">
                      <Settings2 size={16} />
                      <span>Connect an AI provider in Settings to unlock intelligent planning.</span>
                    </div>
                  )}
                  <div className="suggestions">
                    {SUGGESTIONS.map(s => (
                      <button key={s} className="suggestion-chip" onClick={() => handleSend(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                activeConv.messages.map(msg => (
                  <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                    </div>
                    <div className="message-bubble">
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="message-wrapper assistant">
                  <div className="message-avatar"><Bot size={16} /></div>
                  <div className="message-bubble typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <form 
                className="chat-form"
                onSubmit={e => { e.preventDefault(); handleSend(input); }}
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask me to plan your day, break down tasks..."
                  className="chat-input"
                />
                <button type="submit" className="btn-primary send-btn" disabled={!input.trim() || isTyping}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
