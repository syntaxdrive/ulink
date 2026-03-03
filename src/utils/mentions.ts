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
        // Get sender's name and user IDs from usernames
        const [senderRes, profilesRes] = await Promise.all([
            supabase.from('profiles').select('name').eq('id', senderId).single(),
            supabase.from('profiles').select('id').in('username', usernames).neq('id', senderId)
        ]);

        const senderName = senderRes.data?.name || 'Someone';
        const profiles = profilesRes.data;

        if (!profiles || profiles.length === 0) return;

        // Create notifications
        const notifications = profiles.map(profile => ({
            user_id: profile.id,
            type: 'mention',
            sender_id: senderId,
            content: `${senderName} mentioned you in a ${entityType}`,
            data: {
                post_id: entityType === 'post' ? entityId : null,
                comment_id: entityType === 'comment' ? entityId : null,
            },
            action_url: `/app/post/${entityId}`,
            created_at: new Date().toISOString()
        }));

        await supabase.from('notifications').insert(notifications);
    } catch (error) {
        console.error('Error notifying mentioned users:', error);
    }
}
