import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});
const supabase = createClient(url, key);

async function createOpportunities() {
    // 1. Get the unilinkrep@gmail.com user
    const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'unilinkrep@gmail.com')
        .single();

    if (userError || !user) {
        console.error('Error finding unilinkrep user:', userError);
        return;
    }
    const userId = user.id;
    console.log('Found unilinkrep user:', userId);

    // 2. Create Scholarships/Opportunities
    const opportunities = [
        {
            title: "MTN Foundation Science & Technology Scholarship 2026",
            description: "The MTN Foundation Science and Technology Scholarship (MTNF STS) is open to full-time 3rd-year students studying Science and Technology-related disciplines in Nigerian public tertiary institutions (Universities, Polytechnics, and Colleges of Education).",
            requirements: "• Must be a 3rd-year (300 level) student\n• Must be studying a Science or Technology related course\n• Minimum CGPA of 3.5 out of 5.0\n• Must be in a public Nigerian tertiary institution",
            stipend: "N300,000 annually till graduation",
            link: "https://www.mtn.ng/foundation/scholarships/",
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            type: "scholarship",
            posted_by: userId
        },
        {
            title: "NNPC/Seplat National Undergraduate Scholarship 2026",
            description: "The SEPLAT JV Scholarship scheme is designed to promote educational development and human capacity building. This program aims to support academically sound but financially disadvantaged Nigerian students.",
            requirements: "• Must be in second year of study or above\n• Have at least 5 O' level credit passes (English and Mathematics inclusive)\n• Must have a CGPA of 3.5 and above\n• Studying specified Engineering, Science, or Art courses",
            stipend: "N200,000 annually",
            link: "https://seplatenergy.com/",
            deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            type: "scholarship",
            posted_by: userId
        },
        {
            title: "PTDF Undergraduate Scholarship Award",
            description: "The Petroleum Technology Development Fund (PTDF) is offering undergraduate scholarships for students in Nigerian Federal Universities studying courses related to the Oil and Gas industry.",
            requirements: "• Must be a full-time student in a Nigerian Federal University\n• Minimum of 5 O' level credits including Math and English\n• Must be studying a PTDF approved course (Engineering, Geosciences, Computing)\n• Minimum CGPA of 3.0 on a 5-point scale",
            stipend: "Full tuition, accommodation, and N150,000 upkeep",
            link: "https://ptdf.gov.ng/",
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            type: "scholarship",
            posted_by: userId
        },
        {
            title: "Agbami Medical and Engineering Professional Scholarship",
            description: "Chevron and its Agbami partners offer this scholarship to support capacity building in the health and engineering sectors as a strategic feed into the national manpower pool.",
            requirements: "• Full-time, 100 or 200 level undergraduate in a recognized Nigerian University\n• Must be studying Medicine, Dentistry, Pharmacy, or Engineering",
            stipend: "N200,000 for Engineering, N400,000 for Medical students (Annually)",
            link: "https://nigeria.chevron.com/",
            deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            type: "scholarship",
            posted_by: userId
        },
        {
            title: "Flutterwave Student Developer Internship",
            description: "Join Flutterwave's engineering team for a 6-month intensive internship program. Work on real products handling millions of transactions across Africa.",
            requirements: "• Currently pursuing a degree in Computer Science or related field\n• Strong foundation in JavaScript/TypeScript/Go\n• Personal portfolio or GitHub profile with projects\n• Excellent problem-solving skills",
            stipend: "Paid Internship (Competitive)",
            link: "https://flutterwave.com/careers",
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            type: "internship",
            posted_by: userId
        }
    ];

    const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert(opportunities)
        .select();

    if (jobError) {
        console.error('Error inserting opportunities:', jobError);
    } else {
        console.log(`Successfully created ${jobData.length} opportunities!`);
    }

    // 3. Create Engaging Posts on the Feed
    const engagingPosts = [
        {
            content: "🚀 **HUGE ANNOUNCEMENT** 🚀\n\nI just curated the top 5 highest-paying undergraduate scholarships available for Nigerian students right now. \n\nSome of these pay up to **₦300k to ₦400k annually + Tuition!** 💰🎓\n\nI've added all the links, requirements, and deadlines to the Careers section. Who's applying?",
            author_id: userId,
            image_url: null,
            created_at: new Date(Date.now() - 5000).toISOString()
        },
        {
            content: "Let's settle this once and for all: What's the hardest course to get an 'A' in at your university? 🤔📚\n\nDrop your course code and university below, let's see who suffers the most! 😭👇",
            author_id: userId,
            image_url: null,
            created_at: new Date(Date.now() - 15000).toISOString()
        },
        {
            content: "Unpopular Opinion: CGPA doesn't matter as much as networking and actual skills when looking for tech jobs. \n\nDo you agree or disagree? Let's discuss in the comments! 🗣️👨‍💻",
            author_id: userId,
            image_url: null,
            created_at: new Date(Date.now() - 30000).toISOString()
        }
    ];

    const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert(engagingPosts)
        .select();

    if (postError) {
        console.error('Error inserting posts:', postError);
    } else {
        console.log(`Successfully created ${postData.length} engaging posts!`);
    }

}

createOpportunities();
