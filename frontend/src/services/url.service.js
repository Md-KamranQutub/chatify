import axios from 'axios';

const API_URL = `${process.env.REACT_APP_URL}/api`;
const getToken = () => localStorage.getItem("auth_token");

const axiosInstance = axios.create({
    baseURL: API_URL,
    // withCredentials: true,
});

axiosInstance.interceptors.request.use((config)=>{
    const token = getToken();
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
})

export default axiosInstance;
