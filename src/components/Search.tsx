import { collection, getDocs, query, where } from 'firebase/firestore'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collections, db } from '../firebase'
import { QuizModel } from '../models/QuizModel'
import Feed from './Feed'

import MasonryLayout from './MasonryLayout'
import Spinner from './Spinner'

export interface SearchProps {
    searchTerm: string
}

const Search = ({ searchTerm }: SearchProps) => {

    const [quizzes, setQuizzes] = useState<QuizModel[]>()
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        if (searchTerm && searchTerm.length > 0) {
            setLoading(true)
            getSearchResults()
        } else {
            setQuizzes(undefined)
        }
    }, [searchTerm])

    const getSearchResults = async () => {
        const myQuery = query(collection(db, collections.quiz), where('keywords', 'array-contains', `${searchTerm}`))

        const qDoc = await getDocs(myQuery)

        const quizList: QuizModel[] = []

        if (qDoc.docs) {
            qDoc.docs.forEach((doc) => {
                quizList.push(doc.data() as QuizModel)
            })
        }

        setQuizzes(quizList)
        setLoading(false)
    }

    return (
        <div>
            {loading && <Spinner message="Searching..." />}
            {quizzes?.length !== 0 && !loading && <MasonryLayout quizzes={quizzes} />}
            {quizzes?.length == 0 && searchTerm !== '' && !loading && (<div className='mt-10 text-center text-xl'>
                {`No Quizzes Found :-(`}
            </div>)}

            {searchTerm.length == 0 && <Feed />}

        </div>
    )
}

export default Search