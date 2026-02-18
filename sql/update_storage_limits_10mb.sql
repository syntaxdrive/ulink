-- =====================================================
-- CLOUDINARY STORAGE - 10MB UPLOAD LIMIT
-- =====================================================
-- This project uses Cloudinary for image/file storage
-- The 10MB limit is controlled by:
-- 1. Frontend validation (already updated) ✅
-- 2. Cloudinary account settings

-- CLOUDINARY CONFIGURATION:
-- --------------------------
-- Go to: https://console.cloudinary.com/
-- Navigate to: Settings > Upload
-- 
-- Update these settings:
-- - Max File Size: 10 MB (10485760 bytes)
-- - Allowed Formats: 
--   * Images: jpg, jpeg, png, gif, webp
--   * Documents: pdf
--
-- Note: Free tier allows up to 10MB by default
-- Premium tiers support larger files

-- Frontend validation already updated in:
-- - src/features/preferences/ProfilePage.tsx (avatar, background, resume, certificates)
-- - src/features/profile/components/EditProfileModal.tsx (avatar, background)
-- All now support 10MB uploads ✅

-- No SQL changes needed for Cloudinary storage!
