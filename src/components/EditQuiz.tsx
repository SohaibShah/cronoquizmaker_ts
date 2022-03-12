import React, { useEffect, useState } from 'react'
import { AiOutlineCloudUpload, AiFillCheckCircle, AiOutlineCloseCircle, AiFillDelete } from 'react-icons/ai'
import { IoIosAddCircle } from 'react-icons/io'
import { MdDelete } from 'react-icons/md'
import { useNavigate, useParams } from 'react-router-dom'
import AppUser from '../models/AppUser'
import { QuestionModel, QuizModel, OptionModel } from '../models/QuizModel'
import Spinner from './Spinner'

import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { createOrUpdateAndPublishQuiz, createOrUpdateDraftQuiz, getPublishedQuiz, getDraftQuiz } from '../firebase'
import { BsFillEmojiDizzyFill, BsFillFileEarmarkLock2Fill } from 'react-icons/bs'

export interface EditQuizProps {
  user: AppUser | void
}

const EditQuiz = ({ user }: EditQuizProps) => {

  const [imageLoading, setImageLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [allowed, setAllowed] = useState(true)
  const [quizExits, setQuizExists] = useState(true)

  const [quizId, setQuizId] = useState('')

  const [title, setTitle] = useState<string>('')
  const [desc, setDesc] = useState<string>('')

  const [keywords, setKeywords] = useState<string[]>([])

  const [questions, setQuestions] = useState<QuestionModel[]>([{
    question: '',
    answered: false,
    options: [{
      optionDesc: '',
      correct: true
    }] as OptionModel[]
  } as QuestionModel])

  const [imageAsset, setImageAsset] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')

  const [existingImageUrl, setExistingImageUrl] = useState('')

  const [wrongImageType, setWrongImageType] = useState(false)
  const [fields, setFields] = useState(false)

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
        setKeywords(quiz.keywords)
        setQuestions(quiz.questions)
        setExistingImageUrl(quiz.quizImageUrl)
        setLoading(false)
        setAllowed(quiz.creatorUid === user?.uid)
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
        setKeywords(quiz.keywords)
        setQuestions(quiz.questions)
        setExistingImageUrl(quiz.quizImageUrl)
        setLoading(false)
        setAllowed(quiz.creatorUid === user?.uid)
      } else {
        setQuizExists(false)
        setLoading(false)
      }
    }
  }

  const saveAndPublishQuiz = async () => {
    if (title !== '' && desc !== '' && keywords.length > 0 && questions.length > 0 && (imageAsset !== null || existingImageUrl !== '')) {
      if (imageAsset) {
        const { type, name } = imageAsset

        if (type === 'image/png' || type === 'image/svg' || type === 'image/jpeg' || type === 'image/gif' || type === 'image/tiff' || type === 'image/jpeg') {
          setWrongImageType(false)
          setLoading(true)
          if (quizId) {
            await createOrUpdateAndPublishQuiz(title, desc, keywords, questions, undefined, quizId, imageAsset).then((quiz) => {
              navigate(`/quiz-detail/${quiz.quizId}`)
            })
          } else {
            await createOrUpdateAndPublishQuiz(title, desc, keywords, questions, undefined, undefined, imageAsset).then((quiz) => {
              navigate(`/quiz-detail/${quiz.quizId}`)
            })
          }
        } else {
          setWrongImageType(true)
          return;
        }
      } else if (existingImageUrl) {
        setLoading(true)
        if (quizId) {
          await createOrUpdateAndPublishQuiz(title, desc, keywords, questions, existingImageUrl, quizId, undefined).then((quiz) => {
            navigate(`/quiz-detail/${quiz.quizId}`)
          })
        } else {
          await createOrUpdateAndPublishQuiz(title, desc, keywords, questions, existingImageUrl, undefined, undefined).then((quiz) => {
            navigate(`/quiz-detail/${quiz.quizId}`)
          })
        }
      }
    } else {
      setFields(true)
      setTimeout(() => {
        setFields(false)
      }, 5000)
    }
  }

  const saveAsPrivateQuiz = async () => {
    if (title !== '' && desc !== '' && keywords.length > 0 && questions.length > 0 && (imageAsset !== null || existingImageUrl !== '')) {
      if (imageAsset) {
        const { type, name } = imageAsset

        if (type === 'image/png' || type === 'image/svg' || type === 'image/jpeg' || type === 'image/gif' || type === 'image/tiff' || type === 'image/jpeg') {
          setWrongImageType(false)
          setLoading(true)
          if (quizId) {
            await createOrUpdateDraftQuiz(title, desc, keywords, questions, undefined, quizId, imageAsset).then((quiz) => {
              navigate(`/quiz-detail/private/${quiz.quizId}`)
            })
          } else {
            await createOrUpdateDraftQuiz(title, desc, keywords, questions, undefined, undefined, imageAsset).then((quiz) => {
              navigate(`/quiz-detail/private/${quiz.quizId}`)
            })
          }
        } else {
          setWrongImageType(true)
          return;
        }
      } else if (existingImageUrl) {
        setLoading(true)
        if (quizId) {
          await createOrUpdateDraftQuiz(title, desc, keywords, questions, existingImageUrl, quizId, undefined).then((quiz) => {
            navigate(`/quiz-detail/private/${quiz.quizId}`)
          })
        } else {
          await createOrUpdateDraftQuiz(title, desc, keywords, questions, existingImageUrl, undefined, undefined).then((quiz) => {
            navigate(`/quiz-detail/private/${quiz.quizId}`)
          })
        }
      }
    } else {
      setFields(true)
      setTimeout(() => {
        setFields(false)
      }, 5000)
    }
  }

  if (loading) return <Spinner />
  if (!allowed) return (
    <div className="flex flex-col gap-5 w-full h-full items-center justify-center" style={{ height: `100%` }}>
      <BsFillFileEarmarkLock2Fill fontSize={80} color='gray' />
      <h2 className='font-bold text-lg text-gray-500'>You're not allowed to accces this Quiz</h2>
    </div>
  )

  if (!quizExits) return (
    <div className="flex flex-col gap-5 w-full h-full items-center justify-center" style={{ height: `100%` }}>
      <BsFillEmojiDizzyFill fontSize={80} color='gray' />
      <h2 className='font-bold text-lg text-gray-500'>This Quiz does not exist</h2>
    </div>
  )

  return (
    <div className="flex gap-3 flex-col justify-center items-center mt-5 lg:4/5">
      {fields && (
        <p className="text-red-500 mb-5 text-xl transition-all duration-150 ease-in">
          Please fill in all the fields
        </p>
      )}

      <h1 className="font-bold text-3xl font-black mt-3 w-full lg:w-4/5">General Information</h1>

      <div className="flex lg:flex-row flex-col justify-center items-center bg-white lg-p-5 p-3 lg:w-4/5 w-full rounded-lg shadow-md">
        <div className="bg-secondaryColor p-3 flex-0.7 w-full rounded-lg">
          <div className="flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-420 rounded-lg">
            {imageLoading && <Spinner />}
            {wrongImageType && (
              <p className="text-red-500">Wrong image type. Please upload an image.</p>
            )}
            {!imageAsset && !imageUrl && !existingImageUrl ? (
              <div className='flex flex-col h-full items-center justify-center'>
                <label>
                  <div className="flex flex-col items-center justify-center flex-1">
                    <div className="flex flex-col justify-center items-center">
                      <p className="font-bold text-2xl">
                        <AiOutlineCloudUpload />
                      </p>
                      <p className="text-lg">Click to Upload</p>
                    </div>
                    <p className="mt-32 text-gray-400 text-center">
                      Use high-quality JPG, SVG, PNG, or GIF less than 20 MB.
                    </p>
                  </div>
                  <input
                    type="file"
                    name='upload-image'
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const { type, name } = e.target.files[0]
                        if (type === 'image/png' || type === 'image/svg+xml' || type === 'image/jpeg' || type === 'image/gif' || type === 'image/tiff' || type === 'image/jpeg') {
                          if (existingImageUrl) setExistingImageUrl('')
                          setWrongImageType(false)
                          setImageAsset(e.target.files[0]);
                          setImageUrl(URL.createObjectURL(e.target.files[0]))

                        } else {
                          setWrongImageType(true)
                          setTimeout(() => setWrongImageType(false), 5000)
                        }
                      }
                    }}
                    className="w-0 h-0"
                  />
                </label>
                <div className="flex gap-2 flex-col items-center justify-center h-full flex-1">
                  <p>OR</p>
                  <input type="text"
                    value={imageUrl}
                    onChange={e => { setExistingImageUrl(e.target.value) }}
                    placeholder="Paste an image URL"
                    className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
                  />
                </div>
              </div>
            ) : (
              <div className="relative h-full">
                <img src={existingImageUrl ? existingImageUrl : imageUrl} alt="uploaded-pic" className="h-full w-full rounded-lg" />
                <button
                  type='button'
                  className="absolute bottom-3 right-3 p-3 rounded-full bg-white text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                  onClick={() => { setImageAsset(null); setImageUrl(''); setExistingImageUrl('') }}
                >
                  <MdDelete />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Add your title"
            className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2"
          />
          {user && (
            <div className="flex gap-2 my-2 items-center bg-white rounded-lg">
              {user.photoImgUrl && <img src={user.photoImgUrl} className="w-10 h-10 rounded-full bg-white" />}
              <p className="font-bold">{user.name}</p>
            </div>
          )}
          <input type="text"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="What is your quiz about?"
            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
          />
          <input
            type="text"
            value={keywords.map(val => val !== '' ? " #" + val : '')}
            onChange={(e) => { keywords.length <= 9 || [...e.target.value.split(',').map((val) => val.trim().replaceAll('#', '').toLowerCase())].length <= keywords.length ? setKeywords([...e.target.value.split(',').map((val) => val.trim().replaceAll('#', '').toLowerCase())]) : setKeywords(keywords) }}
            placeholder="Add tags (seperated by commas, max. 10)"
            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
          />
        </div>
      </div>

      {questions.length > 0 && <h1 className="font-bold text-3xl font-black mt-3 w-full lg:w-4/5">Questions</h1>}

      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="gap-3 flex flex-col justify-center items-center bg-white lg-p-5 p-3 lg:w-4/5 w-full rounded-lg shadow-md">
          <div className="flex w-full items-center">
            <p className=" text-2xl font-bold">{questionIndex + 1 + '. '}</p>
            <input
              type="text"
              value={question.question}
              onChange={e => {
                let newQuestions = [...questions]
                newQuestions[questionIndex].question = e.target.value;

                setQuestions(newQuestions)
              }}
              placeholder="Add your question"
              className="w-full outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2"
            />
          </div>
          <div className="gap-3 w-full">
            {question.options.map((option, optionIndex) => {
              return (
                <div key={optionIndex} className="flex w-full items-center">
                  <div
                    className='m-2 rounded-full cursor-pointer'
                    onClick={() => {
                      let newQuestions = [...questions]
                      newQuestions[questionIndex].options[optionIndex].correct = !option.correct;

                      setQuestions(newQuestions)
                    }}
                  >
                    {option.correct ? <AiFillCheckCircle fontSize={31} color='logoGreen' /> : <AiOutlineCloseCircle fontSize={31} color='gray' />}
                  </div>
                  {/* <p>{optionIndex + 1 + '. '}</p> */}
                  <input type="text"
                    value={option.optionDesc}
                    onChange={e => {
                      let newQuestions = [...questions]
                      newQuestions[questionIndex].options[optionIndex].optionDesc = e.target.value;

                      setQuestions(newQuestions)
                    }}
                    placeholder="Option text..."
                    className="outline-none flex-1 text-base sm:text-lg border-b-2 border-gray-200 p-2"
                  />
                  <AiFillDelete color='red' fontSize={31} className="m-2 cursor-pointer" onClick={() => {
                    let newQuestions = [...questions]
                    newQuestions[questionIndex].options.splice(optionIndex, 1)

                    setQuestions(newQuestions)
                  }} />
                </div>
              )
            })}
          </div>
          <div className="flex w-full items-center justify-between my-5">
            <button
              type='button'
              onClick={() => {
                let newQuestions = [...questions]
                newQuestions.splice(questionIndex, 1)

                setQuestions(newQuestions)
              }}
              className="bg-red-500 text-white text-lg p-2 px-3 rounded-full outline-none"
            >
              Delete Question
            </button>
            <button
              type='button'
              onClick={() => {
                let newQuestions = [...questions]
                newQuestions[questionIndex].options.push({
                  optionDesc: '',
                  correct: false
                } as OptionModel)

                setQuestions(newQuestions)
              }}
              className="bg-logoBlue text-white text-lg p-2 px-3 rounded-full outline-none"
            >
              Add Option
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center mt-5 w-full lg:w-4/5">
        <div className="flex justify-center gap-4">
          <button
            type='button'
            onClick={saveAndPublishQuiz}
            className="bg-logoGreen text-black text-xl font-bold p-3 px-4 rounded-full outline-none"
          >
            Save And Publish Quiz
          </button>
          <button
            type='button'
            onClick={saveAsPrivateQuiz}
            className="bg-black text-white text-xl font-bold p-3 px-4 rounded-full outline-none"
          >
            Save As Private Quiz
          </button>
        </div>

        <button
          type='button'
          onClick={() => {
            let newQuestions = [...questions]
            newQuestions.push({
              question: '',
              answered: false,
              options: [{
                optionDesc: '',
                correct: true
              }] as OptionModel[]
            } as QuestionModel)

            setQuestions(newQuestions)
          }}
          className="bg-logoBlue text-white text-xl font-bold p-3 px-4 rounded-full outline-none"
        >
          Add Question
        </button>
      </div>
    </div>
  )
}

export default EditQuiz