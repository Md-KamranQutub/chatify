import axiosInstance from "./url.service";

export const sendOtp = async (phoneSuffix, phoneNumber , email) => {
    try{
       const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/auth/send-otp`, {phoneSuffix, phoneNumber, email});
       return response.data;
    }catch(error)
    {
        return error.response ? error.response.data : error.message;
    }
}
export const verifyOtp = async (phoneSuffix, phoneNumber , otp , email) => {  
    try{
       const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/auth/verify-otp`, {phoneSuffix, phoneNumber, otp , email});
       console.log(response.data);
       return response.data;
    }catch(error)
    {
        return error.response ? error.response.data : error.message;
    }
}

export const updateProfile = async (updatedData) => {  
    try{
       const response = await axiosInstance.put(`${process.env.REACT_APP_API_URL}/auth/update-profile`, updatedData);
       return response.data;
    }catch(error)
    {
        return error.response ? error.response.data : error.message;
    }
}

export const checkAuthentication = async () => {
    try{
       const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/auth/check-auth`);
       if(response.data.status === 'success')
        return {isAuthenticated: true, user: response?.data?.data};
        else if( response.data.status === 'error')
          return {isAuthenticated: false};
    }catch(error)
    {
        return error.response ? error.response.data : error.message;
    }
}
export const logout = async () => {
    try{
       const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/auth/logout`);
       return response.data;
    }catch(error)
    {
        return error.response ? error.response.data : error.message;
    }
}
export const getAllUsers = async () => {
    try{
       const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/auth/users`);
       return response.data;
    }catch(error)
    {
        return error.response ? error.response.data : error.message;
    }
}
