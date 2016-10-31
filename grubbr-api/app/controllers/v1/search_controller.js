const Nodal = require('nodal');
const _ = require('underscore');

const Ratings = Nodal.require('app/models/rating.js');

class V1SearchController extends Nodal.Controller {
  get() {
    Ratings.query()
      .join('dish__restaurant')
      .join('dish__menuType')
      .where(this.params.query)
      .end((err, models) => {
        let dishInfo = {};
        // consolidate all info from ratings and dishes into one object
        models.forEach((rating) => {
          // get the dish id this will be compiled under
          const dishID = rating.joined('dish').get('id');
          // check if there is already a property for that dish
          if (dishInfo[dishID] === undefined) {
            // create the one time data for it now.
            dishInfo[dishID] = {};
            dishInfo[dishID].dishID = dishID;
            dishInfo[dishID].dishName = rating.joined('dish').get('name');
            dishInfo[dishID].upvotes = 0;
            dishInfo[dishID].downvotes = 0;
            dishInfo[dishID].score = 0;
            dishInfo[dishID].images = [];
            dishInfo[dishID].restaurantName = rating.joined('dish').joined('restaurant').get('name');
            dishInfo[dishID].restaurantID = rating.joined('dish').joined('restaurant').get('id');
          }
          // do all the things that are normally done now.
          if (rating.get('rating') === 1) {
            dishInfo[dishID].upvotes += 1;
            dishInfo[dishID].score += 1;
          } else if (rating.get('rating') === -1) {
            dishInfo[dishID].downvotes -= 1;
            dishInfo[dishID].score -= 1;
          }
          if (rating.get('image')) { dishInfo[dishID].images.push(rating.get('image')); }
        });
        // Put that info into an array
        dishInfo = _.map(dishInfo, info => info);
        // sort by score
        dishInfo = dishInfo.sort((a, b) => b.score - a.score);
        // send that array back in response.
        this.respond(dishInfo);
      });
  }
}

module.exports = V1SearchController;