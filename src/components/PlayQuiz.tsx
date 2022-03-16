import React, { useEffect, useState } from 'react'
import { AiFillCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai'
import { BsFillTrophyFill } from 'react-icons/bs'
import { IoIosAddCircle } from 'react-icons/io'
import { MdDelete } from 'react-icons/md'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AppUser from '../models/AppUser'
import { QuestionModel, QuizModel, OptionModel, LeaderboardModel } from '../models/QuizModel'
import Spinner from './Spinner'

import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { createOrUpdateAndPublishQuiz, createOrUpdateDraftQuiz, getPublishedQuiz, getDraftQuiz, auth, setOrUpdateLeaderboard } from '../firebase'
import { BsFillEmojiDizzyFill, BsFillFileEarmarkLock2Fill } from 'react-icons/bs'
import { shuffle } from '../utils/functions'
import { fetchUser } from '../utils/fetchUser'
import { serverTimestamp } from 'firebase/firestore'

const PlayQuiz = () => {

  const user = auth.currentUser

  const [loading, setLoading] = useState(false)
  const [quizExits, setQuizExists] = useState(true)

  const [total, setTotal] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [unattempted, setUnattempted] = useState(0)
  const [accuracy, setAccuracy] = useState<number>(0)

  const [questions, setQuestions] = useState<QuestionModel[] | undefined>()
  const [questionsQuiz, setQuestionsQuiz] = useState<QuizModel | undefined>()

  const [onResultsPage, setOnResultsPage] = useState(false)

  const param = useParams()

  const navigate = useNavigate()

  useEffect(() => {
    if (!questions) {
      setOnResultsPage(false)
      if (param.quizId) {
        setLoading(true)
        getQuiz()
      } else if (param.privateQuizId) {
        setLoading(true)
        getQuiz()
      } else {
        setQuizExists(false)
      }
    }
  }, [param.quizId, param.privateQuizId])

  const getQuiz = async () => {
    if (param.quizId) {
      await getPublishedQuiz(param.quizId).then((obtainedQuiz) => {
        if (obtainedQuiz) {
          setQuestionsQuiz(obtainedQuiz)
          setTotal(obtainedQuiz.questions.length)
          let targetQuestions = obtainedQuiz.questions
          targetQuestions.forEach((question, qI) => {
            question.options.forEach((option, oI) => {
              targetQuestions[qI].options[oI].correct = false
            })
          })
          targetQuestions = shuffle(targetQuestions)
          setQuestions(targetQuestions)

        } else setQuizExists(false)
      })
      setLoading(false)
    } else if (param.privateQuizId) {
      await getDraftQuiz(param.privateQuizId).then((obtainedQuiz) => {
        if (obtainedQuiz) {
          setQuestionsQuiz(obtainedQuiz)
          setTotal(obtainedQuiz.questions.length)
          let targetQuestions = obtainedQuiz.questions
          targetQuestions.forEach((question, qI) => {
            question.options.forEach((option, oI) => {
              targetQuestions[qI].options[oI].correct = false
            })
          })
          targetQuestions = shuffle(targetQuestions)
          setQuestions(targetQuestions)
        } else setQuizExists(false)
      })
      setLoading(false)
    }
  }

  useEffect(() => {
    if (questionsQuiz && questions) {
      let answered = 0
      questions.forEach((question, index) => {
        if (question.answered) {
          answered++
        }
      })
      if (answered === questionsQuiz.questions.length) {
        setOnResultsPage(true)
      }
    }
  }, [questions])

  useEffect(() => {
    if (onResultsPage) {
      calculateResults()
    }
  }, [onResultsPage])

  const calculateResults = async () => {
    setLoading(true)
    let totalCorrect = 0
    let totalUnattempted = 0

    if (questionsQuiz && questions) {
      const obtainedQuiz = questionsQuiz.private ? await getDraftQuiz(questionsQuiz.quizId) : await getPublishedQuiz(questionsQuiz.quizId)

      if (obtainedQuiz) {
        const targetQuestions: QuestionModel[] = []

        questions.forEach((question, questionIndex) => {
          obtainedQuiz.questions.forEach((obtainedQuestion, obtainedQuestionIndex) => {
            if (obtainedQuestion.question === question.question) {
              targetQuestions[questionIndex] = obtainedQuestion
            }
          })
        })

        questions.forEach((question, questionIndex) => {
          if (question.answered) {
            let questionCorrect = false
            question.options.forEach((option, optionIndex) => {
              if (option.correct && targetQuestions[questionIndex].options[optionIndex].correct === true) {
                questionCorrect = true
              }
            })
            if (questionCorrect) totalCorrect += 1
          } else {
            totalUnattempted += 1
          }
        })
        setCorrect(totalCorrect)
        setAccuracy((): number => {
          return parseFloat(((totalCorrect / total) * 100).toFixed())
        })
        setUnattempted(totalUnattempted)
        setLoading(false)
      }
    } else {
      setQuizExists(false)
    }
  }

  const continueOut = async () => {
    const appUser = fetchUser()
    if (questionsQuiz && user && appUser) {
      setLoading(true)
      const score = correct * 250
      const name = appUser.name ?? 'Anonymous'
      const uid = user.uid

      await setOrUpdateLeaderboard(uid, name, score, questionsQuiz).then(() => {
        console.log('created Leaderboard')
        navigate(questionsQuiz.private ? `/quiz-detail/private/${questionsQuiz.quizId}` : `/quiz-detail/${questionsQuiz.quizId}`)
      })
    }
  }

  if (loading) return <Spinner />

  if (!quizExits || !questions) return (
    <div className="flex flex-col gap-5 w-full h-full items-center justify-center" style={{ height: `100%` }}>
      <BsFillEmojiDizzyFill fontSize={80} color='gray' />
      <h2 className='font-bold text-lg text-gray-500'>This Quiz does not exist</h2>
    </div>
  )

  return (
    <>
      {onResultsPage ? (
        <div className="flex gap-3 flex-col justify-center items-center mt-5 lg:w-4/5 min-h-[80%]">
          <h1 className="font-bold text-3xl font-blackmt-3 w-full lg:w-4/5">Results</h1>
          <div className="gap-3 flex-1 h-full flex flex-col justify-between items-center bg-white lg:p-5 p-3 lg:w-4/5 w-full rounded-xl shadow-md">
            <div className="flex gap-3 items-center justify-center flex-col flex-1">
              <BsFillTrophyFill fontSize={200} color='gold' className='mb-16' />
              <h1 className='text-4xl font-bold'>{`${accuracy}%`}</h1>
              <p className='text-xl'>{accuracy < 50 ? 'Better luck next time!' : accuracy < 75 ? 'Good!' : 'Amazing!'}</p>
            </div>
            <div
              className='cursor-pointer lg:w-3/5 flex items-center justify-center w-full bg-logoBlue text-white text-xl font-bold p-3 px-4 rounded-lg hover:opacity-75 hover:shadow-md'
              onClick={() => continueOut()}
            >
              Continue
            </div>
          </div>
        </div>
      ) : (<div className="flex gap-3 flex-col justify-center items-center mt-5 lg:4/5">

        {questions && questions.length > 0 && <h1 className="font-bold text-3xl font-black mt-3 w-full lg:w-4/5">Questions</h1>}

        {questions && questions.map((question, questionIndex) => (
          <div key={questionIndex} className="gap-3 flex flex-col justify-start items-center bg-white lg:p-5 p-3 lg:w-4/5 w-full rounded-xl shadow-md">
            {!question.answered ? (
              <div className='w-full items-center justify-start'>
                <div className="flex w-full items-center">
                  <p className=" text-2xl font-bold">{`${questionIndex + 1}. ${question.question}`}</p>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  {question.options.map((option, optionIndex) => {
                    return (
                      <div key={optionIndex} className="flex w-full items-center">
                        <div
                          className='m-2 rounded-full cursor-pointer hover:opacity-75 hover:shadow-md'
                          onClick={() => {
                            let newQuestions = [...questions]
                            newQuestions[questionIndex].options[optionIndex].correct = true;

                            newQuestions[questionIndex].answered = true

                            setQuestions(newQuestions)
                          }}
                        >
                          {option.correct ? <AiFillCheckCircle fontSize={31} color='logoGreen' /> : <AiOutlineCloseCircle fontSize={31} color='gray' />}
                        </div>
                        {/* <p>{optionIndex + 1 + '. '}</p> */}
                        <p className='text-base sm:text-lg p-2'>{option.optionDesc}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full p-5 flex gap-3 items-center justify-center">
                <AiFillCheckCircle fontSize={52} color='green' />
                <p className='text-3xl'>Answered</p>
              </div>
            )}
          </div>
        ))}
      </div>)}
    </>
  )
}

export default PlayQuiz