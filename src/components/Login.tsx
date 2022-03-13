import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import firebase from "firebase/app"
import { Auth } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'

import { auth, logInWithEmailAndPassword, registerWithEmailAndPassword, signInWithGoogle, sendPasswordReset } from '../firebase'

import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { HiOutlineMail } from 'react-icons/hi'
import { RiLockPasswordLine } from 'react-icons/ri'
import { MdDriveFileRenameOutline } from 'react-icons/md'

import Spinner from '../components/Spinner'

import shareVid from '../assets/lowres.mp4'

import logo from '../assets/logo.png'
import personIcon from '../assets/personIcon.png'
import { fetchUser } from '../utils/fetchUser'
import AppUser from '../models/AppUser'
import { serverTimestamp } from 'firebase/firestore'
import { usePrevious } from '../utils/functions'

export interface LoginProps {
  localUser: AppUser | null | undefined;
  setUser: React.Dispatch<React.SetStateAction<AppUser | null | undefined>>;
  // targetLocation?: string;
}

const Login = ({ localUser, setUser }: LoginProps) => {

  const [name, setName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')

  const [passState, setPassState] = useState('password')
  const [onRegisterScreen, setOnRegisterScreen] = useState(false)

  const [onResetScreen, setOnResetScreen] = useState(false)

  const [showError, setShowError] = useState(false)
  const [errorText, setErrorText] = useState('')

  const [user, loading, error] = useAuthState(auth)
  const navigate = useNavigate();

  const targetLocation = useParams()
  // const prevTargetLocation = usePrevious(targetLocation)
  const [prevTargetLocation, setPrevTargetLocation] = useState(targetLocation)

  console.log(`targetLocation: ${JSON.stringify(targetLocation)}`)
  console.log(`prevTargetLocation: ${JSON.stringify(prevTargetLocation)}`)

  useEffect(() => {
    if (error) {
      setErrorText(error.message.replace("-", " "))
      setShowError(true)
    }
    if (user) {
      if (!localUser) {
        const appUser: AppUser = {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoImgUrl: user.photoURL,
          dateAccCreated: serverTimestamp(),
          publishedQuizzes: []
        }
        setUser(appUser)
        localStorage.setItem('user', JSON.stringify(appUser))
      }
        navigate(`${targetLocation.redirect && targetLocation.redirect !== 'undefined' ? '/' + targetLocation.redirect.replaceAll('login>', '').replaceAll('>', '/') : prevTargetLocation?.redirect && prevTargetLocation.redirect !== 'undefined' ? '/' + prevTargetLocation.redirect.replace('login>', '').replaceAll('>', '/') : '/' }`)
    }

    return;

  }, [loading, user, error])

  const login = async () => {
    if (!emailAddress || !password) {
      setShowError(true);
      return setTimeout(() => setShowError(false), 2500)
    } else if (!emailAddress.includes('@') || !emailAddress.includes('.')) {
      setErrorText('Please enter a valid email')
      setShowError(true)
      return setTimeout(() => setShowError(false), 2500)
    } else if (emailAddress && password && emailAddress.includes('@') && emailAddress.includes('.')) {
      const result = await logInWithEmailAndPassword(emailAddress, password);
      if (result) {
        setErrorText(result)
        setShowError(true)
        return setTimeout(() => setShowError(false), 2500)
      }
    } else {
      return;
    }
  }

  const signUp = async () => {
    if (!emailAddress || !password || !name) {
      setShowError(true);
      return setTimeout(() => setShowError(false), 2500)
    } else if (!emailAddress.includes('@') || !emailAddress.includes('.')) {
      setErrorText('Please enter a valid email')
      setShowError(true)
      return setTimeout(() => setShowError(false), 2500)
    } else {
      const result = await registerWithEmailAndPassword(emailAddress, password, name)
      setErrorText(result)
      setShowError(true)
      return setTimeout(() => setShowError(false), 2500)
    }
  }

  const sendReset = async () => {
    if (!emailAddress || !emailAddress.includes('@') || !emailAddress.includes('.')) {
      setErrorText("Enter a valid email!")
      setShowError(true)
      return setTimeout(() => setShowError(false), 2500)
    } else {
      const result = await sendPasswordReset(emailAddress)
      setErrorText(result)
      setShowError(true)
      return setTimeout(() => setShowError(false), 2500)
    }
  }

  return (
    <div className="flex justify-start flex-col items-center h-screen relative top-0 bottom-0">
      <div className="relative h-full w-full object-cover " 
    //   dangerouslySetInnerHTML={{ __html: `
    //   <video
    //     loop="true"
    //     muted="true"
    //     autoplay="true"
    //     controls="false"
    //     playsinline="true"
    //     src="${shareVid}"
    //     class="block w-full h-full object-cover fixed top-0 bottom-0"
    //   />,
    // ` }}
        >
        <video
          src={shareVid}
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          id="video-background"
          className="block w-full h-full object-cover fixed top-0 bottom-0"
        />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onRegisterScreen ? signUp() : onResetScreen ? sendReset() : login() }} className="overflow-y-scroll absolute flex flex-col justify-center items-center top-0 bottom-0 right-0 left-0 bg-blackOverlay">

        <div className="m-5">
          <img src={logo} alt="cronoquiz-logo" width={150} />
        </div>
        {!loading ? (<>
          <div className="flex flex-col gap-y-3 p-5 bg-secondaryColor shadow-md mb-5 rounded-2xl items-center justify-center object-center">
            <img src={personIcon} alt="personIcon" className="p-3" />
            <h3 className="text-2xl">{onRegisterScreen ? "Sign Up" : onResetScreen ? "Reset Password" : "Login"}</h3>
            {onRegisterScreen && (
              <div className="cursor-text flex justify-start items-center w-full px-2 py-1 rounded-full bg-secondaryColor outline outline-1 outline-disabled focus-within:shadow-sm">
                <MdDriveFileRenameOutline fontSize={21} className="ml-1" />
                <input
                  type="text"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  value={name}
                  className="p-2 w-full bg-secondaryColor ouline-none focus:outline-none caret-logoBlue"
                />
              </div>
            )}
            <div className="cursor-text flex justify-start items-center w-full px-2 py-1 rounded-full bg-secondaryColor outline outline-1 outline-disabled focus-within:shadow-sm">
              <HiOutlineMail fontSize={21} className="ml-1" />
              <input
                type="email"
                autoComplete="username"
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Email Address"
                value={emailAddress}
                className="p-2 w-full bg-secondaryColor ouline-none focus:outline-none caret-logoBlue"
              />
            </div>
            {!onResetScreen && <div className="cursor-text flex justify-start items-center w-full px-2 py-1 rounded-full bg-secondaryColor outline outline-1 outline-disabled focus-within:shadow-sm">
              <RiLockPasswordLine fontSize={21} className="ml-1" />
              <input
                type={passState}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                className="p-2 w-full bg-secondaryColor ouline-none focus:outline-none caret-logoBlue"
              />
              {passState === "text" ? <AiOutlineEyeInvisible fontSize={21} className="ml-1 text-white cursor-pointer" onClick={() => setPassState("password")} /> : <AiOutlineEye fontSize={21} className="ml-1 text-white cursor-pointer" onClick={() => setPassState("text")} />}
            </div>}
            <div className="w-full text-right">
              {!onRegisterScreen && !onResetScreen && <p className="font-light -mt-1 mr-2 hover:text-gray-400 cursor-pointer" onClick={(e) => { setOnRegisterScreen(false); setOnResetScreen(true) }}>Forgot Password?</p>}
            </div>
            {showError && <p className="text-red-400 pt-1">
              {!errorText ? "All fields must be filled." : errorText}
            </p>}
            <button
              className='bg-logoBlue w-full h-auto rounded-full py-3 px-5 mt-3 text-white  hover:bg-logoBlue hover:opacity-70 hover:font-bold'
              onClick={onRegisterScreen ? signUp : onResetScreen ? sendReset : login}
            >
              {onRegisterScreen ? "SIGN UP" : onResetScreen ? "SEND RESET EMAIL" : "LOGIN"}
            </button>
            <p>OR</p>
            <button
              className='bg-black w-full h-auto rounded-full py-3 px-5 text-white  hover:bg-gray-800 hover:font-bold'
              onClick={!onResetScreen ? (e) => {e.preventDefault(); signInWithGoogle()} : (e) => { setOnResetScreen(false) }}
            >
              {!onResetScreen ? "CONTINUE WITH GOOGLE" : "GO BACK"}
            </button>
          </div>
        </>) : <Spinner message="Loading Goodness" />}
        {!onResetScreen && <p className="text-white hover:text-gray-400 cursor-pointer" onClick={(e) => { setOnRegisterScreen(!onRegisterScreen); onRegisterScreen && setOnResetScreen(false) }}>{onRegisterScreen ? "Already have an account? Login" : "Don't have an account? Create Account"}</p>}

      </form>
    </div>
  )
}

export default Login