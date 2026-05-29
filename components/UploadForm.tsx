'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, ImageIcon, X, Volume2 } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'
import { BookUploadFormValues } from '@/types'
import { checkBookExists, createBook, saveBookSegments } from '@/lib/actions/book.actions'
import { parsePDFFile } from '@/lib/utils'
// import router from 'next/router' // removed duplicate import
import { upload } from '@vercel/blob/client'
import { validatePdfFile, validateCoverImage } from '@/lib/validation'
// Zod validation schema
import { UploadSchema } from '@/lib/zod'

const MALE_VOICES = [
    {
        id: 'dave',
        name: 'Dave',
        description: 'Young male, British-Essex, casual & conversational',
    },
    {
        id: 'daniel',
        name: 'Daniel',
        description: 'Middle-aged male, British, authoritative but warm',
    },
    {
        id: 'chris',
        name: 'Chris',
        description: 'Male casual & easy-going',
    },
]

const FEMALE_VOICES = [
    {
        id: 'rachel',
        name: 'Rachel',
        description: 'Young female, American calm & clear',
    },
    {
        id: 'sarah',
        name: 'Sarah',
        description: 'Young female, American, soft & approachable',
    },
]

const UploadForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [coverImage, setCoverImage] = useState<File | null>(null)
    const { userId } = useAuth();
    const router = useRouter()
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
        setValue,
        setError,

    } = useForm({
        resolver: zodResolver(UploadSchema),
        defaultValues: {
            title: '',
            author: '',
            pdfFile: undefined,
            coverImage: undefined,
            persona: 'rachel',
        },
    })

    const selectedVoice = useWatch({
        control,
        name: 'persona',
    })

    const handlePdfDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const files = e.dataTransfer?.files
        if (files && files[0]) {
            const file = files[0]
            const errorMsg = validatePdfFile(file)
            if (errorMsg) {
                setError('pdfFile', { type: 'manual', message: errorMsg })
                return
            }
            setPdfFile(file)
            setValue('pdfFile', file)
        }
    }

    const handleCoverDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const files = e.dataTransfer?.files
        if (files && files[0]) {
            const file = files[0]
            const errorMsg = validateCoverImage(file)
            if (errorMsg) {
                setError('coverImage', { type: 'manual', message: errorMsg })
                return
            }
            setCoverImage(file)
            setValue('coverImage', file)
        }
    }

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files[0]) {
            const file = files[0]
            const errorMsg = validatePdfFile(file)
            if (errorMsg) {
                setError('pdfFile', { type: 'manual', message: errorMsg })
                return
            }
            setPdfFile(file)
            setValue('pdfFile', file)
        }
    }

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files[0]) {
            const file = files[0]
            const errorMsg = validateCoverImage(file)
            if (errorMsg) {
                setError('coverImage', { type: 'manual', message: errorMsg })
                return
            }
            setCoverImage(file)
            setValue('coverImage', file)
        }
    }

    const removePdf = () => {
        setPdfFile(null)
        setValue('pdfFile', undefined)
    }

    const removeCover = () => {
        setCoverImage(null)
        setValue('coverImage', undefined)
    }

    const onSubmit = async (data: BookUploadFormValues) => {
        if (!userId) {
            return toast.error("Please Login to upload books")
        }
        setIsSubmitting(true)
        try {
            // Validate PDF file
            const existsCheck = await checkBookExists(data.title);
            if (existsCheck.exists && existsCheck.book) {
                toast.info('Book with same title already exists')
                reset();
                router.push(`/books/${existsCheck.book.slug}`)
                return
            }
            const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
            // data.pdfFile may be a FileList or a single File
            const pdfFile = (Array.isArray(data.pdfFile) ? data.pdfFile[0] : data.pdfFile) as File;
            if (!pdfFile) {
                toast.error("Please select a PDF file to upload");
                return;
            }
            const parsedPDF = await parsePDFFile(pdfFile);

            if (parsedPDF.content.length === 0) {
                toast.error("Failed to parse PDF. Please try again with a different file.");
                return;
            }
            const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
                access: 'public',
                handleUploadUrl: '/api/upload',
                contentType: 'application/pdf'
            });

            let coverUrl: string;

            // Handle optional cover image upload or generate from PDF
            if (data.coverImage) {
                const coverFile = data.coverImage as File;
                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                    contentType: coverFile.type,
                });
                coverUrl = uploadedCoverBlob.url;
            } else {
                const response = await fetch(parsedPDF.cover);
                const blob = await response.blob();
                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                    contentType: 'image/png',
                });
                coverUrl = uploadedCoverBlob.url;
            }

            // Create the book entry
            const book = await createBook({
                clerkId: userId,
                title: data.title,
                author: data.author,
                persona: data.persona,
                fileURL: uploadedPdfBlob.url,
                fileBlobKey: uploadedPdfBlob.pathname,
                coverURL: coverUrl,
                fileSize: pdfFile.size,
            });
            if (!book.success) throw new Error("Failed to create book");
            if (book.alreadyExists) {
                toast.info('Book with same title already exists');
                reset();
                router.push(`/books/${existsCheck.book.slug}`);
                return;
            }
            const segments = await saveBookSegments(book.data._id, userId, parsedPDF.content);
            if (!segments.success) {
                toast.error("Failed to save book segments");
                throw new Error("Failed to save book segments");
            }
            reset();
            router.push('/');
        } catch (error) {
            console.error('Error submitting form:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            {/* Loading Overlay */}
            {isSubmitting && (
                <div className="loading-wrapper">
                    <div className="loading-shadow-wrapper bg-[var(--bg-card)]">
                        <div className="loading-shadow">
                            <div className="loading-animation">
                                <Volume2 className="w-12 h-12 text-[var(--color-brand)]" />
                            </div>
                            <div className="loading-title">Creating Your Book</div>
                            <div className="loading-progress">
                                <div className="loading-progress-item">
                                    <span className="loading-progress-status" />
                                    <span className="text-[var(--text-secondary)]">
                                        Processing PDF
                                    </span>
                                </div>
                                <div className="loading-progress-item">
                                    <span className="loading-progress-status" />
                                    <span className="text-[var(--text-secondary)]">
                                        Generating audio
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Form */}
            <div className="new-book-wrapper">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* PDF Upload */}
                    <div>
                        <label htmlFor="pdf-upload" className="form-label">
                            Book PDF File
                        </label>
                        <label
                            htmlFor="pdf-upload"
                            className="upload-dropzone border-2 border-dashed border-[var(--border-subtle)]"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handlePdfDrop}
                        >
                            {pdfFile ? (
                                <div className="file-upload-shadow w-full">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <Upload className="upload-dropzone-icon text-[var(--color-brand)]" />
                                            <div>
                                                <p className="text-[var(--text-primary)] font-medium">
                                                    {pdfFile.name}
                                                </p>
                                                <p className="text-sm text-[var(--text-muted)]">
                                                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                removePdf()
                                            }}
                                            className="upload-dropzone-remove"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="file-upload-shadow">
                                    <Upload className="upload-dropzone-icon" />
                                    <p className="upload-dropzone-text">Click to upload PDF</p>
                                    <p className="upload-dropzone-hint">PDF file (max 50MB)</p>
                                </div>
                            )}
                            <input
                                {...register('pdfFile')}
                                id="pdf-upload"
                                type="file"
                                accept=".pdf"
                                onChange={handlePdfChange}
                                className="hidden"
                            />
                        </label>
                        {errors.pdfFile && (
                            <p className="text-red-500 text-sm mt-2">
                                {typeof errors.pdfFile?.message === 'string'
                                    ? errors.pdfFile.message
                                    : 'PDF file is required'}
                            </p>
                        )}
                    </div>

                    {/* Cover Image Upload */}
                    <div>
                        <label htmlFor="cover-upload" className="form-label">
                            Cover Image (Optional)
                        </label>
                        <label
                            htmlFor="cover-upload"
                            className="upload-dropzone border-2 border-dashed border-[var(--border-subtle)]"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleCoverDrop}
                        >
                            {coverImage ? (
                                <div className="file-upload-shadow w-full">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <ImageIcon className="upload-dropzone-icon text-[var(--color-brand)]" />
                                            <div>
                                                <p className="text-[var(--text-primary)] font-medium">
                                                    {coverImage.name}
                                                </p>
                                                <p className="text-sm text-[var(--text-muted)]">
                                                    {(coverImage.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                removeCover()
                                            }}
                                            className="upload-dropzone-remove"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="file-upload-shadow">
                                    <ImageIcon className="upload-dropzone-icon" />
                                    <p className="upload-dropzone-text">Click to upload cover image</p>
                                    <p className="upload-dropzone-hint">
                                        Leave empty to auto-generate from PDF
                                    </p>
                                </div>
                            )}
                            <input
                                id="cover-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Title Input */}
                    <div>
                        <label htmlFor="title" className="form-label">
                            Title
                        </label>
                        <input
                            {...register('title')}
                            id="title"
                            type="text"
                            placeholder="ex: Rich Dad Poor Dad"
                            className="form-input"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-2">
                                {typeof errors.title?.message === 'string'
                                    ? errors.title.message
                                    : 'Title is required'}
                            </p>
                        )}
                    </div>

                    {/* Author Input */}
                    <div>
                        <label htmlFor="author" className="form-label">
                            Author Name
                        </label>
                        <input
                            {...register('author')}
                            id="author"
                            type="text"
                            placeholder="ex: Robert Kiyosaki"
                            className="form-input"
                        />
                        {errors.author && (
                            <p className="text-red-500 text-sm mt-2">
                                {typeof errors.author?.message === 'string'
                                    ? errors.author.message
                                    : 'Author name is required'}
                            </p>
                        )}
                    </div>

                    {/* Voice Selector */}
                    <div>
                        <label className="form-label">Choose Assistant Voice</label>

                        {/* Male Voices */}
                        <div className="mb-6">
                            <p className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                                Male Voices
                            </p>
                            <div className="voice-selector-options">
                                {MALE_VOICES.map((voice) => (
                                    <label
                                        key={voice.id}
                                        className={`voice-selector-option ${selectedVoice === voice.id
                                            ? 'voice-selector-option-selected'
                                            : 'voice-selector-option-default'
                                            }`}
                                    >
                                        <input
                                            {...register('persona')}
                                            type="radio"
                                            value={voice.id}
                                            className="hidden"
                                        />
                                        <div className="flex flex-col items-start gap-1 cursor-pointer">
                                            <p className="font-semibold text-[var(--text-primary)]">
                                                {voice.name}
                                            </p>
                                            <p className="text-xs text-[var(--text-secondary)]">
                                                {voice.description}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Female Voices */}
                        <div>
                            <p className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                                Female Voices
                            </p>
                            <div className="voice-selector-options">
                                {FEMALE_VOICES.map((voice) => (
                                    <label
                                        key={voice.id}
                                        className={`voice-selector-option ${selectedVoice === voice.id
                                            ? 'voice-selector-option-selected'
                                            : 'voice-selector-option-default'
                                            }`}
                                    >
                                        <input
                                            {...register('persona')}
                                            type="radio"
                                            value={voice.id}
                                            className="hidden"
                                        />
                                        <div className="flex flex-col items-start gap-1 cursor-pointer">
                                            <p className="font-semibold text-[var(--text-primary)]">
                                                {voice.name}
                                            </p>
                                            <p className="text-xs text-[var(--text-secondary)]">
                                                {voice.description}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {errors.persona && (
                            <p className="text-red-500 text-sm mt-2">
                                {typeof errors.persona?.message === 'string'
                                    ? errors.persona.message
                                    : 'Please select a voice'}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="form-btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Begin Synthesis
                    </button>
                </form>
            </div>
        </>
    )
}

export default UploadForm
