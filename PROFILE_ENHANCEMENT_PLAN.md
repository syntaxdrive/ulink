# Profile Page Enhancement - Implementation Plan

## Overview
Complete rewrite of the ProfilePage component to support inline editing, image cropping, PDF uploads, and profile completion tracking.

## Features to Implement

### 1. Profile Completion Progress Bar ✅
- **Component Created**: `src/components/ProfileCompletion.tsx`
- Shows percentage completion based on:
  - Profile Picture (15%)
  - Headline (10%)
  - About section (15%)
  - Location (5%)
  - Skills 3+ (15%)
  - Experience (20%)
  - Social Links 2+ (10%)
  - Resume (10%)
- Visual progress bar with color coding
- Checklist showing completed/incomplete items
- Bonus points notification

### 2. Image Cropping ✅
- **Component Created**: `src/components/ImageCropper.tsx`
- **Dependency**: `react-image-crop` (installing)
- Features:
  - Circular crop for profile pictures
  - Rectangular crop for background images
  - Rotation support
  - High-quality output (95% JPEG quality)
  - Responsive modal interface

### 3. Resume Upload
- **Field Added**: `resume_url` to Profile type
- **Storage Bucket**: `resumes` (needs to be created in Supabase)
- Features:
  - PDF upload support
  - File size limit: 5MB
  - Preview/download link
  - Replace existing resume
  - Delete resume option

### 4. Certificate PDF Upload
- **Field Added**: `certificate_pdf_url` to Certificate type
- **Storage Bucket**: `certificates` (needs to be created in Supabase)
- Features:
  - PDF upload for each certificate
  - Attach to certificate records
  - View/download certificates
  - Delete certificate PDFs

### 5. Additional Social Links
- **Fields Added**:
  - `youtube_url`
  - `tiktok_url`
  - `whatsapp_url`
- **Existing Fields**:
  - `linkedin_url`
  - `github_url`
  - `twitter_url`
  - `instagram_url`
  - `facebook_url`
  - `website_url`

### 6. Inline Editing (No Popups)
- All fields editable directly on the page
- Auto-save on blur or manual save button
- Real-time validation
- Loading states for uploads
- Error handling with user feedback

## Database Changes Required

### SQL Migration: `sql/PROFILE_ENHANCEMENTS.sql` ✅
```sql
-- Add new columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;

ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_pdf_url TEXT;
```

### Storage Buckets to Create in Supabase Dashboard:
1. **resumes** (public)
2. **certificates** (public)

### Storage Policies (RLS):
- Users can upload/update/delete their own files
- All files are publicly readable

## Component Structure

### New ProfilePage Layout:
```
ProfilePage
├── Header (with Save button)
├── Grid Layout (2 columns on desktop)
│   ├── Left Column
│   │   ├── Profile Completion Progress
│   │   ├── Profile Card
│   │   │   ├── Background Image (with cropper)
│   │   │   ├── Avatar (with cropper)
│   │   │   ├── Name
│   │   │   ├── Headline
│   │   │   ├── Location
│   │   │   └── University
│   │   ├── Social Links Section
│   │   │   ├── LinkedIn
│   │   │   ├── GitHub
│   │   │   ├── Twitter/X
│   │   │   ├── Instagram
│   │   │   ├── Facebook
│   │   │   ├── YouTube
│   │   │   ├── TikTok
│   │   │   ├── WhatsApp
│   │   │   └── Website
│   │   └── Skills Section
│   └── Right Column
│       ├── About Section
│       ├── Resume Upload Section
│       ├── Experience Section
│       ├── Projects Section
│       └── Certificates Section (with PDF upload)
└── Image Cropper Modal (conditional)
```

## Implementation Steps

### Step 1: Database Setup
1. Run `sql/PROFILE_ENHANCEMENTS.sql` in Supabase SQL Editor
2. Create storage buckets in Supabase Dashboard:
   - Go to Storage
   - Create bucket: `resumes` (public: true)
   - Create bucket: `certificates` (public: true)
3. Set up storage policies (included in SQL file comments)

### Step 2: Install Dependencies
```bash
npm install react-image-crop
```

### Step 3: Update ProfilePage Component
The existing ProfilePage.tsx needs to be enhanced with:
- Import ProfileCompletion component
- Import ImageCropper component
- Add resume upload functionality
- Add certificate PDF upload
- Add new social link fields
- Integrate image cropping for avatar and background
- Add auto-save or save confirmation

### Step 4: File Upload Handlers

#### Resume Upload:
```typescript
const handleResumeUpload = async (file: File) => {
  if (file.size > 5 * 1024 * 1024) {
    alert('Resume must be less than 5MB');
    return;
  }
  
  const fileName = `${profile.id}/resume_${Date.now()}.pdf`;
  const { error } = await supabase.storage
    .from('resumes')
    .upload(fileName, file, { upsert: true });
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(fileName);
    
  // Update profile with resume_url
  await supabase
    .from('profiles')
    .update({ resume_url: publicUrl })
    .eq('id', profile.id);
};
```

#### Certificate PDF Upload:
```typescript
const handleCertificatePDFUpload = async (file: File, certificateId: string) => {
  const fileName = `${profile.id}/cert_${certificateId}_${Date.now()}.pdf`;
  const { error } = await supabase.storage
    .from('certificates')
    .upload(fileName, file);
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('certificates')
    .getPublicUrl(fileName);
    
  // Update certificate with PDF URL
  // This would be stored in the certificates array in profile
};
```

### Step 5: Image Cropping Integration

```typescript
const [showAvatarCropper, setShowAvatarCropper] = useState(false);
const [showBgCropper, setShowBgCropper] = useState(false);
const [tempImageUrl, setTempImageUrl] = useState('');

const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImageUrl(reader.result as string);
      setShowAvatarCropper(true);
    };
    reader.readAsDataURL(file);
  }
};

const handleAvatarCropComplete = async (croppedBlob: Blob) => {
  // Upload cropped image
  const fileName = `${profile.id}/avatar_${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, croppedBlob, { upsert: true });
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
    
  setAvatarUrl(publicUrl);
  setShowAvatarCropper(false);
};
```

## Testing Checklist

- [ ] Profile completion percentage calculates correctly
- [ ] Avatar upload and cropping works
- [ ] Background image upload and cropping works
- [ ] Resume PDF upload works (max 5MB)
- [ ] Resume can be downloaded
- [ ] Resume can be replaced
- [ ] Certificate PDFs upload correctly
- [ ] All social links save properly
- [ ] Skills can be added/removed
- [ ] Projects can be added/edited/deleted
- [ ] Certificates can be added/edited/deleted
- [ ] All changes persist after page reload
- [ ] Mobile responsive design
- [ ] Dark mode support
- [ ] Loading states show during uploads
- [ ] Error messages display for failed uploads
- [ ] File size limits are enforced
- [ ] Image rotation works in cropper

## Next Steps

1. **Complete npm install** of react-image-crop
2. **Run SQL migration** in Supabase
3. **Create storage buckets** in Supabase Dashboard
4. **Enhance ProfilePage.tsx** with all new features
5. **Test thoroughly** on both desktop and mobile
6. **Deploy** and verify in production

## Notes

- All file uploads should show progress indicators
- Implement proper error handling for network failures
- Add file type validation (PDF for resume/certificates, images for avatar/background)
- Consider adding image compression before upload
- Add confirmation dialogs for delete operations
- Implement undo functionality for accidental deletions
- Add tooltips explaining each profile section's importance
- Consider adding a "View as Public" preview mode
