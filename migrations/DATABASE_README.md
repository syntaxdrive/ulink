# UniLink Database Schema & Migrations

This directory contains SQL scripts for setting up and modifying the UniLink database on Supabase.

## 📂 Core Schema & Features
These files define the structure and essential functionality of the app. A new developer should likely apply these (or check if they are applied) to ensure feature compatibility.

| File | Description |
|------|-------------|
| `repost_feature.sql` | Adds columns (`is_repost`, `original_post_id`, `repost_comment`) and RLS policies for the Repost feature. |
| `add_job_details.sql` | Adds columns (`application_link`, `salary_range`, `deadline`, etc.) to the `jobs` table. |
| `community_storage_setup.sql` | Sets up Storage buckets for community icons/covers and their policies. |
| `community_creator_trigger.sql` | Creates a trigger to automatically make the community creator an admin member. |

## 🛠 Fixes & Diagnosis
These files were created to resolve specific issues or patch data. They may not be needed for a fresh installation but are useful for debugging or historical context. Many can be considered "redundant" once applied.

| File | Description | Status |
|------|-------------|--------|
| `fix_feed_posts.sql` | Fixes posts that were not showing up in the feed correctly. | 🟡 One-off |
| `move_all_posts_to_main_feed.sql` | migrates posts to the main feed/null community. | 🟡 One-off |
| `fix_existing_communities.sql` | Patches community data for existing rows. | 🟡 One-off |
| `diagnose_feed_issue.sql` | A script to select/debug feed data; not a modification. | 🔵 Debug |
| `delete_all_communities.sql` | **Destructive**: Deletes communities to reset state. | 🔴 Dangerous |

## 🚀 For the SQL Developer
To clean up and consolidate:
1.  **Consolidate**: Combine the "Core Schema" files above into a single `schema.sql` if you are setting up a new env.
2.  **Trash**: The files in "Fixes & Diagnosis" can be archived or deleted once you are confirmed that the production data is clean. They are generally not part of the permanent schema definition.
