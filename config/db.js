const mongoose = require("mongoose");
require("dotenv").config("./config/db")

mongoose
    .connect(
        'mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASSWORD + '@cluster0.wkfkd.mongodb.net/social-network', 
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        }
    )
    .then(() => console.log("Connectez à MongoDB"))
    .catch((err) => console.log("Connection à MongoDB échouer"))

