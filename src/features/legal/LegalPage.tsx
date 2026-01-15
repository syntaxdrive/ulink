import { ArrowLeft, Shield, FileText, Cookie, Scale } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const legalDocs = {
    privacy: {
        title: "Privacy Policy",
        icon: <Shield className="w-6 h-6 text-emerald-600" />,
        content: `
Last Updated: January 12, 2026

1. Introduction
Welcome to UniLink. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.

2. Important Information and Who We Are
UniLink is the controller and responsible for your personal data. We have appointed a data privacy manager who is responsible for overseeing questions in relation to this privacy policy.

3. The Data We Collect About You
We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
- Identity Data: includes first name, last name, username or similar identifier, title, date of birth and gender.
- Contact Data: includes billing address, delivery address, email address and telephone numbers.
- Technical Data: includes internet protocol (IP) address, login data, browser type and version, time zone setting and location.
- Profile Data: includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.

4. How We Use Your Personal Data
We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
- Where we need to perform the contract we are about to enter into or have entered into with you.
- Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.
- Where we need to comply with a legal or regulatory obligation.

5. Data Security
We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.

6. Your Legal Rights
Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
        `
    },
    terms: {
        title: "Terms of Service",
        icon: <FileText className="w-6 h-6 text-emerald-600" />,
        content: `
Last Updated: January 12, 2026

1. Agreement to Terms
By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with these terms, you are prohibited from using or accessing this site.

2. Use License
Permission is granted to temporarily download one copy of the materials (information or software) on UniLink's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- modify or copy the materials;
- use the materials for any commercial purpose, or for any public display (commercial or non-commercial);
- attempt to decompile or reverse engineer any software contained on UniLink's website;
- remove any copyright or other proprietary notations from the materials; or
- transfer the materials to another person or "mirror" the materials on any other server.

3. Disclaimer
The materials on UniLink's website are provided on an 'as is' basis. UniLink makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. Limitations
In no event shall UniLink or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on UniLink's website.

5. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of Nigeria and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        `
    },
    cookies: {
        title: "Cookie Policy",
        icon: <Cookie className="w-6 h-6 text-emerald-600" />,
        content: `
Last Updated: January 12, 2026

1. What Are Cookies
Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.

2. How We Use Cookies
When you use and access the Service, we may place a number of cookies files in your web browser. We use cookies for the following purposes:
- To enable certain functions of the Service.
- To provide analytics.
- To store your preferences.
- To enable advertisements delivery, including behavioral advertising.

3. Third-Party Cookies
In addition to our own cookies, we may also use various third-parties cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on.

4. Your Choices Regarding Cookies
If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
        `
    },
    copyright: {
        title: "Copyright Policy",
        icon: <Scale className="w-6 h-6 text-emerald-600" />,
        content: `
Last Updated: January 12, 2026

1. Copyright Policy
We respect the intellectual property rights of others. It is our policy to respond to any claim that Content posted on the Service infringes the copyright or other intellectual property infringement ("Infringement") of any person.

2. DMCA Notice
If you are a copyright owner, or authorized on behalf of one, and you believe that the copyrighted work has been copied in a way that constitutes copyright infringement that is taking place through the Service, you must submit your notice in writing to the attention of "Copyright Manager" of UniLink and include in your notice a detailed description of the alleged Infringement.

3. Intellectual Property Rights
Proprietary Rights. As between you and us, we (or our licensors) own all right, title, and interest in and to the Service, including all related intellectual property rights. The Service is protected by copyright, trade mark, and other laws of both the Nigeria and foreign countries. Our trade marks and trade dress may not be used in connection with any product or service without the prior written consent of us.
        `
    }
};

export default function LegalPage() {
    const { type } = useParams<{ type: keyof typeof legalDocs }>();
    const doc = type && legalDocs[type] ? legalDocs[type] : legalDocs.privacy;

    return (
        <div className="max-w-4xl mx-auto pb-20 pt-4">
            <Link to="/app" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to App
            </Link>

            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-stone-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                        {doc.icon}
                    </div>
                    <h1 className="text-3xl font-bold text-stone-900">{doc.title}</h1>
                </div>

                <div className="prose prose-stone max-w-none prose-headings:font-bold prose-headings:text-stone-900 prose-p:text-stone-600 prose-li:text-stone-600">
                    {doc.content.split('\n').map((paragraph, idx) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return null;
                        if (trimmed.match(/^\d+\./)) {
                            return <h3 key={idx} className="text-xl mt-8 mb-4">{trimmed}</h3>;
                        }
                        if (trimmed.startsWith('-')) {
                            return <li key={idx} className="ml-4 list-disc">{trimmed.substring(1).trim()}</li>;
                        }
                        return <p key={idx} className="mb-4 leading-relaxed">{trimmed}</p>;
                    })}
                </div>

                <div className="mt-12 pt-8 border-t border-stone-100 text-sm text-stone-400">
                    &copy; {new Date().getFullYear()} UniLink Nigeria. All rights reserved.
                </div>
            </div>
        </div>
    );
}
