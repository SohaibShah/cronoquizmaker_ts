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

  // const checkUser = async (obtainedUser: User | null | undefined) => {
  // console.log(`user: ${JSON.stringify(obtainedUser)}`)
  // if (obtainedUser) {
  //   const user = obtainedUser
  //   const checkIfUserUidExistsQ = query(collection(db, collections.users), where("uid", "==", user?.uid))
  //   const uidDocs = await getDocs(checkIfUserUidExistsQ)

  //   const checkIfUserEmailExistsQ = query(collection(db, collections.users), where("email", "==", user?.email))
  //   const emailDocs = await getDocs(checkIfUserEmailExistsQ)

  //   console.warn(`emailDocs: ${JSON.stringify(emailDocs)}`)

  //   console.log('ran user check and returned true')

  //   if (uidDocs.docs.length < 1 && emailDocs.docs.length < 1) {
  //     console.log('ran uidDocs and emailDocs check and verified equal to zero')
  //     const appUser: AppUser = {
  //       uid: user ? user.uid : 'undefined',
  //       name: user ? user.displayName : null,
  //       email: user ? user.email : null,
  //       photoImgUrl: user ? user.photoURL : null,
  //       dateAccCreated: serverTimestamp(),
  //       publishedQuizzes: [],
  //       savedQuizzes: []
  //     }
  //     localStorage.setItem('user', JSON.stringify(appUser))
  //     console.log('created local storage user')
  //     await addDoc(collection(db, collections.users), appUser).then(() => console.log('CREATED NEW USER'))
  //     setUser(fetchUser())
  //   } else if (uidDocs.docs.length > 0) {
  //     console.log('uidDocs check returned more than 0')
  //     const appUserData = uidDocs.docs[0].data() as AppUser
  //     const appUser: AppUser = {
  //       uid: user ? user.uid : 'undefined',
  //       name: appUserData.name ?? user.displayName ?? null,
  //       email: user.email ?? appUserData.email ?? null,
  //       photoImgUrl: appUserData.photoImgUrl ?? user.photoURL ?? null,
  //       dateAccCreated: serverTimestamp(),
  //       publishedQuizzes: appUserData.publishedQuizzes ?? [],
  //       savedQuizzes: appUserData.savedQuizzes ?? []
  //     }
  //     localStorage.setItem('user', JSON.stringify(appUser))
  //     setUser(fetchUser())
  //   } else if (emailDocs.docs.length > 0) {
  //     console.log('emailDocs check returned more than 0')
  //     const appUserData = emailDocs.docs[0].data() as AppUser
  //     const appUser: AppUser = {
  //       uid: user ? user.uid : 'undefined',
  //       name: appUserData.name ?? user.displayName ?? null,
  //       email: user.email ?? appUserData.email ?? null,
  //       photoImgUrl: appUserData.photoImgUrl ?? user.photoURL ?? null,
  //       dateAccCreated: serverTimestamp(),
  //       publishedQuizzes: appUserData.publishedQuizzes ?? [],
  //       savedQuizzes: appUserData.savedQuizzes ?? []
  //     }
  //     localStorage.setItem('user', JSON.stringify(appUser))
  //     setUser(fetchUser())
  //   }

  //   navigate(`${location.pathname}`)
  // } else if (!localUser || localUser === undefined || !user) {
  //   console.warn(`localUser: ${JSON.stringify(localUser)}`)

  //   navigate(`/login/${location.pathname ? location.pathname.slice(1).replaceAll('/', '>') : targetLoc !== undefined ? targetLoc?.slice(1).replaceAll('/', '>') : 'undefined'}`, { replace: true })
  // }
  // }

  useEffect(() => {
    // if (user) {
    //   checkUser(user)
    // }
    // if (!localUser || localUser === undefined || !user) {
    //   console.warn(`localUser: ${JSON.stringify(localUser)}`)

    //   navigate(`/login/${location.pathname ? location.pathname.slice(1).replaceAll('/', '>') : targetLoc !== undefined ? targetLoc?.slice(1).replaceAll('/', '>') : 'undefined'}`, { replace: true })
    // } else {
    //   console.log(`latestLocalUser: ${JSON.stringify(localUser)}`)
    //   const appUser: AppUser = {
    //     uid: user ? user.uid : 'undefined',
    //     name: user ? user.displayName : null,
    //     email: user ? user.email : null,
    //     photoImgUrl: user ? user.photoURL : null,
    //     dateAccCreated: serverTimestamp(),
    //     publishedQuizzes: [],
    //     savedQuizzes: []
    //   }
    //   localStorage.setItem('user', JSON.stringify(appUser))
    //   navigate(`${location.pathname}`)
    // }

    if (user) {
      checkUser(user)
    } else {
      navigate(`/login/${location.pathname ? location.pathname.slice(1).replaceAll('/', '>') : targetLoc !== undefined ? targetLoc?.slice(1).replaceAll('/', '>') : 'undefined'}`, { replace: true })
    }
  }, [localUser, user])

  const checkUser = async (user: User) => {
    console.warn(`ran check user`)
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
      console.log('localUser exists and navigated to path')
      navigate(`${location.pathname}`)
    } else {
      console.log(`localUser doesn't exist and we ran else`)

      if (uidDocs.docs.length < 1) {
        console.log(`uidDocs check returned less than 1`)
        localStorage.setItem('user', JSON.stringify(appUser))
        setUser(appUser)
        await setDoc(doc(db, collections.users, user.uid), appUser).then(() => console.log('CREATED NEW APP USER'))
      } else {
        console.log('uidDocs check returned more than 0')
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