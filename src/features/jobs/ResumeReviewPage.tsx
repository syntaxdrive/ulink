import { useState } from 'react';
import { Send, FileText, CheckCircle2, AlertCircle, Lightbulb, Loader2 } from 'lucide-react';
import { analyzeResume, type AnalysisResult } from './services/resumeService';

export default function ResumeReviewPage() {
    const [resumeText, setResumeText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const handleAnalyze = async () => {
        if (!resumeText.trim()) return;
        setIsAnalyzing(true);
        try {
            const data = await analyzeResume(resumeText);
            setResult(data);
        } catch (error) {
            console.error(error);
            alert('Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {/* Header */}
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-display font-bold text-stone-900 mb-3">
                    AI Resume Review
                </h1>
                <p className="text-lg text-stone-500 max-w-2xl mx-auto">
                    Get instant, AI-powered feedback on your resume. Improve your score, find keywords, and land your dream job.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 h-full flex flex-col">
                        <label className="font-bold text-stone-700 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-600" />
                            Paste your Resume content
                        </label>
                        <textarea
                            className="flex-1 w-full bg-stone-50 rounded-xl p-4 text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none min-h-[400px] font-mono text-sm"
                            placeholder="John Doe&#10;Software Engineer&#10;..."
                            value={resumeText}
                            onChange={e => setResumeText(e.target.value)}
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={!resumeText.trim() || isAnalyzing}
                            className="mt-4 w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:hover:shadow-none flex justify-center items-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Analyze Resume
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {result ? (
                        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-stone-200/50 border border-stone-100 animate-in slide-in-from-right duration-500">
                            {/* Score */}
                            <div className="flex items-center justify-between mb-8 border-b border-stone-100 pb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-stone-900 mb-1">Analysis Score</h2>
                                    <p className="text-stone-500 text-sm max-w-xs">{result.summary}</p>
                                </div>
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-stone-100" />
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            strokeDasharray={251.2}
                                            strokeDashoffset={251.2 - (251.2 * result.score) / 100}
                                            className={`${result.score > 70 ? 'text-emerald-500' : result.score > 40 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute text-2xl font-bold text-stone-800">{result.score}</span>
                                </div>
                            </div>

                            {/* Feedback Lists */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" /> Strengths
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.strengths.map((item, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-stone-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" /> Improvements
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.weaknesses.map((item, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-stone-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-bold text-amber-600 mb-3 flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5" /> Suggestions
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.suggestions.map((item, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-stone-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200 text-stone-400">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <FileText className="w-8 h-8 text-stone-300" />
                            </div>
                            <p className="font-medium">Submit your resume to see the analysis result here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
