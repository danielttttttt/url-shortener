/**
 * Dashboard component tests
 * Tests the user dashboard functionality including link display, search, and management
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'
import { AuthProvider } from '../../contexts/AuthContext'
import { Timestamp } from 'firebase/firestore'

// Mock the database utilities
jest.mock('../../utils/database', () => ({
  getUserLinks: jest.fn(),
  deleteLink: jest.fn(),
}))

// Mock the auth context
const mockCurrentUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
}

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock LinkCard component for simpler testing
jest.mock('../../components/LinkCard', () => {
  return function MockLinkCard({ link, onCopy, onDelete }: any) {
    return (
      <div data-testid={`link-card-${link.id}`}>
        <div>{link.shortCode}</div>
        <div>{link.originalUrl}</div>
        <div>{link.clicks} clicks</div>
        <button onClick={() => onCopy(`http://localhost/${link.shortCode}`)}>
          Copy
        </button>
        <button onClick={() => onDelete(link.id)}>Delete</button>
      </div>
    )
  }
})

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </BrowserRouter>
  )
}

// Mock data
const mockLinks = [
  {
    id: 'link1',
    shortCode: 'abc123',
    originalUrl: 'https://example.com/long-url-1',
    clicks: 42,
    createdAt: {
      toMillis: () => Date.now() - 86400000, // 1 day ago
      toDate: () => new Date(Date.now() - 86400000),
    } as Timestamp,
    lastClickedAt: {
      toMillis: () => Date.now() - 3600000, // 1 hour ago
      toDate: () => new Date(Date.now() - 3600000),
    } as Timestamp,
    userId: 'test-user-123',
  },
  {
    id: 'link2',
    shortCode: 'def456',
    originalUrl: 'https://example.com/long-url-2',
    clicks: 18,
    createdAt: {
      toMillis: () => Date.now() - 172800000, // 2 days ago
      toDate: () => new Date(Date.now() - 172800000),
    } as Timestamp,
    userId: 'test-user-123',
  },
]

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock window.confirm for delete operations
    window.confirm = jest.fn(() => true)
  })

  test('renders welcome message with user email', async () => {
    const { getUserLinks } = require('../../utils/database')
    getUserLinks.mockResolvedValue([])

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, test!/)).toBeInTheDocument()
    })
  })

  test('displays loading state initially', () => {
    const { getUserLinks } = require('../../utils/database')
    getUserLinks.mockImplementation(() => new Promise(() => {})) // Never resolves

    renderDashboard()

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  test('displays statistics cards with correct data', async () => {
    const { getUserLinks } = require('../../utils/database')
    getUserLinks.mockResolvedValue(mockLinks)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // Total Links
      expect(screen.getByText('60')).toBeInTheDocument() // Total Clicks (42 + 18)
      expect(screen.getByText('30')).toBeInTheDocument() // Average Clicks (60/2)
    })
  })

  test('displays user links correctly', async () => {
    const { getUserLinks } = require('../../utils/database')
    getUserLinks.mockResolvedValue(mockLinks)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('link-card-link1')).toBeInTheDocument()
      expect(screen.getByTestId('link-card-link2')).toBeInTheDocument()
      expect(screen.getByText('abc123')).toBeInTheDocument()
      expect(screen.getByText('def456')).toBeInTheDocument()
    })
  })

  test('handles search functionality', async () => {
    const { getUserLinks } = require('../../utils/database')
    getUserLinks.mockResolvedValue(mockLinks)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('link-card-link1')).toBeInTheDocument()
    })

    // Search for specific link
    const searchInput = screen.getByPlaceholderText('Search your links...')
    fireEvent.change(searchInput, { target: { value: 'abc123' } })

    // Should show only matching link
    expect(screen.getByTestId('link-card-link1')).toBeInTheDocument()
    expect(screen.queryByTestId('link-card-link2')).not.toBeInTheDocument()
  })

  test('handles sorting functionality', async () => {
    const { getUserLinks } = require('../../utils/database')
    getUserLinks.mockResolvedValue(mockLinks)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('link-card-link1')).toBeInTheDocument()
    })

    // Change sort to "Most Clicks"
    const sortSelect = screen.getByDisplayValue('Newest First')
    fireEvent.change(sortSelect, { target: { value: 'clicks' } })

    // Links should be reordered (link1 has more clicks than link2)
    const linkCards = screen.getAllByTestId(/link-card-/)
    expect(linkCards[0]).toHaveAttribute('data-testid', 'link-card-link1')
    expect(linkCards[1]).toHaveAttribute('data-testid', 'link-card-link2')
  })

  test('handles link deletion', async () => {
    const { getUserLinks, deleteLink } = require('../../utils/database')
    getUserLinks.mockResolvedValue(mockLinks)
    deleteLink.mockResolvedValue(undefined)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('link-card-link1')).toBeInTheDocument()
    })

    // Click delete button
    const deleteButton = screen.getAllByText('Delete')[0]
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(deleteLink).toHaveBeenCalledWith('link1', 'test-user-123')
    })

    // Link should be removed from UI
    expect(screen.queryByTestId('link-card-link1')).not.toBeInTheDocument()
  })

  test('handles delete confirmation cancellation', async () => {
    const { getUserLinks, deleteLink } = require('../../utils/database')
    getUserLinks.mockResolvedValue(mockLinks)
    window.confirm = jest.fn(() => false) // User cancels

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('link-card-link1')).toBeInTheDocument()
    })

    // Click delete button
    const deleteButton = screen.getAllByText('Delete')[0]
    fireEvent.click(deleteButton)

    // Delete should not be called
    expect(deleteLink).not.toHaveBeenCalled()
    
    // Link should still be visible
    expect(screen.getByTestId('link-card-link1')).toBeInTheDocument()
  })

  test('displays empty state when no links exist', async () => {
    const { getUserLinks } = require('../../utils/database')
    getUserLinks.mockResolvedValue([])

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('No links created yet')).toBeInTheDocument()
      expect(screen.getByText('Start by creating your first short URL on the home page')).toBeInTheDocument()
      expect(screen.getByText('Create Your First Link')).toBeInTheDocument()
    })
  })

  test('displays empty search results', async () => {
    const { getUserLinks } = require('../../utils/database')
    getUserLinks.mockResolvedValue(mockLinks)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('link-card-link1')).toBeInTheDocument()
    })

    // Search for non-existent link
    const searchInput = screen.getByPlaceholderText('Search your links...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText('No links found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument()
  })

  test('handles error state', async () => {
    const { getUserLinks } = require('../../utils/database')
    getUserLinks.mockRejectedValue(new Error('Database error'))

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Failed to load your links')).toBeInTheDocument()
      expect(screen.getByText('Failed to load your links. Please try again.')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
  })

  test('handles refresh functionality', async () => {
    const { getUserLinks } = require('../../utils/database')
    getUserLinks.mockResolvedValue(mockLinks)

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('link-card-link1')).toBeInTheDocument()
    })

    // Click refresh button
    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    // getUserLinks should be called again
    expect(getUserLinks).toHaveBeenCalledTimes(2)
  })

  test('redirects unauthenticated users', () => {
    // Mock unauthenticated state
    jest.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => ({
        currentUser: null,
      }),
      AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    }))

    renderDashboard()

    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.getByText('Please log in to view your dashboard.')).toBeInTheDocument()
  })
})
