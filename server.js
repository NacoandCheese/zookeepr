//Getting data from json
const { animals } = require('./data/animals.json');

//Adding package to file
const express = require('express');

const PORT = process.env.PORT || 3001;
//Instantiate the server
const app = express();


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
// Function that takes in the ID and array of animals and returns a single animal object
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
};
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

//Chaining method to make sure server listens.
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});