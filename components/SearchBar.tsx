'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'

const SearchBar = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(urlQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery)
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery)

  // Adjust state during render instead of in an effect
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery)
    setQuery(urlQuery)
    setDebouncedQuery(urlQuery)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedQuery.trim()) {
      params.set('q', debouncedQuery.trim())
    } else {
      params.delete('q')
    }
    router.push(`/?${params.toString()}`, { scroll: false })
  }, [debouncedQuery, router, searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      params.set('q', query.trim())
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
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search books..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
    </form>
  )
}

export default SearchBar