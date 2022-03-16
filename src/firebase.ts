import { initializeApp } from 'firebase/app'
import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signInWithRedirect,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    User,
    getRedirectResult,
    onAuthStateChanged
} from 'firebase/auth'
import {
    getFirestore,
    query,
    getDocs,
    collection,
    where,
    addDoc,
    serverTimestamp,
    setDoc,
    doc,
    orderBy,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    FieldValue,
    deleteDoc,
    FirestoreSettings
} from 'firebase/firestore'
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage'

import { v4 as uuidv4 } from 'uuid'


import AppUser from './models/AppUser';
import { LeaderboardModel, QuestionModel, QuizModel } from './models/QuizModel';

const firebaseConfig = {
    apiKey: "AIzaSyCsXAlktZSjRyTkRwDjy0qiSWt-2GiNm9c",
    authDomain: "quizmaker-9c6c8.firebaseapp.com",
    projectId: "quizmaker-9c6c8",
    storageBucket: "quizmaker-9c6c8.appspot.com",
    messagingSenderId: "418338336517",
    appId: "1:418338336517:web:e004438d2299c13cdf516c",
    measurementId: "G-NYC75W3DK3"
}

const collections = {
    users: "Users",
    quiz: "Quiz",
    draftQuizzes: "DraftQuizzes",
    data: "Data",
    leaderboard: "Leaderboard"
}

const getUserFromId = async (uid: string): Promise<AppUser | null> => {
    const userQuery = query(collection(db, collections.users), where("uid", "==", uid))
    const userDocs = await getDocs(userQuery)

    if (userDocs.docs.length > 0) {
        return userDocs.docs[0].data() as AppUser
    }

    return null
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app)

const googleProvider = new GoogleAuthProvider()

const logInWithGoogle = async () => {
    try {
        await signInWithRedirect(auth, googleProvider)
    } catch (error: any) {
        console.log(JSON.stringify(error));
        return (error.message as string).slice(22, -2).replaceAll("-", " ").toUpperCase();
    }
}

const logInWithEmailAndPassword = async (email: string, password: string) => {
    try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const user = res.user;
        // console.log(`USER: ${JSON.stringify(user)}`)
        const checkIfUserUidExistsQ = query(collection(db, collections.users), where("uid", "==", user?.uid))
        const uidDocs = await getDocs(checkIfUserUidExistsQ)
        if (uidDocs.docs.length > 0) {
            const appUserData = uidDocs.docs[0].data() as AppUser
            const appUser: AppUser = {
                uid: user.uid,
                name: appUserData.name ? appUserData.name : user.displayName ? user.displayName : null,
                email: user.email,
                photoImgUrl: appUserData.photoImgUrl ? appUserData.photoImgUrl : user.photoURL ? user.photoURL : null,
                dateAccCreated: serverTimestamp(),
                publishedQuizzes: []
            }
            localStorage.setItem('user', JSON.stringify(appUser))
        }

    } catch (error: any) {
        console.log(error)
        return (error.message as string).slice(22, -2).replaceAll("-", " ").toUpperCase();
    }
}

const registerWithEmailAndPassword = async (email: string, password: string, name: string) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

        const appUser: AppUser = {
            uid: user.uid,
            name: name,
            email: user.email,
            dateAccCreated: serverTimestamp(),
            publishedQuizzes: []
        }
        localStorage.setItem('user', JSON.stringify(appUser))
        await setDoc(doc(db, collections.users, user.uid), appUser)
        return "Created User Successfully"
    } catch (error: any) {
        console.log(error);
        return (error.message as string).slice(22, -2).replaceAll("-", " ").toUpperCase();
    }
}

const sendPasswordReset = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email)
        return "Password Reset Email Sent!"
    } catch (error: any) {
        console.log(error)
        return (error.message as string).slice(22, -2).replaceAll("-", " ").toUpperCase();
    }
}

const logOut = async () => {
    return await signOut(auth).then(() => {
        localStorage.removeItem('user')
    })
}

const getPublishedQuiz = async (quizId: string): Promise<QuizModel | null> => {
    const feedQ = doc(db, `${collections.quiz}/${quizId}`)
    try {
        const quizDoc = await getDoc(feedQ)

        if (quizDoc.data()) {
            return quizDoc.data() as QuizModel
        }
    } catch (e: any) {
        console.warn(e.message)
    }
    return null
}

const getDraftQuiz = async (quizId: string): Promise<QuizModel | null> => {
    const feedQ = doc(db, `${collections.users}/${auth.currentUser?.uid}/DraftQuizzes/${quizId}`)
    try {
        const quizDoc = await getDoc(feedQ)

        if (quizDoc.data()) {
            return quizDoc.data() as QuizModel
        }
    } catch (e: any) {
        console.warn(e.message)
    }
    return null
}

