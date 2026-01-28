import React, { useEffect, useState, useCallback } from 'react';
import { client } from '../../api/client';
import './SubAdminMessages.css';

type Conversation = {
  id: string;
  subject: string;
  participants: { id: string; name: string; email: string }[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

type Message = {
  id: string;
  senderUserId: string;
  senderName: string;
  messageText: string;
  createdAt: string;
  isRead: boolean;
};

type User = {
  id: string;
  name: string;
  email: string;
};

export default function SubAdminMessages(): JSX.Element {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchText, setUserSearchText] = useState('');
  const [newConvData, setNewConvData] = useState({
    participantUserId: '',
    subject: '',
    initialMessage: '',
  });

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/subadmin/conversations');
      setConversations(Array.isArray(response.data) ? response.data : []);
    } catch (e: any) {
      console.error('fetchConversations error', e);
      setError(e.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const response = await client.get(`/subadmin/conversations/${convId}/messages`);
      setMessages(Array.isArray(response.data) ? response.data : []);
      // Mark as read
      await client.patch(`/subadmin/conversations/${convId}/read`);
      fetchConversations(); // Refresh to update unread count
    } catch (e) {
      console.error('fetchMessages error', e);
    }
  }, [fetchConversations]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await client.get('/subadmin/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      console.error('Failed to load users', e);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, [fetchConversations, fetchUsers]);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
    }
  }, [selectedConv, fetchMessages]);

  const handleSendMessage = async () => {
    if (!selectedConv || !newMessage.trim()) return;

    try {
      await client.post(`/subadmin/conversations/${selectedConv.id}/messages`, {
        messageText: newMessage,
      });
      setNewMessage('');
      fetchMessages(selectedConv.id);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to send message');
    }
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/subadmin/conversations', {
        participantUserIds: [newConvData.participantUserId],
        subject: newConvData.subject,
        initialMessage: newConvData.initialMessage,
      });
      setShowNewConvModal(false);
      setNewConvData({ participantUserId: '', subject: '', initialMessage: '' });
      setUserSearchText('');
      fetchConversations();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to create conversation');
    }
  };

  return (
    <div className="subadmin-messages">
      <header className="hdr">
        <div>
          <h1>Messages</h1>
          <p className="muted">
            Direct messaging with workers
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowNewConvModal(true)}>
          + New Conversation
        </button>
      </header>

      <div className="messages-layout">
        <aside className="messages-list">
          {loading && <div className="loader">Loading conversations…</div>}
          {error && <div className="error">Error: {error}</div>}

          {!loading && !error && conversations.length === 0 && (
            <div className="empty">No conversations yet.</div>
          )}

          {!loading &&
            !error &&
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`msg-item ${selectedConv?.id === conv.id ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
                onClick={() => setSelectedConv(conv)}
              >
                <div className="msg-top">
                  <strong>{conv.subject || 'No Subject'}</strong>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
                <div className="msg-meta">
                  <span>{conv.participants.map(p => p.name).join(', ')}</span>
                  <span>{new Date(conv.lastMessageAt).toLocaleString()}</span>
                </div>
                <p className="msg-preview">{conv.lastMessage}</p>
              </div>
            ))}
        </aside>

        <main className="messages-content">
          {!selectedConv && (
            <div className="no-selection">
              <p>Select a conversation to view messages</p>
            </div>
          )}

          {selectedConv && (
            <>
              <div className="messages-header">
                <h2>{selectedConv.subject || 'Conversation'}</h2>
                <p className="muted">
                  {selectedConv.participants.map(p => p.name).join(', ')}
                </p>
              </div>

              <div className="messages-body">
                {messages.map((msg) => (
                  <div key={msg.id} className="message">
                    <div className="message-header">
                      <strong>{msg.senderName}</strong>
                      <span className="muted">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <p>{msg.messageText}</p>
                  </div>
                ))}
              </div>

              <div className="messages-input">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  rows={3}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button className="btn-primary" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {showNewConvModal && (
        <div className="modal-overlay" onClick={() => {
          setShowNewConvModal(false);
          setUserSearchText('');
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>New Conversation</h3>
            <form onSubmit={handleCreateConversation}>
              <div className="form-group">
                <label htmlFor="participant">Send To *</label>
                {users.length > 10 && (
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      marginBottom: '8px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px' 
                    }}
                  />
                )}
                <select
                  id="participant"
                  value={newConvData.participantUserId}
                  onChange={(e) => setNewConvData({ ...newConvData, participantUserId: e.target.value })}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">Choose a user...</option>
                  {users
                    .filter(user => 
                      user.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
                      user.email.toLowerCase().includes(userSearchText.toLowerCase())
                    )
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                </select>
                {users.filter(user => 
                  user.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
                  user.email.toLowerCase().includes(userSearchText.toLowerCase())
                ).length === 0 && (
                  <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>No users found</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={newConvData.subject}
                  onChange={(e) => setNewConvData({ ...newConvData, subject: e.target.value })}
                  placeholder="Optional subject"
                />
              </div>
              <div className="form-group">
                <label htmlFor="initialMessage">Message *</label>
                <textarea
                  id="initialMessage"
                  value={newConvData.initialMessage}
                  onChange={(e) => setNewConvData({ ...newConvData, initialMessage: e.target.value })}
                  rows={5}
                  required
                  placeholder="Type your message..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowNewConvModal(false);
                  setUserSearchText('');
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Start Conversation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
