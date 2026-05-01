
import csv
import json
import os
import sys

# Support for massive messages
csv.field_size_limit(sys.maxsize)

BASE_DIR = r'c:\Users\User\Desktop\ulink\ulink\csv'
OUTPUT_DIR = r'c:\Users\User\Desktop\ulink\ulink\sql_migration'

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def escape_sql(val):
    if val is None or val == '' or val == 'NULL':
        return 'NULL'
    return "'" + str(val).replace("'", "''") + "'"

def format_timestamp(ts):
    if not ts or ts == '' or ts == 'NULL':
        return 'now()'
    return f"'{ts}'"

def process_communities():
    sql = ["-- Pack 1: Communities", "BEGIN;"]
    with open(os.path.join(BASE_DIR, 'communities_rows.csv'), mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sql.append(f"""
INSERT INTO public.communities (id, name, slug, description, icon_url, banner_url, created_by, created_at)
VALUES ({escape_sql(row['id'])}, {escape_sql(row['name'])}, {escape_sql(row['slug'])}, {escape_sql(row['description'])}, {escape_sql(row['icon_url'])}, {escape_sql(row['cover_image_url'])}, {escape_sql(row['created_by'])}, {format_timestamp(row['created_at'])})
ON CONFLICT (id) DO NOTHING;""")
    sql.append("COMMIT;")
    with open(os.path.join(OUTPUT_DIR, '01_communities.sql'), 'w', encoding='utf-8') as f:
        f.write("\n".join(sql))

def process_posts():
    sql = ["-- Pack 2: Posts", "BEGIN;"]
    with open(os.path.join(BASE_DIR, 'posts_rows.csv'), mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            img_urls = row.get('image_urls', '[]')
            if not img_urls: img_urls = '[]'
            try:
                urls_list = json.loads(img_urls)
                pg_array = "ARRAY[" + ", ".join([escape_sql(u) for u in urls_list]) + "]::text[]" if urls_list else "ARRAY[]::text[]"
            except:
                pg_array = "ARRAY[]::text[]"

            sql.append(f"""
INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ({escape_sql(row['id'])}, {escape_sql(row['author_id'])}, {escape_sql(row['content'])}, {escape_sql(row['image_url'])}, {pg_array}, {escape_sql(row['video_url'])}, {escape_sql(row['community_id'])}, {format_timestamp(row['created_at'])}, {format_timestamp(row['updated_at'])})
ON CONFLICT (id) DO NOTHING;""")
    sql.append("COMMIT;")
    with open(os.path.join(OUTPUT_DIR, '02_posts.sql'), 'w', encoding='utf-8') as f:
        f.write("\n".join(sql))

def process_engagement():
    # Pre-fetch post IDs to avoid foreign key violations
    post_ids = set()
    with open(os.path.join(BASE_DIR, 'posts_rows.csv'), mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            post_ids.add(row['id'])

    sql_likes = ["-- Pack 5: Likes", "BEGIN;"]
    if os.path.exists(os.path.join(BASE_DIR, 'likes_rows.csv')):
        with open(os.path.join(BASE_DIR, 'likes_rows.csv'), mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['post_id'] in post_ids:
                    sql_likes.append(f"INSERT INTO public.likes (id, post_id, user_id, created_at) VALUES ({escape_sql(row['id'])}, {escape_sql(row['post_id'])}, {escape_sql(row['user_id'])}, {format_timestamp(row['created_at'])}) ON CONFLICT DO NOTHING;")
    sql_likes.append("COMMIT;")
    with open(os.path.join(OUTPUT_DIR, '05_likes.sql'), 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_likes))

    sql_comments = ["-- Pack 6: Comments", "BEGIN;"]
    if os.path.exists(os.path.join(BASE_DIR, 'comments_rows.csv')):
        with open(os.path.join(BASE_DIR, 'comments_rows.csv'), mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['post_id'] in post_ids:
                    sql_comments.append(f"""
INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
VALUES ({escape_sql(row['id'])}, {escape_sql(row['post_id'])}, {escape_sql(row['author_id'])}, {escape_sql(row['parent_id'])}, {escape_sql(row['content'])}, {escape_sql(row['sticker_url'])}, {escape_sql(row['type'])}, {format_timestamp(row['created_at'])}) 
ON CONFLICT DO NOTHING;""")
    sql_comments.append("COMMIT;")
    with open(os.path.join(OUTPUT_DIR, '06_comments.sql'), 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_comments))

if __name__ == "__main__":
    print("Starting UniLink Content Migration...")
    process_communities()
    process_posts()
    process_engagement()
    print("Migration Packs generated in /sql_migration folder!")
