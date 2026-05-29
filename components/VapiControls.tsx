'use client';
import Image from 'next/image';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { IBook } from '@/types';
import { getVoice, formatDuration } from '@/lib/utils';
import useVapi, { CallStatus } from '@/hooks/useVapi';
import Transcript from './Transcript';

const statusMap: Record<CallStatus, { label: string; dotClass: string }> = {
  idle: { label: 'Ready', dotClass: 'vapi-status-dot vapi-status-dot-ready' },
  connecting: { label: 'Connecting...', dotClass: 'vapi-status-dot vapi-status-dot-connecting' },
  starting: { label: 'Starting...', dotClass: 'vapi-status-dot vapi-status-dot-connecting' },
  listening: { label: 'Listening', dotClass: 'vapi-status-dot vapi-status-dot-listening' },
  thinking: { label: 'Thinking', dotClass: 'vapi-status-dot vapi-status-dot-thinking' },
  speaking: { label: 'Speaking', dotClass: 'vapi-status-dot vapi-status-dot-speaking' },
};

const VapiControls = ({ book }: { book: IBook }) => {
  const {
    status,
    isActive,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    start,
    stop,
  } = useVapi(book);

  const voice = getVoice(book.persona);
  const maxDuration = 15 * 60; // 15 minutes

  const currentStatus = statusMap[status];
  const isAIPulsing = isActive && (status === 'thinking' || status === 'speaking');

  return (
    <section className="vapi-main-container">
      {/* Header Card */}
      <div className="vapi-header-card w-full">
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
            {isAIPulsing && <span className="vapi-pulse-ring bg-white/30" />}
            <button
              onClick={isActive ? stop : start}
              disabled={status === 'connecting'}
              aria-label={isActive ? 'End voice session' : 'Start voice session'}
              className={`vapi-mic-btn ${isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'} shadow-md !w-[60px] !h-[60px]`}
            >
              {isActive ? (
                <Mic className="w-6 h-6 text-[var(--text-secondary)]" />
              ) : (
                <MicOff className="w-6 h-6 text-[var(--accent-warm)]" />
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
                {formatDuration(duration)}/{formatDuration(maxDuration)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Area */}
      <div className="vapi-transcript-wrapper w-full mt-5">
        <Transcript
          messages={messages}
          currentMessage={currentMessage}
          currentUserMessage={currentUserMessage}
        />
      </div>
    </section>
  );
};

export default VapiControls;