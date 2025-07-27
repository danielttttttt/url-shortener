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
  const [copySuccess, setCopySuccess] = useState(false)

  const handleShorten = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    setError('')
    setResult(null)
    setCopySuccess(false) // Reset copy success state

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
      setCopySuccess(true)
      // Reset the success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // You could show an error message here if needed
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
              {/* Success Message */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-green-800">
                    ✅ Link created successfully!
                  </h3>
                  <p className="text-sm text-green-700">
                    Your short URL is ready to share
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Short URL Display */}
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="flex-1 w-full">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Your short link:</span>
                      </div>
                      <a
                        href={result.data.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-gray-100 font-mono text-sm transition-colors duration-200 break-all"
                      >
                        {result.data.shortUrl}
                      </a>
                    </div>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className={`sm:w-auto w-full transition-all duration-200 ${
                        copySuccess
                          ? 'bg-green-100 border-green-300 text-green-700'
                          : 'hover:bg-green-50'
                      }`}
                    >
                      {copySuccess ? (
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Copied!
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Original URL Display */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Original URL:</span>
                  </div>
                  <div className="text-sm text-gray-700 break-all font-mono">
                    {result.data.originalUrl}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-green-600">
                  <div>
                    Short code: <span className="font-mono font-medium">{result.data.shortCode}</span>
                  </div>
                  <div className="flex items-center">
                    {currentUser ? (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Saved to your account
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Created anonymously
                      </span>
                    )}
                  </div>
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
