import { supabase } from '../lib/supabase';

/**
 * Extracts @mentions from text content
 * @param content - The text content to parse
 * @returns Array of mentioned usernames (without @)
 */
export function extractMentions(content: string): string[] {
    const mentionRegex = /@([a-z0-9_]+)/gi;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
        const username = match[1].toLowerCase();
        if (!mentions.includes(username)) {
            mentions.push(username);
        }
    }

    return mentions;
}

/**
 * Sends notifications to mentioned users
 * @param content - The post/comment content
 * @param postId - The ID of the post
 * @param authorId - The ID of the user who created the post/comment
 * @param type - Type of notification ('post' or 'comment')
 */
export async function notifyMentionedUsers(
    content: string,
    postId: string,
    authorId: string,
    type: 'post' | 'comment' = 'post'
): Promise<void> {
    const mentions = extractMentions(content);

    if (mentions.length === 0) return;

    try {
        // Get user IDs for mentioned usernames
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, username')
            .in('username', mentions);

        if (profileError || !profiles) {
            console.error('Error fetching mentioned users:', profileError);
            return;
        }

        // Create notifications for each mentioned user
        const notifications = profiles
            .filter(profile => profile.id !== authorId) // Don't notify yourself
            .map(profile => ({
                user_id: profile.id,
                type: 'mention',
                content: `mentioned you in a ${type}`,
                post_id: postId,
                sender_id: authorId,
                read: false
            }));

        if (notifications.length > 0) {
            const { error: notifError } = await supabase
                .from('notifications')
                .insert(notifications);

            if (notifError) {
                console.error('Error creating mention notifications:', notifError);
            }
        }
    } catch (error) {
        console.error('Error in notifyMentionedUsers:', error);
    }
}
