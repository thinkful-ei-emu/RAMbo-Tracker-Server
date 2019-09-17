const apiFixtures = {
  user: {
    post: {
      req: {
        username: 'testuser',
        password: 'pass',
        display_name: 'Test User'
      }
    },
    get: {
      res: {
        username: 'testuser',
        display_name: 'Test User',
        events: [
          {
            type: 'meal',
            items: [
              {
                name: 'hamburger',
                ingredients: ['wheat', 'beef', 'salt', 'spices']
              },
              {
                name: 'fries',
                ingredients: ['palm oil', 'potato', 'salt']
              }
            ],
            time: 1568727973
          },
          {
            type: 'symptom',
            symptom: 'bloating',
            severity: 4,
            time: 1568731573
          }
        ],
        tracked_symptoms: ['bloating', 'headaches']
      }
    }
  },

  auth: {
    login: {
      req: {
        username: 'testuser',
        password: 'pass'
      },
      res: {
        token:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1Njg3MzE5MDcsImV4cCI6MTYwMDI2NzkwNywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiSm9obm55IiwicGFzcyI6IlJvY2tldCJ9.poT0cfI4yQbu28euEdTgLnvmqaH__-OzKphdvjX5vkA'
      }
    }
  },

  event: {
    post: {
      reqSymptom: {
        type: 'symptom',
        symptom: 'bloating',
        severity: 4,
        time: 1568727973
      },
      reqMeal: {
        type: meal,
        items: [123123, 234, 2345356, 1345, 4356546],
        time: 1568731573
      }
    },

    'food/search?term=butter': {
      get: {
        res: {
          total: 123,
          results: [
            {
              offset: 0,
              name: 'Super Excellent Butter',
              ndbno: 1231231,
              manu: 'Excellent Butter Company'
            },
            {
              offset: 1,
              name: 'Okay butter',
              ndbno: 123123,
              manu: 'Mediocre Butter Company'
            }
          ]
        }
      }
    }
  }
};

module.exports = apiFixtures;
