import jwt from 'jsonwebtoken';
import response from '../utils/responseHandler.js'
// import multer from 'multer';

const authMiddleware = (req, res, next) => {
    // const token = req.cookies.auth_token;
    // if (!token) {
    //     return response(res, 401, "Unauthorized Access");
    // }

    const authHeader = req.headers['authorization'];

    if(!authHeader || !authHeader.startsWith('Bearer')){
        return response(res, 401, "Unauthorized Access");
    }
    const token = authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 

        req.user = decoded;
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
export default authMiddleware;
