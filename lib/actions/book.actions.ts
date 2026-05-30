'use server'
import { generateSlug, serializeData } from "@/lib/utils";
import Book from "@/database/models/book.model";
import { connectToDatabase } from "@/database/mongoose";
import { CreateBook, TextSegment } from "@/types";
import BookSegment from "@/database/models/book-segment.model";
import { BookCardProps } from '@/types';

export const getAllBooks = async (): Promise<{ success: boolean; data: BookCardProps[] }> => {
  try {
    await connectToDatabase();
    const books = await Book.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: serializeData(books) };
  } catch (e) {
    console.error('Error connecting to a database', e);
    return { success: false, data: [] };
  }
}
export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(data.title);

        const existingBook = await Book.findOne({ slug }).lean();

        if (existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true,
            }
        }
        const book = await Book.create({ ...data, slug, totalSegments: 0 })
        return {
            success: true,
            data: serializeData(book)
        }
    } catch (e) {
        console.error('Error creating a book', e);

        return {
            success: false,
            error: e,
        }
    }
}
export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
    try {
        await connectToDatabase();

        console.log('Saving book segments ... ');

        const segmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
            clerkId, bookId, content: text, segmentIndex, pageNumber, wordCount
        }));

        await BookSegment.insertMany(segmentsToInsert);

        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });

        console.log('Book segments saved successfully.');
        return {
            success : true , 
            data : { segmentsCreated : segments.length}
        }
    } catch (e) {
        console.error('Error saving book segments', e);

        await BookSegment.deleteMany({ bookId });
        await Book.findByIdAndDelete(bookId);
        console.log('Deleted book segments and book due to failure to save segments.');
        return {
            success : false ,
            error : e
        }
    }
}
export const getBookBySlug = async (slug: string) => {
  try {
    await connectToDatabase();
    const book = await Book.findOne({ slug }).lean();
    if (!book) {
      return { success: false, error: 'Book not found' };
    }
    return { success: true, data: serializeData(book) };
  } catch (e) {
    console.error('Error fetching book by slug', e);
    return { success: false, error: e };
  }
}

export const checkBookExists = async (title: string) => {
  try {
    await connectToDatabase();

    const slug = generateSlug(title);

    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        exists: true,
        book: serializeData(existingBook)
      }
    }
    return {
        exists : false
    }
  } catch (e) {
    console.error('Error checking book exists', e);
    return {
      exists: false,
      error: e
    }
  }
}

export const searchBookSegments = async (bookId: string, query: string, numSegments: number = 3) => {
  try {
    await connectToDatabase();

    // Search for segments matching the query using text search
    const segments = await BookSegment.find({
      bookId,
      $text: { $search: query }
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(numSegments)
    .lean();

    if (!segments || segments.length === 0) {
      return {
        success: true,
        data: [],
        message: 'no information found about this topic'
      };
    }

    return {
      success: true,
      data: segments.map(seg => ({
        content: seg.content,
        segmentIndex: seg.segmentIndex,
        pageNumber: seg.pageNumber
      }))
    };
  } catch (e) {
    console.error('Error searching book segments', e);
    return {
      success: false,
      error: e
    };
  }
}

export const searchBooks = async (query: string): Promise<{ success: boolean; data: BookCardProps[] }> => {
  try {
    await connectToDatabase();
    
    if (!query || query.trim() === '') {
      const books = await Book.find().sort({ createdAt: -1 }).lean();
      return { success: true, data: serializeData(books) };
    }

    const regex = new RegExp(query.trim(), 'i');
    const books = await Book.find({
      $or: [
        { title: { $regex: regex } },
        { author: { $regex: regex } }
      ]
    }).sort({ createdAt: -1 }).lean();
    
    return { success: true, data: serializeData(books) };
  } catch (e) {
    console.error('Error searching books', e);
    return { success: false, data: [] };
  }
}