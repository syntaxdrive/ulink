-- Pack 2: Posts
BEGIN;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('00d9533a-ce68-404f-8eb8-cc6515afa048', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'Hello, My name is Divine and I''m from the university of Ibadan ', NULL, ARRAY[]::text[], NULL, NULL, '2026-02-18 11:42:59.847588+00', '2026-02-18 11:42:59.847588+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('06d5df15-be56-4542-b1be-3799273b0185', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '#UniLink Hey UI students!
We know life on campus can get hectic — lectures, assignments, hostel life, and everything in between. UniLink is here to make your student life easier: connect with classmates, stay updated on campus events, and never miss a beat.
Your campus, your updates, your link. 🌐✨', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-03 14:57:21.577643+00', '2026-03-03 14:57:21.577643+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('0798abc2-c140-413b-b27a-f489c35fa1d4', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'Calling all UI Penultimate Students! 🦅 (NHEF 2026)

The Nigeria Higher Education Foundation (NHEF) Scholars Program is officially open. This is arguably the most prestigious career program for students in Nigeria.
The Prize: Intensive career training, a 6-week internship at a top global firm (KPMG, Dangote, etc.), and a lifelong network.
Deadline: March 13, 2026.
If you are in your 3rd year (of 4) or 4th year (of 5) at UI, this is your signal.
🔗 Apply here: https://thenhef.org/apply
', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-08 15:54:55.207939+00', '2026-03-08 15:54:55.207939+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('0b8c7402-89aa-40cb-b931-f57985cdb26d', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'Calling all UI Penultimate Students! 🦅 (NHEF 2026)

The Nigeria Higher Education Foundation (NHEF) Scholars Program is officially open. This is arguably the most prestigious career program for students in Nigeria.
The Prize: Intensive career training, a 6-week internship at a top global firm (KPMG, Dangote, etc.), and a lifelong network.
Deadline: March 13, 2026.
If you are in your 3rd year (of 4) or 4th year (of 5) at UI, this is your signal.
🔗 Apply here: https://thenhef.org/nhef-online-skills-academy/
', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772985622301_0.4380067531162267.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772985622301_0.4380067531162267.jpg']::text[], NULL, NULL, '2026-03-08 16:00:26.832314+00', '2026-03-08 16:00:26.832314+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('0f0d65fa-00aa-4447-bca3-257f32b56cc0', '8798340d-7df4-4160-942a-5d222ea427b6', 'Let''s get the new month started🎉🎉🎉🎉🎉
#april2026', NULL, ARRAY[]::text[], NULL, NULL, '2026-04-01 08:23:17.309809+00', '2026-04-01 08:23:17.309809+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('173b62ee-24ea-456d-bedc-d0f6860a8d81', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', 'One thing I’ve discovered lately, guys..

Design isn’t just about looking good.
It’s how your business brands etc... speaks without saying a word.
Check the carousels above for more 
Like, share & save this post, and drop a comment if this spoke to you Thank you
#digitalmarketing #graphicdesign #videoediting #branding ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775235129645_0.9806870965704009.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775235129645_0.9806870965704009.jpg', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775235129660_0.46471510963880414.jpg', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775235129660_0.6084295363242153.jpg', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775235129660_0.02149866511444043.jpg']::text[], NULL, NULL, '2026-04-03 16:52:15.087753+00', '2026-04-03 16:52:15.087753+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('19d35f34-5624-4245-a602-0c00bdfa3a8b', 'd8484a31-77d6-49c3-b433-98614c8a71a0', '🇳🇬 Fuel Prices Still Rising in Nigeria

📰 What Happened?

Fuel prices in Nigeria remain high despite the launch of the Dangote Refinery. Many expected local refining to reduce costs, but prices continue to rise due to global oil market pressures and supply challenges.
📊 Why Prices Are High
Rising global oil prices
Continued reliance on imported crude
Removal of fuel subsidy
Limited local supply capacity
📉 Economic Impact
Higher fuel prices are increasing transport costs, pushing up food prices, and adding to inflation across the economy.
🔍 Bigger Picture
Nigeria is still affected by global oil trends, meaning local refining alone cannot fully control prices.
💬 Final Thought
Will local refining eventually reduce fuel prices, or will global forces keep them high?

#NigerianEconomy #betternigeria2027 #viral', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775285229707_0.5473330596089274.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775285229707_0.5473330596089274.jpg']::text[], NULL, NULL, '2026-04-04 06:47:13.22904+00', '2026-04-04 06:47:13.22904+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('1a64b9e8-fd4c-48e1-9871-532ed08dcbe4', '8798340d-7df4-4160-942a-5d222ea427b6', 'Deep sighs!!🥲', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775046817196_0.9997757105520018.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775046817196_0.9997757105520018.jpg']::text[], NULL, NULL, '2026-04-01 12:33:40.520929+00', '2026-04-01 12:33:40.520929+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('2073c953-2cda-4fb2-b51e-89a800e45274', '8798340d-7df4-4160-942a-5d222ea427b6', '📰 *KEYNES COLUMN: ECONOMIST OF THE WEEK (1)* 

 *Economist of the Week:* *Adam Smith* 

