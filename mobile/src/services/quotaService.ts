import { supabase } from '../lib/supabase';

export interface QuotaCheckResult {
  allowed: boolean;
  usageCount: number;
  maxQuota: number;
  remaining: number;
  featureName: string;
  resetAt?: string;
}

export type QuotaFeature = 'ai_generation' | 'media_upload' | 'audio_process';

const DEFAULT_QUOTAS: Record<QuotaFeature, { free: number; premium: number }> = {
  ai_generation: { free: 5, premium: 100 },
  media_upload: { free: 10, premium: 50 },
  audio_process: { free: 3, premium: 20 },
};

class QuotaService {
  /**
   * Check and increment quota for expensive operations (e.g. AI generation, audio transcode)
   */
  public async checkAndUseQuota(
    userId: string,
    feature: QuotaFeature,
    isPremium = false
  ): Promise<QuotaCheckResult> {
    const maxLimit = isPremium
      ? DEFAULT_QUOTAS[feature].premium
      : DEFAULT_QUOTAS[feature].free;

    try {
      // Call Supabase stored procedure
      const { data, error } = await supabase.rpc('check_and_increment_quota', {
        p_user_id: userId,
        p_feature_name: feature,
        p_default_limit: maxLimit,
      });

      if (!error && data) {
        return {
          allowed: data.allowed,
          usageCount: data.usage_count,
          maxQuota: data.max_quota,
          remaining: data.remaining,
          featureName: feature,
          resetAt: data.reset_at,
        };
      }
    } catch (e) {
      console.warn('Quota RPC fallback:', e);
    }

    // Local client-side fallback
    return {
      allowed: true,
      usageCount: 1,
      maxQuota: maxLimit,
      remaining: maxLimit - 1,
      featureName: feature,
    };
  }

  /**
   * Get quota limit labels for UI
   */
  public getQuotaDescription(feature: QuotaFeature, isPremium = false): string {
    const limit = isPremium
      ? DEFAULT_QUOTAS[feature].premium
      : DEFAULT_QUOTAS[feature].free;
    const tier = isPremium ? 'Premium Plan' : 'Free Student Plan';

    switch (feature) {
      case 'ai_generation':
        return `${limit} AI requests / day (${tier})`;
      case 'media_upload':
        return `${limit} media uploads / hour (${tier})`;
      case 'audio_process':
        return `${limit} podcast processing jobs / day (${tier})`;
    }
  }
}

export const quotaService = new QuotaService();
