import { useState } from 'react';
import { LinkData } from '../utils/database';
import Button from './Button';

interface LinkCardProps {
  link: LinkData;
  onCopy?: (shortUrl: string) => void;
  onDelete?: (linkId: string) => void;
  baseUrl?: string;
}

export default function LinkCard({ link, onCopy, onDelete, baseUrl = window.location.origin }: LinkCardProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const shortUrl = `${baseUrl}/${link.shortCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      onCopy?.(shortUrl);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !link.id) return;
    
    setIsDeleting(true);
    try {
      await onDelete(link.id);
    } catch (error) {
      console.error('Failed to delete link:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      // Handle Firestore Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatLastClicked = (timestamp: any) => {
    if (!timestamp) return null;
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) {
        return 'Just now';
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header with short URL and clicks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold text-lg truncate transition-colors duration-200"
              title={shortUrl}
            >
              /{link.shortCode}
            </a>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                {link.clicks} {link.clicks === 1 ? 'click' : 'clicks'}
              </span>
              {link.clicks > 0 && link.lastClickedAt && (
                <span className="text-xs text-gray-500">
                  Last: {formatLastClicked(link.lastClickedAt)}
                </span>
              )}
            </div>
          </div>
          
          {/* Original URL */}
          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-1">Original URL:</p>
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 text-sm hover:text-blue-600 transition-colors duration-200 break-all"
              title={link.originalUrl}
            >
              {link.originalUrl}
            </a>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Created {formatDate(link.createdAt)}</span>
            </div>
            
            {link.clicks > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>
                  {link.clicks === 1 ? '1 view' : `${link.clicks} views`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 sm:flex-col sm:w-auto w-full">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className={`flex-1 sm:flex-none transition-all duration-200 ${
              copySuccess 
                ? 'bg-green-50 border-green-300 text-green-700' 
                : 'hover:bg-blue-50 hover:border-blue-300'
            }`}
          >
            {copySuccess ? (
              <div className="flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </div>
            )}
          </Button>

          {onDelete && (
            <Button
              onClick={handleDelete}
              variant="secondary"
              size="sm"
              disabled={isDeleting}
              className="flex-1 sm:flex-none hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
            >
              {isDeleting ? (
                <div className="flex items-center justify-center gap-1">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </div>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Performance indicator */}
      {link.clicks > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Performance</span>
            <div className="flex items-center gap-2">
              {link.clicks >= 100 && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                  🔥 Popular
                </span>
              )}
              {link.clicks >= 50 && link.clicks < 100 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  📈 Trending
                </span>
              )}
              {link.clicks >= 10 && link.clicks < 50 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  ✨ Active
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