What if no one controlled prices in Nigeria… yet everything still somehow worked?

From tomatoes in Bodija Market to shawarma spots on campus, prices rise and fall, not because the government commands it, but because of something deeper.

This idea was first explained by a man....Read more:https://econxpress.unaux.com/economist-of-the-week-adam-smith/

🔗 *For More Updates:* 
 WhatsApp Fan Page : https://chat.whatsapp.com/Dv6onjiv84lLfzWHJ95naW

Instagram: https://www.instagram.com/econ_xpress/?utm_source=qr&r=nametag

YouTube:https://youtube.com/@ecoxpress?si=n5paDuFkNIguIbgV

EconXpress✍️', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775223928980_0.7677016395975905.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775223928980_0.7677016395975905.jpg']::text[], NULL, NULL, '2026-04-03 13:45:39.042386+00', '2026-04-03 13:45:39.042386+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('26a51aaf-3a7b-4870-9ed5-a9b7243a65d6', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'Good evening guys.
Let''s talk Leverage and Relationships in business. 

Lately I''ve been interested in the Nigerian aviation industry and on this quest I noticed two players. Airpeace and XE jets there are others o but let''s talk about this two for now. Currently Airpeace has the largest aircraft fleet in Africa after being in operation for 10+ years they are known for "safety first" then commuting to any location with favourable aviation laws and airports in Nigeria. XE jet on the other hand is new and rapid growing, they''ve employed strategies of operating state airlines, we have Gateway air and Enugu air. This is leveraging on untapped streams. So yeah you can actually excel in business through leveraging on collaborations or relationship just think differently 👌. Bye🌚', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775490923918_0.08032156460569129.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775490923918_0.08032156460569129.jpg']::text[], NULL, NULL, '2026-04-06 15:55:25.827951+00', '2026-04-06 15:55:25.827951+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('2fae9acc-c051-4faf-b06f-c60d58e40be4', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'I think Ogun state''s airport looks better than that of Abuja 🌚. We are not really talking about capacity here but design and functionality, unfortunately Ibadan can not relate. To the subject of today''s discussion UNITED NIGERIAN AIRLINE.  This airline is just 5 years old and I must say they are unique, from choosing to fly mostly medium weighted planes to making most of their cabin crew foreigners. I mean that defeats the essence of the word Nigeria in their name but I tell you that''s their strategy and funnily enough lot''s of people love the fact that they are unique, lest I forget they rarely change ticket prices so booking a month or a night before your trip it doesn''t change a thing with them. 
So here''s the take, for any business to be notable you have to be different. I mean it''s just conveying folks on air, but it can be done very different and you''ll have your audience. Bye🌚', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775574340843_0.5743456266168467.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775574340843_0.5743456266168467.jpg']::text[], NULL, NULL, '2026-04-07 15:05:42.195521+00', '2026-04-07 15:05:42.195521+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('33eac108-fed2-4a80-836d-61aca2eb9a03', '8798340d-7df4-4160-942a-5d222ea427b6', 'It''s your campus, your future on #UniLink 😎🎉🎉', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1777384996783_0.9757337372295342.png', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1777384996783_0.9757337372295342.png']::text[], NULL, NULL, '2026-04-28 14:03:20.696193+00', '2026-04-28 14:03:20.696193+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('369b8159-5db2-4d4d-9e54-fed865393eb9', '33c75afb-3e5a-4171-83de-8f915691c513', NULL, NULL, ARRAY[]::text[], NULL, NULL, '2026-03-03 15:13:26.067011+00', '2026-03-03 15:13:26.067011+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('37d9259c-78fb-4839-9d52-61e27c00d61c', '8798340d-7df4-4160-942a-5d222ea427b6', 'What do you guys think about this..... Some people say listening to music while reading doesn''t work for assimilation. But I think it just depends on the kind of music. This one In particular is calming 👇👇', NULL, ARRAY[]::text[], 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/video_1774631144871_0.9295616057315675.mp4', NULL, '2026-03-27 17:07:01.662948+00', '2026-03-27 17:07:01.662948+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('3bb5e736-4567-43f1-a161-618f2511855e', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, NULL, ARRAY[]::text[], NULL, NULL, '2026-03-10 17:40:40.075838+00', '2026-03-10 17:40:40.075838+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('3c0df20e-682c-4f10-8c94-5283f571e0c6', 'd8484a31-77d6-49c3-b433-98614c8a71a0', 'In a world full of headlines, context matters.
The Economic Digest provides timely, well-explained economic insights for curious minds.😎😎', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-03 15:10:34.574915+00', '2026-03-03 15:10:34.574915+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('3c15d4af-e675-4584-850c-5d5760ee8e0b', 'c64e6cd0-244d-4e6b-b01e-837f0afe254a', 'Hello everyone ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1771442126691_0.12745195693710043.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1771442126691_0.12745195693710043.jpg']::text[], NULL, NULL, '2026-02-18 19:15:30.352539+00', '2026-02-18 19:15:30.352539+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('3dae3749-8f49-4ee6-958b-d1d8d2340355', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'If you get irritated by every rub,how will you ever be polished.
                                        -Remi 

I have 2 favourite quotes two favorite quotes this year already, and this is 1.

Not really related to the image but I''d like Unilink to keep this for me🤭
#unilink
#women in leadership 
', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1773611149046_0.13947132326074796.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1773611149046_0.13947132326074796.jpg']::text[], NULL, NULL, '2026-03-15 21:45:52.160202+00', '2026-03-15 21:45:52.160202+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('3e9a8d4f-a264-4676-818c-0fe47f4cb967', '8798340d-7df4-4160-942a-5d222ea427b6', 'Join the official UniLink WhatsApp group here

