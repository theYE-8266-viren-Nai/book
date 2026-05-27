import Link from "next/link";
import { BookCardProps } from "@/types";
import Image from "next/image";

const BookCard = ({ title, author, coverURL, slug }: BookCardProps) => {
  return (
    <Link href={`/books/${slug}`}>
      <article className="book-card">
        <div className="book-card-cover-wrapper">
          <Image
            src={coverURL}
            alt={title}
            width={133}
            height={200}
            className="book-card-cover"
          />
        </div>
        <div className="book-card-meta">
          <p className="book-card-title">{title}</p>
          <p className="book-card-author">{author}</p>
        </div>
      </article>
    </Link>
  );
};

export default BookCard;