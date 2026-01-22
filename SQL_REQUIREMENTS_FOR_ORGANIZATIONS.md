# SQL Requirements for Organizations ✅

## ✅ **Already Have (Existing):**

### **1. Profiles Table**
- ✅ `id` (UUID)
- ✅ `email` (TEXT)
- ✅ `name` (TEXT)
- ✅ `role` (TEXT) - 'student' or 'org'
- ✅ `university` (TEXT)
- ✅ `avatar_url` (TEXT)
- ✅ `headline` (TEXT)
- ✅ `about` (TEXT)
- ✅ `location` (TEXT)
- ✅ `skills` (TEXT[])
- ✅ `linkedin_url` (TEXT)
- ✅ `instagram_url` (TEXT)
- ✅ `twitter_url` (TEXT)
- ✅ `background_image_url` (TEXT)
- ✅ `username` (TEXT)
- ✅ `is_verified` (BOOLEAN)
- ✅ `is_admin` (BOOLEAN)

### **2. Jobs Table**
- ✅ `id` (UUID)
- ✅ `title` (TEXT)
- ✅ `company` (TEXT)
- ✅ `type` (TEXT)
- ✅ `description` (TEXT)
- ✅ `application_link` (TEXT)
- ✅ `creator_id` (UUID) - Links to organization
- ✅ `status` (TEXT) - 'active' or 'closed'
- ✅ `location` (TEXT)
- ✅ `salary_range` (TEXT)
- ✅ `deadline` (TEXT)

### **3. Job Applications Table**
- ✅ `id` (UUID)
- ✅ `job_id` (UUID)
- ✅ `user_id` (UUID)
- ✅ `status` (TEXT) - 'applied', 'interviewing', 'offer', 'rejected'
- ✅ `created_at` (TIMESTAMP)

### **4. Notifications Table**
- ✅ Triggers for job applications
- ✅ Triggers for status updates

---

## 🆕 **NEED TO ADD (New Fields):**

### **Run This SQL Migration:**

```sql
-- File: sql/add_organization_fields.sql

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT;
```

**What this adds:**
- ✅ `website_url` - Organization website
- ✅ `facebook_url` - Organization Facebook page
- ✅ `industry` - Organization industry/sector

---

## 📋 **How to Run:**

### **Option 1: Supabase Dashboard (Recommended)**
1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Copy contents of `sql/add_organization_fields.sql`
4. Click "Run"
5. Verify success

### **Option 2: Supabase CLI**
```bash
supabase db push
```

### **Option 3: Direct SQL**
```bash
psql -h your-db-host -U postgres -d postgres -f sql/add_organization_fields.sql
```

---

## ✅ **Verification:**

After running the migration, verify with:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('website_url', 'facebook_url', 'industry');
```

**Expected output:**
```
column_name    | data_type
---------------+-----------
website_url    | text
facebook_url   | text
industry       | text
```

---

## 🎯 **Complete Organization Schema:**

After migration, organizations will have:

### **Profile Fields:**
- ✅ Basic: name, email, role, avatar, background
- ✅ Details: headline, about, location
- ✅ Services: skills array (used as "services" for orgs)
- ✅ Social: linkedin_url, website_url, instagram_url, twitter_url, facebook_url
- ✅ Industry: industry field
- ✅ Verification: is_verified, gold_verified

### **Job Management:**
- ✅ Create jobs (via jobs table)
- ✅ Track applicants (via job_applications table)
- ✅ Update applicant status
- ✅ Get notifications on applications

### **Networking:**
- ✅ Connect with students
- ✅ Message students
- ✅ Post updates

---

## 🚨 **Important Notes:**

1. **Backward Compatible:** The migration uses `IF NOT EXISTS` so it's safe to run multiple times
2. **No Data Loss:** Adding columns doesn't affect existing data
3. **NULL Values:** New columns will be NULL for existing organizations until they update their profiles
4. **No Downtime:** This is a non-breaking change

---

## 📊 **Summary:**

| Feature | SQL Required | Status |
|---------|--------------|--------|
| **Basic Profile** | ✅ Exists | Ready |
| **Job Posting** | ✅ Exists | Ready |
| **Applicant Tracking** | ✅ Exists | Ready |
| **Notifications** | ✅ Exists | Ready |
| **Social Links (5)** | ⚠️ Need 2 more | **Run migration** |
| **Industry Field** | ⚠️ Need to add | **Run migration** |

---

## ✅ **Action Required:**

**Run this ONE SQL file:**
```
sql/add_organization_fields.sql
```

**That's it!** After running this migration, all organization features will be fully functional.

---

## 🎉 **After Migration:**

Organizations can:
- ✅ Set their industry
- ✅ Add website URL
- ✅ Add Facebook page
- ✅ Display all 5 social links
- ✅ Show industry badge on profile
- ✅ Complete professional profile

**Total time to run:** ~5 seconds
**Risk level:** Very low (backward compatible)
**Downtime:** None

---

**Ready to run the migration!** 🚀
