const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Symptom Endpoint', function() {
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
  describe('GET /symptom',()=>{
    beforeEach('insert users', () => {
      const symptom = helpers.getSampleSymptomSentByClient();
      const auth = helpers.makeAuthHeader(testUsers[0]);
      return helpers
        .seedUsers(db, testUsers)
        .then(() => {
          return helpers.postSymptomEventToServer(symptom, auth);
        })
    });

    it('responds with 200 and responds with a correct looking JSON string rep the symptoms',()=>{
      return supertest(app)
        .get(`/api/symptom`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0])).expect(200)
        .then(res=>{
          let trueRes = res.body;
          expect(trueRes).to.be.an('array');
          expect(trueRes[0]).to.be.an('object');
          expect(trueRes[0]).to.include.all.keys(['type', 'type_id', 'min_time', 'max_time'])
          expect(trueRes[0]['type']).to.eql('sore eyes');
          expect(trueRes[0]['type_id']).to.eql(1);
          expect(trueRes[0]['min_time']).to.be.deep.eql({minutes: 30});
          expect(trueRes[0]['max_time']).to.deep.eql({hours: 72});
          });
          
    });
  });

  describe('PATCH /symptom',()=>{
    beforeEach('insert users', () => {
      const symptom = helpers.getSampleSymptomSentByClient();
      const auth = helpers.makeAuthHeader(testUsers[0]);
      return helpers
        .seedUsers(db, testUsers)
        .then(() => {
          return helpers.postSymptomEventToServer(symptom, auth);
        })
    });
    it('returns 400 if wrong id',()=>{
      const newSymptom={
        id: 11111,
        min_time: '5 hours'
      };
      return supertest(app)
        .patch('/api/symptom')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newSymptom)
        .expect(400);
    });
    it('returns 200 and new symptom when given proper data', () => {
      const newSymptom = {
        id: 1,
        min_time: '5 hours'
      }
      return supertest(app)
        .patch('/api/symptom')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newSymptom)
        .expect(200)
        .then(response => {
          let res = response.body;
          expect(res).to.be.an('object')
          expect(res).to.include.all.keys(['type', 'id', 'min_time', 'max_time'])
        })
        
    })


  });
  describe('DELETE /symptom/:symptomid', () => {
    beforeEach('insert users', () => {
      const symptom = helpers.getSampleSymptomSentByClient();
      const auth = helpers.makeAuthHeader(testUsers[0]);
      return helpers
        .seedUsers(db, testUsers)
        .then(() => {
          return helpers.postSymptomEventToServer(symptom, auth);
        })
    });

    it('deletes', () => {
      return supertest(app)
      .delete('/api/symptom/1')
      .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
      .expect(204)
      .then(() => {
        db.select('*').from('user_symptom').where({id: 1})
        .then((res) => {
          expect(res).to.eql([]);
        })
      })
    })
  })
 });