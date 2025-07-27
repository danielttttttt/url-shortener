/**
 * LandingPage component tests
 * Tests the enhanced URL shortening functionality with improved UI
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LandingPage from '../LandingPage'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock the URL shortening utilities
jest.mock('../../utils/urlShortener', () => ({
  shortenUrl: jest.fn(),
  shortenUrlAnonymous: jest.fn(),
}))

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const renderLandingPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LandingPage />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('LandingPage Enhanced Features', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    })
  })

  test('renders the main heading and description', () => {
    renderLandingPage()
    
    expect(screen.getByText('Shorten Your Links Easily')).toBeInTheDocument()
    expect(screen.getByText('Transform long URLs into short, shareable links in seconds')).toBeInTheDocument()
  })

  test('shows placeholder when no URL is shortened', () => {
    renderLandingPage()
    
    expect(screen.getByText('Your short URL will appear here')).toBeInTheDocument()
    expect(screen.getByText('Enter a URL above and click "Shorten" to get started')).toBeInTheDocument()
  })

  test('displays URL input and custom short code input', () => {
    renderLandingPage()
    
    const urlInput = screen.getByPlaceholderText('Paste your long URL here...')
    const customCodeInput = screen.getByPlaceholderText('custom-link (optional)')
    
    expect(urlInput).toBeInTheDocument()
    expect(customCodeInput).toBeInTheDocument()
  })

  test('shows shorten button and handles loading state', () => {
    renderLandingPage()
    
    const shortenButton = screen.getByRole('button', { name: /shorten/i })
    expect(shortenButton).toBeInTheDocument()
    expect(shortenButton).toBeDisabled() // Should be disabled when no URL is entered
  })

  test('enables shorten button when URL is entered', () => {
    renderLandingPage()
    
    const urlInput = screen.getByPlaceholderText('Paste your long URL here...')
    const shortenButton = screen.getByRole('button', { name: /shorten/i })
    
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } })
    
    expect(shortenButton).not.toBeDisabled()
  })

  test('displays success message and clickable link after successful shortening', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 'test-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'https://yourdomain.com/abc123',
        createdAt: new Date(),
      },
    }

    const { shortenUrlAnonymous } = require('../../utils/urlShortener')
    shortenUrlAnonymous.mockResolvedValue(mockResponse)

    renderLandingPage()
    
    const urlInput = screen.getByPlaceholderText('Paste your long URL here...')
    const shortenButton = screen.getByRole('button', { name: /shorten/i })
    
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } })
    fireEvent.click(shortenButton)

    await waitFor(() => {
      expect(screen.getByText('✅ Link created successfully!')).toBeInTheDocument()
      expect(screen.getByText('Your short URL is ready to share')).toBeInTheDocument()
    })

    // Check if the short URL is displayed as a clickable link
    const shortLink = screen.getByRole('link', { name: /https:\/\/yourdomain\.com\/abc123/i })
    expect(shortLink).toBeInTheDocument()
    expect(shortLink).toHaveAttribute('href', 'https://yourdomain.com/abc123')
    expect(shortLink).toHaveAttribute('target', '_blank')
    expect(shortLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('displays copy button and handles copy functionality', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 'test-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'https://yourdomain.com/abc123',
        createdAt: new Date(),
      },
    }

    const { shortenUrlAnonymous } = require('../../utils/urlShortener')
    shortenUrlAnonymous.mockResolvedValue(mockResponse)

    renderLandingPage()
    
    const urlInput = screen.getByPlaceholderText('Paste your long URL here...')
    const shortenButton = screen.getByRole('button', { name: /shorten/i })
    
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } })
    fireEvent.click(shortenButton)

    await waitFor(() => {
      expect(screen.getByText('✅ Link created successfully!')).toBeInTheDocument()
    })

    // Find and click the copy button
    const copyButton = screen.getByRole('button', { name: /copy/i })
    expect(copyButton).toBeInTheDocument()
    
    fireEvent.click(copyButton)

    // Check if clipboard.writeText was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://yourdomain.com/abc123')

    // Check if the button shows "Copied!" feedback
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })

  test('displays original URL and additional info', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 'test-id',
        originalUrl: 'https://example.com/very-long-url-path',
        shortCode: 'abc123',
        shortUrl: 'https://yourdomain.com/abc123',
        createdAt: new Date(),
      },
    }

    const { shortenUrlAnonymous } = require('../../utils/urlShortener')
    shortenUrlAnonymous.mockResolvedValue(mockResponse)

    renderLandingPage()
    
    const urlInput = screen.getByPlaceholderText('Paste your long URL here...')
    const shortenButton = screen.getByRole('button', { name: /shorten/i })
    
    fireEvent.change(urlInput, { target: { value: 'https://example.com/very-long-url-path' } })
    fireEvent.click(shortenButton)

    await waitFor(() => {
      expect(screen.getByText('Original URL:')).toBeInTheDocument()
      expect(screen.getByText('https://example.com/very-long-url-path')).toBeInTheDocument()
      expect(screen.getByText('Short code:')).toBeInTheDocument()
      expect(screen.getByText('abc123')).toBeInTheDocument()
      expect(screen.getByText('Created anonymously')).toBeInTheDocument()
    })
  })

  test('handles error states gracefully', async () => {
    const mockErrorResponse = {
      success: false,
      error: 'Invalid URL format',
    }

    const { shortenUrlAnonymous } = require('../../utils/urlShortener')
    shortenUrlAnonymous.mockResolvedValue(mockErrorResponse)

    renderLandingPage()
    
    const urlInput = screen.getByPlaceholderText('Paste your long URL here...')
    const shortenButton = screen.getByRole('button', { name: /shorten/i })
    
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } })
    fireEvent.click(shortenButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid URL format')).toBeInTheDocument()
    })

    // Should not show success message
    expect(screen.queryByText('✅ Link created successfully!')).not.toBeInTheDocument()
  })

  test('resets copy success state when shortening new URL', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 'test-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'https://yourdomain.com/abc123',
        createdAt: new Date(),
      },
    }

    const { shortenUrlAnonymous } = require('../../utils/urlShortener')
    shortenUrlAnonymous.mockResolvedValue(mockResponse)

    renderLandingPage()
    
    const urlInput = screen.getByPlaceholderText('Paste your long URL here...')
    const shortenButton = screen.getByRole('button', { name: /shorten/i })
    
    // First shortening
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } })
    fireEvent.click(shortenButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    })

    // Click copy button
    const copyButton = screen.getByRole('button', { name: /copy/i })
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    // Start new shortening - should reset copy state
    fireEvent.change(urlInput, { target: { value: 'https://example2.com' } })
    fireEvent.click(shortenButton)

    // Copy success state should be reset (button should show "Copy" again)
    await waitFor(() => {
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    })
  })
})
