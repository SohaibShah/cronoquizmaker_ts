import { collection, doc, getDoc, query, where } from 'firebase/firestore'
import React, { useState, useEffect } from 'react'
import { BsFillEmojiDizzyFill } from 'react-icons/bs'
import { useParams } from 'react-router-dom'
import { collections, db } from '../firebase'
import AppUser from '../models/AppUser'
import { QuizModel } from '../models/QuizModel'
import { fetchUser } from '../utils/fetchUser'
import Spinner from './Spinner'

const QuizDetail = () => {
  const user: AppUser | undefined = fetchUser()

  const { quizId } = useParams()

  const [quizzes, setQuizzes] = useState<QuizModel[] | undefined>()
  const [quizDetail, setQuizDetail] = useState<QuizModel | undefined>()

  const [loading, setLoading] = useState(false)
  const [invalidQuiz, setinvalidQuiz] = useState(false)

  useEffect(() => {
    fetchQuizDetail()
  }, [quizId])


  const fetchQuizDetail = async () => {
    if (quizId) {
      setLoading(true)
      const obtainedDoc = await getDoc(doc(db, collections.quiz, quizId))
      if (obtainedDoc && obtainedDoc.data()) {
        setQuizDetail(obtainedDoc.data() as QuizModel)
      } else {
        setinvalidQuiz(true)
      }
    } else {
      setinvalidQuiz(true)
    }
    setLoading(false)
  }

  if (loading) return <Spinner />


  if (invalidQuiz) return (
    <div className="flex flex-col gap-5 w-full h-full items-center justify-center" style={{ height: `100%` }}>
      <BsFillEmojiDizzyFill fontSize={80} color='gray' />
      <h2 className='font-bold text-lg text-gray-500'>I couldn't find this quiz... I looked everywhere, but just couldn't. I swear I'm not crazy!</h2>
    </div>
  )

  return (
    <div>
      {JSON.stringify(quizDetail)}
    </div>
  )
}

export default QuizDetail