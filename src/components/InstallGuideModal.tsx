import { X, Share, MoreVertical, PlusSquare } from 'lucide-react';

interface InstallGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    isIOS: boolean;
}

export default function InstallGuideModal({ isOpen, onClose, isIOS }: InstallGuideModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                    <h3 className="font-display font-bold text-lg text-slate-900">Install UniLink</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex justify-center">
                        <img src="/icon-512.png" alt="Icon" className="w-20 h-20 rounded-2xl shadow-lg" />
                    </div>

                    <div className="space-y-4">
                        <p className="text-center text-slate-600 font-medium">
                            Add UniLink to your home screen for the best experience.
                        </p>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                            {isIOS ? (
                                <>
                                    <div className="flex items-center gap-3 text-sm text-slate-700">
                                        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full font-bold text-xs shrink-0">1</span>
                                        <span>Tap the <Share className="w-4 h-4 inline mx-1" /> Share button</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-700">
                                        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full font-bold text-xs shrink-0">2</span>
                                        <span>Select <PlusSquare className="w-4 h-4 inline mx-1" /> Add to Home Screen</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 text-sm text-slate-700">
                                        <span className="flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full font-bold text-xs shrink-0">1</span>
                                        <span>Tap the <MoreVertical className="w-4 h-4 inline mx-1" /> Menu button</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-700">
                                        <span className="flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full font-bold text-xs shrink-0">2</span>
                                        <span>Select "Install App" or "Add to Home Screen"</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}
