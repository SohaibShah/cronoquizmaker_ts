import React, { useState } from 'react'
import { Routes, Route, } from 'react-router-dom'

import { Feed, QuizDetail, EditQuiz } from '../components'
import Navbar from '../components/Navbar'
import PlayQuiz from '../components/PlayQuiz'
import AppUser from '../models/AppUser'

export interface QuizzesProps {
  user: AppUser | void;
}

export const Quizzes = ({ user }: QuizzesProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  return (
    <div className="px-2 md:px-5">
      <div className="bg-gray-50">
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} user={user} />
      </div>
      <div className="h-full">
        <Routes>
          <Route path='/' element={<Feed />} />
          <Route path='/category/:categoryId' element={<Feed />} />
          <Route path='/quiz-detail/:quizId' element={<QuizDetail />} />
          <Route path='/quiz-detail/private/:privateQuizId' element={<QuizDetail />} />
          <Route path='/edit-quiz' element={<EditQuiz user={user && user}/>} />
          <Route path='/edit-quiz/:quizId' element={<EditQuiz user={user && user} />} />
          <Route path='/edit-quiz/private' element={<EditQuiz user={user && user} />} />
          <Route path='/edit-quiz/private/:privateQuizId' element={<EditQuiz user={user && user} />} />
          
          {/* <Route path='/search' element={<Search searchTerm={searchTerm} />} /> */}
        </Routes>
      </div>
    </div>
  )
}
