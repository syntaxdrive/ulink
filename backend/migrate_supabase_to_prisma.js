"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚀 Starting Migration from Supabase to Prisma...');
    // 1. Migrate Profiles -> Users
    console.log('Fetching Profiles...');
    const { data: profiles, error: profileErr } = await supabase.from('profiles').select('*');
    if (profileErr)
        throw profileErr;
    console.log(`Found ${profiles.length} profiles. Migrating to Users...`);
    // Default password for migrated accounts
    const defaultPassword = await bcrypt.hash('UlinkMigration2026!', 10);
    for (const p of profiles) {
        await prisma.user.upsert({
            where: { id: p.id },
            update: {},
            create: {
                id: p.id,
                email: p.email || `${p.username || p.id}@unilink.app`,
                name: p.name,
                username: p.username || p.id,
                role: p.role || 'Student',
                password_hash: defaultPassword,
                university: p.university,
                avatar_url: p.avatar_url,
                background_image_url: p.background_image_url,
                headline: p.headline,
                location: p.location,
                about: p.about,
                points: p.points || 0,
                is_verified: p.is_verified || false,
                is_admin: p.is_admin || false,
            }
        });
    }
    console.log('✅ Profiles migrated.');
    // 2. Migrate Posts
    console.log('Fetching Posts...');
    const { data: posts, error: postErr } = await supabase.from('posts').select('*');
    if (!postErr && posts) {
        for (const post of posts) {
            await prisma.post.upsert({
                where: { id: post.id },
                update: {},
                create: {
                    id: post.id,
                    author_id: post.author_id,
                    content: post.content,
                    image_url: post.image_url,
                    created_at: new Date(post.created_at)
                }
            });
        }
        console.log('✅ Posts migrated.');
    }
    // 3. Migrate Messages
    console.log('Fetching Messages...');
    const { data: messages, error: msgErr } = await supabase.from('messages').select('*');
    if (!msgErr && messages) {
        for (const msg of messages) {
            await prisma.message.upsert({
                where: { id: msg.id },
                update: {},
                create: {
                    id: msg.id,
                    sender_id: msg.sender_id,
                    recipient_id: msg.recipient_id,
                    content: msg.content,
                    image_url: msg.image_url,
                    created_at: new Date(msg.created_at),
                    read_at: msg.read_at ? new Date(msg.read_at) : null
                }
            });
        }
        console.log('✅ Messages migrated.');
    }
    console.log('🎉 Migration Completed Successfully!');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=migrate_supabase_to_prisma.js.map