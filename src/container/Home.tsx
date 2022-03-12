import React, { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase'

import { HiMenu } from 'react-icons/hi'

import { AiOutlineCloseCircle } from 'react-icons/ai';
import { BsPersonCircle } from 'react-icons/bs'
import { Link, Route, Routes } from 'react-router-dom';

import Sidebar from '../components/Sidebar'
import UserProfile from '../components/UserProfile';

import logo from '../assets/logo.png'
import { Quizzes } from './Quizzes';
import { User } from 'firebase/auth';
import { fetchUser } from '../utils/fetchUser';
import AppUser from '../models/AppUser';
import PlayQuiz from '../components/PlayQuiz';

export interface HomeProps {
  user: AppUser
  changeUser: React.Dispatch<React.SetStateAction<AppUser | undefined>>
}

const Home = ({ user, changeUser }: HomeProps) => {

  const [toggleSidebar, setToggleSidebar] = useState(false)

  return (
    <div className="flex md:flex-row flex-col bg-mainColor h-screen transition-height duration-75 ease-out">
      <div className="hidden md:flex h-screen flex-initial">
        <Sidebar setSidebarVisible={undefined} setUser={changeUser} user={user} />
      </div>

      <div className="flex md:hidden flex-row relative sticky-top-0">
        <div className="p-2 w-full flex flex-row justify-between items-center shadow-md bg-appBarBgDark">
          <HiMenu fontSize={40} className="cursor-pointer text-white" onClick={(e) => setToggleSidebar(true)} />
          <Link to="/">
            <img src={logo} alt="logo" className="w-24" />
          </Link>
          {user?.photoImgUrl ?
            <Link to={`user-profile/${user?.uid}`} className="w-12 h-12 items-center text-center mr-1" >
              <img src={user?.photoImgUrl === null ? 'undefined' : user?.photoImgUrl} alt="profile-image" className="bg-white rounded-full" />
            </Link>
            :
            <Link to={`user-profile/${user?.uid}`} className="items-ceter text-center mr-2">
              <BsPersonCircle className="text-center items-center" color='white' fontSize={35} />
            </Link>}
        </div>

        {toggleSidebar && (
          <div className="fixed w-4/5 bg-appBarBgDark h-screen overflow-y-auto shadow-md z-10 animate-slide-in">
            <div className="absolute w-full flex justify-end items-center p-2">
              <AiOutlineCloseCircle
                fontSize={30}
                className="cursor-pointer text-white"
                onClick={() => setToggleSidebar(false)}
              />
            </div>
            <Sidebar setSidebarVisible={setToggleSidebar} setUser={changeUser} user={user} />
          </div>
        )}
      </div>

      <div className="pb-2 flex-1 h-screen overflow-y-scroll">
        <Routes>
          <Route path='/user-profile/:userId' element={<UserProfile />} />
          <Route path='/user-profile' element={<UserProfile />} />
          <Route path="/*" element={<Quizzes user={user && user} />} />
          <Route path='/play-quiz/:quizId' element={<PlayQuiz />} />          
          <Route path='/play-quiz/private/:privateQuizId' element={<PlayQuiz />} />
        </Routes>
      </div>

    </div>
  )
}

export default Home