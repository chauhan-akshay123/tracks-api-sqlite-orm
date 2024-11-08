// Import DataTypes and sequelize instance from the ../lib/ directory
let { DataTypes, sequelize } = require("../lib/");

// Import the user and track models, which will be referenced in the like model
let { user } = require("./user.model");
let { track } = require("./track.model");
// Define the like model to represent a "like" action by a user on a track
let like = sequelize.define("like", {
  
  // Define the userId field, which references the user model's id
  userId: {
    type: DataTypes.INTEGER, // The userId is an integer data type
    references: {
      model: user, // Referencing the user model
      key: "id" // Foreign key is the id field in the user model
    }
  },

  // Define the trackId field, which references the track model's id
  trackId: {
    type: DataTypes.INTEGER, // The trackId is an integer data type
    references: {
      model: track, // Referencing the track model
      key: "id" // Foreign key is the id field in the track model
    },
  },
});

// Set up a many-to-many relationship between users and tracks through the like model
user.belongsToMany(track, { through: like }); // Each user can like many tracks
track.belongsToMany(user, { through: like }); // Each track can be liked by many users

// Export the like model so it can be used in other parts of the application
module.exports = { like };
