import CodeEditor from '@uiw/react-textarea-code-editor'
import { useState } from 'react'
import styled from 'styled-components'

const ChatContainer = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border-bottom: 1px solid #ccc;
`

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 70%;
  margin-bottom: 10px;
  padding: 10px;
  background: ${props => props.isUser ? '#007bff' : '#f1f1f1'};
  color: ${props => props.isUser ? '#fff' : '#000'};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
`

const Input = styled.textarea`
  flex: 1;
  resize: none;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 40px;
`

const SendButton = styled.button`
  margin-left: 10px;
  padding: 8px 16px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ccc;
`

const CanvasContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
`

const CanvasHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const CanvasEditor = styled(CodeEditor)<{ isCode: boolean }>`
  flex: 1;
  font-family: ${props => props.isCode ? 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace' : 'Arial, sans-serif'};
`

type Message = {
  text: string
  isUser: boolean
  timestamp: Date
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I assist you today?", isUser: false, timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [canvasMode, setCanvasMode] = useState(false)
  const [canvasType, setCanvasType] = useState<'document' | string>('document') // 'document' or 'code/python' etc.
  const [canvasContent, setCanvasContent] = useState('')

  const sendMessage = () => {
    if (!input.trim()) return
    const newMessage: Message = { text: input, isUser: true, timestamp: new Date() }
    setMessages(prev => [...prev, newMessage])
    setInput('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { text: "This is a simulated AI response. If you'd like to create a draft or code, I can trigger canvas mode.", isUser: false, timestamp: new Date() }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)

    // Trigger canvas if message contains keywords
    if (input.toLowerCase().includes('draft') || input.toLowerCase().includes('code') || input.toLowerCase().includes('document')) {
      setCanvasMode(true)
      if (input.toLowerCase().includes('code')) {
        const lang = input.includes('python') ? 'python' : input.includes('javascript') ? 'javascript' : 'javascript'
        setCanvasType(`code/${lang}`)
      } else {
        setCanvasType('document')
      }
    }
  }

  const toggleCanvas = () => {
    setCanvasMode(!canvasMode)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const renderChat = () => (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} isUser={msg.isUser}>
            {msg.text}
          </MessageBubble>
        ))}
      </MessagesContainer>
      <InputContainer>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
        />
        <SendButton onClick={sendMessage}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  )

  const renderCanvas = () => (
    <CanvasContainer>
      <CanvasHeader>
        <span>{canvasType === 'document' ? 'Document Editor' : `Code Editor (${canvasType.split('/')[1]})`}</span>
        <button onClick={() => setCanvasMode(false)}>Close Canvas</button>
      </CanvasHeader>
      <CanvasEditor
        isCode={canvasType.startsWith('code/')}
        value={canvasContent}
        language={canvasType.startsWith('code/') ? canvasType.split('/')[1] : undefined}
        placeholder={canvasType === 'document' ? 'Write your document here...' : 'Write your code here...'}
        onChange={(evn) => setCanvasContent(evn.target.value)}
        padding={15}
        data-color-mode="dark"
        style={{
          fontSize: 12,
          backgroundColor: '#f5f5f5',
          fontFamily: canvasType.startsWith('code/') ? 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace' : 'Arial, sans-serif',
        }}
      />
    </CanvasContainer>
  )

  if (canvasMode) {
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flex: 1, borderRight: '1px solid #ccc' }}>
          {renderChat()}
        </div>
        <div style={{ flex: 1 }}>
          {renderCanvas()}
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Controls>
        <div>
          <button onClick={toggleCanvas}>Open Canvas</button>
        </div>
      </Controls>
      {renderChat()}
    </div>
  )
}

export default Chat
