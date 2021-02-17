const express = require("express");
const app = express();
require("dotenv").config({path: './config/.env'});
require("./config/db");
const userRoutes = require("./routes/user.routes");



app.use(express.json());
app.use(express.urlencoded({extended: false }));

// Routes
app.use("/api/user", userRoutes);

// Server
app.listen(process.env.PORT, () => {
    console.log(`Serveur ecoute le port ${process.env.PORT}`);
})