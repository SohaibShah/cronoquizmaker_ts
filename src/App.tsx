import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, collections, db } from './firebase'

import { useNavigate } from 'react-router-dom'

import Login from './components/Login'
import Home from './container/Home'

import { fetchUser } from './utils/fetchUser';
import { usePrevious } from './utils/functions'
import AppUser from './models/AppUser';
import { onAuthStateChanged, User } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

const App = () => {

  const navigate = useNavigate();
  const [localUser, setUser] = useState<AppUser | undefined | null>(fetchUser())
  const [user, loading, error] = useAuthState(auth)

  const location = useLocation()

  const targetLoc = usePrevious<string>(location.pathname)

  useEffect(() => {
    if (user) {
      checkUser(user)
    } else {
      localStorage.removeItem('user')
      navigate(`/login/${location.pathname ? location.pathname.slice(1).replaceAll('/', '>') : targetLoc !== undefined ? targetLoc?.slice(1).replaceAll('/', '>') : 'undefined'}`, { replace: true })
    }
  }, [localUser, user])

  const checkUser = async (user: User) => {
    const uidDoc = await getDoc(doc(db, collections.users, user.uid))
    const appUserData = uidDoc.data() as AppUser

    if (appUserData) {
      const appUser: AppUser = {
        uid: user.uid,
        name: appUserData.name ?? user.displayName ?? 'undefined',
        email: appUserData.email,
        dateAccCreated: appUserData.dateAccCreated,
        publishedQuizzes: appUserData.publishedQuizzes,
        savedQuizzes: appUserData.savedQuizzes,
        photoImgUrl: appUserData.photoImgUrl ?? user.photoURL
      }
      if (localUser !== appUser || localUser === undefined) {
        localStorage.setItem('user', JSON.stringify(appUser))
        setUser(fetchUser())
      }
    } else {
      const appUser: AppUser = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        dateAccCreated: serverTimestamp(),
        publishedQuizzes: [],
        savedQuizzes: [],
        photoImgUrl: user.photoURL
      }
      await setDoc(doc(db, collections.users, user.uid), appUser)
      localStorage.setItem('user', JSON.stringify(appUser))
      setUser(fetchUser())
    }
  }

  return (
    <Routes>
      <Route path="/*" element={<Home user={localUser as AppUser} changeUser={setUser} />} />
      <Route path="/login" element={<Login localUser={localUser} setUser={setUser} />} />
      <Route path="/login/:redirect" element={<Login localUser={localUser} setUser={setUser} />} />
    </Routes>
  )
}

export default App