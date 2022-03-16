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
import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

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
      navigate(`/login/${location.pathname ? location.pathname.slice(1).replaceAll('/', '>') : targetLoc !== undefined ? targetLoc?.slice(1).replaceAll('/', '>') : 'undefined'}`, { replace: true })
    }
  }, [localUser, user])

  const checkUser = async (user: User) => {
    const userUidQ = query(collection(db, collections.users), where("uid", "==", user?.uid))
    const uidDocs = await getDocs(userUidQ)
    const appUserData = uidDocs.docs[0].data() as AppUser

    var appUser: AppUser = {
      uid: user ? user.uid : 'undefined',
      name: appUserData.name ?? user.displayName ?? null,
      email: user.email ?? appUserData.email ?? null,
      photoImgUrl: appUserData.photoImgUrl ?? user.photoURL ?? null,
      dateAccCreated: serverTimestamp(),
      publishedQuizzes: appUserData.publishedQuizzes ?? [],
      savedQuizzes: appUserData.savedQuizzes ?? []
    }
    if (localUser && localUser.uid === appUser.uid && localUser.email === appUser.email && localUser.photoImgUrl === appUser.photoImgUrl && uidDocs.docs.length > 0) {
      appUser = {
        uid: user ? user.uid : 'undefined',
        name: appUserData.name ?? user.displayName ?? null,
        email: user.email ?? appUserData.email ?? null,
        photoImgUrl: appUserData.photoImgUrl ?? user.photoURL ?? null,
        dateAccCreated: serverTimestamp(),
        publishedQuizzes: appUserData.publishedQuizzes ?? [],
        savedQuizzes: appUserData.savedQuizzes ?? []
      }
      navigate(`${location.pathname}`)
    } else {

      if (uidDocs.docs.length < 1) {
        localStorage.setItem('user', JSON.stringify(appUser))
        setUser(appUser)
        await setDoc(doc(db, collections.users, user.uid), appUser)
        // .then(() => console.log('CREATED NEW APP USER'))
      } else {
        appUser = {
          uid: user ? user.uid : 'undefined',
          name: appUserData.name ?? user.displayName ?? null,
          email: user.email ?? appUserData.email ?? null,
          photoImgUrl: appUserData.photoImgUrl ?? user.photoURL ?? null,
          dateAccCreated: serverTimestamp(),
          publishedQuizzes: appUserData.publishedQuizzes ?? [],
          savedQuizzes: appUserData.savedQuizzes ?? []
        }
        localStorage.setItem('user', JSON.stringify(appUser))
        setUser(fetchUser())
      }
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