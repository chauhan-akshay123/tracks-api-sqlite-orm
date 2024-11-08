const express = require("express");
let { track } = require("./models/track.model");  // Model for the track, which likely represents the database schema for movie data
let { user } = require("./models/user.model");
let { like } = require("./models/like.model");
let { sequelize } = require("./lib/index");  // Sequelize instance used to connect to the database
const app = express();

// Middleware setup
app.use(express.json());  // Correct usage of express.json()

// Movie data array to seed the database
let movieData = [
  {
    name: 'Raabta',
    genre: 'Romantic',
    release_year: 2012,
    artist: 'Arijit Singh',
    album: 'Agent Vinod',
    duration: 4,
  },
  {
    name: 'Naina Da Kya Kasoor',
    genre: 'Pop',
    release_year: 2018,
    artist: 'Amit Trivedi',
    album: 'Andhadhun',
    duration: 3,
  },
  {
    name: 'Ghoomar',
    genre: 'Traditional',
    release_year: 2018,
    artist: 'Shreya Ghoshal',
    album: 'Padmaavat',
    duration: 3,
  },
  {
    name: 'Bekhayali',
    genre: 'Rock',
    release_year: 2019,
    artist: 'Sachet Tandon',
    album: 'Kabir Singh',
    duration: 6,
  },
  {
    name: 'Hawa Banke',
    genre: 'Romantic',
    release_year: 2019,
    artist: 'Darshan Raval',
    album: 'Hawa Banke (Single)',
    duration: 3,
  },
  {
    name: 'Ghungroo',
    genre: 'Dance',
    release_year: 2019,
    artist: 'Arijit Singh',
    album: 'War',
    duration: 5,
  },
  {
    name: 'Makhna',
    genre: 'Hip-Hop',
    release_year: 2019,
    artist: 'Tanishk Bagchi',
    album: 'Drive',
    duration: 3,
  },
  {
    name: 'Tera Ban Jaunga',
    genre: 'Romantic',
    release_year: 2019,
    artist: 'Tulsi Kumar',
    album: 'Kabir Singh',
    duration: 3,
  },
  {
    name: 'First Class',
    genre: 'Dance',
    release_year: 2019,
    artist: 'Arijit Singh',
    album: 'Kalank',
    duration: 4,
  },
  {
    name: 'Kalank Title Track',
    genre: 'Romantic',
    release_year: 2019,
    artist: 'Arijit Singh',
    album: 'Kalank',
    duration: 5,
  },
]

// Defining a route to seed the database
app.get("/seed_db", async (req, res) => {
  try {
    // Syncs the database, recreating all tables as per models
    await sequelize.sync({ force: true });  // `force: true` drops existing tables and recreates them
    
    // Bulk inserts all data from the movieData array into the track table
    await track.bulkCreate(movieData);
    
    res.status(200).json({ message: "Database seeding successful." });
  } catch (error) {
    res.status(500).json({ message: "Error seeding the data", error: error.message });
  }
});

// function to fetch all tracks
async function fetchAllTracks(){
  let tracks = await track.findAll();
  return { tracks };
}

// Endpoint to fetch all tracks
app.get("/tracks", async (req, res) => {
 try{
   let response = await fetchAllTracks();

   if(response.tracks.length === 0){
     return res.status(404).json({ message: "No tracks found." });
   }

   return res.status(200).json(response);
 } catch(error){
   res.status(500).json({ message: "Error fetching tracks", error: error.message });
 }
});

// function to fetch track by Id
async function fetchTrackById(id){
  let trackData = await track.findOne({ where: { id } });

  return { track: trackData };
}

// Endpoint to fetch a track by Id
app.get("/tracks/details/:id", async (req, res) => {
 try{
  let id = parseInt(req.params.id);  
  let result = await fetchTrackById(id);

  if(result.track === null){
    return res.status(404).json({ error: "Track not found." });
  }

  return res.status(200).json(result);
 } catch(error){
   res.status(500).json({ message: "Error fetching a track by Id", error: error.message });
 }
});

// function to fetch a track by artist
async function fetchTrackByArtist(artist){
  let tracks = await track.findAll({ where: {artist} });
  return { tracks: tracks };
}

