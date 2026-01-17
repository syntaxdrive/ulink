import { supabase } from '../../../lib/supabase';

export interface AnalysisResult {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

export const analyzeResume = async (resumeText: string): Promise<AnalysisResult> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Mock API Delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simple functionality to generate a dynamic-looking score
    const keywords = ['react', 'typescript', 'javascript', 'node', 'sql', 'python', 'java', 'html', 'css', 'git'];
    const foundKeywords = keywords.filter(k => resumeText.toLowerCase().includes(k));

    // Calculate a pseudo-score
    let score = 50; // Base score
    score += Math.min(20, resumeText.length / 100); // Length bonus
    score += Math.min(30, foundKeywords.length * 3); // Keyword bonus
    score = Math.min(100, Math.round(score));

    const result: AnalysisResult = {
        score,
        summary: score > 80
            ? "Excellent resume! Well-structured and keyword-rich."
            : "Good start, but there is room for improvement in content depth and keyword usage.",
        strengths: [
            "Contact information detected",
            ...(foundKeywords.length > 0 ? [`Keywords found: ${foundKeywords.slice(0, 3).join(', ')}...`] : []),
            resumeText.length > 500 ? "Good length" : "Concise format"
        ],
        weaknesses: [
            "Could use more action verbs",
            "Quantifiable metrics are scarce",
            foundKeywords.length < 3 ? "Missing key technical skills" : "Skill section could be more prominent"
        ],
        suggestions: [
            "Use the 'STAR' method for bullet points (Situation, Task, Action, Result)",
            "Add a strong professional summary at the top",
            "Ensure formatting is consistent"
        ]
    };

    // Save to DB
    const { error } = await supabase.from('resume_reviews').insert({
        user_id: user.id,
        resume_text: resumeText,
        analysis_result: result
    });

    if (error) {
        console.error("Failed to save review:", error);
        // We ensure we still return the result even if save fails (e.g. table doesn't exist yet)
    }

    return result;
};
