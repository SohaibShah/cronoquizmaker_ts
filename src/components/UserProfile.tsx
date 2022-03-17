import { collection, DocumentData, getDocs, orderBy, Query, query, where } from 'firebase/firestore'
import React, { useState, useEffect } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { AiOutlineLogout, AiFillCloseCircle, AiOutlineCloudUpload } from 'react-icons/ai'
import { IoSettingsSharp } from 'react-icons/io5'
import { BsFillEmojiDizzyFill } from 'react-icons/bs'
import { GiNothingToSay } from 'react-icons/gi'
import { useNavigate, useParams } from 'react-router-dom'
import { auth, collections, db, getUserFromId, logOut, updateUser } from '../firebase'
import AppUser from '../models/AppUser'
import { QuizModel } from '../models/QuizModel'
import { fetchUser } from '../utils/fetchUser'
import MasonryLayout from './MasonryLayout'
import Spinner from './Spinner'
import { MdDelete, MdDriveFileRenameOutline } from 'react-icons/md'
import { updateCurrentUser } from 'firebase/auth'


const randomImage = 'https://source.unsplash.com/1600x900/?nature,photography,technology'

const activeBtnStyles = `bg-logoBlue text-white font-bold p-2 px-3 rounded-t-lg outline-none` 
// + ` border-[2px] border-b-0 border-black`
const notActiveBtnStyles = "bg-primary text-black font-bold p-2 px-3 rounded-t-lg outline-none hover:opacity-75"

