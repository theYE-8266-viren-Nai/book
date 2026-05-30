import React from 'react'
import HeroSection from '@/components/HeroSection'
import BooksGrid from '@/components/BooksGrid'
import { searchBooks } from '@/lib/actions/book.actions'
import SearchBar from '@/components/SearchBar'

const page = async ({ searchParams }: { searchParams: Promise<{ q?: string }> }) => {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const bookResults = await searchBooks(query);
  const Books = bookResults.success ? bookResults.data : [];
  

  return (
    <>
      <HeroSection />
      <div className="wrapper py-8 md:py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Books</h2>
          <SearchBar />
        </div>
        <BooksGrid books={Books} />
      </div>
    </>
  )
}

export default page