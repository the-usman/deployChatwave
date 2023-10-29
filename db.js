const mongoose = require('mongoose')

const ConnectToDataBase = async () => {
    try {
        mongoose.connect(process.env.DB)
        console.log("Successfully Connected To MongoDB")
    } catch (error) {
        console.error(error)
    }
}

module.exports = ConnectToDataBase;