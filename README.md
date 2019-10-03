# Symptom Tracker Server

Deployed server URL: `https://rambo-tracker.herokuapp.com/`

## Technology Used

Node.js
Framework: Express
Testing: Mocha/Chai, Supertest
Auth/Security: jwt, xss, helmet

## Local dev setup

If using user `dunder-mifflin`:

```bash
mv example.env .env
createdb -U dunder-mifflin symptom-tracker
createdb -U dunder-mifflin symptom-tracker-test
```

If your `dunder-mifflin` user has a password be sure to set it in `.env` for all appropriate fields. Or if using a different user, update appropriately.

```bash
npm install
npm run migrate
env MIGRATION_DB_NAME=symptom-tracker-test npm run migrate
```

And `npm test` should work at this point

## Configuring Postgres

For tests involving time to run properly, configure your Postgres database to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
   1. E.g. for an OS X, Homebrew install: `/usr/local/var/postgres/postgresql.conf`
   2. E.g. on Windows, _maybe_: `C: Program Files PostgreSQL 11.2 data postgresql.conf`
   3. E.g  on Ubuntu 18.04 probably: '/etc/postgresql/10/main/postgresql.conf'
2. Find the `timezone` line and set it to `UTC`:

```conf
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.

## API ENDPOINTS

### User Login, Registration

POST /user
  request:
   `{
      username,
      password,
      display_name
    }`
  response:
    location
    serialized:
    {
      id,
      name (as display name)
      username
    }

POST /auth/token
  request:
    `{
      username,
      password
    }`

  if correct, response:
    `{
      jwt_token
    }`

PUT /auth/token
  request:
  Header with Authorization

  response: `{
    jwt_token
  }`
  
### Events: Either Symptom or Meal

All endpoints are protected and require a bearer token sent in header (Authorization)

#### Get All User Events

GET /event
  
  response:
    `{
      username,
      display_name,
      events:
        [
          {
            type: meal,
            id: 1,
            name: 'A meal',
            time: 2134234,
            items: [
              {
                name: 'hamburger',
                ingredients: ['wheat', 'beef', 'salt', 'spices'],
                ndbno: 3982983
              },
              {
                name: 'fries'.
                ingredients: ['palm oil', 'potato', 'salt'],
                ndbno: 3998723
              }
            ]
          },
          {
            type: 'symptom',
            symptom: ‘bloating’,
            severityNumber: 4,
            severity: severe,
            name:'bloating',
            time: 13o2847912378,
            id:1
          }
        ]
    }`

#### Posting a symptom

POST /event
  request:
    `{
      type: 'symptom'
      symptom: ‘bloating’,
      severity: 4,
      time: 134134234
    }`
  response: 201
  {
     type: 'symptom',
          symptom: symptom,
          severityNumber: 4,
          severity: severe,
          name: symptom,
          time: 134134234,
          id: 1
  }

#### Posting a meal

POST /event

Request(numbers are ndbno of foods selected in the USDA database):

`{
      type: meal,
      items: [123123, 234, 2345356, 1345, 4356546],
      time: 123123123
    }`
  response: 201, `{
   type: 'meal',
          id: response.id,
          name: response.name,
          time: response.created,
          items: []
  }`

#### Deleting a meal

DELETE /event

Request:
`{
  type
  id
}`

Response: 204

### Searching for a food to add to a meal /food

Endpoint requires auth sent in header

#### This endpoint utilizes the USDA Food Composition Databases

GET /food/search
request:
/food/search?search=butter&pageNumber=1
(request must have search term, brand is optional (also as query))
  response (cut for brevity):
  `"{ "foodSearchCriteria ":{ "includeDataTypes ":{ "Survey (FNDDS) ":false, "Foundation ":true, "Branded ":true, "SR Legacy ":true}, "generalSearchInput ": "butter ", "pageNumber ":1, "requireAllWords ":true}, "totalHits ":34890, "currentPage ":1, "totalPages ":698,
  "foods ":[{ "fdcId ":442117, "description ": "BUTTER ", "dataType ": "Branded ", "gtinUpc ": "070399432102 ", "publishedDate ": "2019-04-01 ", "brandOwner ": "Dean Foods Company ", "ingredients ": "PASTEURIZED CREAM (DERIVED FROM MILK), SALT. ", "allHighlightFields ": " ", "score ":290.994},}]"`

#### Posting a food to a meal

POST /food
request: `{
  ndbno
  }`

This will both post the ndbno to the meal as well as request ingredients from the USDA DB

response: 204

### Analyzing Results of A Given User: Results Endpoint

GET /results

returns all the users tracked symptoms

response: `[
    {
        "symptomType": {
            "type": "Drowzey",
            "type_id": 1,
            "min_time": {
                "minutes": 30,
                "days": 0,
                "hours": 0
            },
            "max_time": {
                "hours": 72,
                "days": 0,
                "minutes": 0
            }
        },
        "mostCommonFoods": [
            {
                "name": "PIZZA HUT 12\" Cheese Pizza, Pan Crust",
                "weight": 2
            },
            {
                "name": "CHEESE",
                "weight": 2
            },
            {
                "name": "PIZZA",
                "weight": 2
            },
            {
                "name": "CHEESE",
                "weight": 2
            },
            {
                "name": "PRINGLES",
                "weight": 2
            }
        ],
        "mostCommonIngredients": [
            {
                "name": "SALT",
                "weight": 24
            },
            {
                "name": "ENZYMES",
                "weight": 12
            },
            {
                "name": "SPICES",
                "weight": 8
            },
            {
                "name": "WATER",
                "weight": 6
            },
            {
                "name": "DEXTROSE",
                "weight": 6
            },
            {
                "name": "CHEESE CULTURES",
                "weight": 6
            },
            {
                "name": "CHEDDAR CHEESE",
                "weight": 4
            },
            {
                "name": "WHEY",
                "weight": 4
            },
            {
                "name": "SOYBEAN OIL",
                "weight": 4
            },
            {
                "name": "PORK",
                "weight": 4
            },
            {
                "name": "PAPRIKA",
                "weight": 4
            },
            {
                "name": "GARLIC POWDER",
                "weight": 4
            },
            {
                "name": "CITRIC ACID",
                "weight": 4
            },
            {
                "name": "CULTURES",
                "weight": 4
            }
        ],
        "totalFoodsFound": 5,
        "totalIngredientsFound": 102
}]`

### Symptoms Endpoint

GET /symptom

response: [
   {
        "type": "drowzey",
        "type_id": 2,
        "min_time": {
            "minutes": 30
        },
        "max_time": {
            "hours": 72
        }
    }
]

PATCH /symptom

request: {
  id,
  updates (for example: min_time: {minutes: 30})
}

response: returns updated symptom

DELETE /:symptom_id

response: 204
