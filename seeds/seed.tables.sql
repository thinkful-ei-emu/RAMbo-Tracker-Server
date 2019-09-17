
BEGIN;
TRUNCATE
  users,
  symptoms,
  meals RESTART IDENTITY CASCADE ;

INSERT INTO users ( username, password, display_name)
VALUES
(
  'testuser',
/*   'pass', */
  '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG',
  'Test User'
);


INSERT INTO symptoms ( user_id, severity_id, type)
VALUES
(
  1,
  1, 
  'bloating'
);

INSERT INTO meals (user_id)
VALUES
(
  1
);
COMMIT;
