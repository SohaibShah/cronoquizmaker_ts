import { FieldValue } from 'firebase/firestore'

interface AppUser {
    uid: string,
    name: string | null,
    email: string | null,
    photoImgUrl?: string | null,
    dateAccCreated: FieldValue,
    publishedQuizzes: string[],
    savedQuizzes?: string[]
}

export default AppUser;