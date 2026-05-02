-- Pack 4: Marketplace
BEGIN;

INSERT INTO public.marketplace_listings (id, seller_id, title, description, price, category, image_urls, is_sold, created_at)
VALUES ('dc09e9f2-6ee8-400d-9834-9480eea3ccf9', '8798340d-7df4-4160-942a-5d222ea427b6', 'food guru', 'FOOD_DATA:{"options":[{"name":"yam","price":600}],"description":""}', 200.00, 'Food', ARRAY[]::text[], true, '2026-04-27 18:15:30.491452+00')
ON CONFLICT (id) DO NOTHING;
COMMIT;