import React from 'react'
import HeroSection from '@/components/HeroSection'
import BooksGrid from '@/components/BooksGrid'
import { connectToDatabase } from '@/database/mongoose'
import { getAllBooks } from '@/lib/actions/book.actions'

const page = async () => {
  const bookResults = await getAllBooks();
  const Books = bookResults.success ? bookResults.data : [];
  

  return (
    <>
      <HeroSection />
      <BooksGrid books={Books} />
    </>
  )
}

export default page