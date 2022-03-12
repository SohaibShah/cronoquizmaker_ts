import React from 'react'

import { Circles } from 'react-loader-spinner'

export interface SpinnerProps {
    message?: String | undefined | null
}

const Spinner = ({ message }: SpinnerProps) => {
    return (
        <div className="flex flex-col justify-center items-center w-full h-full">
            <Circles
                color="#0098BA"
                height={50}
                width={200}
            />

            {message && <p className="text-dark text-lg text-center px-2 m-5">{message}</p>}
        </div>
    )
}

export default Spinner