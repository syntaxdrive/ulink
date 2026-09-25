import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});
const supabase = createClient(url, key);

async function createScholarships() {
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

    const opportunities = [
        {
            title: "Oxford University Undergraduate Scholarships in UK 2026",
            company: "Oxford University", // Added required company field
            description: "The Oxford University Undergraduate Scholarships are highly competitive and offer full funding for international students applying for undergraduate studies at the University of Oxford.",
            location: "United Kingdom",
            salary_range: "Full Funding + Living Expenses",
            application_link: "https://www.scholarshipregion.com/oxford-university-undergraduate-scholarship/",
            deadline: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Scholarship",
            creator_id: userId,
            status: "active"
        },
        {
            title: "NIPES Comfort Architectural Scholarship For Undergraduates",
            company: "NIPES",
            description: "NIPES is offering a ₦1m Award for undergraduate architecture students demonstrating excellence in their studies and projects.",
            location: "Nigeria",
            salary_range: "₦1,000,000 Award",
            application_link: "https://www.scholarshipregion.com/nipes-comfort-architectural-scholarship/",
            deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Scholarship",
            creator_id: userId,
            status: "active"
        },
        {
            title: "2026 Alex Otti Foundation Scholarship",
            company: "Alex Otti Foundation",
            description: "The Alex Otti Foundation offers scholarships to indigent but brilliant students to pursue their higher education in any Nigerian tertiary institution.",
            location: "Nigeria",
            salary_range: "₦150,000 annually",
            application_link: "https://www.scholarshipregion.com/alex-otti-foundation-scholarship/",
            deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Scholarship",
            creator_id: userId,
            status: "active"
        },
        {
            title: "African Future Leader Scholarship at Imperial College London",
            company: "Imperial College London",
            description: "Aimed at exceptional African students, this scholarship covers studies at the prestigious Imperial College London to nurture the next generation of leaders.",
            location: "United Kingdom",
            salary_range: "Full Tuition + Stipend",
            application_link: "https://www.scholarshipregion.com/african-future-leader-scholarship/",
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Scholarship",
            creator_id: userId,
            status: "active"
        },
        {
            title: "France IDEX Masters Scholarship 2026",
            company: "Université Grenoble Alpes",
            description: "The IDEX Scholarship is awarded to outstanding international students pursuing a Master's degree at Université Grenoble Alpes in France.",
            location: "France",
            salary_range: "€8,000 per academic year",
            application_link: "https://www.scholarshipregion.com/france-idex-masters-scholarship/",
            deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Scholarship",
            creator_id: userId,
            status: "active"
        },
        {
            title: "MTN Foundation Science & Technology Scholarship 2026",
            company: "MTN Foundation",
            description: "The MTN Foundation Science and Technology Scholarship (MTNF STS) is open to full-time 3rd-year students studying Science and Technology-related disciplines in Nigerian public tertiary institutions (Universities, Polytechnics, and Colleges of Education).",
            location: "Nigeria",
            salary_range: "N300,000 annually till graduation",
            application_link: "https://www.mtn.ng/foundation/scholarships/",
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Scholarship",
            creator_id: userId,
            status: "active"
        },
        {
            title: "NNPC/Seplat National Undergraduate Scholarship 2026",
            company: "Seplat Energy",
            description: "The SEPLAT JV Scholarship scheme is designed to promote educational development and human capacity building. This program aims to support academically sound but financially disadvantaged Nigerian students.",
            location: "Nigeria",
            salary_range: "N200,000 annually",
            application_link: "https://seplatenergy.com/",
            deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Scholarship",
            creator_id: userId,
            status: "active"
        }
    ];

    const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert(opportunities)
        .select();

    if (jobError) {
        console.error('Error inserting extra opportunities:', jobError);
    } else {
        console.log(`Successfully created ${jobData.length} extra opportunities from Scholarship Region!`);
    }
}

createScholarships();