// Endpoint to fetch a track by Artit
app.get("/tracks/artist/:artist", async (req, res) => {
 try{
    let artist = req.params.artist;
    let result = await fetchTrackByArtist(artist);
    
    if(result.tracks.length === 0){
      return res.status(404).json({ message: "Track not found." });
    }
    
    return res.status(200).json(result);
 } catch(error){
   res.status(500).json({ message: "Error fetching track by an artist", error: error.message });
 }
});

// function to Sort all the tracks by their release year
async function sortTrackByReleaseYear(order){
  let sortedTracks = await track.findAll({ order: [["release_year", order]]});

  return { tracks: sortedTracks };
}

// Endpoint to fetch sorted tracks by their release year by specifying the order
app.get("/tracks/sort/release_year", async (req, res) => {
  try{
    let order = req.query.order 
    let result = await sortTrackByReleaseYear(order);  
    
    if(result.tracks.length === 0){
      return res.status(404).json({ error: "No tracks found" });
    }

    return res.status(200).json(result);
  } catch(error){
    res.status(500).json({ message: "Error sorting the tracks", error: error.message });
  }
});

// function to add new track
async function addNewTrack(trackData){
  let newTrack = await track.create(trackData);

  return { newTrack };
}

// Endpoint to add a new track in the database
app.post("/tracks/new", async (req, res) => {
 try{
   let newTrack = req.body.newTrack;
   let response = await addNewTrack(newTrack);
   return res.status(200).json(response);
 } catch(error){
   res.status(500).json({ message: "Error adding new track.", error: error.message });
 }
});

// function to update track information
async function updateTrackById(updateTrackData, id){
 let trackDetails = await track.findOne({ where: { id } });
 if(!trackDetails){
    return {};
 }

 trackDetails.set(updateTrackData);
 let updatedTrack = await trackDetails.save();

 return {message: "Track updated successfully.", updatedTrack};
}

// Endpoint to update track information
app.post("/tracks/update/:id", async (req, res) => {
 try{
    let newTrackData = req.body;
    let id = parseInt(req.params.id);
    let response = await updateTrackById(newTrackData, id);

    if(!response.message){
        return res.status(404).json({ message: "Track not found." });
    }
    
    return res.status(200).json(response);
 } catch(error){
    res.status(500).json({message: "Error updating the Id", error: error.message});
 }
});

// function to delete track by Id
async function deleteTrackById(id){
    let destroyedTrack = await track.destroy({ where: { id } });

    if(destroyedTrack === 0){
        return {};
    }
    
    return { message: "Track record has been deleted successfully." };
}

// Endpoint to delete a track from database
app.post("/tracks/delete", async (req, res) => {
  try{
    let id = parseInt(req.body.id);
    let response = await deleteTrackById(id);
    
    if(!response.message){
        return res.status(404).json({ message: "Track not found." });
    }

    return res.status(200).json(response);
  } catch(error){
    res.status(500).json({ message: "Error deleting the track by Id", error: error.message });
  }
});

// function to add a new user
async function addNewUser(newUser){
  let newData = await user.create(newUser);

  return { newData };
}

// Endpoint to create a new User
app.post("/users/new", async (req, res) => {
 try{
   let newUser = req.body.newUser;
   let response = await addNewUser(newUser);

   return res.status(200).json(response);
 } catch(error){
   res.status(500).json({ message: "Error creating a new user", error: error.message });
 }
});

// function to update user by Id
async function updateUserById(id, newUserData){
  let userDetails = await user.findOne({ where: { id } });

  if(!userDetails){
    return {};
  }

  userDetails.set(newUserData);
  let updatedUser = await userDetails.save();

  return { message: "User updated successfully.", updatedUser };
}

// Endpoint to update a user
app.post("/users/update/:id", async (req, res) => {
  try{
    let newUserData = req.body;
    let id = parseInt(req.params.id);
    let response = await updateUserById(id, newUserData);
    
    return res.status(200).json(response);
  } catch(error){
    res.status(500).json({ message: "Error updating the user", error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on Port : 3000");
});