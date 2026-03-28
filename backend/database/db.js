require('dotenv').config()
const mongoose=require("mongoose")

let connectionPromise = null;

exports.connectToDB=async()=>{
    try {
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        if (!connectionPromise) {
            connectionPromise = mongoose.connect(process.env.MONGO_URI)
                .then((connection) => {
                    console.log('connected to DB');
                    return connection;
                })
                .catch((error) => {
                    connectionPromise = null;
                    throw error;
                });
        }

        await connectionPromise;
        return mongoose.connection;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
