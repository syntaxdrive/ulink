import { supabase } from '../../../lib/supabase';
import { Flag } from 'lucide-react';
import type { Profile } from '../../../types';

interface Report {
    id: string;
    reporter: Profile;
    reported: Profile;
    reason: string;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string;
}

interface ReportsManagerProps {
    reports: Report[];
    setReports: React.Dispatch<React.SetStateAction<any[]>>; // Keeping it any[] to match parent state for now, but should be Report[]
}

export default function ReportsManager({ reports, setReports }: ReportsManagerProps) {

    const resolveReport = async (reportId: string) => {
        const { error } = await supabase
            .from('reports')
            .update({ status: 'resolved' })
            .eq('id', reportId);

        if (!error) {
            setReports(prev => prev.filter(r => r.id !== reportId));
        } else {
            console.error('Error resolving report:', error);
            // In a real app, use a Toast here
            alert('Failed to resolve report');
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-stone-200 dark:border-zinc-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-lg">
                    <Flag className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-white">Flagged Accounts & Reports</h2>
            </div>

            <div className="overflow-x-auto">
                {reports.length === 0 ? (
                    <div className="p-8 text-center text-stone-500">
                        <p>No active reports found. All good! 👍</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-red-50 text-red-900 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Reported User</th>
                                <th className="px-6 py-4 font-semibold">Reported By</th>
                                <th className="px-6 py-4 font-semibold">Reason</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-red-100">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-red-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden">
                                                <img src={report.reported?.avatar_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-stone-900 text-sm">{report.reported?.name || 'Unknown'}</p>
                                                <p className="text-xs text-stone-500">{report.reported?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden">
                                                <img src={report.reporter?.avatar_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-sm font-medium text-stone-700">{report.reporter?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-stone-700 max-w-xs">{report.reason}</p>
                                        <p className="text-xs text-stone-400 mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => resolveReport(report.id)}
                                            className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold rounded-lg shadow-sm"
                                        >
                                            Mark Resolved
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
