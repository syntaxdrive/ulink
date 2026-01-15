import { BadgeCheck } from 'lucide-react';

interface VerificationBadgeProps {
    isFounder?: boolean;
    isVerified?: boolean;
    className?: string;
}

export function VerificationBadge({ isFounder, isVerified, className = "w-4 h-4" }: VerificationBadgeProps) {
    if (isFounder) {
        // Gold badge for founders
        return (
            <span title="Founder" className="inline-flex items-center justify-center">
                <BadgeCheck className={`${className} text-yellow-500 fill-yellow-50`} />
            </span>
        );
    }

    if (isVerified) {
        // Blue badge for verified users
        return (
            <span title="Verified" className="inline-flex items-center justify-center">
                <BadgeCheck className={`${className} text-blue-500 fill-blue-50`} />
            </span>
        );
    }

    return null;
}
