import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  clicks: number;
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [url, setUrl] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([
    {
      id: '1',
      originalUrl: 'https://www.example.com/very-long-url-that-needs-shortening',
      shortUrl: 'https://short.ly/abc123',
      createdAt: '2024-01-15',
      clicks: 42
    },
    {
      id: '2',
      originalUrl: 'https://www.another-example.com/another-long-url',
      shortUrl: 'https://short.ly/def456',
      createdAt: '2024-01-14',
      clicks: 18
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleShorten = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const newUrl: ShortenedUrl = {
        id: Date.now().toString(),
        originalUrl: url,
        shortUrl: `https://short.ly/${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date().toISOString().split('T')[0],
        clicks: 0
      };
      setShortenedUrls([newUrl, ...shortenedUrls]);
      setUrl('');
      setIsLoading(false);
    }, 1000);
  };

  const handleCopy = async (shortUrl: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = (id: string) => {
    setShortenedUrls(shortenedUrls.filter(url => url.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Manage your shortened URLs and track their performance.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create New Short URL
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                'Shorten URL'
              )}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Your URLs ({shortenedUrls.length})
            </h2>
          </div>
          
          {shortenedUrls.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No URLs shortened yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first short URL above</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {shortenedUrls.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <a
                          href={item.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium truncate"
                        >
                          {item.shortUrl}
                        </a>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {item.clicks} clicks
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm truncate" title={item.originalUrl}>
                        {item.originalUrl}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Created on {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopy(item.shortUrl)}
                        variant="outline"
                        size="sm"
                      >
                        Copy
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        variant="secondary"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
