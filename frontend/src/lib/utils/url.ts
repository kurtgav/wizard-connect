import { supabase } from '@/lib/supabase';

/**
 * Get's correct public URL for avatar images.
 * Handles both full URLs and Supabase Storage paths.
 * @param avatarUrl - The avatar URL from the database
 * @returns The properly formatted public URL
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) return '';

  // If it's already a full URL, return as-is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // If it's a Supabase Storage path, convert to public URL
  if (avatarUrl.startsWith('/')) {
    const { data } = supabase.storage.from('avatars').getPublicUrl(avatarUrl);
    return data.publicUrl;
  }

  return avatarUrl;
}

