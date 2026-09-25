
import csv
import json

csv_path = r'c:\Users\User\Desktop\ulink\ulink\profiles_rows.csv'
output_path = r'c:\Users\User\Desktop\ulink\ulink\MIGRATION_USER_IMPORT.sql'

def escape_sql(val):
    if val is None or val == '' or val == 'NULL':
        return 'NULL'
    return "'" + str(val).replace("'", "''") + "'"

def format_timestamp(ts):
    if not ts or ts == '' or ts == 'NULL':
        return 'now()'
    return f"'{ts}'"

sql_statements = []
sql_statements.append("-- UniLink User Migration Script (Full Auth Sync v3)")
sql_statements.append("BEGIN;")

with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        uid = row['id']
        email = row['email']
        name = row['name']
        
        app_meta = json.dumps({"provider": "google", "providers": ["google"]})
        user_meta = json.dumps({"full_name": name})
        
        # 1. Auth Record (Full column set to avoid Scan Errors)
        auth_sql = f"""
INSERT INTO auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    instance_id, confirmation_token, recovery_token, email_change_token_new, 
    email_change, email_change_token_current, reauthentication_token, is_sso_user
) VALUES (
    {escape_sql(uid)}, 'authenticated', 'authenticated', {escape_sql(email)}, 
    crypt('migration_dummy_pass', gen_salt('bf')), now(), 
    {escape_sql(app_meta)}, {escape_sql(user_meta)}, {format_timestamp(row['created_at'])}, {format_timestamp(row['updated_at'])}, 
    '00000000-0000-0000-0000-000000000000', '', '', '', '', '', '', false
) ON CONFLICT (id) DO UPDATE SET 
    aud = 'authenticated', 
    role = 'authenticated',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    confirmation_token = '';"""
        sql_statements.append(auth_sql.strip())

        # 2. Profile Record
        profile_sql = f"""
INSERT INTO public.profiles (
    id, email, name, username, role, university, avatar_url, background_image_url, 
    headline, location, about, skills, experience, website_url, github_url, 
    linkedin_url, instagram_url, twitter_url, facebook_url, youtube_url, tiktok_url, 
    whatsapp_url, points, is_verified, is_admin, created_at, updated_at, 
    followers_count, following_count, certificates, projects, expected_graduation_year, referral_code
) VALUES (
    {escape_sql(uid)}, {escape_sql(email)}, {escape_sql(name)}, {escape_sql(row['username'])}, 
    {escape_sql(row['role'])}, {escape_sql(row['university'])}, {escape_sql(row['avatar_url'])}, 
    {escape_sql(row['background_image_url'])}, {escape_sql(row['headline'])}, {escape_sql(row['location'])}, 
    {escape_sql(row['about'])}, {escape_sql(row['skills'])}, {escape_sql(row['experience'])}, 
    {escape_sql(row['website_url'])}, {escape_sql(row['github_url'])}, {escape_sql(row['linkedin_url'])}, 
    {escape_sql(row['instagram_url'])}, {escape_sql(row['twitter_url'])}, {escape_sql(row['facebook_url'])},
    {escape_sql(row['youtube_url'])}, {escape_sql(row['tiktok_url'])}, {escape_sql(row['whatsapp_url'])},
    {row['points'] or 0}, {row['is_verified'].lower()}, {row['is_admin'].lower()}, 
    {format_timestamp(row['created_at'])}, {format_timestamp(row['updated_at'])}, 
    {row['followers_count'] or 0}, {row['following_count'] or 0},
    {escape_sql(row['certificates'])}, {escape_sql(row['projects'])}, {escape_sql(row['expected_graduation_year'])}, {escape_sql(row['referral_code'])}
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, points = EXCLUDED.points;"""
        sql_statements.append(profile_sql.strip())

sql_statements.append("COMMIT;")

with open(output_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_statements))
