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
("WATER", 2),
("BROWN RICE FLOUR", 2),
("POTATO STARCH", 2),
("TAPIOCA STARCH", 2),
("EGG WHITE", 2),
("SALT", 2),
("XANTHAM GUM", 2),
("MILK", 2),
("CHEESE CULTURES", 2),
("SALT", 2),
("ENZYMES", 2),
("CORN STARCH", 2),
("POTATO FLOUR", 2),
("ANATTO", 2),
("SEA SALT", 2),
("SPICES", 2),






COMMIT;