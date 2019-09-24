const app = require('../src/app');
const helpers = require('./test-helpers');
describe.only('Food Endpoint', function() {
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
  describe('GET /food/search/:search',()=>{
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    it('responds with 200 and responds with a correct looking JSON string rep of an object',()=>{
      const searchTerm='butter';
      return supertest(app)
        .get(`/api/food/search/${searchTerm}`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0])).expect(200)
        .then(res=>{
          let trueRes=JSON.parse(res.body);
          expect(trueRes).to.be.an('object');
          expect(trueRes.list).to.be.an('object');
          expect(trueRes.list).to.include.all.keys('q','sort','total','start','item');
          expect(trueRes.list.q).to.equal(searchTerm);
          expect(trueRes.list.item).to.be.an('array');
          for(let i=0;i<trueRes.list.item.length;i++){
            expect(trueRes.list.item[i]).to.include.all.keys('name','manu','ndbno');
          }
        });
    });
    //Should make some other things happen if searchTerm is blank or if search results have no results, but it's kind of being handled on the front-end, and not by back-end. Would need to shift things to test it here.
  });

  describe('POST /food/',()=>{
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    it('returns 400 if the ndbno posted does not exist',()=>{

      return supertest(app)
        .post('/api/food')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newBuild)
        .expect(400);
    });
  });

});