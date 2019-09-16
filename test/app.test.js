const app = require('../src/app');
describe('server response with 200 and Hello world',()=>{
  it('resonse with a 200 code',()=>{
    return request(app).get('/').expect(200);
  });
});