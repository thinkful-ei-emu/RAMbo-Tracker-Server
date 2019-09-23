# Symptom Tracker Server

## Testing a change


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
   2. E.g. on Windows, _maybe_: `C:\Program Files\PostgreSQL\11.2\data\postgresql.conf`
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

POST /auth/token
  request:
    `{
      username,
      password
    }`

  response:
    `{
      jwt_token
    }`

GET /user 
  request:
    `{
      jwt_token
    }`

  response:
    `{
      username,
      display_name,
      events: 
        [
          {
            type: meal, 
            items: [
              {
                name: 'hamburger',
                ingredients: ['wheat', 'beef', 'salt', 'spices']
              },
              {
                name: 'fries'.
                ingredients: ['palm oil', 'potato', 'salt']
              }
            ]
            time: 2134234
          }, 
          {
            type: symptom, 
            symptom: ‘bloating’, 
            severity: 4, 
            time: 13o2847912378
          }
        ]
        symptoms: [‘bloating’, ‘headaches’]
    }`

### Events: Either Symptom or Meal

#### Posting a symptom 

POST /event
  request:
    `{
      type: 'symptom'
      symptom: ‘bloating’,
      severity: 999999999999,
      time: 134134234
    }`
  response: 201 created

#### Posting a meal

POST /event
  request(numbers are ids of foods selected in the USDA database):
   ` {
      type: meal,
      items: [123123, 234, 2345356, 1345, 4356546],
      time: 123123123
    }`
  response: 201 created

<<<<<<< HEAD
<<<<<<< HEAD
POST /food
=======
#### Searching for a food to add to a meal

##### This endpoint utilizes the USDA Food Composition Databases
>>>>>>> 5b99255c2a258b54954ef8fb4a41e203336d8182
=======
#### Searching for a food to add to a meal

##### This endpoint utilizes the USDA Food Composition Databases
>>>>>>> master

GET /food/search?term=butter
  response: 
  `{
    total: 123,
    results:
    [
      {
        offset: 0,
        name: 'Super Excellent Butter',
        ndbno: 1231231,
        manu: 'Excellent Butter Company,
      },
      {
        name: 'Okay butter',
        ndbno: 123123,
        manu: 'Mediocre Butter Company'
      }
    ]
  }`

#### Posting a food to a meal

POST /food
request(meal_id, food ndbno)

This will both post the ndbno to the meal as well as request ingredients from the USDA DB

get /results

returns all the users tracked symptoms a,d for each push to a results array with most common foods and ingredients

response

[{symptomType: 'bloating', mostCommonFoods: [bread, oreo cookies, pizza, muffin, steak], mostCommonIngredients: [butter, broccoli, msg, flour, cornstarch}, {symptomType: 'headache', mostCommonFoods: [cereal, yogurt, tilapia fish, beef wellington, crackers], mostCommonIngredients: [milk, whey, gluten, butter, rice]}]