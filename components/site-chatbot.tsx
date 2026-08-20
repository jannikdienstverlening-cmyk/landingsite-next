'use client'

import Link from 'next/link'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { buildWhatsAppHandoffMessage, createWhatsAppUrl } from '@/lib/whatsapp'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hoi, ik ben de digitale assistent van Landingsite.nl. Waar kan ik je mee helpen?',
}

const suggestions = [
  'Welk pakket past bij mij?',
  'Wat zit er in Websitebeheer?',
  'Wanneer is mijn pagina klaar?',
]

export function SiteChatbot({ whatsappNumber }: { whatsappNumber: string | null }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const whatsappUrl = createWhatsAppUrl(whatsappNumber, buildWhatsAppHandoffMessage(messages))

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (open) messageEndRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages, open, sending])

  async function sendMessage(content: string) {
    const question = content.trim()
    if (!question || sending) return

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: question }
    const nextMessages = [...messages, userMessage].slice(-10)
    setMessages(nextMessages)
    setInput('')
    setError('')
    setSending(true)

    try {
      const apiMessages = nextMessages
        .filter((message) => message.id !== welcomeMessage.id)
        .map(({ role, content: messageContent }) => ({ role, content: messageContent }))
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })
      const data = await response.json() as { reply?: unknown; error?: unknown }
      if (!response.ok || typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Antwoord ophalen lukt nu niet.')
      }
      const assistantMessage: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: data.reply.trim() }
      setMessages((current) => [...current, assistantMessage].slice(-10))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Antwoord ophalen lukt nu niet.')
    } finally {
      setSending(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(input)
  }

  function closeChat() {
    setOpen(false)
    window.setTimeout(() => launcherRef.current?.focus(), 0)
  }

  return (
    <div className={`site-chat${open ? ' is-open' : ''}`}>
      {open && (
        <section id="site-chat-panel" className="chat-panel" aria-label="Digitale assistent" onKeyDown={(event) => { if (event.key === 'Escape') closeChat() }}>
          <header className="chat-header">
            <div>
              <span className="chat-status-dot" aria-hidden="true" />
              <div><strong>Landingsite Assistent</strong><span>{whatsappUrl ? 'Direct antwoord · Jannik via WhatsApp' : 'Direct antwoord'}</span></div>
            </div>
            <button type="button" className="chat-close" onClick={closeChat} aria-label="Chat sluiten" title="Chat sluiten">×</button>
          </header>

          <div className="chat-messages" aria-live="polite" aria-relevant="additions">
            {messages.map((message) => (
              <div className={`chat-message ${message.role}`} key={message.id}>{message.content}</div>
            ))}
            {messages.length === 1 && (
              <div className="chat-suggestions" aria-label="Veelgestelde vragen">
                {suggestions.map((suggestion) => <button type="button" onClick={() => void sendMessage(suggestion)} key={suggestion}>{suggestion}</button>)}
              </div>
            )}
            {sending && <div className="chat-typing" role="status"><span /><span /><span /><span className="sr-only">De assistent schrijft</span></div>}
            {error && <p className="chat-error" role="alert">{error} {whatsappUrl
              ? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="chat_whatsapp_open">Vraag via WhatsApp</a>
              : <Link href="/#contact" onClick={() => setOpen(false)}>Naar contact</Link>}
            </p>}
            <div ref={messageEndRef} />
          </div>

          {whatsappUrl && (
            <a
              className="chat-whatsapp"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-event="chat_whatsapp_open"
            >
              <span><strong>Verder via WhatsApp</strong><small>Je bericht staat alvast klaar</small></span>
              <span aria-hidden="true">↗</span>
            </a>
          )}

          <form className="chat-form" onSubmit={submit}>
            <label className="sr-only" htmlFor="chat-question">Stel je vraag</label>
            <input id="chat-question" ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} maxLength={800} autoComplete="off" placeholder="Stel je vraag..." disabled={sending} />
            <button type="submit" disabled={sending || !input.trim()} aria-label="Vraag versturen" title="Vraag versturen">→</button>
          </form>
          <p className="chat-privacy">Deel geen gevoelige gegevens. WhatsApp opent buiten deze site. <a href="/privacybeleid">Privacy</a></p>
        </section>
      )}

      <button ref={launcherRef} className="chat-launcher" type="button" onClick={() => setOpen((value) => !value)} aria-controls="site-chat-panel" aria-expanded={open} aria-label={open ? 'Chat sluiten' : 'Chat met de digitale assistent openen'}>
        {open ? <span aria-hidden="true">×</span> : <span className="chat-icon" aria-hidden="true"><i /><i /></span>}
      </button>
    </div>
  )
}
