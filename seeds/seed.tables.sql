BEGIN;

TRUNCATE
  'users',
  'symptoms',
  'meals',
  'severity';

INSERT INTO 'users' ('id', 'username', 'password', 'display_name')
VALUES
(
  1,
  'testuser',
/*   'pass', */
  '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG',
  'Test User'
);


INSERT INTO 'symptoms' ( 'user', 'severity', 'type', 'timestamp')
VALUES
(
  1,
  4, 
  'bloating',
  1568731573
);

INSERT INTO 'meals' ('user', 'food', 'ingredients', 'timestamp')
VALUES
(
  1,
  ARRAY [ 'hamburger', 'fries' ],
  ARRAY [ 'wheat', 'beef', 'spices', 'palm oil', 'potato', 'salt' ]
);

SELECT setval('users_id_seq', (SELECT MAX(id) from "users"));
SELECT setval('symptoms_id_seq', (SELECT MAX(id) from "symptoms"));
SELECT setval('meals_id_seq', (SELECT MAX(id) from "meals"));

COMMIT;