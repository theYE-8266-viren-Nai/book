'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { IBook, Messages } from '@/types';
import { getVoice, formatDuration } from '@/lib/utils';
import VapiControls from './VapiControls';

type CallStatus = 'idle' | 'connecting' | 'active' | 'ended';

const statusMap: Record<CallStatus, { label: string; dotClass: string }> = {
  idle: { label: 'Ready', dotClass: 'vapi-status-dot vapi-status-dot-ready' },
  connecting: { label: 'Connecting...', dotClass: 'vapi-status-dot vapi-status-dot-connecting' },
  active: { label: 'Listening', dotClass: 'vapi-status-dot vapi-status-dot-listening' },
  ended: { label: 'Ended', dotClass: 'vapi-status-dot vapi-status-dot-ready' },
};

interface BookConversationProps {
  book: IBook;
}

const BookConversation = ({ book }: BookConversationProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [messages, setMessages] = useState<Messages[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const voice = getVoice(book.persona);
  const maxDuration = 15 * 60; // 15 minutes

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer logic
  useEffect(() => {
    if (callStatus === 'active') {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= maxDuration) {
            handleEndCall();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  const handleStartCall = useCallback(() => {
    setCallStatus('connecting');
    // Simulate connection delay, then go active
    setTimeout(() => {
      setCallStatus('active');
    }, 1500);
  }, []);

  const handleEndCall = useCallback(() => {
    setCallStatus('ended');
    if (timerRef.current) clearInterval(timerRef.current);
    // Reset after a moment
    setTimeout(() => {
      setCallStatus('idle');
      setElapsed(0);
    }, 2000);
  }, []);

  const toggleCall = () => {
    if (callStatus === 'idle' || callStatus === 'ended') {
      handleStartCall();
    } else {
      handleEndCall();
    }
  };

  const isActive = callStatus === 'active' || callStatus === 'connecting';
  const currentStatus = statusMap[callStatus];

  return (
    <section className="vapi-main-container">
      {/* ─── Header Card ─── */}
      {/* <div className="vapi-header-card w-full">

        <div className="vapi-cover-wrapper">
          <Image
            src={book.coverURL}
            alt={book.title}
            width={162}
            height={240}
            className="vapi-cover-image"
            priority
          />
          <div className="vapi-mic-wrapper">
            {isActive && <span className="vapi-pulse-ring" />}
            <button
              onClick={toggleCall}
              className={`vapi-mic-btn ${isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'}`}
              aria-label={isActive ? 'End conversation' : 'Start conversation'}
            >
              {isActive ? (
                <MicOff className="w-6 h-6 text-[var(--accent-warm)]" />
              ) : (
                <Mic className="w-6 h-6 text-[var(--text-secondary)]" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div>
            <h1 className="book-title-lg line-clamp-2">{book.title}</h1>
            <p className="subtitle">by {book.author}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="vapi-status-indicator">
              <span className={currentStatus.dotClass} />
              <span className="vapi-status-text">{currentStatus.label}</span>
            </div>

            <div className="vapi-badge-ai">
              <span className="vapi-badge-ai-text">
                Voice: &nbsp;
                <strong>{voice.name}</strong>
              </span>
              {isActive && <Volume2 className="volume" />}
            </div>

            <div className="vapi-badge-ai">
              <span className="vapi-badge-ai-text">
                {formatDuration(elapsed)}/{formatDuration(maxDuration)}
              </span>
            </div>
          </div>
        </div>
      </div> */}

      {/* ─── Transcript Area ─── */}
      {/* <div className="vapi-transcript-wrapper w-full mt-5">
        <div className="transcript-container">
          <div className="transcript-messages">
            {messages.length === 0 ? (
              <div className="transcript-empty">
                <Mic className="w-10 h-10 text-[var(--text-muted)] mb-4" />
                <p className="transcript-empty-text">No conversation yet</p>
                <p className="transcript-empty-hint">
                  Click the mic button above to start talking
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`transcript-message ${msg.role === 'user'
                        ? 'transcript-message-user'
                        : 'transcript-message-assistant'
                      }`}
                  >
                    <div
                      className={`transcript-bubble ${msg.role === 'user'
                          ? 'transcript-bubble-user'
                          : 'transcript-bubble-assistant'
                        }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      </div> */}
      <VapiControls book={book}/>
    </section>
  );
};

export default BookConversation;
