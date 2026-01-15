-- Inspect table definition and constraints
SELECT 
    con.conname AS constraint_name, 
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_catalog.pg_constraint con
INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
WHERE nsp.nspname = 'public'
AND rel.relname = 'notifications';

-- Also check if 'type' is an ENUM type
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'notifications' AND column_name = 'type';
