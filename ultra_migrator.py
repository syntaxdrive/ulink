
import csv
import json
import os
import sys

# Support for massive data
csv.field_size_limit(sys.maxsize)

BASE_DIR = r'c:\Users\User\Desktop\ulink\ulink\csv'
OUTPUT_DIR = r'c:\Users\User\Desktop\ulink\ulink\sql_migration_extra'

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# Table Definitions for Auto-Provisioning (Including Dependencies)
DEFS = {
    'public.podcasts': """CREATE TABLE IF NOT EXISTS public.podcasts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);""",
    'public.courses': """CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    university TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);""",
    'public.study_rooms': """CREATE TABLE IF NOT EXISTS public.study_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);"""
}

TABLE_DEFS = {
    'public.follows': """CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(follower_id, following_id)
);""",
    'public.connections': """CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    connected_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, connected_user_id)
);""",
    'public.community_members': """CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(community_id, user_id)
);""",
    'public.courses': DEFS['public.courses'],
    'public.course_documents': DEFS['public.courses'] + "\n\n" + """CREATE TABLE IF NOT EXISTS public.course_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    file_url TEXT,
    file_type TEXT,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);""",
    'public.podcasts': DEFS['public.podcasts'],
    'public.podcast_episodes': DEFS['public.podcasts'] + "\n\n" + """CREATE TABLE IF NOT EXISTS public.podcast_episodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT NOT NULL,
    duration INTEGER,
    plays_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);""",
    'public.study_rooms': DEFS['public.study_rooms'],
    'public.study_room_messages': DEFS['public.study_rooms'] + "\n\n" + """CREATE TABLE IF NOT EXISTS public.study_room_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.study_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    image_url TEXT,
    audio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);""",
    'public.points_history': """CREATE TABLE IF NOT EXISTS public.points_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);""",
    'public.notifications': """CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT,
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);""",
    'public.posts': """CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
    content TEXT,
    image_url TEXT,
    image_urls TEXT[] DEFAULT '{}',
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);"""
}

def escape_sql(val, is_array=False):
    if val is None or val == '' or val == 'NULL':
        return "'{}'" if is_array else 'NULL'
    
    # Convert JSON-style [] arrays to PostgreSQL {} arrays
    if is_array:
        # Simple cleanup for JSON strings to PG arrays
        clean_val = str(val).replace('[', '{').replace(']', '}').replace('"', '')
        return "'" + clean_val.replace("'", "''") + "'"
        
    return "'" + str(val).replace("'", "''") + "'"

def format_timestamp(ts):
    if not ts or ts == '' or ts == 'NULL':
        return 'now()'
    return f"'{ts}'"

def generate_safe_pack(filename, table_name, mapping, arrays=None):
    if arrays is None: arrays = []
    sql = [f"-- Fully-Provisioned Migration for {table_name}", "BEGIN;"]
    
    # Add Provisioning with Dependencies
    if table_name in TABLE_DEFS:
        sql.append(TABLE_DEFS[table_name])
        sql.append("")

    csv_path = os.path.join(BASE_DIR, filename)
    if not os.path.exists(csv_path): return
    
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cols = []
            vals = []
            for csv_col, db_col in mapping.items():
                cols.append(db_col)
                if 'at' in db_col or 'deadline' in db_col:
                    vals.append(format_timestamp(row.get(csv_col)))
                else:
                    vals.append(escape_sql(row.get(csv_col), is_array=(db_col in arrays)))
            
            safe_sql = f"""
DO $$ 
BEGIN
    INSERT INTO {table_name} ({', '.join(cols)}) VALUES ({', '.join(vals)}) ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;"""
            sql.append(safe_sql.strip())
    
    sql.append("COMMIT;")
    with open(os.path.join(OUTPUT_DIR, f"{table_name.replace('public.', '')}.sql"), 'w', encoding='utf-8') as f:
        f.write("\n".join(sql))

if __name__ == "__main__":
    print("Starting Fully-Provisioned Ultra Migration...")
    
    generate_safe_pack('follows_rows.csv', 'public.follows', {'id':'id', 'follower_id':'follower_id', 'following_id':'following_id', 'created_at':'created_at'})
    generate_safe_pack('connections_rows.csv', 'public.connections', {'id':'id', 'requester_id':'user_id', 'recipient_id':'connected_user_id', 'status':'status', 'created_at':'created_at'})
    generate_safe_pack('community_members_rows.csv', 'public.community_members', {'id':'id', 'community_id':'community_id', 'user_id':'user_id', 'role':'role', 'created_at':'created_at'})
    generate_safe_pack('courses_rows.csv', 'public.courses', {'id':'id', 'title':'name', 'category':'university', 'description':'description', 'created_at':'created_at', 'id':'code'})
    generate_safe_pack('course_documents_rows.csv', 'public.course_documents', {'id':'id', 'course_id':'course_id', 'uploader_id':'uploader_id', 'name':'title', 'public_url':'file_url', 'file_type':'file_type', 'downloads_count':'downloads_count', 'created_at':'created_at'})
    generate_safe_pack('podcasts_rows.csv', 'public.podcasts', {'id':'id', 'creator_id':'creator_id', 'title':'title', 'description':'description', 'cover_url':'cover_url', 'category':'category', 'created_at':'created_at'})
    generate_safe_pack('podcast_episodes_rows.csv', 'public.podcast_episodes', {'id':'id', 'podcast_id':'podcast_id', 'title':'title', 'description':'description', 'audio_url':'audio_url', 'created_at':'created_at'})
    generate_safe_pack('study_rooms_rows.csv', 'public.study_rooms', {'id':'id', 'creator_id':'creator_id', 'name':'name', 'description':'description', 'is_private':'is_private', 'created_at':'created_at'})
    generate_safe_pack('study_room_messages_rows.csv', 'public.study_room_messages', {'id':'id', 'room_id':'room_id', 'user_id':'user_id', 'content':'content', 'created_at':'created_at'})
    generate_safe_pack('points_history_rows.csv', 'public.points_history', {'id':'id', 'user_id':'user_id', 'points_earned':'amount', 'activity_type':'reason', 'created_at':'created_at'})
    generate_safe_pack('notifications_rows.csv', 'public.notifications', {'id':'id', 'user_id':'user_id', 'actor_id':'actor_id', 'type':'type', 'content':'content', 'reference_id':'reference_id', 'is_read':'is_read', 'created_at':'created_at'})
    generate_safe_pack('posts_rows.csv', 'public.posts', {'id':'id', 'author_id':'author_id', 'content':'content', 'image_url':'image_url', 'image_urls':'image_urls', 'video_url':'video_url', 'community_id':'community_id', 'created_at':'created_at', 'updated_at':'updated_at'}, arrays=['image_urls'])

    print("Fully-Provisioned Packs regenerated!")
