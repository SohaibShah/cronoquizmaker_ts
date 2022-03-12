import AppUser from "../models/AppUser";

export const fetchUser = () => {
    const userInfo = localStorage.getItem('user') !== 'undefined' ? JSON.parse(localStorage.getItem('user') as string) as AppUser : localStorage.clear();

    if (typeof userInfo === "object") {
        return userInfo
    } else {
        return undefined
    }
}