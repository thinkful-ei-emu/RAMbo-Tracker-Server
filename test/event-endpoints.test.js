const app = require('../src/app');
const helpers = require('./test-helpers');
describe.only('Event Endpoint', function() {
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
  describe('POST /event type=meal',()=>{
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    const requiredFields=['type','name','items'];
    requiredFields.forEach(field=>{
      it(`returns 400 when request body doesn't have .${field} key`,()=>{
        const meal=helpers.getSampleMealSentByClient();
        delete meal[field];
        return helpers.postMealToServer(meal,helpers.makeAuthHeader(testUsers[0]))
          .expect(400,
            {
              error: `Missing '${field}' in request body`
            });
      });
    });


    it('returns 201 when no required request body key is missing, and check the returned meal looks right',async ()=>{
      const meal=helpers.getSampleMealSentByClient();
      const auth=helpers.makeAuthHeader(testUsers[0]);
      /* for(let i=0;i<meal.items.length;i++){
        await helpers.postFoodToServer(meal.items[i],auth)
      }
      return helpers.postMealToServer(meal,auth)
        .expect(201); */
      return helpers.postFoodsThenMealToServerExpect201(meal,auth)
        .then(res=>{
          const body=res.body;
          const {itemNames,ingredientsOf363898}=meal;
          delete meal['ingredientsOf363898'];
          delete meal['itemNames'];
          delete meal['items'];
          expect(body).to.deep.include(meal)
          body.items.forEach(food=>{
            expect(itemNames[food.ndbno]).to.equal(food.name)
            //I'm only checking ingredients of one of these foods
            if(food.ndbno==='363898'){
              food.ingredients.forEach(ing=>{
                expect(ingredientsOf363898).to.include(ing)
              })
            }
          })
        })
    });
  });
  describe('POST /event type=\"symptom\"',()=>{
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    const requiredFields=['type','symptom','severity'];
    requiredFields.forEach(field=>{
      it(`returns 400 when request body doesn't have .${field} key`,()=>{
        const symptom=helpers.getSampleSymptomSentByClient();
        delete symptom[field];
        return helpers.postSymptomToServer(symptom,helpers.makeAuthHeader(testUsers[0]))
          .expect(400,
            {
              error: `Missing '${field}' in request body`
            });
      });
    });

    it('returns 201 when no required request body key is missing, and check the returned meal looks right',()=>{
      const symptom=helpers.getSampleSymptomSentByClient();
      return helpers.postSymptomToServer(symptom,helpers.makeAuthHeader(testUsers[0]))
        .expect(201)
        .then(res=>{
          const body=res.body;
          symptom.severityNumber=5;
          symptom.severity='Extreme';
          symptom.name=symptom.symptom;
          expect(body).to.deep.include(symptom);
        })
    });
  });

  describe('GET /event',()=>{
    beforeEach('insert users', () => {
      const symptom=helpers.getSampleSymptomSentByClient();
      const meal=helpers.getSampleMealSentByClient2();
      const auth=helpers.makeAuthHeader(testUsers[0])
      return helpers.seedUsers(db, testUsers)
        .then(()=>{
          return helpers.postSymptomToServer(symptom,auth)
        })
        .then(()=>{
          return helpers.postFoodsThenMealToServer(meal,auth);
        })
    
    });
    it('returns 200 in the right format',()=>{
      return supertest(app)
        .get('/api/event')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200)
        .then(res=>{
          res=res.body;
          expect(res).to.include.all.keys('username','display_name','events')
          expect(testUsers[0]).to.deep.include({
            username:res.username,
            display_name:res.display_name
          })
          expect(res.events[0]).to.deep.include(helpers.getSampleSymptomReturnedByServer())
          expect(res.events[1]).to.deep.include(helpers.getSampleMealReturnedByServer2())
        })
    })
  })



});