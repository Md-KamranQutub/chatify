import { Outlet, useLocation } from "react-router-dom";
import useUserStore from "./store/useUserStore";
import { useEffect, useState } from "react";
import { checkAuthentication } from "./services/user.service";
import Loader from "../src/utils/Loader"
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ()=>{
    const location = useLocation();
    const {isAuthenticated , setCurrentUser , clearCurrentUser} = useUserStore();
    const [isChecking , setIsChecking] = useState(false);
    
    useEffect(() => {
     const verifyAuth = async()=>{
        try{
        setIsChecking(true);
        const result = await checkAuthentication();
        if(result?.isAuthenticated)
        {
            setCurrentUser(result.user);
            console.log("This is result in protected route",result);
        }
        else{
            clearCurrentUser();
        }
    }catch(error)
    {
        console.error(error);
        clearCurrentUser();
    }finally
    {
        setIsChecking(false)
    }
     }

     verifyAuth();
    }, [setCurrentUser, clearCurrentUser])

    if(isChecking)
    {
        return <Loader />
    }
    if(!isAuthenticated)
    {
        return <Navigate to='/user-login' state={{from:location}} replace/>
    }

    return <Outlet/>
    
}

export const PublicRoute = ()=>{
    const isAuthenticated = useUserStore(state=>state.isAuthenticated);
    if(isAuthenticated)
    {
        return <Navigate to='/' replace />
    }
    else{
        return <Outlet/>
    }
}