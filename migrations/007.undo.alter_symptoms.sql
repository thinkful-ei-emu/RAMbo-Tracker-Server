ALTER TABLE symptoms ADD COLUMN type varchar, ADD COLUMN user_id INTEGER references "users"(id);

ALTER TABLE symptoms ALTER COLUMN "type_id" DROP NOT NULL;

ALTER TABLE symptoms DROP COLUMN "type_id";