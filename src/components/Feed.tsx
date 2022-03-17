import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useCollectionData } from 'react-firebase-hooks/firestore'


import { QuizModel } from '../models/QuizModel'

import { db, collections } from '../firebase'
import Spinner from './Spinner'
import MasonryLayout from './MasonryLayout'
import { collection, orderBy, query, where } from 'firebase/firestore'

import {FaRegSadTear} from 'react-icons/fa'

const Feed = () => {

  // const [loading, setLoading] = useState(false)
  const [quizzes, setQuizzes] = useState<QuizModel[] | null>(null)
  const { categoryId } = useParams<string>()

  // var myQ = categoryId !== undefined && categoryId !== null && categoryId !== '' ? query(collection(db, collections.quiz), where('keywords', 'array-contains', categoryId), orderBy('createdAt', 'desc')) : query(collection(db, collections.quiz), orderBy("createdAt", 'desc'))

  const [feedQuery, setFeedQuery] = useState(query(collection(db, collections.quiz), orderBy("createdAt", 'desc')))
  var [feedValue, feedLoading, error, feedSnapshot] = useCollectionData(feedQuery)

  useEffect(() => {
    if (categoryId) {
      setFeedQuery(query(collection(db, collections.quiz), where('keywords', 'array-contains', categoryId.toLowerCase()), orderBy('createdAt', 'desc')))
    }
    if (!categoryId) {
      setFeedQuery(query(collection(db, collections.quiz), orderBy("createdAt", 'desc')))
    }
  }, [categoryId])

  useEffect(() => {
    if (error) {
      console.warn(error.message)
    }
  }, [error])

  useEffect(() => {
    if (feedValue && feedValue.length > 0) {
      // setLoading(true)
      const quizzesList: QuizModel[] = []
      feedValue.map((quiz) => {
        quizzesList.push(quiz as QuizModel)
      })
      setQuizzes(quizzesList)
      // setLoading(false)
    } else {
      setQuizzes([])
    }
  }, [feedValue])


  if (feedLoading) {
    return (
      <Spinner message="Loading... Get Ready!" />
    )
  }

  if (!(quizzes?.length)) return (
    <div className="flex flex-col gap-5 w-full h-full items-center justify-center" style={{height: `100%`}}>
      <FaRegSadTear fontSize={80} color='gray' />
      <h2 className='font-bold text-lg text-gray-500'>No Quizzes Available</h2>
    </div>
  )


  return (
    <div>{quizzes && <MasonryLayout quizzes={quizzes} />}</div>
  )
}

export default Feed