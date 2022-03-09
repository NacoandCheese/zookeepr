//Getting data from json
const { animals } = require('./data/animals.json');

//Adding package to file
const express = require('express');

const PORT = process.env.PORT || 3001;
//Instantiate the server
const app = express();

const fs = require('fs');
const path = require('path');

//parse incoming string or array data
app.use(express.urlencoded({ extended: true}));
//parse incoming JSON data. app.use() is a method executed by our Express.js server that mounts a function to the server that our requests will pass through before getting to the endpoint.
//The functions we can mount to our server are referred to as middleware.
app.use(express.json());


//Function that will filter specifics
function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        //Save personalityTraits as a dedicated array.
        //If personalityTraits is a string, place it into a new array and save.
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        // Loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            //Check the trait against each animal in the filteredRestults array.
            //Remember, it is initially a copy of the animal array,
            //but here we're updating it for each trait in the .forEach() loop.
            //For each trait being targeted by the filter, the filteredResults
            //array will then contain only the entries that contain the trait,
            //so at the end we'll have an array of animals that have every one
            //of the traits when the .forEach() loop is finished.
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );

    //return finished code to post route for response
    return animal;
}
// Function that takes in the ID and array of animals and returns a single animal object
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
};

//validate function
function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}
//Route that the front-end can get the data from. Use res.json to send json. Use res.send to send small messages.
app.get('/api/animals', (req, res) => {
    //accessing the query property on the req object
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});
//New GET route for animals. If no record exists for the animal being searched for the client recieves a 404 error.
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
});
//Post request that accepts data to be used for stored server-side.
app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    //if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted');
    } else {
        // add animal to json file and animals array in this function
     const animal = createNewAnimal(req.body, animals);
     res.json(animal);
    }
    
});


//Route that serves index.html. The '/' brings us to the root route of the server
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepr-public/index.html'));
});
//Chaining method to make sure server listens.
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});