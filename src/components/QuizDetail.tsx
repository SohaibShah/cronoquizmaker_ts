import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import React, { useState, useEffect } from 'react'
import { BsBookmarkPlus, BsFillBookmarkCheckFill, BsFillEmojiDizzyFill, BsPlayFill } from 'react-icons/bs'
import { GoPencil } from 'react-icons/go'
import { Link, useParams } from 'react-router-dom'
import { auth, collections, db, saveQuiz, unsaveQuiz } from '../firebase'
import AppUser from '../models/AppUser'
import { QuizModel } from '../models/QuizModel'
import { fetchUser } from '../utils/fetchUser'
import MasonryLayout from './MasonryLayout'
import Spinner from './Spinner'
import { useMediaQuery } from 'react-responsive'

const QuizDetail = () => {
  const isMobileOrTablet = useMediaQuery({ query: '(max-width: 1224px)' })

  const { quizId, privateQuizId } = useParams()

  const [quizzes, setQuizzes] = useState<QuizModel[] | undefined>(undefined)
  const [quizDetail, setQuizDetail] = useState<QuizModel | undefined>()
  const [quizCreator, setQuizCreator] = useState<AppUser | undefined>()
  const currentUser = auth.currentUser

  const [alreadySaved, setAlreadySaved] = useState(false)
  const [savingQuiz, setSavingQuiz] = useState(false)

  const [loading, setLoading] = useState(false)
  const [invalidQuiz, setInvalidQuiz] = useState(false)

  useEffect(() => {
    fetchQuizDetail()
  }, [quizId, privateQuizId])

  useEffect(() => {
    // console.log(`quizzes: ${quizzes}`)
    // console.log(`quizDetail: ${JSON.stringify(quizDetail)}`)
  }, [quizDetail, quizzes])


  const fetchQuizDetail = async () => {
    setLoading(true)
    if (quizId) {
      const quizDetailDoc = await getDoc(doc(db, collections.quiz, quizId))
      if (quizDetailDoc.data()) {
        setQuizDetail(quizDetailDoc.data() as QuizModel)
        currentUser && setAlreadySaved((quizDetailDoc.data() as QuizModel).save.includes(currentUser.uid))
        const creatorDoc = await getDoc(doc(db, collections.users, (quizDetailDoc.data() as QuizModel).creatorUid))
        if (creatorDoc.data()) {
          setQuizCreator(creatorDoc.data() as AppUser)
        }
        if (quizDetail && quizDetail.keywords.length > 0) {
          var quizzesList: QuizModel[] = []
          for (const keyword of quizDetail.keywords) {
            if (keyword.length > 0) {
              const keywordQ = query(collection(db, collections.quiz), where('keywords', 'array-contains', `${keyword}`))
              const matchingDocs = await getDocs(keywordQ)
              if (matchingDocs.docs) {
                matchingDocs.docs.forEach((doc) => {
                  if (!quizzesList.includes(doc.data() as QuizModel) && (doc.data() as QuizModel).quizId !== quizDetail.quizId) {
                    quizzesList.push(doc.data() as QuizModel)
                  }
                })
              }
            }
          }
          setQuizzes(quizzesList)
        }
      } else {
        setInvalidQuiz(true)
      }
    } else if (privateQuizId && currentUser) {
      const quizDetailDoc = await getDoc(doc(db, `${collections.users}/${currentUser.uid}/${collections.draftQuizzes}/${privateQuizId}`))
      if (quizDetailDoc.data()) {
        setQuizDetail(quizDetailDoc.data() as QuizModel)
        currentUser && setAlreadySaved((quizDetailDoc.data() as QuizModel).save.includes(currentUser.uid))
        const creatorDoc = await getDoc(doc(db, collections.users, (quizDetailDoc.data() as QuizModel).creatorUid))
        if (creatorDoc.data()) {
          setQuizCreator(creatorDoc.data() as AppUser)
        }
        if (quizDetail && quizDetail.keywords.length > 0) {
          var quizzesList: QuizModel[] = []
          for (const keyword of quizDetail.keywords) {
            if (keyword.length > 0) {
              const keywordQ = query(collection(db, collections.quiz), where('keywords', 'array-contains', `${keyword}`))
              const matchingDocs = await getDocs(keywordQ)
              if (matchingDocs.docs) {
                matchingDocs.docs.forEach((doc) => {
                  if (!quizzesList.includes(doc.data() as QuizModel) && (doc.data() as QuizModel).quizId !== quizDetail.quizId) {
                    quizzesList.push(doc.data() as QuizModel)
                  }
                })
              }
            }
          }
          setQuizzes(quizzesList)
        }
      } else {
        setInvalidQuiz(true)
      }
    } else {
      setInvalidQuiz(true)
    }
    setLoading(false)
  }

  const handleSaveQuiz = async () => {
    if (quizDetail) {
      if (!alreadySaved) {
        setSavingQuiz(true)
        saveQuiz(quizDetail).then(() => {
          setAlreadySaved(true)
          setSavingQuiz(false)
        })
      } else {
        setSavingQuiz(true)
        unsaveQuiz(quizDetail).then(() => {
          setAlreadySaved(false)
          setSavingQuiz(false)
        })
      }
    }
  }

  if (loading) return <Spinner />

  if (invalidQuiz && !loading) return (
    <div className="flex flex-col gap-5 w-full h-full items-center justify-center" style={{ height: `100%` }}>
      <BsFillEmojiDizzyFill fontSize={80} color='gray' />
      <h2 className='font-bold text-lg text-gray-500'>I couldn't find this quiz... I looked everywhere, but just couldn't. I swear I'm not crazy!</h2>
    </div>
  )

  return (
    <>
      {quizDetail && (
        <div className="rounded-xl flex xl:flex-row flex-col m-auto bg-white" style={{ maxWidth: '1500px' }}>
          <div className="flex flex-1 justify-center xl:justify-start items-center md:items-start flex-initial">
            <img
              className='rounded-lg object-fill'
              src={quizDetail.quizImageUrl ?? `https://via.placeholder.com/800x300.png?text=${quizDetail.quizTitle.replaceAll(' ', '+')}`}
              alt="user-post"
            />
          </div>
          <div className="w-full p-5 flex-1 xl:min-w-620">
            <div className='flex items-center justify-end gap-5'>
              {alreadySaved ? (
                <button onClick={(e) => {
                  handleSaveQuiz()
                }} type="button" className='bg-logoBlue w-9 h-9 rounded-full flex items-center text-xl justify-center opacity-75 hover:opacity-100 hover:shadow-md outline-none text-white'>
                  <BsFillBookmarkCheckFill />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveQuiz();
                  }}
                  type="button"
                  className="bg-gray w-9 h-9 rounded-full flex items-center text-xl justify-center opacity-75 hover:opacity-100 hover:shadow-md outline-none text-dark"
                >
                  {savingQuiz ? <Spinner message={null} /> : <BsBookmarkPlus />}
                </button>
              )}
              {quizDetail.creatorUid === currentUser?.uid && <a
                href={!quizDetail.private ? `/edit-quiz/${quizDetail.quizId}` : `/edit-quiz/private/${quizDetail.quizId}`}
                className="gap-1 rounded-md bg-logoBlue py-2 px-3 text-md md:text-xl flex items-center justify-center text-white opacity-100 hover:opacity-75 hover:shadow-md"
              >
                <GoPencil />
                <p className='font-bold'>Edit Quiz</p>
              </a>}
              <a
                href={!quizDetail.private ? `/play-quiz/${quizDetail.quizId}` : `/play-quiz/private/${quizDetail.quizId}`}
                className="gap-1 rounded-md bg-logoGreen py-2 px-3 text-md md:text-xl flex items-center justify-center text-dark opacity-100 hover:opacity-75 shadow-md"
              >
                <BsPlayFill />
                <p className='font-bold'>Play Quiz</p>
              </a>
            </div>
            <div>
              <h1 className="text-4xl font-bold break-words mt-3">
                {quizDetail.quizTitle}
              </h1>
              <p className="mt-3">{quizDetail.quizDesc}</p>
            </div>
            {quizCreator && <Link
              to={`/user-profile/${quizDetail.creatorUid}`}
              className='flex gap-2 mt-5 items-center bg-white rounded-lg opacity-100 hover:opacity-75'
            >
              {quizCreator.photoImgUrl && <img src={quizCreator.photoImgUrl} alt="user-profile" className='w-10 h-10 rounded-full' />}
              <p className="font-bold">{quizCreator.name}</p>
            </Link>}
            <div className='flex gap-1 mt-5 items-center'>
              {quizDetail.keywords.map((keyword, keywordIndex) => <a href={`/category/${keyword}`} className='opacity-60 hover:opacity-90'>
               {!isMobileOrTablet && keywordIndex < 6 && <p>{`#${keyword}`}</p>}
               {isMobileOrTablet && keywordIndex < 3 && <p>{`#${keyword}`}</p>}
              </a>)}
            </div>
            {quizDetail.save.length > 0 && <div className='flex gap-2 items-center mt-5'>
              <BsFillBookmarkCheckFill color='blue' />
              <p>{`${quizDetail.save.length} ${quizDetail.save.length > 1 ? 'people have' : 'person has'} saved this quiz.`}</p>
            </div>}
          </div>
        </div>
      )}
      {quizzes && quizzes.length > 0 && (
        <h2 className="text-center font-bold text-2xl mt-8 mb-4">
          More like this
        </h2>
      )}
      {quizzes && quizzes.length > 0 && (
        <MasonryLayout quizzes={quizzes} />
      )}
    </>
  )
}

export default QuizDetail