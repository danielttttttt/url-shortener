import { useState } from 'react'
import Button from '../components/Button'
import { useAuth } from '../contexts/AuthContext'
import { shortenUrl, shortenUrlAnonymous, type ShortenUrlResponse } from '../utils/urlShortener'

const LandingPage = () => {
  const { currentUser } = useAuth()
  const [url, setUrl] = useState('')
  const [customShortCode, setCustomShortCode] = useState('')
  const [result, setResult] = useState<ShortenUrlResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleShorten = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      let response: ShortenUrlResponse

      if (currentUser) {
        // User is authenticated
        response = await shortenUrl({
          originalUrl: url,
          customShortCode: customShortCode.trim() || undefined,
          userId: currentUser.uid
        })
      } else {
        // Anonymous user
        response = await shortenUrlAnonymous(url, customShortCode.trim() || undefined)
      }

      if (response.success && response.data) {
        setResult(response)
        setUrl('')
        setCustomShortCode('')
      } else {
        setError(response.error || 'Failed to shorten URL')
      }
    } catch (err) {
      console.error('Error shortening URL:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result?.data?.shortUrl) return

    try {
      await navigator.clipboard.writeText(result.data.shortUrl)
      // You could add a toast notification here
      console.log('URL copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div className="w-full max-w-2xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Shorten Your Links Easily
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Transform long URLs into short, shareable links in seconds
            </p>
          </div>

          {/* URL Input Section */}
          <div className="space-y-4 mb-8">
            {/* Main URL Input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long URL here..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleShorten}
                disabled={!url.trim() || isLoading}
                className="sm:w-auto w-full"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Shortening...
                  </div>
                ) : (
                  'Shorten'
                )}
              </Button>
            </div>

            {/* Custom Short Code Input */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-2 whitespace-nowrap">
                    {window.location.origin}/
                  </span>
                  <input
                    type="text"
                    value={customShortCode}
                    onChange={(e) => setCustomShortCode(e.target.value)}
                    placeholder="custom-link (optional)"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-700 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 sm:w-auto w-full">
                Leave empty for random code
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Result Section */}
          {result?.success && result.data && (
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-100">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                Your shortened URL:
              </h3>
              <div className="space-y-3">
                {/* Short URL */}
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={result.data.shortUrl}
                      readOnly
                      className="w-full px-4 py-3 bg-white border border-green-200 rounded-lg text-gray-700 font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="sm:w-auto w-full"
                  >
                    Copy
                  </Button>
                </div>

                {/* Original URL Display */}
                <div className="text-sm text-green-700">
                  <span className="font-medium">Original URL:</span>
                  <div className="mt-1 p-2 bg-white rounded border border-green-200 break-all">
                    {result.data.originalUrl}
                  </div>
                </div>

                {/* Short Code Info */}
                <div className="text-xs text-green-600">
                  Short code: <span className="font-mono font-medium">{result.data.shortCode}</span>
                  {currentUser ? ' • Saved to your account' : ' • Created anonymously'}
                </div>
              </div>
            </div>
          )}

          {/* Placeholder when no URL is shortened yet */}
          {!result && (
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200 text-center">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                Your short URL will appear here
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Enter a URL above and click "Shorten" to get started
              </p>
              <p className="text-gray-400 text-xs mt-2">
                💡 Tip: Add a custom short code or leave it empty for a random one
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Fast, secure, and reliable URL shortening service</p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
