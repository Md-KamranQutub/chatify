import io from 'socket.io-client';
import useUserStore from '../store/useUserStore';

let socket = null ;

const token = localStorage.getItem("auth_token")

const user = useUserStore.getState().currentUser;

export const initializeSocket = ()=>{
    if(socket)
    return socket;

   const BACKEND_URL = process.env.REACT_APP_URL;
   socket = io(BACKEND_URL , {
    // withCredentials: true , 
    auth: {token},
    transports: ["websocket" , "polling"],
    reconnectionAttempts: 5, 
    reconnectionDelay: 1000,
   })

   //connection events
   socket.on("connect" , ()=>{
    console.log("socket connected with id :" , socket.id);
    socket.emit("user_connected" , user?._id);
   })

   socket.on("connect_error" , (error)=>{
    console.error("Error in socket connection :" , error);
   })

   socket.on("disconnect" , (reason)=>{
    console.log("Socket disconnected due to :" , reason);
   })
}

export const getSocket = ()=>{
    if( !socket )
    return initializeSocket();
    return socket;
}

export const disconnectSocket = ()=>{
    if(socket)
    {
        socket.disconnect();
        socket = null;
    }
}