# Community Feature Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Communities  │  │  Community   │  │   Create     │          │
│  │    Page      │  │ Details Page │  │   Modal      │          │
│  │              │  │              │  │              │          │
│  │ - List all   │  │ - Header     │  │ - Form       │          │
│  │ - Search     │  │ - Feed       │  │ - Validation │          │
│  │ - Create btn │  │ - Join/Leave │  │ - Upload     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLIENT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Database   │  │   Storage    │  │     Auth     │          │
│  │   Queries    │  │   Uploads    │  │   Context    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    PostgreSQL Database                      │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │ communities  │  │   community  │  │    posts     │    │ │
│  │  │              │  │   _members   │  │              │    │ │
│  │  │ - id         │  │              │  │ - id         │    │ │
│  │  │ - name       │  │ - id         │  │ - content    │    │ │
│  │  │ - slug       │  │ - community  │  │ - author_id  │    │ │
│  │  │ - privacy    │  │ - user_id    │  │ - community  │    │ │
│  │  │ - icon_url   │  │ - role       │  │   _id        │    │ │
│  │  │ - cover_url  │  │ - joined_at  │  │ - created_at │    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │ │
│  │         │                  │                  │            │ │
│  │         └──────────────────┴──────────────────┘            │ │
│  │                            │                                │ │
│  │                  ┌─────────▼─────────┐                     │ │
│  │                  │   RLS Policies    │                     │ │
│  │                  │                   │                     │ │
│  │                  │ - View public     │                     │ │
│  │                  │ - Create auth     │                     │ │
│  │                  │ - Update owner    │                     │ │
│  │                  │ - Join/Leave      │                     │ │
│  │                  └───────────────────┘                     │ │
│  │                                                             │ │
│  │                  ┌───────────────────┐                     │ │
│  │                  │     Triggers      │                     │ │
│  │                  │                   │                     │ │
│  │                  │ on_community_     │                     │ │
│  │                  │   created         │                     │ │
│  │                  │ → Add creator     │                     │ │
│  │                  │   as owner        │                     │ │
│  │                  └───────────────────┘                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Storage Buckets                           │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │           community-images (public)                   │  │ │
│  │  │                                                        │  │ │
│  │  │  ├── community-icons/                                 │  │ │
│  │  │  │   └── slug-timestamp.ext                           │  │ │
│  │  │  │                                                     │  │ │
│  │  │  └── community-covers/                                │  │ │
│  │  │      └── slug-timestamp.ext                           │  │ │
│  │  │                                                        │  │ │
│  │  │  RLS Policies:                                         │  │ │
│  │  │  - Anyone can view                                     │  │ │
│  │  │  - Authenticated can upload                            │  │ │
│  │  │  - Authenticated can update                            │  │ │
│  │  │  - Authenticated can delete                            │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Community Creation Flow

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. Clicks "Create Community"
     ▼
┌────────────────┐
│ CreateCommunity│
│     Modal      │
└────┬───────────┘
     │ 2. Fills form & uploads images
     │ 3. Validates input
     ▼
┌────────────────┐
│   Validation   │
│   - Name       │
│   - Slug       │
│   - File size  │
│   - File type  │
└────┬───────────┘
     │ 4. If valid
     ▼
┌────────────────┐
│ Check Slug     │
│ Uniqueness     │
└────┬───────────┘
     │ 5. If unique
     ▼
┌────────────────┐
│ Upload Images  │
│ to Storage     │
│ - Icon         │
│ - Cover        │
└────┬───────────┘
     │ 6. Get URLs
     ▼
┌────────────────┐
│ Insert into    │
│ communities    │
│ table          │
└────┬───────────┘
     │ 7. Trigger fires
     ▼
┌────────────────┐
│ Auto-add       │
│ creator as     │
│ owner in       │
│ members table  │
└────┬───────────┘
     │ 8. Success
     ▼
┌────────────────┐
│ Navigate to    │
│ Community Page │
└────────────────┘
```

### 2. Join Community Flow

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. Clicks "Join Group"
     ▼
┌────────────────┐
│ Check Privacy  │
│ - Public? ✓    │
│ - Private? ✗   │
└────┬───────────┘
     │ 2. If public
     ▼
┌────────────────┐
│ Insert into    │
│ community_     │
│ members        │
│ - role: member │
└────┬───────────┘
     │ 3. Success
     ▼
┌────────────────┐
│ Update UI      │
│ - Button text  │
│ - Member count │
│ - Can post     │
└────────────────┘
```

