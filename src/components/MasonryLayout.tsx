import React from 'react'
import Masonry from 'react-masonry-css'
import { QuizModel } from '../models/QuizModel';
import Quiz from './Quiz';

const breakpointObj = {
  default: 4,
  3000: 6,
  2000: 5,
  1200: 3,
  1000: 2,
  500: 1
}

export interface MasonryLayoutProps {
  quizzes: QuizModel[] | null | undefined
}

const MasonryLayout = ({ quizzes }: MasonryLayoutProps) => {
  return (
    <Masonry
      className='flex animate-slide-fwd'
      breakpointCols={breakpointObj}
    >
      {quizzes?.map((quiz) => <Quiz key={quiz.quizId} quiz={quiz} />)}
    </Masonry>
  )
}

export default MasonryLayout