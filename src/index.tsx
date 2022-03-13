import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'

import './fonts/Lato/Lato-Regular.ttf'
import './fonts/Lato/Lato-Black.ttf'
import './fonts/Lato/Lato-Bold.ttf'

import './index.css'

import App from './App'

ReactDOM.render(
    <Router>
        <App />
    </Router>
    , document.getElementById('root'))