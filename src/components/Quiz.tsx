import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { fetchUser } from '../utils/fetchUser'

import { AiFillDelete } from 'react-icons/ai'
import { BsPlayFill, BsFillBookmarkCheckFill, BsBookmarkPlus } from 'react-icons/bs'
import { GoPencil } from'react-icons/go'

import Spinner from './Spinner'
import AppUser from '../models/AppUser'
import { QuizModel } from '../models/QuizModel'

import { saveQuiz, unsaveQuiz, getUserFromId, deletePublishedQuiz, deleteDraftQuiz } from '../firebase'

export interface QuizProps {
  quiz: QuizModel
}

const Quiz = ({ quiz }: QuizProps) => {

  const [loading, setLoading] = useState(false)

  const [quizHovered, setQuizHovered] = useState(false)
  const [savingQuiz, setSavingQuiz] = useState(false)

  const [quizCreator, setQuizCreator] = useState<AppUser | null>(null)

  const navigate = useNavigate();
  const user = fetchUser();

  const [alreadySaved, setAlreadySaved] = useState(quiz.save.includes(`${user?.uid}`))

  useEffect(() => {

    if (quizCreator !== null) {
      setLoading(false)
    } else {
      setLoading(true)
      getQuizCreator()
    }
  }, [quizCreator])

  const getQuizCreator = async () => {
    await getUserFromId(quiz.creatorUid).then((creator) => {
      if (creator !== null) {
        setQuizCreator(creator)
        setLoading(false)
      } else {
        setQuizCreator(null)
      }
    })
  }


  const handleSaveQuiz = async () => {
    if (!alreadySaved) {
      setSavingQuiz(true)
      saveQuiz(quiz).then(() => {
        setAlreadySaved(true)
        setSavingQuiz(false)
      })
    } else {
      setSavingQuiz(true)
      unsaveQuiz(quiz).then(() => {
        setAlreadySaved(false)
        setSavingQuiz(false)
      })
    }
  }

  const deleteQuiz = async () => {
    if (quiz.private) {
      await deleteDraftQuiz(quiz)
    } else {
      await deletePublishedQuiz(quiz)
    }
  }

  return (
    <>
      {quizCreator !== null || !loading ? (
        <div className="m-2">
          <div
            onMouseEnter={() => setQuizHovered(true)}
            onMouseLeave={() => setQuizHovered(false)}
            onTouchStart={() => setQuizHovered(true)}
            onClick={() => quiz.private ? navigate(`/quiz-detail/private/${quiz.quizId}`) : navigate(`/quiz-detail/${quiz.quizId}`)}
            className="relative cursor-pointer w-auto hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
          >
            <img src={quiz.quizImageUrl} alt="quiz-image" className="rounded-lg w-full bg-white min-h-[150px] object-contain" />
            {quizHovered ? (
              <div className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50" style={{ height: '100%' }}>
                <div className="flex items-center justify-between">
                {alreadySaved ? (
                    <button onClick={(e) => {
                      e.stopPropagation()
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
                      className="bg-white w-9 h-9 rounded-full flex items-center text-xl justify-center opacity-75 hover:opacity-100 hover:shadow-md outline-none text-dark"
                    >
                      {savingQuiz ? <Spinner message={null} /> : <BsBookmarkPlus />}
                    </button>
                  )}
                  {quiz.creatorUid === user?.uid && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        quiz.private ? navigate(`/edit-quiz/private/${quiz.quizId}`) : navigate(`/edit-quiz/${quiz.quizId}`) 
                      }}
                      className="p-2 bg-logoBlue opacity-70 hover:opacity-100 font-bold text-white text-base rounded-full hover:shadow-md outline-none">
                      <GoPencil />
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center gap-2 w-full">
                  {quiz.questions.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); quiz.private ? navigate(`/play-quiz/private/${quiz.quizId}`) : navigate(`/play-quiz/${quiz.quizId}`) }}
                      className="p-2 bg-logoGreen opacity-70 hover:opacity-100 font-bold text-dark text-base rounded-full hover:shadow-md outline-none">
                      <BsPlayFill />
                    </button>
                  )}
                  {quiz.creatorUid === user?.uid && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuiz();
                      }}
                      className="p-2 bg-red-500 opacity-70 hover:opacity-100 font-bold text-white text-base rounded-full hover:shadow-md outline-none">
                      <AiFillDelete />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-black/50 absolute top-0 w-full h-full flex flex-col justify-center p-1 pr-2 pt-2 pb-2 z-50" style={{ height: '100%' }}>
                <div className="flex flex-col justify-center items-center gap-2 w-full">
                  <h2 className="text-white text-center font-bold">
                    {quiz.quizTitle}
                  </h2>
                  <p className="text-white text-center">{quiz.quizDesc}</p>
                </div>
              </div>
            )}
          </div>
          <Link
            to={`user-profile/${quiz.creatorUid}`}
            className="flex gap-2 mt-2 items-center hover:opacity-75"
          >
            {quizCreator?.photoImgUrl && <img src={quizCreator?.photoImgUrl ? quizCreator.photoImgUrl!! : undefined} alt="creator-image" className="w-8 h-8 rounded-full object-cover" />}
            <p className="font-semibold">{quizCreator?.name}</p>
          </Link>
        </div>
      ) : (
        <div className="p-20">
          <div className="p-20 bg-white relative w-full hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out">
            <Spinner message={null} />
          </div>
        </div>
      )}
    </>
  )
}

export default Quiz