### 3. Community Feed Flow

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. Visits community page
     ▼
┌────────────────┐
│ Check Member   │
│ Status         │
└────┬───────────┘
     │ 2. If member or public
     ▼
┌────────────────┐
│ Fetch Posts    │
│ WHERE          │
│ community_id = │
│ current_id     │
└────┬───────────┘
     │ 3. Apply RLS
     ▼
┌────────────────┐
│ Display Posts  │
│ - With author  │
│ - With likes   │
│ - With comments│
└────────────────┘
```

## Database Relationships

```
┌─────────────────┐
│   profiles      │
│                 │
│ - id (PK)       │
│ - name          │
│ - email         │
└────────┬────────┘
         │
         │ created_by
         │
         ▼
┌─────────────────┐         ┌─────────────────┐
│  communities    │◄────────│ community_      │
│                 │         │   members       │
│ - id (PK)       │         │                 │
│ - name          │         │ - id (PK)       │
│ - slug (UNIQUE) │         │ - community_id  │
│ - privacy       │         │ - user_id       │
│ - created_by    │         │ - role          │
│ - icon_url      │         │ - joined_at     │
│ - cover_url     │         └────────┬────────┘
└────────┬────────┘                  │
         │                           │
         │ community_id              │ user_id
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│     posts       │         │   profiles      │
│                 │         │   (again)       │
│ - id (PK)       │         └─────────────────┘
│ - content       │
│ - author_id     │
│ - community_id  │
│ - created_at    │
└─────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Row Level Security                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Communities Table:                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ SELECT: Public OR (Private AND is_member)             │ │
│  │ INSERT: Authenticated users                            │ │
│  │ UPDATE: Owner OR Admin                                 │ │
│  │ DELETE: Owner (if implemented)                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Community Members Table:                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ SELECT: Everyone (public info)                         │ │
│  │ INSERT: Authenticated (public communities only)        │ │
│  │ DELETE: Self (leave community)                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Storage (community-images):                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ SELECT: Everyone (public bucket)                       │ │
│  │ INSERT: Authenticated users                            │ │
│  │ UPDATE: Authenticated users                            │ │
│  │ DELETE: Authenticated users                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
└── DashboardLayout
    └── Routes
        ├── /app/communities
        │   └── CommunitiesPage
        │       ├── Search Bar
        │       ├── Create Button → CreateCommunityModal
        │       └── Community Grid
        │           └── Community Cards
        │
        └── /app/communities/:slug
            └── CommunityDetailsPage
                ├── Community Header
                │   ├── Cover Image
                │   ├── Icon
                │   ├── Name & Description
                │   ├── Join/Leave Button
                │   └── Settings Button → EditCommunityModal
                │
                ├── Main Feed (if member)
                │   ├── CreatePost
                │   └── PostList
                │       └── PostItem (multiple)
                │
                └── Sidebar
                    └── About Section
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    Component State                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  CommunitiesPage:                                            │
│  - communities: Community[]                                  │
│  - loading: boolean                                          │
│  - searchQuery: string                                       │
│  - isCreateModalOpen: boolean                                │
│                                                               │
│  CommunityDetailsPage:                                       │
│  - community: Community | null                               │
│  - loading: boolean                                          │
│  - isMember: boolean                                         │
│  - role: string | null                                       │
│  - isEditModalOpen: boolean                                  │
│                                                               │
│  CreateCommunityModal:                                       │
│  - name: string                                              │
│  - slug: string                                              │
│  - description: string                                       │
│  - privacy: 'public' | 'private'                             │
│  - iconFile: File | null                                     │
│  - coverFile: File | null                                    │
│  - iconPreview: string                                       │
│  - coverPreview: string                                      │
│  - loading: boolean                                          │
│                                                               │
│  useFeed Hook (with communityId):                            │
│  - posts: Post[]                                             │
│  - loading: boolean                                          │
│  - comments: Record<string, Comment[]>                       │
│  - activeCommentPostId: string | null                        │
└─────────────────────────────────────────────────────────────┘
```

This architecture provides a clear separation of concerns, proper security through RLS, and a scalable structure for the community feature.
