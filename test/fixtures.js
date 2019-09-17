const apiFixtures = {
  postUserReq: {
    username: 'testuser',
    password: 'pass',
    display_name: 'Test User'
  },

  getUserRes: {
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
  },

  postAuthLoginReq: {
    username: 'testuser',
    password: 'pass'
  },

  postEventSymptomReq: {
    type: 'symptom',
    symptom: 'bloating',
    severity: 4,
    time: 1568727973
  },
  
  postEventMealReq: {
    type: 'meal',
    items: [123123, 234, 2345356, 1345, 4356546],
    time: 1568731573
  },

  getFoodSearchRes: {
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
};

module.exports = apiFixtures;