const UserProfile = () => {

  const [user, setUser] = useState<AppUser | null>(null)
  const [userDoesNotExist, setUserDoesNotExist] = useState(false)

  const [loading, setLoading] = useState(false)
  const [quizzesLoading, setQuizzesLoading] = useState(false)

  const [quizzes, setQuizzes] = useState<QuizModel[] | null>(null)
  const [selectedTabText, setSelectedTabText] = useState<string>('published') // Published, Drafts, or Saved
  const [activeTab, setActiveTab] = useState('published')

  const [onSettings, setOnSettings] = useState(false)

  const [existingImageUrl, setExistingImageUrl] = useState('')
  const [wrongImageType, setWrongImageType] = useState(false)
  const [imageAsset, setImageAsset] = useState<File | null>()
  const [imageUrl, setImageUrl] = useState('')

  const [existingName, setExistingName] = useState('')


  const { userId } = useParams()


  const [feedQuery, setFeedQuery] = useState(query(collection(db, collections.quiz), where('creatorUid', '==', `${userId}`), orderBy('createdAt', 'desc')))
  var [feedValue, feedLoading, feedError, feedSnapshot] = useCollectionData(feedQuery)


  const draftSavesQuery = query(collection(db, `${collections.users}/${userId}/DraftQuizzes`), where('save', 'array-contains', `${userId}`))
  var [draftSavesValue, draftSavesLoading, draftSavesError, draftSavesSnapshot] = useCollectionData(draftSavesQuery)

  const publishedSavesQuery = query(collection(db, collections.quiz), where('save', 'array-contains', `${userId}`))
  var [publishedSavesValue, publishedSavesLoading, publishedSavesError, publishedSavesSnapshot] = useCollectionData(publishedSavesQuery)

  const navigate = useNavigate()

  const saveAndUpdateUser = async () => {
    if (user && existingImageUrl && existingImageUrl !== '' && existingImageUrl !== user.photoImgUrl) {
      setLoading(true)
      await updateUser(undefined, existingImageUrl, undefined).then(() => {
        setLoading(false)
        navigate('/user-profile/')
      })
      if (user && existingName && existingName !== '' && existingName !== user.name) {
        setLoading(true)
        await updateUser(existingName, undefined, undefined).then(() => {
          setLoading(false)
          navigate('/user-profile/')
        })
      }

    } else if (user && imageAsset && existingImageUrl === '') {
      setLoading(true)
      await updateUser(undefined, undefined, imageAsset).then(() => {
        setLoading(false)
        navigate('/user-profile/')
      })
      if (user && existingName && existingName !== '' && existingName !== user.name) {
        setLoading(true)
        await updateUser(existingName, undefined, undefined).then(() => {
          setLoading(false)
          navigate('/user-profile/')
        })
      }
    } else {
      if (user && existingName && existingName !== '' && existingName !== user.name) {
        setLoading(true)
        await updateUser(existingName, undefined, undefined).then(() => {
          setLoading(false)
          navigate('/user-profile/')
        })
      } else {
        setOnSettings(false)
      }
    }
  }

  const resetSettings = () => {
    if (user) {
      if (user.photoImgUrl) {
        setExistingImageUrl(user.photoImgUrl)
      }
      if (user.name) {
        setExistingName(user.name)
      }
    }
    return true
  }

  useEffect(() => {
    resetSettings()
  }, [onSettings])

  useEffect(() => {
    if (userId && userId !== '') {
      setLoading(true)
      getUser(userId)
    } else {
      const localUser = fetchUser()
      if (localUser) {
        setUser(localUser)
        if (localUser.photoImgUrl) {
          setExistingImageUrl(localUser.photoImgUrl)
        }
      }
    }
  }, [userId])

  useEffect(() => {
    if (selectedTabText === 'published' && activeTab === 'published' && user) {
      setQuizzesLoading(true)
      setFeedQuery(query(collection(db, collections.quiz), where('creatorUid', '==', `${user.uid}`)))
    } else if (selectedTabText === 'saved' && activeTab === 'saved' && user) {
      setQuizzesLoading(true)
      // getSavedQuizzes()
    } else if (selectedTabText === 'drafts' && activeTab === 'drafts' && user) {
      setQuizzesLoading(true)
      setFeedQuery(query(collection(db, `${collections.users}/${user.uid}/DraftQuizzes`)))
    } else {
      setQuizzesLoading(true)
      setFeedQuery(query(collection(db, collections.quiz), where('creatorUid', '==', `${userId}`)))
    }
  }, [userId, selectedTabText, activeTab])

  useEffect(() => {
    if (feedValue && feedValue.length > 0) {
      const quizzesList: QuizModel[] = []
      feedValue.forEach((quiz) => {
        quizzesList.push(quiz as QuizModel)
      })
      setQuizzes(quizzesList)
      setQuizzesLoading(false)
    } else {
      setQuizzes([])
      setQuizzesLoading(false)
    }
  }, [feedValue])

  useEffect(() => {
    if (user && selectedTabText === 'saved' && activeTab === 'saved') {
      const obtainedQuizzes: QuizModel[] = []

      if (publishedSavesValue && publishedSavesValue.length > 0) {
        publishedSavesValue.forEach((quiz) => obtainedQuizzes.push(quiz as QuizModel))
      }
      if (draftSavesValue && draftSavesValue.length > 0) {
        draftSavesValue.forEach((quiz) => obtainedQuizzes.push(quiz as QuizModel))
      }

      setQuizzes(obtainedQuizzes)
      setQuizzesLoading(false)
    }
  }, [publishedSavesValue, draftSavesValue, selectedTabText, activeTab])

  const getUser = async (userId: string) => {
    const userQuery = await getUserFromId(userId)
    if (userQuery) {
      setUser(userQuery)
      if (userQuery.photoImgUrl) {
        setExistingImageUrl(userQuery.photoImgUrl)
      } else {
        setExistingImageUrl(`https://via.placeholder.com/500x1000?text=${userQuery.name}`)
      }
      setLoading(false)
    } else {
      setUserDoesNotExist(true)
      setLoading(false)
    }
  }

  const logUserOut = async () => {
    logOut()
  }

  if (loading) return <Spinner />

  if (userDoesNotExist) return (
    <div className="flex flex-col gap-5 w-full h-full items-center justify-center" style={{ height: `100%` }}>
      <BsFillEmojiDizzyFill fontSize={80} color='gray' />
      <h2 className='font-bold text-lg text-gray-500'>This User does not exist</h2>
    </div>
  )

  return (
    <div className='relative w-full h-full'>
      {user && <div className="pb-2 h-full justify-center items-center z-10">
        <div className="flex flex-col pb-5">
          <div className="relative flex flex-col mb-7">
            <div className="flex flex-col justify-center items-center">
              <img
                src={randomImage}
                className="w-full h-370 2xl:h510 shadow-lg object-cover"
                alt="banner-pic"
              />
              {user.photoImgUrl ? <img
                className="rounded-full w-20 h-20 -mt-10 shadow-xl object-cover bg-white"
                src={user.photoImgUrl}
                alt="user-pic"
              /> : <img
                className="rounded-full w-20 h-20 -mt-10 shadow-xl object-cover bg-white"
                src={
                  // `https://via.placeholder.com/500x1000?text=${user.name}`
                  `https://img.icons8.com/ios-glyphs/344/test-account.png`
                }
                alt="user-pic"
              />}
              <h1 className="font-bold text-3xl text-center mt-3">{user.name}</h1>
              <div className="absolute top-0 z-1 right-0 p-2">
                {user.uid === auth.currentUser?.uid && (
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      className='bg-white p-2 rounded-full cursor-pointer outline-none shadow-md hover:opacity-75'
                      onClick={(e) => { setOnSettings(true); console.log('settings is on') }}
                    >
                      <IoSettingsSharp color="black" fontSize={21} />
                    </button>
                    <button
                      type='button'
                      className='bg-white p-2 rounded-full cursor-pointer outline-none shadow-md hover:opacity-75'
                      onClick={logUserOut}
                    >
                      <AiOutlineLogout color="blue" fontSize={21} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center my-7 mb-10">
              <button
                type="button"
                onClick={(e) => {
                  setSelectedTabText('published')
                  setActiveTab('published')
                }}
                className={`${activeTab === 'published' ? activeBtnStyles : notActiveBtnStyles}`}
              >
                Published
              </button>
              {user.uid === auth.currentUser?.uid && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      setSelectedTabText('saved')
                      setActiveTab('saved')
                    }}
                    className={`${activeTab === 'saved' ? activeBtnStyles : notActiveBtnStyles}`}
                  >
                    Saved
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      setSelectedTabText('drafts')
                      setActiveTab('drafts')
                    }}
                    className={`${activeTab === 'drafts' ? activeBtnStyles : notActiveBtnStyles}`}
                  >
                    Private
                  </button>
                </>)}
            </div>

            {quizzes && quizzes.length > 0 ? (
              <div className="px-2">
                <MasonryLayout quizzes={quizzes} />
              </div>
            ) : !quizzesLoading && !feedLoading && !publishedSavesLoading && !draftSavesLoading ? (
              <div className="flex flex-col gap-5 w-full h-full items-center justify-center" style={{ height: `100%` }}>
                <GiNothingToSay fontSize={80} color='gray' />
                <h2 className='font-bold text-lg text-gray-500'>No Quizzes Found</h2>
              </div>
            ) : (
              <Spinner />
            )}

          </div>
        </div>
      </div>}
      {onSettings && (
        <div className="absolute flex flex-col p-10 w-full h-full top-0 bottom-0 left-0 right-0 items-center justify-center z-10 overflow-y-auto">
          <div className="absolute w-full h-full top-0 bottom-0 right-0 left-0 bg-blackOverlay z-20"
            onClick={(e) => setOnSettings(false)}
          />
          <div className="z-30 gap-2 flex flex-col justify-start h-full md:h-[70%] lg:h-[70%] w-full my-50 md:w-[70%] lg:w-[50%] bg-white rounded-lg p-2">
            <div className="w-full flex justify-end items-center hover:opacity-75">
              <AiFillCloseCircle fontSize={21}
                onClick={(e) => setOnSettings(false)}
              />
            </div>
            <hr />
            <div className="w-full flex flex-col overflow-y-auto">
              <div className="w-[85%] mx-auto bg-gray-100 p-3 rounded-lg border-2 border-dotted border-gray-300">
                <div className="bg-secondaryColor p-3 flex-0.7 w-full rounded-lg">
                  <div className="flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full rounded-lg">
                    {/* {imageLoading && <Spinner />} */}
                    {wrongImageType && (
                      <p className="text-red-500">Wrong image type. Please upload an image.</p>
                    )}
                    {!imageAsset && !imageUrl && !existingImageUrl ? (
                      <div className='flex flex-col h-full items-center justify-center'>
                        <label>
                          <div className="flex flex-col items-center justify-center flex-1">
                            <div className="flex flex-col justify-center items-center">
                              <p className="font-bold text-2xl">
                                <AiOutlineCloudUpload />
                              </p>
                              <p className="text-lg">Click to Upload</p>
                            </div>
                            <p className="mt-32 text-gray-400 text-center">
                              Use high-quality JPG, SVG, PNG, or GIF less than 20 MB.
                            </p>
                          </div>
                          <input
                            type="file"
                            name='upload-image'
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const { type, name } = e.target.files[0]
                                if (type === 'image/png' || type === 'image/svg+xml' || type === 'image/jpeg' || type === 'image/gif' || type === 'image/tiff' || type === 'image/jpeg') {
                                  if (existingImageUrl) setExistingImageUrl('')
                                  setWrongImageType(false)
                                  setImageAsset(e.target.files[0]);
                                  setImageUrl(URL.createObjectURL(e.target.files[0]))

                                } else {
                                  setWrongImageType(true)
                                  setTimeout(() => setWrongImageType(false), 5000)
                                }
                              }
                            }}
                            className="w-0 h-0"
                          />
                        </label>
                        <div className="flex gap-2 flex-col items-center justify-center h-full flex-1">
                          <p>OR</p>
                          <input type="text"
                            value={imageUrl}
                            onChange={e => { setExistingImageUrl(e.target.value) }}
                            placeholder="Paste an image URL"
                            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-full">
                        <img src={existingImageUrl ? existingImageUrl : imageUrl} alt="uploaded-pic" className="h-full w-full rounded-lg" />
                        <button
                          type='button'
                          className="absolute bottom-3 right-3 p-3 rounded-full bg-white text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                          onClick={() => { setImageAsset(null); setImageUrl(''); setExistingImageUrl('') }}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-[85%] md:w-[60%] lg:w-[30%] mx-auto mt-5">
                <div className="cursor-text flex justify-start items-center w-full px-2 py-1 rounded-full bg-secondaryColor outline outline-1 outline-disabled focus-within:shadow-sm">
                  <MdDriveFileRenameOutline fontSize={21} className="ml-1" />
                  <input type="text"
                    value={existingName}
                    onChange={e => setExistingName(e.target.value)}
                    placeholder="What's your new username?"
                    className="text-lg p-2 w-full bg-secondaryColor ouline-none focus:outline-none caret-logoBlue"
                  />
                </div>
                <button
                  className='bg-logoBlue w-full h-auto rounded-full py-3 px-5 mt-3 text-white  hover:bg-logoBlue hover:opacity-70 hover:font-bold'
                  onClick={saveAndUpdateUser}
                >SAVE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile