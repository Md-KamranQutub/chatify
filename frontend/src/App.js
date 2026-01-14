
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './pages/user-login/Login';
import { ProtectedRoute , PublicRoute } from './protected';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Homepage from './components/Homepage';
import useUserStore from './store/useUserStore';
import { useEffect } from 'react';
import { disconnectSocket, initializeSocket } from './services/chat.service';
import useChatStore from './store/useChatStore';
import Setting from './pages/SettingSection/Setting'
import Status from './pages/StatusSection/Status';
import UserDetails from './components/UserDetails';

function App() {
  const {currentUser} = useUserStore();
  const {setCurrentUser , initSocketListeners , cleanup} = useChatStore();

  useEffect(()=>{
    let socket;
    if(currentUser?._id)
    {
      socket = initializeSocket();
    }
    
    if(socket){
      setCurrentUser(currentUser);
      initSocketListeners();
    }

    return ()=>{
      cleanup();
      disconnectSocket();
    }
  }, [currentUser , setCurrentUser , initSocketListeners , cleanup]);
  return (
    <>
    <ToastContainer position='top-right' autoClose={3000} />
   <Router>
    <Routes>
      <Route element={<ProtectedRoute/>}>
      <Route path='/' element={<Homepage />}/>
      <Route path="/settings" element={<Setting/>} />
      <Route path="/update" element={<Status/>}/>
      <Route path="/user-profile" element={<UserDetails/>}/>
      </Route>
      <Route element={<PublicRoute/>}>
      <Route path="/user-login" element={<Login />} />
      </Route>
    </Routes>
   </Router>
   </>
  );
}

export default App;