const createOrUpdateAndPublishQuiz = async (title: string, desc: string, keywords: string[], questions: QuestionModel[], imageUrl?: string, id?: string, imageFile?: File) => {

    var uid = id !== undefined ? id : uuidv4();
    var uploadedImageUrl = imageUrl !== undefined ? imageUrl : `https://via.placeholder.com/500x1000?text=${title}`

    const draftQuiz = await getDraftQuiz(uid)
    if (draftQuiz) {
        if (imageUrl && imageUrl.includes(`firebasestorage.googleapis.com/v0/b/quizmaker-9c6c8.appspot.com`)) {
            await deleteDraftQuizWithoutDeletingImage(draftQuiz)
            uid = uuidv4()
        } else {
            await deleteDraftQuiz(draftQuiz)
            uid = uuidv4()
        }
    }

    if (imageFile && imageUrl === undefined) {
        const imageRef = ref(storage, `images/quizzes/${uid}`)
        const uploadTask = await uploadBytes(imageRef, imageFile)
        uploadedImageUrl = await getDownloadURL(uploadTask.ref)
    }

    const quiz: QuizModel = {
        quizId: uid,
        quizTitle: title,
        quizDesc: desc,
        quizImageUrl: uploadedImageUrl,
        private: false,
        creatorUid: auth.currentUser?.uid ?? 'undefined',
        createdAt: serverTimestamp(),
        keywords: keywords,
        questions: questions,
        save: []
    }

    await setDoc(doc(db, collections.quiz, quiz.quizId), quiz)
        .then(async (ref) => {
            await updateDoc(doc(collection(db, collections.users), auth.currentUser?.uid), {
                publishedQuizzes: arrayUnion(...[quiz.quizId])
            })
        })
    return quiz
}

const createOrUpdateDraftQuiz = async (title: string, desc: string, keywords: string[], questions: QuestionModel[], imageUrl?: string, id?: string, imageFile?: File) => {

    var uid: string = id !== undefined ? id : uuidv4();
    var uploadedImageUrl = imageUrl !== undefined ? imageUrl : `https://via.placeholder.com/500x1000?text=${title}`

    const publishedQuiz = await getPublishedQuiz(uid)
    if (publishedQuiz) {
        if (imageUrl && imageUrl.includes(`firebasestorage.googleapis.com/v0/b/quizmaker-9c6c8.appspot.com`)) {
            await deletePublishedQuizWithoutDeletingImage(publishedQuiz)
            uid = uuidv4()
        } else {
            await deletePublishedQuiz(publishedQuiz)
            uid = uuidv4()
        }
    }

    if (imageFile && imageUrl === undefined) {
        const imageRef = ref(storage, `images/quizzes/drafts/${auth.currentUser?.uid}/${uid}`)
        const uploadTask = await uploadBytes(imageRef, imageFile)
        uploadedImageUrl = await getDownloadURL(uploadTask.ref)
    }

    const quiz: QuizModel = {
        quizId: uid,
        quizTitle: title,
        quizDesc: desc,
        quizImageUrl: uploadedImageUrl,
        private: true,
        creatorUid: auth.currentUser?.uid ?? 'undefined',
        createdAt: serverTimestamp(),
        keywords: keywords,
        questions: questions,
        save: []
    }

    await setDoc(doc(db, `${collections.users}/${auth.currentUser?.uid}/${collections.draftQuizzes}`, quiz.quizId), quiz)

    return quiz
}

const deletePublishedQuiz = async (quiz: QuizModel) => {
    await deleteDoc(doc(db, `${collections.quiz}/${quiz.quizId}`)).then(async (ref) => {
        await updateDoc(doc(collection(db, collections.users), auth.currentUser?.uid), {
            publishedQuizzes: arrayRemove(quiz.quizId)
        })
        const searchQuery = query(collection(db, collections.users), where('savedQuizzes', 'array-contains', quiz.quizId))
        const docs = await getDocs(searchQuery)
        docs.forEach(async (doc) => {
            await updateDoc(doc.ref, {
                savedQuizzes: arrayRemove(quiz.quizId)
            })
        })
    })

    const imageRef = ref(storage, `images/quizzes/${quiz.quizId}`)
    await deleteObject(imageRef)
}

const deletePublishedQuizWithoutDeletingImage = async (quiz: QuizModel) => {
    await deleteDoc(doc(db, `${collections.quiz}/${quiz.quizId}`)).then(async (ref) => {
        await updateDoc(doc(collection(db, collections.users), auth.currentUser?.uid), {
            publishedQuizzes: arrayRemove(quiz.quizId)
        })
        const searchQuery = query(collection(db, collections.users), where('savedQuizzes', 'array-contains', quiz.quizId))
        const docs = await getDocs(searchQuery)
        docs.forEach(async (doc) => {
            await updateDoc(doc.ref, {
                savedQuizzes: arrayRemove(quiz.quizId)
            })
        })
    })
}

