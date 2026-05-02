
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

def process_engagement():
    sql_comments = ["-- Pack 6: Comments (Safe Mode)", "BEGIN;"]
    if os.path.exists(os.path.join(BASE_DIR, 'comments_rows.csv')):
        with open(os.path.join(BASE_DIR, 'comments_rows.csv'), mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Wrap in a sub-block to ignore foreign key failures for single rows
                sql_comments.append(f"""
DO $$ 
BEGIN
    INSERT INTO public.comments (id, post_id, author_id, parent_id, content, image_url, type, created_at) 
    VALUES ({escape_sql(row['id'])}, {escape_sql(row['post_id'])}, {escape_sql(row['author_id'])}, {escape_sql(row['parent_id'])}, {escape_sql(row['content'])}, {escape_sql(row['sticker_url'])}, {escape_sql(row['type'])}, {format_timestamp(row['created_at'])}) 
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    -- Skip orphans
END $$;""")
    sql_comments.append("COMMIT;")
    with open(os.path.join(OUTPUT_DIR, '06_comments.sql'), 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_comments))

if __name__ == "__main__":
    print("Generating Safe Comment Pack...")
    process_engagement()
    print("06_comments.sql regenerated in Safe Mode!")
