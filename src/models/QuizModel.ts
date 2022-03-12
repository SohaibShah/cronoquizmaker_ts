import { FieldValue } from 'firebase/firestore'
import AppUser from './AppUser'

export interface OptionModel {
    optionDesc: string;
    correct: boolean;
}

export interface QuestionModel {
    question: string;
    answered: boolean;
    options: OptionModel[]
}

export interface QuizModel {
    quizId: string, 
    quizTitle: string,
    quizDesc: string, 
    quizImageUrl: string,
    private: boolean,
    creatorUid: string,
    createdAt: FieldValue,
    keywords: string[],
    questions: QuestionModel[]
    save: string[]
}