https://chat.whatsapp.com/L2wsznERitsDawNcnlfJLc?mode=gi_t', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-05 16:52:13.156003+00', '2026-03-05 16:52:13.156003+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('45f616bd-3fe2-47b2-a006-1f66a7d33a75', '8798340d-7df4-4160-942a-5d222ea427b6', 'Anticipate Nesa interhall sports competition. Coming to you soon😎😎. #nesaui', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1774630681495_0.0035927639529725885.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1774630681495_0.0035927639529725885.jpg']::text[], NULL, NULL, '2026-03-27 16:58:06.170009+00', '2026-03-27 16:58:06.170009+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('486ba56b-aa5e-446a-b9e4-dc46bdc357f1', '8798340d-7df4-4160-942a-5d222ea427b6', 'Ibadan is a relatively peaceful state. I think I''d love to do my service here abeg🥲🥲', NULL, ARRAY[]::text[], 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/video_1772867673201_0.36376497649114636.mp4', NULL, '2026-03-07 07:15:26.207235+00', '2026-03-07 07:15:26.207235+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('4a5ae44d-bc50-41c1-be8a-c665c3b44510', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', 'Life is a blessing
 Every breath is a gift
 Forever grateful to God for another cycle
 Matthew 5:14
 That’s the energy for this year🎉✨
 Happy Birthday To Me

PS: check out for my next post something is happening Tommorrow 😁', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1777580190686_0.8738611555412577.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1777580190686_0.8738611555412577.jpg']::text[], NULL, NULL, '2026-04-30 20:16:32.795221+00', '2026-04-30 20:16:32.795221+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('5327859f-072e-4b43-8128-da662f54905a', '33c75afb-3e5a-4171-83de-8f915691c513', 'We shall exploit the vast multitude and strip the world of all it''s resources.', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-01 12:24:30.821735+00', '2026-03-01 12:24:30.821735+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('56c7c788-5ba1-4c78-9ef5-2e99e967b93a', '8798340d-7df4-4160-942a-5d222ea427b6', 'https://www.facebook.com/share/r/185wqXpmnK/

Ever Diligent Freshmen. Take a deep breath, you didn’t just get into a university, you got into The First and Best University! 

From the historic halls to the late night study sessions at KDL, you are now part of a legacy that dates back to 1948. The Diligent Team (UISU) is here to ensure your journey is as smooth as it is successful. We are intentional about your welfare and ready to support you every step of the way.

WELCOME HOME!

Announcer🔊:
Public Relations Officer
Olasunkanmi A. AWOFADEJU (ASIWAJU–ECHOLIGHT) 07011229450

