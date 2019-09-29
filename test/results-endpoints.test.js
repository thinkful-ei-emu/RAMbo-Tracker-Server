const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Results Endpoint', function() {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));
  describe('GET /results', () => {
    beforeEach('insert users', () => {
      const symptom = helpers.getSampleSymptomSentByClient();
      const meal = helpers.getSampleMealSentByClient2();
      const auth = helpers.makeAuthHeader(testUsers[0]);
      return helpers
        .seedUsers(db, testUsers)
        .then(() => {
          return helpers.postSymptomToServer(symptom, auth);
        })
        .then(() => {
          return helpers.postFoodsThenMealToServer(meal, auth);
        });
    });

    it('returns 200 in the right format', async () => {
      return supertest(app)
        .get('/api/results')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200)
        .then((res) => {
          res = res.body;
          expect(res[0]).to.include.all.keys(
            'mostCommonIngredients',
            'mostCommonFoods',
            'symptomType',
            'totalFoodsWeight',
            'totalIngredientsWeight'
          );
          expect(res[0].symptomType).to.be.an('object');
          expect(res[0].totalFoodsWeight).to.be.a('number');
          expect(res[0].totalIngredientsWeight).to.be.a('number');
          expect(res[0].mostCommonFoods).to.be.an('array');
          expect(res[0].mostCommonIngredients).to.be.an('array');
          expect(res[0].symptomType).to.include.all.keys('type');
          expect(res[0].symptomType.type).to.be.a('string');
          expect(res[0].mostCommonFoods[0]).to.be.an('object');
          expect(res[0].mostCommonFoods[0]).to.include.all.keys(
            'name',
            'weight'
          );
          expect(res[0].mostCommonFoods[0].name).to.be.a('string');
          expect(res[0].mostCommonFoods[0].weight).to.be.a('number');
          expect(res[0].mostCommonIngredients[0]).to.be.an('object');
          expect(res[0].mostCommonIngredients[0]).to.include.all.keys(
            'name',
            'weight'
          );
          expect(res[0].mostCommonIngredients[0].name).to.be.a('string');
          expect(res[0].mostCommonIngredients[0].weight).to.be.a('number');
        });
    });
  });
});
