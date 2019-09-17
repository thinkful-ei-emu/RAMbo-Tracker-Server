DROP TABLE IF EXISTs severity ON DELETE CASCADE;
CREATE TBALE severity(
  id INT PRIMARY KEY,
  name VARCHAR NOT NULL
);

INSERT INTO severity(id,name)
VALUES(
  (1,"Low"),
  (2,"Mild"),
  (3,"Medium"),
  (4,"High"),
  (5,"Extreme")
);