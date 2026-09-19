import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User } from "lucide-react";

function AICare() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I am GreenPulse. Ask me anything about your plant's current health." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text }),
      });
      const json = await response.json();

      if (json.success) {
        setMessages((prev) => [...prev, { role: "ai", text: json.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: json.message }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Connection error. Make sure your server is running." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SMART CARE</p>
          <h1>AI Assistant</h1>
          <p className="page-description">
            Chat directly with your plant's care agent.
          </p>
        </div>
      </div>

      <div className="dashboard-panel" style={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
        <div className="panel-header" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <p className="eyebrow">INTERACTIVE</p>
            <h3>Ask GreenPulse</h3>
          </div>
          <Sparkles size={22} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                background: msg.role === 'user' ? '#62d98b' : '#1e293b',
                color: msg.role === 'user' ? '#000' : '#fff',
                padding: '12px 16px',
                borderRadius: '12px',
                maxWidth: '75%',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Bot size={24} style={{ color: '#82958a' }} />
              <div style={{ color: '#82958a', fontSize: '13px' }}>GreenPulse is thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Does my plant need watering today?"
            style={{
              flex: 1,
              background: '#0d1813',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#fff',
              outline: 'none'
            }}
          />
          <button type="submit" disabled={loading || !input.trim()} style={{
            background: '#62d98b',
            border: 'none',
            borderRadius: '8px',
            padding: '0 20px',
            color: '#000',
            cursor: 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1
          }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AICare;