'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from './db';

// Cache the betting status for better performance
const getCachedBettingStatus = unstable_cache(
  async () => {
    try {
      const candidate = await prisma.candidate.findFirst({
        where: { status: 'Active' }
      });
      
      // If there are no active candidates, betting is disabled
      if (!candidate) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking betting status:', error);
      return false; // Default to disabled on error
    }
  },
  ['betting-status'],
  { revalidate: 5 } // Cache for 5 seconds
);

export async function getBettingStatus() {
  return getCachedBettingStatus();
}
