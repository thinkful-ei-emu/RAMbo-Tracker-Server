const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Event Endpoint', function() {
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
  describe('POST /event type=meal', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    const requiredFields = ['type', 'name', 'items'];
    requiredFields.forEach((field) => {
      it(`returns 400 when request body doesn't have .${field} key`, () => {
        const meal = helpers.getSampleMealSentByClient();
        delete meal[field];
        return helpers
          .postMealToServer(meal, helpers.makeAuthHeader(testUsers[0]))
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });

    it('returns 201 when no required request body key is missing, and check the returned meal looks right', async () => {
      const meal = helpers.getSampleMealSentByClient();
      const auth = helpers.makeAuthHeader(testUsers[0]);
      /* for(let i=0;i<meal.items.length;i++){
        await helpers.postFoodToServer(meal.items[i],auth)
      }
      return helpers.postMealToServer(meal,auth)
        .expect(201); */
      return helpers
        .postFoodsThenMealToServerExpect201(meal, auth)
        .then((res) => {
          const body = res.body;
          const { itemNames, ingredientsOf363898 } = meal;
          delete meal['ingredientsOf363898'];
          delete meal['itemNames'];
          delete meal['items'];
          expect(body).to.deep.include(meal);
          body.items.forEach((food) => {
            expect(itemNames[food.ndbno]).to.equal(food.name);
            //I'm only checking ingredients of one of these foods
            if (food.ndbno === '363898') {
              food.ingredients.forEach((ing) => {
                expect(ingredientsOf363898).to.include(ing);
              });
            }
          });
        });
    });
  });
  describe('POST /event type="symptom"', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    const requiredFields = ['type', 'symptom', 'severity'];
    requiredFields.forEach((field) => {
      it(`returns 400 when request body doesn't have .${field} key`, () => {
        const symptom = helpers.getSampleSymptomSentByClient();
        delete symptom[field];
        return helpers
          .postSymptomEventToServer(
            symptom,
            helpers.makeAuthHeader(testUsers[0])
          )
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });

    it('returns 201 when no required request body key is missing, and check the returned symptom looks right', () => {
      const symptom = helpers.getSampleSymptomSentByClient();
      return helpers
        .postSymptomEventToServer(symptom, helpers.makeAuthHeader(testUsers[0]))
        .expect(201)
        .then((res) => {
          const body = res.body;
          symptom.severityNumber = 5;
          symptom.severity = 'Extreme';
          symptom.name = symptom.symptom;
          expect(body).to.deep.include(symptom);
        });
    });
  });

  describe('GET /event', () => {
    beforeEach('insert users', () => {
      const symptom = helpers.getSampleSymptomSentByClient();
      const meal = helpers.getSampleMealSentByClient2();
      const auth = helpers.makeAuthHeader(testUsers[0]);
      return helpers
        .seedUsers(db, testUsers)
        .then(() => {
          return helpers.postSymptomEventToServer(symptom, auth);
        })
        .then(() => {
          return helpers.postFoodsThenMealToServer(meal, auth);
        });
    });
    it('returns 200 in the right format', () => {
      return supertest(app)
        .get('/api/event')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200)
        .then((res) => {
          res = res.body;
          expect(res).to.include.all.keys('username', 'display_name', 'events');
          expect(testUsers[0]).to.deep.include({
            username: res.username,
            display_name: res.display_name
          });
          expect(res.events[0]).to.deep.include(
            helpers.getSampleSymptomReturnedByServer()
          );
          expect(res.events[1]).to.deep.include(
            helpers.getSampleMealReturnedByServer2()
          );
        });
    });
  });

  describe('DELETE /event type="meal"', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    const requiredFields = ['type', 'id'];
    requiredFields.forEach((field) => {
      it(`returns 400 when request body doesn't have .${field} key`, () => {
        const meal2Delete = {
          type: 'meal',
          id: 1
        };
        delete meal2Delete[field];
        return supertest(app)
          .delete('/api/event')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(meal2Delete)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });
    it(`returns 404 when the meal doesn't exist`, () => {
      const meal2Delete = {
        type: 'meal',
        id: 1
      };
      return supertest(app)
        .delete('/api/event')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(meal2Delete)
        .expect(404, {
          error: 'Meal not found'
        });
    });
    it(`returns 403 when meal doesn't belong to the user making the request`, () => {
      const meal = helpers.getSampleMealSentByClient2();
      const auth = helpers.makeAuthHeader(testUsers[0]);
      const authOfDifferentUser = helpers.makeAuthHeader(testUsers[1]);
      return helpers
        .postFoodsThenMealToServerExpect201(meal, auth)
        .then((res) => {
          const meal2Delete = {
            type: 'meal',
            id: res.body.id
          };
          return supertest(app)
            .delete('/api/event')
            .set('Authorization', authOfDifferentUser)
            .send(meal2Delete)
            .expect(403, {
              error: 'Meal does not belong to user'
            });
        });
    });
    it(`returns 204 and deletes`, async () => {
      const meal = helpers.getSampleMealSentByClient2();
      const auth = helpers.makeAuthHeader(testUsers[0]);
      let mealPostRes = await helpers.postFoodsThenMealToServerExpect201(
        meal,
        auth
      );
      mealPostRes = mealPostRes.body;
      return supertest(app)
        .delete('/api/event')
        .set('Authorization', auth)
        .send({ type: 'meal', id: mealPostRes.id })
        .expect(204)
        .then(() => {
          return db
            .from('meals')
            .where('id', mealPostRes.id)
            .first()
            .then((res) => {
              expect(res).to.be.undefined;
            });
        });
    });
  });
  describe('DELETE /event type="symptom"', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    const requiredFields = ['type', 'id'];
    requiredFields.forEach((field) => {
      it(`returns 400 when request body doesn't have .${field} key`, () => {
        const symptom2Delete = {
          type: 'symptom',
          id: 1
        };
        delete symptom2Delete[field];
        return supertest(app)
          .delete('/api/event')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(symptom2Delete)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });
    it(`returns 404 when the symptom doesn't exist`, () => {
      const symptom2Delete = {
        type: 'symptom',
        id: 1
      };
      return supertest(app)
        .delete('/api/event')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(symptom2Delete)
        .expect(404, {
          error: 'Symptom not found'
        });
    });
    it(`returns 403 when symptom doesn't belong to the user making the request`, () => {
      const symptom = helpers.getSampleSymptomSentByClient();
      const auth = helpers.makeAuthHeader(testUsers[0]);
      const authOfDifferentUser = helpers.makeAuthHeader(testUsers[1]);
      return helpers.postSymptomEventToServer(symptom, auth).then((res) => {
        const symptom2Delete = {
          type: 'symptom',
          id: res.body.id
        };
        return supertest(app)
          .delete('/api/event')
          .set('Authorization', authOfDifferentUser)
          .send(symptom2Delete)
          .expect(403, {
            error: 'Symptom does not belong to user'
          });
      });
    });
    it(`returns 204 and deletes`, async () => {
      const symptom = helpers.getSampleSymptomSentByClient();
      const auth = helpers.makeAuthHeader(testUsers[0]);
      let symptomPostRes = await helpers.postSymptomEventToServer(
        symptom,
        auth
      );
      symptomPostRes = symptomPostRes.body;
      return supertest(app)
        .delete('/api/event')
        .set('Authorization', auth)
        .send({ type: 'symptom', id: symptomPostRes.id })
        .expect(204)
        .then(() => {
          return db
            .from('symptoms')
            .where('id', symptomPostRes.id)
            .first()
            .then((res) => {
              expect(res).to.be.undefined;
            });
        });
    });
  });
});
