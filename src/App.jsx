import { useState, useRef, useEffect } from 'react'
import './App.css'
import { chatIconSVG, userIconSVG, botIconSVG, sendIconSVG, plusIconSVG, menuIconSVG } from './assets/icons'

function App() {
  const [input, setInput] = useState('')
const [messages, setMessages] = useState([])
const [loading, setLoading] = useState(false)
const [sidebarOpen, setSidebarOpen] = useState(false)
const [selectedFile, setSelectedFile] = useState(null)

const messagesEndRef = useRef(null)
const textareaRef = useRef(null)
const fileInputRef = useRef(null)
  
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatHistory");

    if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
    }
}, []);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [input])
  useEffect(() => {
    localStorage.setItem(
        "chatHistory",
        JSON.stringify(messages)
    );
}, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() && !selectedFile) return;

    // Add user message
    const userMessage = { role: 'user', content: input }
    setMessages(prevMessages => [...prevMessages, userMessage])
    setInput('')
    setLoading(true)
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {

      const formData = new FormData();

formData.append("message", input);

if (selectedFile) {
    formData.append("file", selectedFile);
}

const response = await fetch("/api/chat", {
    method: "POST",
    body: formData,
});

const data = await response.text();

      // Add bot message
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: data }
      ])
    } catch (error) {
      console.error('Error fetching response:', error)
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ])
    }

    setLoading(false)
    setSelectedFile(null);
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }
  
  const startNewChat = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
}

  return (
    <div className="chat-container">
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-toggle" onClick={toggleSidebar} dangerouslySetInnerHTML={{ __html: menuIconSVG }} />
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo" dangerouslySetInnerHTML={{ __html: chatIconSVG }} />
            <div className="app-title">Telusko GPT</div>
          </div>
          <button className="new-chat-btn" onClick={startNewChat}>
            <span dangerouslySetInnerHTML={{ __html: plusIconSVG }} />
            New Conversation
          </button>
        </div>
        <div className="sidebar-history">
          {/* Chat history would go here */}
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-icon">
              <div dangerouslySetInnerHTML={{ __html: userIconSVG }} />
            </div>
            <span>Your Account</span>
          </div>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h2>Sporty GPT</h2>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-container">
              <div className="welcome-logo" dangerouslySetInnerHTML={{ __html: chatIconSVG }} />
              <h1>Welcome to Sporty GPT</h1>
              <p>Your intelligent assistant powered by Spring AI. Ask me anything about programming, Java, technology, or any topic you'd like to explore.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-avatar">
                  <div dangerouslySetInnerHTML={{ 
                    __html: message.role === 'user' ? userIconSVG : botIconSVG 
                  }} />
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">
                <div dangerouslySetInnerHTML={{ __html: botIconSVG }} />
              </div>
              <div className="message-content">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
        {selectedFile && (
        <div className="selected-file">
            📄 {selectedFile.name}
        </div>
    )}
          <form onSubmit={handleSubmit}>
          <button
    type="button"
    onClick={() => fileInputRef.current.click()}
    className="attach-button"
>
    📎
</button>

<input
    type="file"
    ref={fileInputRef}
    style={{ display: "none" }}
    onChange={(e) => setSelectedFile(e.target.files[0])}
/>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="message-input"
              rows="1"
            />
            <button
  type="submit"
  className="send-button"
  disabled={(!input.trim() && !selectedFile) || loading}
>
              <div dangerouslySetInnerHTML={{ __html: sendIconSVG }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App