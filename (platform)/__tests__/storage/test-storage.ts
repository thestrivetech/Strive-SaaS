/**
 * Storage Test Script
 * Tests file upload, download, signed URLs, and deletion
 */

// Load environment variables
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

import { createClient } from '@supabase/supabase-js';

async function testStorage() {
  console.log('🧪 Testing Storage Buckets\n');
  console.log('=' .repeat(60));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const testResults = {
    attachments: { upload: false, signedUrl: false, download: false, delete: false },
    avatars: { upload: false, signedUrl: false, download: false, delete: false },
    publicAssets: { upload: false, signedUrl: false, download: false, delete: false },
  };

  try {
    // Test 1: Attachments bucket (private)
    console.log('\n🧪 Test 1: Attachments Bucket (Private)');
    console.log('-'.repeat(60));

    const attachmentContent = Buffer.from('Test attachment file content');
    const attachmentPath = 'test/test-attachment.txt';

    // Upload
    console.log('📤 Uploading file to attachments bucket...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(attachmentPath, attachmentContent, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message);
    } else {
      console.log('✅ File uploaded:', uploadData.path);
      testResults.attachments.upload = true;
    }

    // Generate signed URL (private bucket requires signed URL)
    if (testResults.attachments.upload) {
      console.log('🔗 Generating signed URL...');
      const { data: urlData, error: urlError } = await supabase.storage
        .from('attachments')
        .createSignedUrl(attachmentPath, 3600);

      if (urlError) {
        console.log('❌ Signed URL failed:', urlError.message);
      } else {
        console.log('✅ Signed URL generated');
        console.log('   URL (first 80 chars):', urlData.signedUrl.substring(0, 80) + '...');
        testResults.attachments.signedUrl = true;
      }
    }

    // Download
    if (testResults.attachments.upload) {
      console.log('📥 Downloading file...');
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('attachments')
        .download(attachmentPath);

      if (downloadError) {
        console.log('❌ Download failed:', downloadError.message);
      } else {
        const downloadedText = await downloadData.text();
        console.log('✅ File downloaded');
        console.log('   Content:', downloadedText);
        testResults.attachments.download = true;
      }
    }

    // Delete
    if (testResults.attachments.upload) {
      console.log('🗑️  Deleting file...');
      const { error: deleteError } = await supabase.storage
        .from('attachments')
        .remove([attachmentPath]);

      if (deleteError) {
        console.log('❌ Delete failed:', deleteError.message);
      } else {
        console.log('✅ File deleted');
        testResults.attachments.delete = true;
      }
    }

    // Test 2: Avatars bucket (public)
    console.log('\n🧪 Test 2: Avatars Bucket (Public)');
    console.log('-'.repeat(60));

    // Create a simple test image (1x1 transparent PNG)
    const avatarContent = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const avatarPath = 'test/test-avatar.png';

    // Upload
    console.log('📤 Uploading image to avatars bucket...');
    const { data: avatarUploadData, error: avatarUploadError } = await supabase.storage
      .from('avatars')
      .upload(avatarPath, avatarContent, {
        contentType: 'image/png',
        upsert: true
      });

    if (avatarUploadError) {
      console.log('❌ Upload failed:', avatarUploadError.message);
    } else {
      console.log('✅ Image uploaded:', avatarUploadData.path);
      testResults.avatars.upload = true;
    }

    // Get public URL (no signature needed for public bucket)
    if (testResults.avatars.upload) {
      console.log('🔗 Getting public URL...');
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(avatarPath);

      console.log('✅ Public URL retrieved');
      console.log('   URL (first 80 chars):', publicUrlData.publicUrl.substring(0, 80) + '...');
      testResults.avatars.signedUrl = true; // Using same flag for consistency
    }

    // Download
    if (testResults.avatars.upload) {
      console.log('📥 Downloading image...');
      const { data: avatarDownloadData, error: avatarDownloadError } = await supabase.storage
        .from('avatars')
        .download(avatarPath);

      if (avatarDownloadError) {
        console.log('❌ Download failed:', avatarDownloadError.message);
      } else {
        console.log('✅ Image downloaded');
        console.log('   Size:', avatarDownloadData.size, 'bytes');
        testResults.avatars.download = true;
      }
    }

    // Delete
    if (testResults.avatars.upload) {
      console.log('🗑️  Deleting image...');
      const { error: avatarDeleteError } = await supabase.storage
        .from('avatars')
        .remove([avatarPath]);

      if (avatarDeleteError) {
        console.log('❌ Delete failed:', avatarDeleteError.message);
      } else {
        console.log('✅ Image deleted');
        testResults.avatars.delete = true;
      }
    }

    // Test 3: Public assets bucket (public)
    console.log('\n🧪 Test 3: Public Assets Bucket (Public)');
    console.log('-'.repeat(60));

    const assetContent = Buffer.from('# Test Asset\n\nThis is a test markdown file.');
    const assetPath = 'test/test-asset.md';

    // Upload
    console.log('📤 Uploading file to public-assets bucket...');
    const { data: assetUploadData, error: assetUploadError } = await supabase.storage
      .from('public-assets')
      .upload(assetPath, assetContent, {
        contentType: 'text/markdown',
        upsert: true
      });

    if (assetUploadError) {
      console.log('❌ Upload failed:', assetUploadError.message);
    } else {
      console.log('✅ File uploaded:', assetUploadData.path);
      testResults.publicAssets.upload = true;
    }

    // Get public URL
    if (testResults.publicAssets.upload) {
      console.log('🔗 Getting public URL...');
      const { data: assetUrlData } = supabase.storage
        .from('public-assets')
        .getPublicUrl(assetPath);

      console.log('✅ Public URL retrieved');
      console.log('   URL (first 80 chars):', assetUrlData.publicUrl.substring(0, 80) + '...');
      testResults.publicAssets.signedUrl = true;
    }

    // Download
    if (testResults.publicAssets.upload) {
      console.log('📥 Downloading file...');
      const { data: assetDownloadData, error: assetDownloadError } = await supabase.storage
        .from('public-assets')
        .download(assetPath);

      if (assetDownloadError) {
        console.log('❌ Download failed:', assetDownloadError.message);
      } else {
        const assetText = await assetDownloadData.text();
        console.log('✅ File downloaded');
        console.log('   Content:', assetText);
        testResults.publicAssets.download = true;
      }
    }

    // Delete
    if (testResults.publicAssets.upload) {
      console.log('🗑️  Deleting file...');
      const { error: assetDeleteError } = await supabase.storage
        .from('public-assets')
        .remove([assetPath]);

      if (assetDeleteError) {
        console.log('❌ Delete failed:', assetDeleteError.message);
      } else {
        console.log('✅ File deleted');
        testResults.publicAssets.delete = true;
      }
    }

    // Test 4: Verify buckets exist
    console.log('\n🧪 Test 4: Verify All Buckets');
    console.log('-'.repeat(60));

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log('❌ Error listing buckets:', bucketsError.message);
    } else {
      console.log(`✅ Found ${buckets.length} bucket(s):`);
      buckets.forEach((bucket: any) => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));

    console.log('\nAttachments Bucket (Private):');
    console.log('  ', testResults.attachments.upload ? '✅' : '❌', 'Upload');
    console.log('  ', testResults.attachments.signedUrl ? '✅' : '❌', 'Signed URL');
    console.log('  ', testResults.attachments.download ? '✅' : '❌', 'Download');
    console.log('  ', testResults.attachments.delete ? '✅' : '❌', 'Delete');

    console.log('\nAvatars Bucket (Public):');
    console.log('  ', testResults.avatars.upload ? '✅' : '❌', 'Upload');
    console.log('  ', testResults.avatars.signedUrl ? '✅' : '❌', 'Public URL');
    console.log('  ', testResults.avatars.download ? '✅' : '❌', 'Download');
    console.log('  ', testResults.avatars.delete ? '✅' : '❌', 'Delete');

    console.log('\nPublic Assets Bucket (Public):');
    console.log('  ', testResults.publicAssets.upload ? '✅' : '❌', 'Upload');
    console.log('  ', testResults.publicAssets.signedUrl ? '✅' : '❌', 'Public URL');
    console.log('  ', testResults.publicAssets.download ? '✅' : '❌', 'Download');
    console.log('  ', testResults.publicAssets.delete ? '✅' : '❌', 'Delete');

    const totalTests = 12;
    const passedTests = Object.values(testResults).reduce(
      (sum, bucket) => sum + Object.values(bucket).filter(Boolean).length,
      0
    );

    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('🎉 All storage tests passed!\n');
    } else {
      console.log('⚠️  Some tests failed. Check errors above.\n');
    }

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

testStorage()
  .catch(console.error)
  .finally(() => process.exit());
