import React from 'react'
import AppUser from '../models/AppUser'
import { Link, useNavigate } from 'react-router-dom'

import { IoMdSearch, IoMdAdd } from 'react-icons/io'

export interface NavbarProps {
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>,
    searchTerm: string,
    user: AppUser | void
}

const Navbar = ({ searchTerm, setSearchTerm, user }: NavbarProps) => {

    const navigate = useNavigate();

    if (!user) return null;

    return (
        <div className="bg-mainColor flex gap-2 md:gap-3 w-full mt-5 pb-7">
            <div className="flex justify-start items-center w-full px-2 rounded-md bg-white border-none outline-none focus-within:shadow-sm">
                <IoMdSearch fontSize={21} className="ml-1" />
                <input
                    type="text"
                    onChange={(e) => { setSearchTerm(e.target.value) }}
                    placeholder="Search"
                    value={searchTerm}
                    onFocus={() => navigate('/search')}
                    className="p-2 w-full bg-white outline-none focus:outline-none"
                />
            </div>
            <div className="flex gap-3">
                {user && <Link
                    to={`user-profile/${user?.uid}`}
                    className="hidden md:block"
                >
                    <img src={user.photoImgUrl ?? 
                        // `https://via.placeholder.com/500x1000?text=${user.name}`
                        `https://img.icons8.com/ios-glyphs/344/test-account.png`
                        } alt="user-image" className="w-14 h-12 rounded-lg bg-white" />
                </Link>}
                <Link
                    to='/edit-quiz'
                    className="bg-logoGreen text-dark rounded-lg w-12 h-12 md:w-14 md:h-12 flex justify-center items-center"
                >
                    <IoMdAdd fontSize={30} />
                </Link>
            </div>
        </div>
    )
}

export default Navbar