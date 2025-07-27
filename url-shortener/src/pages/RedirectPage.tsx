import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { handleRedirectWithAnalytics, safeRedirect, type RedirectResult } from '../utils/redirectUtils';
import LoadingSpinner from '../components/LoadingSpinner';

const RedirectPage: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [result, setResult] = useState<RedirectResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processRedirect = async () => {
      if (!shortCode) {
        setResult({
          success: false,
          error: 'Invalid short code'
        });
        setLoading(false);
        return;
      }

      try {
        // Handle the redirect with analytics
        const redirectResult = await handleRedirectWithAnalytics(shortCode);
        setResult(redirectResult);

        if (redirectResult.success && redirectResult.originalUrl) {
          // Show success message briefly, then redirect
          setTimeout(() => {
            safeRedirect(redirectResult.originalUrl!, 0);
          }, 1000);
        }
      } catch (error) {
        console.error('Error processing redirect:', error);
        setResult({
          success: false,
          error: 'An unexpected error occurred'
        });
      } finally {
        setLoading(false);
      }
    };

    processRedirect();
  }, [shortCode]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Redirecting...
          </h2>
          <p className="mt-2 text-gray-600">
            Taking you to your destination
          </p>
        </div>
      </div>
    );
  }

  // Link found - show redirect message (brief moment before redirect)
  if (result?.success && result.originalUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-green-500"
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Redirecting...
          </h2>
          <p className="text-gray-600 mb-4">
            Taking you to:
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700 break-all">
              {result.originalUrl}
            </p>
          </div>
          {result.linkData && (
            <div className="text-xs text-gray-500 mb-4">
              <p>Short code: <span className="font-mono">{result.linkData.shortCode}</span></p>
              <p>Total clicks: {result.linkData.clicks}</p>
            </div>
          )}
          <p className="text-xs text-gray-500">
            If you're not redirected automatically,{' '}
            <a
              href={result.originalUrl}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              click here
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Link not found - show error page
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Link Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          {result?.error || 'The short link you\'re looking for doesn\'t exist or may have been removed.'}
        </p>
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-700">
            Short code: <span className="font-mono font-medium">{shortCode}</span>
          </p>
        </div>
        <div className="space-y-3">
          <a
            href="/"
            className="inline-block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Create a New Short Link
          </a>
          <a
            href="/"
            className="inline-block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default RedirectPage;
