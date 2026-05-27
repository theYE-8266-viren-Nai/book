import BookCard from './BookCard';
import { BookCardProps } from '@/types';

const BooksGrid = ({ books }: { books: BookCardProps[] }) => (
  <div className="library-books-grid">
    {books.map((book) => (
      <BookCard key={book._id} {...book} />
    ))}
  </div>
);

export default BooksGrid;