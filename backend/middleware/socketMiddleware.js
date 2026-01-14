import jwt from 'jsonwebtoken';
import response from '../utils/responseHandler.js'
// import multer from 'multer';

const socketMiddleware = (socket , next) => {

    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];

     if(!token){
            return next(new Error("Authorization token missing"))
        }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return response(res, 401, "Unauthorized Access");
        }
        socket.user = decoded;
        next();
    });
} catch (error) {
    console.error("Error in authMiddleware:", error);
    return response(res, 500, "Internal Server Error");
}
};
//  export function multerMiddleware()
// {
//     return multer({ dest: 'uploads/' }).single();
// }
export default socketMiddleware;
