# Profile Enhancement - Setup Instructions

## ✅ Completed Work

### 1. **New Components Created**
- ✅ `src/components/ImageCropper.tsx` - Image cropping with rotation
- ✅ `src/components/ProfileCompletion.tsx` - Progress bar component
- ✅ `src/features/preferences/ProfilePage.tsx` - Completely rewritten profile page

### 2. **Database Schema Updates**
- ✅ `sql/PROFILE_ENHANCEMENTS.sql` - Migration file created
- ✅ `sql/POINTS_AND_LEADERBOARD.sql` - Points system created

### 3. **TypeScript Types Updated**
- ✅ Added `resume_url` to Profile interface
- ✅ Added `points` to Profile interface
- ✅ Added `certificate_pdf_url` to Certificate interface

### 4. **Features Implemented**
- ✅ Inline editing (no popups)
- ✅ Profile completion progress bar
- ✅ Image cropping for avatar and background
- ✅ Resume PDF upload
- ✅ Certificate PDF uploads
- ✅ 9 social link fields (LinkedIn, GitHub, Twitter, Instagram, Facebook, YouTube, TikTok, WhatsApp, Website)
- ✅ Skills management
- ✅ Projects management
- ✅ Certificates management
- ✅ Dark mode support
- ✅ Responsive design

---

## 🔧 Required Setup Steps (YOU MUST DO THESE)

### Step 1: Install Dependencies
The `react-image-crop` package is currently installing. Wait for it to complete, then verify:

```bash
npm list react-image-crop
```

If it's not installed, run:
```bash
npm install react-image-crop
```

### Step 2: Run Database Migrations

**In Supabase SQL Editor**, run these SQL files in order:

1. **Points and Leaderboard System**:
   - Open `sql/POINTS_AND_LEADERBOARD.sql`
   - Copy all contents
   - Paste into Supabase SQL Editor
   - Click "Run"

2. **Profile Enhancements**:
   - Open `sql/PROFILE_ENHANCEMENTS.sql`
   - Copy the ALTER TABLE commands (lines 6-17)
   - Paste into Supabase SQL Editor
   - Click "Run"

### Step 3: Create Storage Buckets

**In Supabase Dashboard > Storage**:

1. **Create `resumes` bucket**:
   - Click "New bucket"
   - Name: `resumes`
   - Public: ✅ Yes
   - Click "Create bucket"

2. **Create `certificates` bucket**:
   - Click "New bucket"
   - Name: `certificates`
   - Public: ✅ Yes
   - Click "Create bucket"

### Step 4: Set Up Storage Policies

For each bucket (`resumes` and `certificates`), create these policies:

**In Supabase Dashboard > Storage > [bucket name] > Policies**:

1. **SELECT Policy** (Public Read):
   ```sql
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'resumes'); -- or 'certificates'
   ```

2. **INSERT Policy** (User Upload):
   ```sql
   CREATE POLICY "Users can upload their own files"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'resumes' AND -- or 'certificates'
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

3. **UPDATE Policy** (User Update):
   ```sql
   CREATE POLICY "Users can update their own files"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (
     bucket_id = 'resumes' AND -- or 'certificates'
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

4. **DELETE Policy** (User Delete):
   ```sql
   CREATE POLICY "Users can delete their own files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'resumes' AND -- or 'certificates'
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

### Step 5: Test the Application

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Navigate to** `/app/profile` in your browser

3. **Test each feature**:
   - [ ] Upload and crop profile picture
   - [ ] Upload and crop background image
   - [ ] Fill in all profile fields
   - [ ] Add skills
   - [ ] Add projects
   - [ ] Add certificates
   - [ ] Upload resume PDF
   - [ ] Upload certificate PDFs
   - [ ] Add all social links
   - [ ] Check profile completion percentage
   - [ ] Save changes
   - [ ] Reload page and verify data persists

---

## 📋 Feature Checklist

### Profile Completion Progress
- [x] Shows percentage based on completed fields
- [x] Visual progress bar with color coding
- [x] Checklist of incomplete items
- [x] Bonus points notification

### Image Uploads
- [x] Avatar upload with cropping
- [x] Background image upload with cropping
- [x] Rotation support in cropper
- [x] File size validation (5MB limit)
- [x] Preview before crop
- [x] Circular crop for avatar
- [x] Rectangular crop for background

### Resume Upload
- [x] PDF upload (5MB limit)
- [x] View uploaded resume
- [x] Download resume
- [x] Replace existing resume
- [x] Upload progress indicator

### Certificate PDFs
- [x] Upload PDF for each certificate
- [x] View certificate PDFs
- [x] Individual upload per certificate
- [x] Upload progress indicator

### Social Links (9 total)
- [x] LinkedIn
- [x] GitHub
- [x] Twitter/X
- [x] Instagram
- [x] Facebook
- [x] YouTube
- [x] TikTok
- [x] WhatsApp
- [x] Website/Portfolio

### Inline Editing
- [x] All fields editable directly
- [x] No popup modals
- [x] Single save button
- [x] Real-time validation
- [x] Loading states
- [x] Error handling

### Skills Management
- [x] Add skills with Enter key
- [x] Remove skills with X button
- [x] Visual skill tags
- [x] Duplicate prevention

### Projects Management
- [x] Add/edit/delete projects
- [x] Title, description, link fields
- [x] Inline form
- [x] Hover to delete

### Certificates Management
- [x] Add/edit/delete certificates
- [x] Title, org, date, credential fields
- [x] PDF upload per certificate
- [x] Credential URL links
- [x] Inline form

---

## 🎨 UI/UX Features

- ✅ Dark mode support throughout
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth transitions and animations
- ✅ Loading states for all async operations
- ✅ Error messages for failed operations
- ✅ Success confirmations
- ✅ Hover effects
- ✅ Icon-based navigation
- ✅ Clean, modern design
- ✅ Accessible form labels
- ✅ Placeholder text guidance

---

## 🐛 Troubleshooting

### If image cropping doesn't work:
1. Check that `react-image-crop` is installed
2. Check browser console for errors
3. Verify the CSS is imported in ImageCropper.tsx

### If file uploads fail:
1. Verify storage buckets exist in Supabase
2. Check storage policies are set correctly
3. Verify bucket names match exactly (`resumes`, `certificates`)
4. Check file size limits (5MB)
5. Check file types (PDF for resume/certs, images for avatar/bg)

### If profile completion doesn't update:
1. Verify all fields are saving correctly
2. Check that the ProfileCompletion component is receiving updated profile data
3. Refresh the page to see updated percentage

### If points don't award:
1. Verify `sql/POINTS_AND_LEADERBOARD.sql` was run successfully
2. Check that triggers are created in Supabase
3. Test by creating a post or making a connection

---

## 📝 Notes

- The old ProfilePage has been backed up to `ProfilePage.old.tsx`
- All uploads are stored in user-specific folders (using user ID)
- File names include timestamps to prevent conflicts
- All images are converted to JPEG at 95% quality
- Profile completion awards bonus points automatically
- Changes are saved to database immediately on "Save Changes" click

---

## 🚀 Next Steps After Setup

1. Test thoroughly on different devices
2. Create an OG image for social media (`public/og-image.png`, 1200x630px)
3. Deploy to production
4. Monitor error logs for any issues
5. Gather user feedback on the new profile experience

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify all setup steps were completed
4. Check that environment variables are set correctly
