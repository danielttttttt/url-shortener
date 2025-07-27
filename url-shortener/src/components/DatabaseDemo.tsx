import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  createLink, 
  getUserLinks, 
  shortCodeExists,
  type LinkData,
  type CreateLinkData 
} from '../utils/database';

/**
 * Demo component to test database functionality
 */
const DatabaseDemo: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userLinks, setUserLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [originalUrl, setOriginalUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserLinks();
      } else {
        setUserLinks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserLinks();
    }
  }, [user]);

  const loadUserLinks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const links = await getUserLinks(user.uid);
      setUserLinks(links);
    } catch (error) {
      setMessage('Error loading links: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage('Please log in to create links');
      return;
    }

    if (!originalUrl || !shortCode) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const exists = await shortCodeExists(shortCode);
      if (exists) {
        setMessage('Short code already exists. Please choose a different one.');
        return;
      }
      const linkData: CreateLinkData = {
        originalUrl,
        shortCode,
        userId: user.uid
      };

      const linkId = await createLink(linkData);
      setMessage(`Link created successfully! ID: ${linkId}`);

      setOriginalUrl('');
      setShortCode('');

      await loadUserLinks();
    } catch (error) {
      setMessage('Error creating link: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Database Demo</h2>
        <p>Please log in to test database functionality.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Database Demo</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Create New Link</h3>
        <form onSubmit={handleCreateLink} className="space-y-4">
          <div>
            <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Original URL
            </label>
            <input
              type="url"
              id="originalUrl"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://www.example.com/long-url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="shortCode" className="block text-sm font-medium text-gray-700 mb-1">
              Short Code
            </label>
            <input
              type="text"
              id="shortCode"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              placeholder="abc123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Link'}
          </button>
        </form>
        
        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Your Links</h3>
          <button
            onClick={loadUserLinks}
            disabled={loading}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {userLinks.length === 0 ? (
          <p className="text-gray-500 italic">No links created yet.</p>
        ) : (
          <div className="space-y-3">
            {userLinks.map((link) => (
              <div key={link.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-blue-600">/{link.shortCode}</p>
                    <p className="text-sm text-gray-600 break-all">{link.originalUrl}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{link.clicks} clicks</p>
                    <p>{link.createdAt.toDate().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {userLinks.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Links:</span>
              <span className="ml-2 font-medium">{userLinks.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Clicks:</span>
              <span className="ml-2 font-medium">
                {userLinks.reduce((sum, link) => sum + link.clicks, 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseDemo;
