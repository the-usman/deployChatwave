const mongoose = require('mongoose')
require('dotenv').config();
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const clusterUrl = '@cluster0.ikx5mmf.mongodb.net';
const databaseName = 'ShareHive'; 
const url = `mongodb+srv://${username}:${password}${clusterUrl}/${databaseName}?retryWrites=true&w=majority`;
const connectToMongo = async () => {
    try {
        await mongoose.connect(url);
        console.log("Successfully Connected to MongoDB");
    } catch (error) {
        console.log(error);
    }
};

module.exports = connectToMongo