const deleteDraftQuiz = async (quiz: QuizModel) => {
    await deleteDoc(doc(db, `${collections.users}/${auth.currentUser?.uid}/DraftQuizzes/${quiz.quizId}`)).then(async () => {
        const searchQuery = query(collection(db, collections.users), where('savedQuizzes', 'array-contains', quiz.quizId))
        const docs = await getDocs(searchQuery)
        docs.forEach(async (doc) => {
            await updateDoc(doc.ref, {
                savedQuizzes: arrayRemove(quiz.quizId)
            })
        })
    })

    const imageRef = ref(storage, `images/quizzes/drafts/${auth.currentUser?.uid}/${quiz.quizId}`)
    await deleteObject(imageRef)
}

const deleteDraftQuizWithoutDeletingImage = async (quiz: QuizModel) => {
    await deleteDoc(doc(db, `${collections.users}/${auth.currentUser?.uid}/DraftQuizzes/${quiz.quizId}`)).then(async () => {
        const searchQuery = query(collection(db, collections.users), where('savedQuizzes', 'array-contains', quiz.quizId))
        const docs = await getDocs(searchQuery)
        docs.forEach(async (doc) => {
            await updateDoc(doc.ref, {
                savedQuizzes: arrayRemove(quiz.quizId)
            })
        })
    })
}

const saveQuiz = async (quiz: QuizModel) => {
    if (!quiz.private) {
        await updateDoc(doc(collection(db, collections.quiz), quiz.quizId), {
            save: arrayUnion(auth.currentUser?.uid)
        }).then(async () => {
            await updateDoc(doc(collection(db, collections.users), auth.currentUser?.uid), {
                savedQuizzes: arrayUnion(quiz.quizId)
            })
        })
    } else {
        await updateDoc(doc(collection(db, `${collections.users}/${quiz.creatorUid}/DraftQuizzes`), quiz.quizId), {
            save: arrayUnion(auth.currentUser?.uid)
        }).then(async () => {
            await updateDoc(doc(collection(db, collections.users), auth.currentUser?.uid), {
                savedQuizzes: arrayUnion(quiz.quizId)
            })
        })
    }
}

const unsaveQuiz = async (quiz: QuizModel) => {
    if (!quiz.private) {
        await updateDoc(doc(collection(db, collections.quiz), quiz.quizId), {
            save: arrayRemove(auth.currentUser?.uid)
        }).then(async () => {
            await updateDoc(doc(collection(db, collections.users), auth.currentUser?.uid), {
                savedQuizzes: arrayRemove(quiz.quizId)
            })
        })
    } else {
        await updateDoc(doc(collection(db, `${collections.users}/${quiz.creatorUid}/DraftQuizzes`), quiz.quizId), {
            save: arrayRemove(auth.currentUser?.uid)
        }).then(async () => {
            await updateDoc(doc(collection(db, collections.users), auth.currentUser?.uid), {
                savedQuizzes: arrayRemove(quiz.quizId)
            })
        })
    }
}

const updateUser = async (name?: string, imageUrl?: string, imageFile?: File) => {
    if (auth.currentUser) {
        if (name) {
            await updateDoc(doc(db, collections.users, auth.currentUser.uid), {
                name: name
            })
        }

        if (imageUrl) {
            await updateDoc(doc(db, collections.users, auth.currentUser.uid), {
                photoImgUrl: imageUrl
            })
        }

        if (imageFile) {
            const imageStorage = ref(storage, `images/users/${auth.currentUser.uid}`)
            const uploadTask = await uploadBytes(imageStorage, imageFile)
            const downloadUrl = await getDownloadURL(uploadTask.ref)

            await updateDoc(doc(db, collections.users, auth.currentUser.uid), {
                photoImgUrl: downloadUrl
            })
        }
    }
}

const setOrUpdateLeaderboard = async (uid: string, name: string, score: number, quiz: QuizModel) => {
    const lbObj: LeaderboardModel = {
        userId: uid,
        userName: name,
        score: score,
        time: serverTimestamp(),
    }

    if (!quiz.private) {
        await setDoc(doc(db, `${collections.quiz}/${quiz.quizId}/${collections.leaderboard}`, uid), lbObj)
        return;
    } else {
        await setDoc(doc(db, `${collections.users}/${quiz.creatorUid}/${collections.draftQuizzes}/${quiz.quizId}/${collections.leaderboard}`, uid), lbObj)
        return;
    }
}

export {
    collections,
    auth,
    db,
    logInWithGoogle as signInWithGoogle,
    logInWithEmailAndPassword,
    registerWithEmailAndPassword,
    sendPasswordReset,
    logOut,
    getUserFromId,
    getPublishedQuiz,
    getDraftQuiz,
    createOrUpdateAndPublishQuiz,
    createOrUpdateDraftQuiz,
    deletePublishedQuiz,
    deletePublishedQuizWithoutDeletingImage,
    deleteDraftQuiz,
    deleteDraftQuizWithoutDeletingImage,
    saveQuiz,
    unsaveQuiz,
    updateUser,
    setOrUpdateLeaderboard,
}