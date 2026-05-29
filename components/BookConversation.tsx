'use client';

import { IBook } from '@/types';
import VapiControls from './VapiControls';

interface BookConversationProps {
  book: IBook;
}

const BookConversation = ({ book }: BookConversationProps) => {
  return (
    <section className="vapi-main-container">
      <VapiControls book={book} />
    </section>
  );
};

export default BookConversation;