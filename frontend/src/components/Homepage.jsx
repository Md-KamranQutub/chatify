import React, { useDebugValue, useEffect, useState } from 'react'
import {motion} from 'framer-motion'
import Layout from './Layout'
import Chatlist from '../pages/ChatSection/Chatlist'
import useLayoutStore from '../store/useLayoutStore'
import {getAllUsers} from '../services/user.service'

const Homepage = () => {
  const [allUsers,setAllUsers] = useState(null);
  const getUsers = async()=>{
   try{
    const result = await getAllUsers();
    if(result.status === 'success')
    {
      setAllUsers(result.data);
    }
   }catch(error){
     console.error(error.message);
   }
  }
  useEffect(() => {
   getUsers();
  }, [])
  
  return (
    <Layout>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transtion={{duration:0.5}} className='h-full'>
        <Chatlist contacts={allUsers}/>
      </motion.div>
    </Layout>
  )
}

export default Homepage