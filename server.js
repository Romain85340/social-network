const express = require("express");
const cookieParser = require("cookie-parser")
require("dotenv").config({path: './config/.env'});
require("./config/db");
const cors = require("cors");


const app = express();

const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false

}

app.use(cors(corsOptions))
app.use(express.json());
app.use(express.urlencoded({extended: false }));
app.use(cookieParser());


//Middleware
const { checkUser, requireAuth } = require("./middleware/auth.middleware")

// jwt
app.get("*", checkUser);
app.get("/jwtid", requireAuth, (req, res) => {
    res.status(200).json(res.locals.user._id)
})

// Routes
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);

// Server
app.listen(process.env.PORT, () => {
    console.log(`Serveur ecoute le port ${process.env.PORT}`);
})