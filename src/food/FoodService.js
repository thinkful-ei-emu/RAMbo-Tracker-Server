const FoodService = {
  searchFood(db, ndbno) {
    return db("food").where('ndbno', ndbno );
  },
  addFood(db, ndbno, name) {
    return db("food").insert({'ndbno': ndbno, 'name': name });
  },

  /**
   * 
   * @param {the database} db 
   * @param {the food item that the ingredient is being associated with} ndbno 
   * @param {the body of the response from usda} body 
   */
  async addIngredients(db, ndbno, body) {
    const arrayOfIngredients = await this.parseIngredients(body);
    for(let i = 0; i < arrayOfIngredients.length; i++){
    await this.insertIngredients(db, ndbno, arrayOfIngredients[i])
    }
  },
  /**
   * Takes the body of the USDA response for a specific food,
   * gets the ingredients, and does some parsing to transform that into strings
   * @param {the body of the response from usda to get to the ingredients have to dig deep} body 
   */
  parseIngredients(body) {
    const ingredientString = body.foods[0].food.ing.desc;
    console.log(ingredientString)
    const ingredientsArray = ingredientString.split(",");
    for (let i = 0; i < ingredientsArray.length; i++) {
      //removing 'CONTAINS 2% or less of....'
      if (ingredientsArray[i].includes("CONTAINS")) {
        ingredientsArray.splice(i, 1);
      }
      ingredientsArray[i].trim();
      for (let j = 0; j < ingredientsArray[i].length; j++) {
        if (ingredientsArray[i][j] === "(") {
          ingredientsArray[i] = ingredientsArray[i].replace(/\(/g, "");
        }
        if (ingredientsArray[i][j] === ")") {
          ingredientsArray[i] = ingredientsArray[i].replace(/\)/g, "");
        }
        if (ingredientsArray[i][j] === ".") {
          ingredientsArray[i] = ingredientsArray[i].replace(/\./g, "");
        }
      }
    }
    return ingredientsArray;
  },
  insertIngredients(db, food, name){
    return db("ingredients")
    .insert({'food': food,'name': name})
  }
};

module.exports = FoodService;
/* 
const body = {
  foods: [
    {
      food: {
        sr: "July, 2018",
        type: "b",
        desc: {
          ndbno: "45166992",
          name: "ABC, PEANUT BUTTER, UPC: 837991219186",
          ds: "Label Insight",
          manu: "",
          ru: "g"
        },
        ing: {
          desc:
            "FRESHLY ROASTED PEANUTS, SUGAR, CONTAINS 2% OR LESS OF: MOLASSES, HYDROGENATED VEGETABLES OILS (RAPESSED, COTTONSEED AND SOYBEAN), DEXTROSE, CORN SYRUP AND SALT.",
          upd: "07/14/2017"
        },
        nutrients: [
          {
            nutrient_id: "208",
            name: "Energy",
            derivation: "LCCS",
            group: "Proximates",
            unit: "kcal",
            value: "562",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "180" }
            ]
          },
          {
            nutrient_id: "203",
            name: "Protein",
            derivation: "LCCS",
            group: "Proximates",
            unit: "g",
            value: "21.88",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "7.00" }
            ]
          },
          {
            nutrient_id: "204",
            name: "Total lipid (fat)",
            derivation: "LCCS",
            group: "Proximates",
            unit: "g",
            value: "46.88",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "15.00" }
            ]
          },
          {
            nutrient_id: "205",
            name: "Carbohydrate, by difference",
            derivation: "LCCS",
            group: "Proximates",
            unit: "g",
            value: "25.00",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "8.00" }
            ]
          },
          {
            nutrient_id: "291",
            name: "Fiber, total dietary",
            derivation: "LCCS",
            group: "Proximates",
            unit: "g",
            value: "6.2",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "2.0" }
            ]
          },
          {
            nutrient_id: "269",
            name: "Sugars, total",
            derivation: "LCCS",
            group: "Proximates",
            unit: "g",
            value: "9.38",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "3.00" }
            ]
          },
          {
            nutrient_id: "301",
            name: "Calcium, Ca",
            derivation: "LCCD",
            group: "Minerals",
            unit: "mg",
            value: "0",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "0" }
            ]
          },
          {
            nutrient_id: "303",
            name: "Iron, Fe",
            derivation: "LCCD",
            group: "Minerals",
            unit: "mg",
            value: "2.25",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "0.72" }
            ]
          },
          {
            nutrient_id: "307",
            name: "Sodium, Na",
            derivation: "LCCS",
            group: "Minerals",
            unit: "mg",
            value: "422",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "135" }
            ]
          },
          {
            nutrient_id: "401",
            name: "Vitamin C, total ascorbic acid",
            derivation: "LCCD",
            group: "Vitamins",
            unit: "mg",
            value: "0.0",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "0.0" }
            ]
          },
          {
            nutrient_id: "318",
            name: "Vitamin A, IU",
            derivation: "LCCD",
            group: "Vitamins",
            unit: "IU",
            value: "0",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "0" }
            ]
          },
          {
            nutrient_id: "606",
            name: "Fatty acids, total saturated",
            derivation: "LCCS",
            group: "Lipids",
            unit: "g",
            value: "7.810",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "2.499" }
            ]
          },
          {
            nutrient_id: "605",
            name: "Fatty acids, total trans",
            derivation: "LCCS",
            group: "Lipids",
            unit: "g",
            value: "0.000",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "0.000" }
            ]
          },
          {
            nutrient_id: "601",
            name: "Cholesterol",
            derivation: "LCCD",
            group: "Lipids",
            unit: "mg",
            value: "0",
            measures: [
              { label: "Tbsp", eqv: 32.0, eunit: "g", qty: 2.0, value: "0" }
            ]
          }
        ],
        footnotes: []
      }
    }
  ],
  count: 1,
  notfound: 0,
  api: 2.0
};

FoodService.parseIngredients(body); */
