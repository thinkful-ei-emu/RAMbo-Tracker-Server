ALTER TABLE symptoms ADD COLUMN type varchar, ADD COLUMN user_id INTEGER references "users"(id);




INSERT INTO user_symptom (type, user_id) SELECT DISTINCT type, user_id FROM symptoms;

ALTER TABLE symptoms ADD COLUMN "type_id" INTEGER REFERENCES "user_symptom"(id);

UPDATE symptoms SET type_id = user_symptom.id FROM user_symptom WHERE symptoms.type = user_symptom.type;

ALTER TABLE symptoms ALTER COLUMN "type_id" SET NOT NULL;

ALTER TABLE symptoms DROP COLUMN type, DROP COLUMN user_id;