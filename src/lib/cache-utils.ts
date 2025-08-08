import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * Cache utilities for forcing data refreshes
 */

export async function refreshCandidatesCache() {
  try {
    revalidateTag('candidates');
    console.log('🔄 Candidates cache invalidated');
  } catch (error) {
    console.error('Error invalidating candidates cache:', error);
  }
}

export async function refreshAdminSettingsCache() {
  try {
    revalidateTag('admin-settings');
    console.log('🔄 Admin settings cache invalidated');
  } catch (error) {
    console.error('Error invalidating admin settings cache:', error);
  }
}

export async function refreshUserCache() {
  try {
    revalidateTag('user-by-id');
    console.log('🔄 User cache invalidated');
  } catch (error) {
    console.error('Error invalidating user cache:', error);
  }
}

export async function refreshPageCache(path: string) {
  try {
    revalidatePath(path);
    console.log(`🔄 Page cache invalidated for: ${path}`);
  } catch (error) {
    console.error(`Error invalidating page cache for ${path}:`, error);
  }
}

export async function refreshAllCaches() {
  try {
    revalidateTag('candidates');
    revalidateTag('admin-settings');
    revalidateTag('user-by-id');
    revalidateTag('bets');
    revalidateTag('transactions');
    console.log('🔄 All caches invalidated');
  } catch (error) {
    console.error('Error invalidating all caches:', error);
  }
}
