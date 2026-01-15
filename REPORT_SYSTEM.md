# Report System Documentation

## Overview
Users can report accounts directly from user profiles. The report button opens the Messages page with a pre-filled report template.

## How It Works

### 1. Report Button Location
- **Where:** On every user's profile page (UserProfilePage)
- **Appearance:** Red button with flag icon below social links
- **Label:** "Report Account"

### 2. Report Flow

**Step 1: User clicks "Report Account"**
- Button is located in the left sidebar of the profile
- Below social media links (GitHub, LinkedIn, Email)

**Step 2: Pre-filled Report Template**
The system automatically generates a report with:
```
🚨 REPORT

Reported User: [User's Name]
User ID: [User's ID]
Email: [User's Email]
University: [User's University or N/A]

Reason for report:
[Please describe the issue]
```

**Step 3: Navigate to Messages**
- User is redirected to `/app/messages`
- The report template is pre-filled in the message input
- User can edit the template and add details
- User sends the message to support/admin

### 3. Technical Implementation

**UserProfilePage.tsx:**
- Report button stores data in `sessionStorage`
- Keys: `reportMessage`, `reportUserId`
- Navigates to messages page

**MessagesPage.tsx:**
- Checks `sessionStorage` on mount
- Pre-fills message input if report data exists
- Clears sessionStorage after loading

### 4. Admin Handling

Reports are sent as regular messages. To set up a dedicated support account:

1. Create a support/admin account
2. Users should be directed to message this account
3. Or implement a dedicated "reports" table for better tracking

### 5. Future Enhancements

**Potential improvements:**
- Dedicated reports table in database
- Report categories (spam, harassment, inappropriate content)
- Admin dashboard for reviewing reports
- Automated report tracking and status updates
- Block user functionality after reporting

## Usage

**For Users:**
1. Visit any user's profile
2. Scroll to the sidebar
3. Click "Report Account" button
4. Edit the pre-filled template
5. Send the report

**For Admins:**
- Monitor messages for reports (🚨 prefix)
- Review reported user details
- Take appropriate action