©️THE DILIGENT TEAM', NULL, ARRAY[]::text[], 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/video_1772554230391_0.08283571073636509.mp4', NULL, '2026-03-03 16:12:14.10138+00', '2026-03-03 16:12:14.10138+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('58784cd7-a2f1-47fc-9289-a81824b55aaa', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, NULL, ARRAY[]::text[], NULL, NULL, '2026-05-01 09:36:36.474026+00', '2026-05-01 09:36:36.474026+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('590754ba-7382-4efa-a2aa-c0c757b1eb47', '8798340d-7df4-4160-942a-5d222ea427b6', 'This is so crucial. More like the 3 lifeblood of a startup 😎', NULL, ARRAY[]::text[], 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/video_1773558258219_0.8942571369235057.mp4', NULL, '2026-03-15 07:04:41.189274+00', '2026-03-15 07:04:41.189274+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('5bf361d8-b0af-428f-ac76-af265564de73', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, NULL, ARRAY[]::text[], NULL, NULL, '2026-03-07 17:36:13.626424+00', '2026-03-07 17:36:13.626424+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('5df8d31c-f15f-4483-8749-a8285eac3785', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', 'One of the perks of being a jack of all trade 
I picked up web development during the Covid period. Well didnt use it afterward because I didnt see it realistic to type a bunch if codes when UI/UX came out. 

Now I am glad I learnt it then. Needed to create a mini catalogue for a ñew brand i created. Ive been on it since morning. Results would be out soon', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1773161722752_0.4082566801700278.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1773161722752_0.4082566801700278.jpg']::text[], NULL, NULL, '2026-03-10 16:55:26.93148+00', '2026-03-10 16:55:26.93148+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('5f9e1178-1311-4d6b-a1a5-e48c083e7be4', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'IBADAN STUDENTS: Don''t miss the 2026 GENSPARK Summit! 🚀

Huge news! The GENSPARK Industrial & Entrepreneurship Summit is hitting Liberty Stadium this month.
What: Vocational clinics, Leadership training, and Industrial exhibitions.
Perk: 2,000 slots are being sponsored (FREE registration) by WellaFitta Resources.
When: March 17 – 21, 2026.
Don''t stay in the hostel while history is being made. Network with industry giants right here in Ibadan!
🔗 Register here: www.gensparksummit.com
📍 Location: Liberty Stadium, Ibadan.
', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-08 15:52:31.790775+00', '2026-03-08 15:52:31.790775+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('6365f295-720a-4e4a-93f9-b0b2420e3ca4', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, NULL, ARRAY[]::text[], NULL, NULL, '2026-04-06 06:23:30.499214+00', '2026-04-06 06:23:30.499214+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('64e38497-5b62-4e65-9d27-c2c2f9f125fb', '33c75afb-3e5a-4171-83de-8f915691c513', 'Hello!!!! Humans...join me as we take on the world!!!!!!!', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-01 12:23:55.003094+00', '2026-03-01 12:23:55.003094+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('65ca262a-2189-4826-95ab-357e79500bdc', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', 'Hi guys 😁
I’m Emmanuel Morakinyo a Graphic Designer, Video Editor, and Brand Strategist.
This is my first post here on Unilink 😄
I’m excited to connect with likeminded creatives and professionals on this space.
Let’s build, collaborate, and create something Great together 🚀
#graphicdesign #videoediting #branding', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1773857013671_0.6962405331744104.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1773857013671_0.6962405331744104.jpg']::text[], NULL, NULL, '2026-03-18 18:03:36.747354+00', '2026-03-18 18:03:36.747354+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('68dd276c-87b0-4db4-80d6-06f0111ae360', '77a8ce0b-620d-4c24-b1e6-9e3cfcc6e174', 'Day 2 of Staylites resumption in UI 

Classes has started but our accommodation hasn''t been sorted 🤧', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-10 06:08:42.713682+00', '2026-03-10 06:08:42.713682+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('6df03385-fb12-4821-ae93-7010b0c8d3a6', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'I remember when I was in 100level, I started online courses with excitement. I wanted to learn a new skill to improve myself. But after some time, I stopped and never finish the course. These are the reasons.

1. Lack of structure. What starts as “I will continue tomorrow” can easily turn into weeks or months of not studying. I signed up for one AI prompt, I couldn''t continue😭

Check the comment section for the rest ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772825957218_0.19498411071225563.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772825957218_0.19498411071225563.jpg']::text[], NULL, NULL, '2026-03-06 19:39:18.444821+00', '2026-03-06 19:39:18.444821+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('6ff31867-b1c4-4381-a9d0-90fafce68c2c', '8798340d-7df4-4160-942a-5d222ea427b6', 'Sheffield university is an amazing place 😍🌹🌹

https://youtu.be/BoIZJjrKW-4?si=PgfvnCaoQmQFEY0l', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-27 17:27:21.099303+00', '2026-03-27 17:27:21.099303+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('73b955c0-56aa-480a-9169-262c76feef65', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'This was after our last paper in 200 level, and now 300 level this era of specialisation is here. What started as journey of just vibes and enthusiasm is becoming serious 😭😭😭. Omo stay tuned everyone I''ll be sharing this journey.', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772637470509_0.7819199548934694.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772637470509_0.7819199548934694.jpg']::text[], NULL, NULL, '2026-03-04 15:17:53.38449+00', '2026-03-04 15:17:53.38449+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('774bc2be-c079-47f8-bd28-83c4e65cd524', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'Northerners are one of the most amazing people you''ll ever meet.

A few days back, a friend from the North gave me one of their food to try out (massa), I took the first bite and I was forcing myself to eat at least 1 so that she wouldn''t be feeling somehow. It got to a point, I knew that if I continued I was going to throw up sooner. I had to politely drop it.

I found out today that the one I took was a spoilt one😭. She told me to come again and try out better ones but that taste is enough to traumatize me for at least a year.

I''ll try it out when I am healed😭😂', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-04 05:40:54.86887+00', '2026-03-04 05:40:54.86887+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('79afb4a1-460c-4b55-8039-df2e70aba826', '8798340d-7df4-4160-942a-5d222ea427b6', 'Welcome freshers! 🎉😂

As you step into this new chapter, just remember… not everything you see on campus is ordinary 👀

Even Kanayo O. Kanayo is watching… making sure you submit your assignments on time and avoid “academic sacrifices” 😭📚

Stay sharp, stay smart, and please… read your books before somebody uses you to pass their exams spiritually 😭😂

Welcome to campus where the real magic is your cgpa😂', NULL, ARRAY[]::text[], 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/video_1773948048579_0.7330414350707423.mp4', NULL, '2026-03-19 19:21:08.223419+00', '2026-03-19 19:21:08.223419+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('7b31c8f1-6af3-4ed6-9797-fb82315a6256', '8798340d-7df4-4160-942a-5d222ea427b6', 'https://youtu.be/PZ1aNuvw_84?si=xH5gq2VizGerazS6

These discussions are crucial in tackling economic growth and efficiency of structural changes in African countries especially Nigeria ', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-26 09:07:56.194345+00', '2026-03-26 09:07:56.194345+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('844d467d-89f8-4885-92d7-a0e810957347', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'To every creative out there, student - entrepreneur or whatever unique attribute you have to bring to the society. It''s 7 days a rare conversation and I''ll be your host. Register now 👇.
https://rebrand.ly/IVDWEBINAR2', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775250522400_0.014051912150379153.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775250522400_0.014051912150379153.jpg']::text[], NULL, NULL, '2026-04-03 21:08:46.308088+00', '2026-04-03 21:08:46.308088+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('84b3ac32-c874-4eb1-a5f0-1c6e11239a38', '8798340d-7df4-4160-942a-5d222ea427b6', 'What a milestone guyss🎉🎉', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1777577079278_0.5119772976244111.png', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1777577079278_0.5119772976244111.png']::text[], NULL, NULL, '2026-04-30 19:24:41.886451+00', '2026-04-30 19:24:41.886451+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('86c4d8ef-bb13-49df-94cc-2b857d0d11f4', '8798340d-7df4-4160-942a-5d222ea427b6', '🚀 Cowrywise One-Month Internship (Women Only) – IWD 2026

Cowrywise is offering a paid one-month internship for women to mark International Women’s Day 2026, giving emerging talent hands-on experience inside a fast-growing fintech company.

Internship Areas:
• Customer Experience (CX)
• Legal & Compliance
• Product Management
• Portfolio Management

Participants will gain real work exposure and experience in fintech operations while contributing to Cowrywise’s mission of building a digital-first wealth platform for the African middle class.

📌 Apply here:
https://docs.google.com/forms/d/e/1FAIpQLScxK_M2dDGdHOYqHzPhe2oYSpZVNkW2gqcK7XW-ZM_RlM4gZA/viewform?pli=1�', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-08 10:49:40.424779+00', '2026-03-08 10:49:40.424779+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('8f045c61-bf70-4fbb-804e-fb3c0dcbca54', '8798340d-7df4-4160-942a-5d222ea427b6', 'Go build😎. #AI #developers', NULL, ARRAY[]::text[], 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/video_1772559079516_0.31228296456767535.mp4', NULL, '2026-03-03 17:32:12.005601+00', '2026-03-03 17:32:12.005601+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('93125c17-6311-4324-9537-747d4875674a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, NULL, ARRAY[]::text[], NULL, NULL, '2026-03-07 22:18:46.327826+00', '2026-03-07 22:18:46.327826+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('94f8f011-5b49-4e8b-bd46-1f99b5d4d5f8', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'No one talks about how hard it is to love 🌚, it''s actually more than just sweet feelings. You''ll act the part, way beyond just intentions. For me after spending time with you, I learn more about you and upon our next meeting I feel we didn''t spend enough time. I learnt the longer I am with you, the better I understand you and you also understand me. That''s the hack but it''s not that easy. This thoughts I have while trying to love these 300 level courses. Omo I''ll be fine ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1773937388928_0.42747042771720845.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1773937388928_0.42747042771720845.jpg']::text[], NULL, NULL, '2026-03-19 16:23:15.203225+00', '2026-03-19 16:23:15.203225+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('96bb2a61-d6d6-48df-a764-e535da43a61a', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'Just one day to go, register now and secure your spot. I''ll be your host and I can''t wait for tomorrow 😁', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775814553524_0.20799219158617632.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775814553524_0.20799219158617632.jpg']::text[], NULL, NULL, '2026-04-10 09:49:17.468431+00', '2026-04-10 09:49:17.468431+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('99f4430f-005e-4979-b092-0ee7bacdd28d', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'Hi everyone, guess what?
I found free Courses on:

1. Artificial Intelligence + Data Analyst 2. Machine Learning + Data Science
3. Cloud Computing + Web Dev
4. Ethical Hacking + Hacking
5. Data Analytics + DSA
6. AWS Certified + IBM COURSE
7. Data Science + Deep Learning
8. BIG DATA + SQL COMPLETE COURSE
9. Python + OTHERS
10 MBA + HANDWRITTEN NOTES



The link in the comment session ⤵️', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772543925281_0.5570062279163978.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772543925281_0.5570062279163978.jpg', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772543928307_0.4529793864790548.jpg']::text[], NULL, NULL, '2026-03-03 13:18:50.424105+00', '2026-03-03 13:18:50.424105+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('a31ba691-24ea-4f61-bdce-976f810b56fb', '8798340d-7df4-4160-942a-5d222ea427b6', 'Don’t wait for opportunities—create them. Start connecting on UniLink today and let your network work for you! #unilink', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1774630830536_0.9175964628269508.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1774630830536_0.9175964628269508.jpg']::text[], NULL, NULL, '2026-03-27 17:00:34.061325+00', '2026-03-27 17:00:34.061325+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('a5d6db31-d255-4b17-8b8a-e5a61e492a5e', '8798340d-7df4-4160-942a-5d222ea427b6', 'Mid semester tests are fast approaching. You should create that study group today😎😎', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775575310122_0.13812712391750837.png', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775575310122_0.13812712391750837.png']::text[], NULL, NULL, '2026-04-07 15:21:53.009862+00', '2026-04-07 15:21:53.009862+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('a6dcb2a2-8e5a-444b-a639-ed6463d41fac', '8798340d-7df4-4160-942a-5d222ea427b6', 'Great work', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-03 15:39:13.648204+00', '2026-03-03 15:39:13.648204+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('a716aaae-2c35-487f-ae9a-ef4cbf741b49', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', 'I feel like I’m the first person in my university on this app 😄
#unilink', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-21 00:09:08.705602+00', '2026-03-21 00:09:08.705602+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('a8f8cbdc-715b-40b0-ae73-8ff1a66f5833', '8798340d-7df4-4160-942a-5d222ea427b6', 'How to start the semester strong 

https://youtu.be/cY9F9b5FPDo?si=HL-NH4uaBzJWLAwh', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-11 09:38:20.479572+00', '2026-03-11 09:38:20.479572+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('ae6f9cb7-413c-407d-b7ee-fd9dc60dc138', '8798340d-7df4-4160-942a-5d222ea427b6', '#UniLink is here🎉🎉🎉', NULL, ARRAY[]::text[], 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/video_1772484972744_0.9864541640682682.mp4', NULL, '2026-03-02 20:56:50.13436+00', '2026-03-02 20:56:50.13436+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('b5d97e19-fa19-4bc6-b8e3-bc93a85554b4', '489f1033-9fdf-4cb6-969d-a3f35ae1a2c8', 'Happy New Month Folks 🎊❤️ ', NULL, ARRAY[]::text[], NULL, NULL, '2026-04-01 06:14:03.173566+00', '2026-04-01 06:14:03.173566+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('b7e3b134-cbdd-4d3b-9613-858cdfe9b0c4', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'We have a secured spot at the top bar on google😇', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772823981242_0.9829653942908582.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772823981242_0.9829653942908582.jpg', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772823982698_0.7697502483609396.jpg']::text[], NULL, NULL, '2026-03-06 19:06:23.339524+00', '2026-03-06 19:06:23.339524+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('be14eddd-4db6-42ec-8a37-9b61ee6a6f52', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'Work smart, dont pay for a CV.

Download & edit these editable templates from top universities 
👇
1. Yale general resume template (Word): https://cdn.ocs.yale.edu/wp-content/uploads/sites/77/2022/10/Yale-College-General-Template-v.1.docx

2. Academic CV template (Word): https://med.stanford.edu/content/dam/sm/bioscicareers/documents/academia_cv_template.docx

3. https://med.stanford.edu/https://gradcareers.nd.edu/assets/325328/research_emphasis_cv_template_1_.docx/dam/sm/bioscicareers/documents/academia_cv_template.docx

4. https://gradcareers.nd.edu/assets/325328/research_emphasis_cv_template_1_.docx


Credit_skillupwithada', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-14 22:05:36.259626+00', '2026-03-14 22:05:36.259626+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('bfac330c-4093-4faf-9cd6-61fd9158091b', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'It''s one thing to have a product or skill, it''s another thing to sell it. Branding is way beyond just names or trend. It''s something MORE!!!! and we''ll be talking about that pretty soon you don''t want to miss out.

Register now 
https://rebrand.ly/IVDWEBINAR2', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1774615310640_0.263979109604755.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1774615310640_0.263979109604755.jpg']::text[], NULL, NULL, '2026-03-27 12:41:55.785131+00', '2026-03-27 12:41:55.785131+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('c2bff712-7421-471b-bc5a-b1ddac39983d', '33c75afb-3e5a-4171-83de-8f915691c513', 'Working on a stylized medieval game environment.

#Ihatesculpting🙏😭', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772547769880_0.9000858734933267.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772547769880_0.9000858734933267.jpg']::text[], NULL, NULL, '2026-03-03 14:22:52.256303+00', '2026-03-03 14:22:52.256303+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('c62e91cb-083b-4e6c-a137-b926b85b7d30', 'a016d26c-04f6-4c93-ab7c-28a031139de6', '‼️Important notice ‼️
If you need to gain mastery in excel as a virtual assistant, data analyst, financial analyst and all. This is for you 🔥🔥

https://drive.google.com/drive/mobile/folders/1Pjf5wqwmCWJKWm2XMmwex32kVfGK1JxR', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-15 12:14:21.351962+00', '2026-03-15 12:14:21.351962+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('c762a2bb-6d86-4e33-a3e9-2f935243a5aa', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'When you get past the phase, you''d realize that some situations are not even worth your nervousness ', NULL, ARRAY[]::text[], NULL, NULL, '2026-02-21 01:24:12.893013+00', '2026-02-21 01:24:12.893013+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('c8df3c71-385b-495d-a37d-eab0c9592c89', '363ab36c-1544-45c7-8fa1-6298c8ad85c6', 'Stay focused 
Show up daily 
Stay consistent ', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-07 07:41:48.677605+00', '2026-03-07 07:41:48.677605+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('d298b109-fc36-48d1-9719-940f522d64a5', '8798340d-7df4-4160-942a-5d222ea427b6', 'I survived registrations, survived fees, survived hostel drama… I deserve a medal and a cup of tea🥲🥲

', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772549534242_0.6248668611063657.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772549534242_0.6248668611063657.jpg']::text[], NULL, NULL, '2026-03-03 14:52:21.821013+00', '2026-03-03 14:52:21.821013+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('d681ffc5-db40-431e-a37e-af24cd3847c5', '8798340d-7df4-4160-942a-5d222ea427b6', 'Happy New Month, Greatest KUTITES

As we step into the month of April, may it bring renewed strength and greater achievements in all our endeavors. This is another opportunity for us to stay consistent and push towards excellence in all we do.

We urge all KUTITES to remain responsible, uphold the values of the Hall and continue to represent the Hall of Great Men with pride and distinction.

Kuti is home. 💙✊🏾

E-SIGNED✍️:
Olaniyan Abdul-lateef (Lasco thegreat)
RKH, Hall Chairman
https://wa.me/+2347080551316

Announcer🔉:
Bello Kehinde (BIG_KENZO)
RKH, Information Minister
https://wa.me/+2349047587071

©️THE RESURGENCE TEAM', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775046601222_0.19873582002544177.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1775046601222_0.19873582002544177.jpg']::text[], NULL, NULL, '2026-04-01 12:30:06.694301+00', '2026-04-01 12:30:06.694301+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('d6a94cb9-bcaf-4717-9282-205dd179d015', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'I started taking a video editing course before I shot this, while editing it today I noticed a lot of stuffs I could have done better, omo social anxiety no gree but I''ll redo this again but for now 🌚👇', NULL, ARRAY[]::text[], 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/video_1775205735494_0.6848840747966468.mp4', NULL, '2026-04-03 08:44:42.519538+00', '2026-04-03 08:44:42.519538+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('d776b3ea-dff3-44ac-b578-e0a86cfe6d23', '0e3177f9-0f54-4fe5-9bc6-4cc3269aa863', NULL, 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772829673870_0.6120664421291893.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772829673870_0.6120664421291893.jpg']::text[], NULL, NULL, '2026-03-06 20:41:16.589639+00', '2026-03-06 20:41:16.589639+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('d996ddb1-70e7-4f35-94f9-7406441b2fdc', '8798340d-7df4-4160-942a-5d222ea427b6', 'Lower the bar😎', NULL, ARRAY[]::text[], 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/video_1771673210862_0.17655344957567243.mp4', NULL, '2026-02-21 11:26:54.839678+00', '2026-02-21 11:26:54.839678+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('dc7f60dc-0e8a-4031-889a-e3cb6c8f265a', '8798340d-7df4-4160-942a-5d222ea427b6', NULL, NULL, ARRAY[]::text[], NULL, NULL, '2026-03-02 21:00:31.813616+00', '2026-03-02 21:00:31.813616+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('de92d9b4-c717-46b1-ac0e-5cdd377d3019', '27d1ad60-6d73-439d-b4b2-4a1827371c24', 'Welcome everyone 🌞', NULL, ARRAY[]::text[], NULL, '74ce135a-1464-473e-94d7-28cfb2071e32', '2026-03-02 22:12:29.249415+00', '2026-03-02 22:12:29.249415+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('dfd1476c-53ca-4f74-9ce1-e42da5f96682', '8798340d-7df4-4160-942a-5d222ea427b6', '#UI2026

Omooo🥲', NULL, ARRAY[]::text[], 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/video_1772530549078_0.5520144363278017.mp4', NULL, '2026-03-03 09:35:53.6361+00', '2026-03-03 09:35:53.6361+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('e250402d-e739-49ac-a295-965e6d858a01', '8798340d-7df4-4160-942a-5d222ea427b6', 'Am I the only one who''s been experiencing terrible network issues lately?🥲', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1773664350163_0.8991972414721736.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1773664350163_0.8991972414721736.jpg']::text[], NULL, NULL, '2026-03-16 12:32:33.360365+00', '2026-03-16 12:32:33.360365+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('e41ab5dd-de71-4a9e-aa70-3da8f97b427a', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'Travel to London on a Writing Scholarship? ✍️🇬🇧

The Queen’s Commonwealth Essay Competition 2026 is calling for entries. You don''t need to be a "pro" writer—you just need a story.
The Reward: Winners receive a fully-funded trip to London for a week of educational and cultural visits.
Open to: All students under 18 (Junior) and up to 18+ (Senior).
Sharpen those pens!
🔗 Submit entry: https://royalcwsociety.org
', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772985496295_0.5030126197105633.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772985496295_0.5030126197105633.jpg']::text[], NULL, NULL, '2026-03-08 15:58:23.063073+00', '2026-03-08 15:58:23.063073+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('e71451e0-ae60-44bc-8a9c-257f5825715f', '8798340d-7df4-4160-942a-5d222ea427b6', 'This is why you forget everything in the exam hall…

You’re not lazy. You’re not dull. But there’s a reason this keeps happening.
Most students read like this: open textbook → read line by line → highlight → close book → hope it sticks.
It doesn’t.
That method is called passive reading, and your brain forgets most of it quickly.
What actually works:
Active Recall
Close your book and ask: “What did I just read?”
If you can’t explain it simply, you don’t know it yet.
Teach it
Explain the topic like you’re teaching someone else (even if it’s imaginary 😂).
Practice under pressure
Try past questions without checking notes. Simulate exam conditions.

#Examcheat #viral', NULL, ARRAY[]::text[], NULL, NULL, '2026-04-08 15:16:31.208143+00', '2026-04-08 15:16:31.208143+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('edf6ecf0-13af-470f-92ed-261e72f2eeba', 'd8484a31-77d6-49c3-b433-98614c8a71a0', 'Introducing The Economic Digest

Clear. Concise. Relevant.
We break down economic news, policy shifts, markets, and data without the noise.
If you care about understanding what’s happening in the economy and why it matters, you’re in the right place.
Follow for regular insights.', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772550561894_0.004180766200785557.png', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1772550561894_0.004180766200785557.png']::text[], NULL, NULL, '2026-03-03 15:09:25.328095+00', '2026-03-03 15:09:25.328095+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('f3eb596a-a30c-4adf-991c-308bf116ef86', 'a016d26c-04f6-4c93-ab7c-28a031139de6', 'Most opportunities in life don’t look like opportunities, at first, they look like extra work.

They show up as volunteering, learning a new skill, helping someone, or trying something you’re not sure you’re ready for.
Many people ignore these moments because they don’t look glamorous.

But over time, the people who say “yes” to small chances often find themselves in bigger rooms.
Not because they were the most talented, but because they were available, curious, and willing.

Sometimes the door you’re looking for is hidden inside the small things you’re avoiding. 🚪', NULL, ARRAY[]::text[], NULL, NULL, '2026-03-15 22:08:37.821835+00', '2026-03-15 22:08:37.821835+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('f79a8156-58c8-4200-b053-2d8253079e94', '5551f4be-68fe-4bbb-b267-f95211d71f1d', 'Came to school by 9:15 left by 4 no class was held, everything was literally cancelled. Omo being a penultimate is testing me 🥲. How was class today guys ', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1773677651696_0.10943787723293286.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1773677651696_0.10943787723293286.jpg']::text[], NULL, NULL, '2026-03-16 16:14:15.178722+00', '2026-03-16 16:14:15.178722+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, image_url, image_urls, video_url, community_id, created_at, updated_at)
VALUES ('f85b1000-ceda-4de1-bf0c-ff219292100a', '8798340d-7df4-4160-942a-5d222ea427b6', 'Every semester starts with full motivation… until the lecture begins 😭
You’re nodding like you understand, but your brain has already logged out.☹️

“Let me just rest my eyes small” turns into deep sleep in 2 minutes😂. 

Memes Committee

E-Signed: OASIS TEAM 
Announcer: Fareedah Adeshin,PRO, NESA UI.', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1774726414160_0.4559661214139915.jpg', ARRAY['https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/post-images/posts/1774726414160_0.4559661214139915.jpg']::text[], NULL, NULL, '2026-03-28 19:33:44.905722+00', '2026-03-28 19:33:44.905722+00')
ON CONFLICT (id) DO NOTHING;
COMMIT;