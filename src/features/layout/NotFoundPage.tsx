import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-stone-100 p-6 rounded-full mb-6">
                <span className="text-4xl">🛸</span>
            </div>

            <h1 className="text-6xl font-black text-stone-900 mb-2 font-display">404</h1>
            <h2 className="text-2xl font-bold text-stone-700 mb-4">Page Not Found</h2>
            <p className="text-stone-500 max-w-md mb-8">
                The page you are looking for seems to have drifted into outer space.
                Let's get you back to solid ground.
            </p>

            <div className="flex gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                </button>
                <button
                    onClick={() => navigate('/app')}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Home className="w-4 h-4" />
                    Dashboard
                </button>
            </div>
        </div>
    );
}
