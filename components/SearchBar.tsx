'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const SearchBar = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const isUserInput = useRef(false)

  useEffect(() => {
    if (!isUserInput.current) return

    const trimmed = query.trim()
    if (trimmed === (searchParams.get('q') || '')) {
      isUserInput.current = false
      return
    }

    const timer = setTimeout(() => {
      isUserInput.current = false
      const params = new URLSearchParams(searchParams.toString())
      if (trimmed) {
        params.set('q', trimmed)
      } else {
        params.delete('q')
      }
      router.push(`/?${params.toString()}`, { scroll: false })
    }, 300)

    return () => clearTimeout(timer)
  }, [query, router, searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    const trimmed = query.trim()
    if (trimmed) {
      params.set('q', trimmed)
    } else {
      params.delete('q')
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-64">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          isUserInput.current = true
          setQuery(e.target.value)
        }}
        placeholder="Search books..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
    </form>
  )
}

export default SearchBar
