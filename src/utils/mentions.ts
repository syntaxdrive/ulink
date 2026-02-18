import { supabase } from '../lib/supabase';

/**
 * Extract @mentions from content
 */
function extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1]);
    }

    return mentions;
}

/**
 * Notify users mentioned in content
 */
export async function notifyMentionedUsers(
    content: string,
    entityId: string,
    senderId: string,
    entityType: 'post' | 'comment'
): Promise<void> {
    const usernames = extractMentions(content);
    if (usernames.length === 0) return;

    try {
        // Get user IDs from usernames
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .in('username', usernames)
            .neq('id', senderId); // Don't notify self

        if (!profiles || profiles.length === 0) return;

        // Create notifications
        const notifications = profiles.map(profile => ({
            user_id: profile.id,
            type: 'mention',
            sender_id: senderId,
            post_id: entityType === 'post' ? entityId : null,
            comment_id: entityType === 'comment' ? entityId : null,
            created_at: new Date().toISOString()
        }));

        await supabase.from('notifications').insert(notifications);
    } catch (error) {
        console.error('Error notifying mentioned users:', error);
    }
}
