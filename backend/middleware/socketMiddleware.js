import jwt from 'jsonwebtoken';
import response from '../utils/responseHandler.js'
// import multer from 'multer';

const socketMiddleware = (socket , next) => {

    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];

     if(!token){
            return next(new Error("Authorization token missing"))
        }

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        socket.user = decode;
        next();
    }catch (error) {
    console.error("Error in authMiddleware:", error);
    return response(res, 500, "Internal Server Error");
}
};
//  export function multerMiddleware()
// {
//     return multer({ dest: 'uploads/' }).single();
// }
export default socketMiddleware;
