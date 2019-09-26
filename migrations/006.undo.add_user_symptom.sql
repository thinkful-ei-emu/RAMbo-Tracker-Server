ALTER TABLE symptoms ADD COLUMN "user_id" integer references 'users'(id);
ALTER TABLE symptoms ALTER COLUMN "type" varchar NOT NULL;

DROP TABLE user_symptom;
