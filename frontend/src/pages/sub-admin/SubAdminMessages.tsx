import React, { useEffect, useState, useCallback } from 'react';
import { client } from '../../api/client';
import './SubAdminMessages.css';

type InternalMessage = {
  id: string;
  from: string;
  subject: string;
  body: string;
  createdAt: string;
  read: boolean;
  priority?: 'high' | 'normal' | 'low';
};

export default function SubAdminMessages(): JSX.Element {
  const [messages, setMessages] = useState<InternalMessage[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<InternalMessage | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/subadmin/messages');
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (e: any) {
      console.error('fetchMessages error', e);
      setError(e.message || 'Failed to load messages');
      setMessages(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (msg: InternalMessage) => {
    if (msg.read) return;
    try {
      await client.patch(`/subadmin/messages/${msg.id}/read`);
      setMessages((prev) =>
        prev
          ? prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
          : prev
      );
    } catch (e) {
      console.error('markAsRead failed', e);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="subadmin-messages">
      <header className="hdr">
        <div>
          <h1>Internal Messages</h1>
          <p className="muted">
            Direct system and admin-to-admin communications. Backend-driven.
          </p>
        </div>
        <button className="refresh" onClick={fetchMessages}>
          Refresh
        </button>
      </header>

      <div className="messages-layout">
        <aside className="messages-list">
          {loading && <div className="loader">Loading messages…</div>}
          {error && <div className="error">Error: {error}</div>}

          {!loading && !error && messages && messages.length === 0 && (
            <div className="empty">No internal messages.</div>
          )}

          {!loading &&
            !error &&
            messages &&
            messages.map((m) => (
              <div
                key={m.id}
                className={`msg-item ${m.read ? 'read' : 'unread'}`}
                onClick={() => {
                  setSelected(m);
                  markAsRead(m);
                }}
              >
                <div className="msg-top">
                  <strong>{m.subject}</strong>
                  {m.priority && (
                    <span className={`prio ${m.priority}`}>
                      {m.priority.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="msg-meta">
                  <span>{m.from}</span>
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
        </aside>

        <section className="message-view">
          {!selected && (
            <div className="empty large">
              Select a message to view its contents.
            </div>
          )}

          {selected && (
            <>
              <div className="view-header">
                <h2>{selected.subject}</h2>
                <div className="view-meta">
                  <span>From: {selected.from}</span>
                  <span>
                    {new Date(selected.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="view-body">{selected.body}</div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
