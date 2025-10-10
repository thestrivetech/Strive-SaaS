'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/database/prisma';
import { createClient } from '@/lib/supabase/server';
type UpdateProfileInput = any;
type UpdatePreferencesInput = any;
type UpdateNotificationPreferencesInput = any;
export async function updateProfile(data: UpdateProfileInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = data;

    const updated = await prisma.users.update({
      where: { id: user.id },
      data: {
        name: validated.name,
        email: validated.email,
        // Note: phone and bio fields don't exist in current schema
        // Add them in a future migration if needed
      },
    });

    revalidatePath('/settings/profile');

    return { success: true, user: updated };
  } catch (error) {
    console.error('updateProfile error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile'
    };
  }
}

export async function uploadAvatar(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const file = formData.get('avatar') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: 'File must be less than 2MB' };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'File must be an image (JPEG, PNG, WebP, or GIF)' };
    }

    const supabase = await createClient();

    // Upload to Supabase Storage
    const fileName = `${user.id}-${Date.now()}.${file.type.split('/')[1]}`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      return { success: false, error: `Upload failed: ${error.message}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user with new avatar URL
    await prisma.users.update({
      where: { id: user.id },
      data: { avatar_url: urlData.publicUrl },
    });

    revalidatePath('/settings/profile');

    return { success: true, avatarUrl: urlData.publicUrl };
  } catch (error) {
    console.error('uploadAvatar error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload avatar'
    };
  }
}

export async function updatePreferences(data: UpdatePreferencesInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = data;

    // For now, preferences are client-side only (localStorage)
    // In future, store in user metadata or preferences table
    // This is a placeholder that returns success

    revalidatePath('/settings/profile');

    return { success: true, preferences: validated };
  } catch (error) {
    console.error('updatePreferences error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update preferences'
    };
  }
}

export async function updateNotificationPreferences(data: UpdateNotificationPreferencesInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = data;

    // For now, preferences are client-side only
    // In future, store in user_preferences table or user metadata
    // This is a placeholder that returns success

    revalidatePath('/settings/notifications');

    return { success: true, preferences: validated };
  } catch (error) {
    console.error('updateNotificationPreferences error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update notification preferences'
    };
  }
}
