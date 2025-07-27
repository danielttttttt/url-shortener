/**
 * Example usage of database functions
 * This file demonstrates how to use the database utility functions
 * Remove this file once you've integrated the functions into your components
 */

import { 
  createLink, 
  getLinkByShortCode, 
  getUserLinks, 
  incrementLinkClicks, 
  shortCodeExists,
  type CreateLinkData 
} from './database';

// Example: Creating a new link
export const exampleCreateLink = async (userId: string) => {
  try {
    const newLinkData: CreateLinkData = {
      originalUrl: 'https://www.example.com/very-long-url-that-needs-shortening',
      shortCode: 'abc123', // This could be generated or user-provided
      userId: userId
    };

    const linkId = await createLink(newLinkData);
    console.log('Created link with ID:', linkId);
    return linkId;
  } catch (error) {
    console.error('Failed to create link:', error);
  }
};

// Example: Getting a link by short code (for redirection)
export const exampleGetLinkForRedirection = async (shortCode: string) => {
  try {
    const link = await getLinkByShortCode(shortCode);
    
    if (link) {
      console.log('Found link:', link);
      
      // Increment the click count
      await incrementLinkClicks(link.id!);
      
      // Return the original URL for redirection
      return link.originalUrl;
    } else {
      console.log('Link not found for short code:', shortCode);
      return null;
    }
  } catch (error) {
    console.error('Failed to get link:', error);
    return null;
  }
};

// Example: Getting all links for a user (for dashboard)
export const exampleGetUserDashboard = async (userId: string) => {
  try {
    const userLinks = await getUserLinks(userId);
    console.log(`Found ${userLinks.length} links for user:`, userLinks);
    
    // Calculate total clicks
    const totalClicks = userLinks.reduce((sum, link) => sum + link.clicks, 0);
    console.log('Total clicks across all links:', totalClicks);
    
    return {
      links: userLinks,
      totalClicks
    };
  } catch (error) {
    console.error('Failed to get user dashboard:', error);
    return null;
  }
};

// Example: Checking if a short code is available
export const exampleCheckShortCodeAvailability = async (shortCode: string) => {
  try {
    const exists = await shortCodeExists(shortCode);
    
    if (exists) {
      console.log(`Short code "${shortCode}" is already taken`);
      return false;
    } else {
      console.log(`Short code "${shortCode}" is available`);
      return true;
    }
  } catch (error) {
    console.error('Failed to check short code availability:', error);
    return false;
  }
};

// Example: Complete workflow for creating a link with validation
export const exampleCompleteWorkflow = async (
  originalUrl: string, 
  desiredShortCode: string, 
  userId: string
) => {
  try {
    // Step 1: Check if short code is available
    const isAvailable = await exampleCheckShortCodeAvailability(desiredShortCode);
    
    if (!isAvailable) {
      throw new Error('Short code is already taken');
    }
    
    // Step 2: Create the link
    const linkId = await createLink({
      originalUrl,
      shortCode: desiredShortCode,
      userId
    });
    
    // Step 3: Verify the link was created
    const createdLink = await getLinkByShortCode(desiredShortCode);
    
    console.log('Link creation workflow completed successfully:', {
      linkId,
      shortCode: desiredShortCode,
      originalUrl,
      createdAt: createdLink?.createdAt
    });
    
    return {
      success: true,
      linkId,
      shortCode: desiredShortCode,
      link: createdLink
    };
  } catch (error) {
    console.error('Link creation workflow failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
