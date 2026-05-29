import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBookBySlug } from '@/lib/actions/book.actions';
import BookConversation from '@/components/BookConversation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getBookBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const book = result.data;

  return (
    <main className="book-page-container">
      {/* Floating back button */}
      <Link href="/" className="back-btn-floating">
        <ArrowLeft className="icon-sm text-[var(--text-primary)]" />
      </Link>

      <BookConversation book={book} />
    </main>
  );
}