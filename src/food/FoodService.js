const FoodService = {
  searchFood(db, ndbno) {
    return db('food').where('ndbno', ndbno );
  },
  addFood(db, ndbno, name) {
    return db('food').insert({'ndbno': ndbno, 'name': name });
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

  parseIngredient(phrase){
    const initialStringRemoveArray=['and ','derived from ','from ','for ','made with ','preserved by ', 'made from ','including ', 'contains ', 'contains less than 2% of ', 'contains less than 1% of ', 'less than 1% of ', 'less than 2% of '];
  
    //tempted to add 'water' here
    const entireStringRemove=['and','preservative','preservatives','artificial color','emulsifier','as preservatives', 'protects color', 'color', 'colors'];
    
    //remove . and *
    phrase=phrase.replace(/[.*]/g,'');

    //handle :
    //you only want what comes after ':'
    phrase=phrase.split(':').pop();
  
    //handle " and "
    if(phrase.toLowerCase().includes(' and ')|| phrase.toLowerCase().includes(' & ')){
      //the joys of not knowing regex
      const pieces=phrase.split(' and ').join(',').split('&').map(str=>str.trim()).join(',').split(',').map(str=>str.trim());
      
      //Can add this feature once we handle more than 2 layer deep nested arrays in parseIngredients
      /* if(pieces.length>=3){
        return pieces.map(piece=> this.parseIngredient(piece));
      } */
      
      let staysBroken=true;
      for(let i=0;i<pieces.length;i++){
        //if any of the pieces are
        //(A) more than one word
        //(B) or is equivalent to 'mono'
        //We cancel the break.
        if(pieces[i].split(' ').length>1 || pieces[i].toLowerCase()==='mono'){
          staysBroken=false;
          break;
        }
      }
      if(staysBroken){
        return pieces.map(piece=>this.parseIngredient(piece));
      }
      else{
        return pieces.join(' and ');
      }
    }
  
    //killing entire strings
    for(let i=0;i<entireStringRemove.length;i++){
      if(phrase.toLowerCase()===entireStringRemove[i]){
        return '';
      }
    }
  
    //removing initial substrings to be removed
    let oldPhrase=phrase;
    while(phrase){
      for(let i=0;i<initialStringRemoveArray.length;i++){
        let match=initialStringRemoveArray[i];
        if(phrase.substr(0,match.length).toLowerCase()===match){
          phrase=phrase.substr(match.length).trim();
        }
      }
      if(oldPhrase===phrase){
        break;
      }
      oldPhrase=phrase;
    }
    return phrase;
  },

  /**
   * Takes the body of the USDA response for a specific food,
   * gets the ingredients, and does some parsing to transform that into strings
   * @param {the body of the response from usda to get to the ingredients have to dig deep} body 
   */
  parseIngredients(body) {
    if(!(Object.keys(body).includes('ingredients'))){
      return ['No ingredients found in the USDA database'];
    }
    
    const ingredientString = body.ingredients.replace(/ made with | and\/or /ig,',');
    const ingredientsArray = ingredientString.split(/[,\[\]\(\)\{\}]/).map(str=>str.trim()).filter(Boolean);
    const occTable= {};
    const finalArray=[];
    ingredientsArray.forEach(phrase=>{
      let parsed=this.parseIngredient(phrase);
      if(Array.isArray(parsed)){
        parsed.forEach(piece=>{
          if(!(occTable[piece]) && piece){
            finalArray.push(piece);
            occTable[piece]=true;
          }
        });
      }
      else if(typeof parsed === 'string'){
        if(!(occTable[parsed]) && parsed){
          finalArray.push(parsed);
          occTable[parsed]=true;
        }
      }
    });
    return finalArray;
  },
  insertIngredients(db, food, name){
    return db('ingredients')
      .insert({'food': food,'name': name});
  }
};

module.exports = FoodService;
