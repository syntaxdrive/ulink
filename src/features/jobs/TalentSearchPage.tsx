import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { type Profile } from '../../types';
import { Search, MapPin, School, BadgeCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TalentSearchPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUni, setFilterUni] = useState('');

    useEffect(() => {
        fetchTalent();
    }, []);

    const fetchTalent = async () => {
        setLoading(true);
        // Fetch all student profiles (limit 100 for MVP)
        const { data } = await supabase
            .from('profiles')
            .select('*, certificates(*)')
            .eq('role', 'student')
            .limit(100);

        if (data) {
            setProfiles(data);
        }
        setLoading(false);
    };

    // Client-side filtering for responsiveness
    // In production, this should be server-side search
    const filteredProfiles = profiles.filter(profile => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            profile.name.toLowerCase().includes(term) ||
            profile.headline?.toLowerCase().includes(term) ||
            profile.skills?.some(s => s.toLowerCase().includes(term));

        const matchesUni = filterUni ? profile.university?.toLowerCase().includes(filterUni.toLowerCase()) : true;

        return matchesSearch && matchesUni;
    });

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 font-display">Talent Discovery</h1>
                <p className="text-slate-500 mt-2">Find the perfect candidates for your organization based on skills and verification.</p>
            </div>

            {/* Search Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, skill, or headline..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                    />
                </div>
                <div className="flex-1 relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Filter by University..."
                        value={filterUni}
                        onChange={(e) => setFilterUni(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredProfiles.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredProfiles.map((profile) => (
                        <div key={profile.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all group">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 shrink-0">
                                    <img
                                        src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`}
                                        alt={profile.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                {profile.name}
                                                {profile.gold_verified ? (
                                                    <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-50" />
                                                ) : profile.is_verified ? (
                                                    <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />
                                                ) : null}
                                            </h3>
                                            <p className="text-slate-500 font-medium">{profile.headline || 'Student'}</p>
                                        </div>
                                        <Link
                                            to={`/app/profile/${profile.id}`}
                                            className="px-4 py-2 bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            View Profile <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                                        {profile.university && (
                                            <span className="flex items-center gap-1">
                                                <School className="w-3.5 h-3.5" />
                                                {profile.university}
                                            </span>
                                        )}
                                        {profile.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {profile.location}
                                            </span>
                                        )}
                                    </div>

                                    {/* Skills & Certificates Tags */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {profile.skills && profile.skills.slice(0, 5).map(skill => (
                                            <span key={skill} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg">
                                                {skill}
                                            </span>
                                        ))}
                                        {profile.certificates && profile.certificates.length > 0 && (
                                            <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-lg flex items-center gap-1">
                                                <BadgeCheck className="w-3 h-3" /> {profile.certificates.length} Verified Certs
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No candidates found</h3>
                    <p className="text-slate-500">Try adjusting your filters to see more results.</p>
                </div>
            )}
        </div>
    );
}
