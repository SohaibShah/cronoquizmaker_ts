import React, { useEffect, useState } from 'react'
import { AiOutlineCloudUpload, AiFillCheckCircle, AiOutlineCloseCircle, AiFillDelete } from 'react-icons/ai'
import { IoIosAddCircle } from 'react-icons/io'
import { MdDelete } from 'react-icons/md'
import { useNavigate, useParams } from 'react-router-dom'
import AppUser from '../models/AppUser'
import { QuestionModel, QuizModel, OptionModel } from '../models/QuizModel'
import Spinner from './Spinner'

import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { createOrUpdateAndPublishQuiz, createOrUpdateDraftQuiz, getPublishedQuiz, getDraftQuiz, auth } from '../firebase'
import { BsFillEmojiDizzyFill, BsFillFileEarmarkLock2Fill } from 'react-icons/bs'

const PlayQuiz = () => {

  const user = auth.currentUser

  const [loading, setLoading] = useState(false)
  const [quizExits, setQuizExists] = useState(true)

  const [quizId, setQuizId] = useState('')

  const [title, setTitle] = useState<string>('')
  const [desc, setDesc] = useState<string>('')

  const [total, setTotal] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [unattempted, setUnattempted] = useState(0)


  const [questions, setQuestions] = useState<QuestionModel[]>([{
    question: '',
    answered: false,
    options: [{
      optionDesc: '',
      correct: true
    }] as OptionModel[]
  } as QuestionModel])

  const [targetQuestions, setTargetQuestions] = useState<QuestionModel[]>([{
    question: '',
    answered: false,
    options: [{
      optionDesc: '',
      correct: true
    }] as OptionModel[]
  } as QuestionModel])

  useEffect(() => {
    let answered = 0
    questions.forEach((question, index) => {
      if (question.answered) {
        answered++
      }
    })
    if (answered === questions.length) {
      setOnResultsPage(true)
    }
  }, [questions])


  const [onResultsPage, setOnResultsPage] = useState(false)

  const param = useParams()

  const navigate = useNavigate()

  useEffect(() => {
    console.log(`params: ${JSON.stringify(param)}`)
    if (param.quizId) {
      setLoading(true)
      getQuiz()
    } else if (param.privateQuizId) {
      setLoading(true)
      getQuiz()
    }
  }, [])

  const getQuiz = async () => {
    if (param.quizId) {
      const quiz = await getPublishedQuiz(param.quizId)
      if (quiz) {
        setQuizId(quiz.quizId)
        setTitle(quiz.quizTitle)
        setDesc(quiz.quizDesc)
        setQuestions(quiz.questions)
        const newQuestions = quiz.questions
        setTotal(newQuestions.length)
        newQuestions.forEach((question, index) => {
          newQuestions[index].options.forEach((option, optionIndex) => {
            newQuestions[index].options[optionIndex].correct = false
          })
        })
        setQuestions(newQuestions)
        setTargetQuestions(quiz.questions)
        setLoading(false)
      } else {
        setQuizExists(false)
        setLoading(false)
      }
    } else if (param.privateQuizId) {
      const quiz = await getDraftQuiz(param.privateQuizId)
      if (quiz) {
        setQuizId(quiz.quizId)
        setTitle(quiz.quizTitle)
        setDesc(quiz.quizDesc)
        setQuestions(quiz.questions)
        const newQuestions = quiz.questions
        setTotal(newQuestions.length)
        newQuestions.forEach((question, index) => {
          newQuestions[index].options.forEach((option, optionIndex) => {
            newQuestions[index].options[optionIndex].correct = false
          })
        })
        setQuestions(newQuestions)
        setTargetQuestions(quiz.questions)
        setLoading(false)
      } else {
        setQuizExists(false)
        setLoading(false)
      }
    }
  }

  if (loading) return <Spinner />

  if (!quizExits) return (
    <div className="flex flex-col gap-5 w-full h-full items-center justify-center" style={{ height: `100%` }}>
      <BsFillEmojiDizzyFill fontSize={80} color='gray' />
      <h2 className='font-bold text-lg text-gray-500'>This Quiz does not exist</h2>
    </div>
  )

  return (
    <>
    {onResultsPage ? (
      <div className="flex gap-3 flex-col justify-center items-center mt-5 lg:4/5">
        <h1 className="font-bold text-3xl font-blackmt-3 w-full lg:w-4/5">Results</h1>
      </div>
    ) : (<div className="flex gap-3 flex-col justify-center items-center mt-5 lg:4/5">

      {questions.length > 0 && <h1 className="font-bold text-3xl font-black mt-3 w-full lg:w-4/5">Questions</h1>}

      {questions.map((question, questionIndex) => (
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
          ): (
            <div className="w-full p-5 flex gap-3 items-center justify-center">
              <AiFillCheckCircle fontSize={52} color='green'/>
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