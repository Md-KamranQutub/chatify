import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/dbConnect.js';
import authRoute from './routes/authRoute.js';
import bodyParser from 'body-parser';
import chatRoute from './routes/chatRoute.js';
import http from 'http';
import initializeSocket from './services/socketService.js';
import updateRoute from './routes/updateRoute.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT ;

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
};
app.use(cors(corsOptions));

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

//MongoDb connection
connectDB();

//create server
const server = http.createServer(app);

const io = initializeSocket(server);

//apply socket middleware
app.use((req, res, next) => {
    req.io = io;
    req.socketUserMap = io.socketUserMap
    next();
})


//routes
app.use('/api/auth', authRoute);
app.use('/api/chats', chatRoute);
app.use('/api/update',updateRoute);


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
