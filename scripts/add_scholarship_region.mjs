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

    // Additional scholarships from scholarshipregion.com
    const opportunities = [
        {
            title: "Oxford University Undergraduate Scholarships in UK 2026",
            description: "The Oxford University Undergraduate Scholarships are highly competitive and offer full funding for international students applying for undergraduate studies at the University of Oxford.",
            requirements: "• Outstanding academic record\n• Financial need\n• Must be an international applicant",
            stipend: "Full tuition plus living expenses",
            link: "https://www.scholarshipregion.com/oxford-university-undergraduate-scholarship/",
            deadline: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Scholarship",
            posted_by: userId
        },
        {
            title: "NIPES Comfort Architectural Scholarship For Undergraduates",
            description: "NIPES is offering a ₦1m Award for undergraduate architecture students demonstrating excellence in their studies and projects.",
            requirements: "• Undergraduate student\n• Studying Architecture\n• Strong portfolio and academic standing",
            stipend: "₦1,000,000 Award",
            link: "https://www.scholarshipregion.com/nipes-comfort-architectural-scholarship/",
            deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Scholarship",
            posted_by: userId
        },
        {
            title: "2026 Alex Otti Foundation Scholarship For Nigerians",
            description: "The Alex Otti Foundation offers scholarships to indigent but brilliant students to pursue their higher education in any Nigerian tertiary institution.",
            requirements: "• Minimum CGPA requirement (usually 3.5 or equivalent)\n• Must be from a financially disadvantaged background\n• Studying in a public tertiary institution in Nigeria",
            stipend: "N150,000 annually",
            link: "https://www.scholarshipregion.com/alex-otti-foundation-scholarship/",
            deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Scholarship",
            posted_by: userId
        },
        {
            title: "African Future Leader Scholarship at Imperial College London 2026",
            description: "Aimed at exceptional African students, this scholarship covers studies at the prestigious Imperial College London to nurture the next generation of leaders.",
            requirements: "• Resident of an African nation\n• Outstanding academic performance\n• Demonstrated leadership potential",
            stipend: "Full tuition and living stipend",
            link: "https://www.scholarshipregion.com/african-future-leader-scholarship/",
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Scholarship",
            posted_by: userId
        },
        {
            title: "France IDEX Masters Scholarship (Grenoble University) 2026",
            description: "The IDEX Scholarship is awarded to outstanding international students pursuing a Master's degree at Université Grenoble Alpes in France.",
            requirements: "• Excellent academic records\n• Applying for an eligible Master's program at UGA",
            stipend: "€8,000 per academic year",
            link: "https://www.scholarshipregion.com/france-idex-masters-scholarship/",
            deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
            type: "Scholarship",
            posted_by: userId
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
