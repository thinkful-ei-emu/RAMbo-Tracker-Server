ALTER TABLE symptoms ADD COLUMN type varchar;

ALTER TABLE symptoms ADD COLUMN user_id INTEGER references "users"(id) ON DELETE CASCADE;

UPDATE symptoms SET type = user_symptom.type FROM user_symptom WHERE symptoms.type_id = user_symptom.id;

UPDATE symptoms SET user_id = user_symptom.user_id FROM user_symptom WHERE symptoms.type_id = user_symptom.id;

ALTER TABLE symptoms DROP COLUMN type_id;