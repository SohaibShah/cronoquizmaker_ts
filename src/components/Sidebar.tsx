import React, { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { useDocumentDataOnce } from 'react-firebase-hooks/firestore'

import { collections, db, logOut } from '../firebase'

import { BiHomeSmile, BiExit } from 'react-icons/bi'

import logo from '../assets/logo.png'
import { fetchUser } from '../utils/fetchUser'
import { doc, query } from 'firebase/firestore'
import AppUser from '../models/AppUser'

const isNotActiveStyle = "flex items-center px-5 gap-3 text-gray-300 hover:text-white hover:font-bold transition-all duration-200 ease-in-out capitalize"
const isActiveStyle = "flex items-center px-5 gap-3 font-extrabold border-r-2 border-white transition-all duration-200 ease-in-out capitalize"

export interface SidebarProps {
    setSidebarVisible?: React.Dispatch<React.SetStateAction<boolean>>;
    user: AppUser;
    setUser: React.Dispatch<React.SetStateAction<AppUser | null | undefined>>;
}

const Sidebar = ({ setSidebarVisible, setUser, user }: SidebarProps) => {

    const categoriesQ = doc(db, collections.data, "Categories")

    const [categoriesValue, loading, error, categoriesSnapshot, reloadCategories] = useDocumentDataOnce(categoriesQ)

    const [categories, setCategories] = useState<string[]>([])
    useEffect(() => {
        if (categoriesValue && categoriesValue['categories'] !== categories) {
            setCategories(categoriesValue?.categories)
        }
    }, [categoriesValue])

    const handleCloseToggle = () => setSidebarVisible && setSidebarVisible !== undefined ? setSidebarVisible(false) : console.error("setSidebarVisible is null")

    return (
        <div className="overflow-auto flex flex-col justify-between bg-appBarBgDark h-full min-w-210 h-scrollbar">
            <div className="flex flex-col">
                <Link
                    to="/"
                    className="flex px-5 gap-2 my-6 pt-1 w-190 items-center"
                    onClick={handleCloseToggle}
                >
                    <img src={logo} alt="logo" className='w-full' />
                </Link>
                <div className="flex flex-col gap-5 text-white">
                    <NavLink
                        to="/"
                        className={({ isActive }) => isActive ? isActiveStyle : isNotActiveStyle}
                        onClick={handleCloseToggle}
                    >
                        <BiHomeSmile />
                        Home
                    </NavLink>
                    <h3 className="mt-2 px-5 text-base 2xl:text-xl text-white">
                        Discover Categories
                    </h3>
                    {categories && categories.slice(0, categories.length).map((category) => (
                        <NavLink
                            to={`/category/${category}`}
                            className={({ isActive }) => isActive ? isActiveStyle : isNotActiveStyle}
                            onClick={handleCloseToggle}
                            key={category}
                        >
                            {category}
                        </NavLink>
                    ))}
                </div>
            </div>

            {user && (
                <div className="flex my-5 mb-3 mx-3 justify-center gap-2">
                    <Link
                        to={`user-profile/${user?.uid}`}
                        className="flex gap-2 p-2 items-center bg-logoBlue rounded-lg shadow-lg hover:opacity-70"
                        onClick={handleCloseToggle}
                    >
                        {user.photoImgUrl && <img src={user.photoImgUrl ? user.photoImgUrl : undefined} className="w-10 h-10 rounded-full bg-white" alt='user-profile' />}
                        <p className="text-white font-bold">{user.name}</p>
                    </Link>
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            await logOut().then(() => { 
                                setUser(undefined)
                            })
                        }}
                        className="text-white"
                    >
                        <BiExit fontSize={31} />
                    </button>
                </div>
            )}
        </div>
    )
}

export default Sidebar