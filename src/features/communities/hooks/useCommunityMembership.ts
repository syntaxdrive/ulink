import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

export function useCommunityMembership() {
    const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null);

    const joinCommunity = async (communityId: string) => {
        setJoiningCommunity(communityId);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Fetch community privacy first
            const { data: comm } = await supabase
                .from('communities')
                .select('privacy')
                .eq('id', communityId)
                .single();

            const isPrivate = comm?.privacy === 'private';

            const { error } = await supabase
                .from('community_members')
                .insert({
                    community_id: communityId,
                    user_id: user.id,
                    role: 'member',
                    status: isPrivate ? 'pending' : 'active'
                });

            if (error) throw error;

            return { success: true, status: isPrivate ? 'pending' : 'active' };
        } catch (error) {
            console.error('Error joining community:', error);
            return false;
        } finally {
            setJoiningCommunity(null);
        }
    };

    const leaveCommunity = async (communityId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('community_members')
                .delete()
                .match({ community_id: communityId, user_id: user.id });

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error leaving community:', error);
            return false;
        }
    };

    const checkMembership = async (communityId: string): Promise<boolean> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { data } = await supabase
                .from('community_members')
                .select('id')
                .match({ community_id: communityId, user_id: user.id })
                .single();

            return !!data;
        } catch (error) {
            return false;
        }
    };

    return {
        joinCommunity,
        leaveCommunity,
        checkMembership,
        joiningCommunity
    };
}
