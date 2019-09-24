BEGIN;

TRUNCATE ingredients, food, meals, plates CASCADE;

INSERT INTO "meals" ("user_id", "created") values 
(1, now()),
(1, now() - INTERVAL '30 minutes'),
(1, now() - INTERVAL '60 minutes'),
(1, now() - INTERVAL '120 minutes'),
(1, now() - INTERVAL '150 minutes'),
(1, now() - INTERVAL '180 minutes'),
(1, now() - INTERVAL '240 minutes'),
(1, now() - INTERVAL '400 minutes'),
(1, now() - INTERVAL '560 minutes'),
(1, now() - INTERVAL '600 minutes');

INSERT INTO "food" ("name", "ndbno") values
("Cheese, cheddar (Include…d Distribution Program)", 01009),
("MAC & CHEESE", 45285302),
("ORGANIC SHALLOTS", 45274257),
("PARMESAN CHEESE", 45350853),
("CHICKEN STRIPS", 45288430),
("MAYONNAISE DRESSING", 45217643),
("TUONG OT SRIRACHA, SRIRACHA CHILI SAUCE", 45064535),
("TATER TOTS", 45247145),
("MONGOLIAN BEEF WITH ASPARAGUS & SCALLIONS", 45203448),
("Quinoa", 20137),
("Onions, yellow, sauteed", 11286);

INSERT INTO "ingredients" ("name", "food") values
("WATER", 45285302),
("BROWN RICE FLOUR",45285302),
("POTATO STARCH", 45285302),
("TAPIOCA STARCH", 45285302),
("EGG WHITE", 45285302),
("SALT", 45285302),
("XANTHAM GUM", 45285302),
("MILK", 45285302),
("CHEESE CULTURES", 45285302),
("SALT", 45285302),
("ENZYMES", 45285302),
("CORN STARCH", 45285302),
("POTATO FLOUR", 45285302),
("ANATTO", 45285302),
("SEA SALT", 45285302),
("SPICES", 45285302);

INSERT INTO "plates" ("food", "meal") values
(45285302, 1),
(45247145, 1),
(45285302, 1),







COMMIT;