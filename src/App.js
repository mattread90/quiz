import { useState, useEffect } from 'react'
import firebase from 'firebase/app'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

import logo from './logo.svg'
import './App.css'

const firebaseConfig = {
  apiKey: 'AIzaSyBi61brUhtspSb67GCblNm-2OJbg9zIMoE',
  authDomain: 'quiz-13ac3.firebaseapp.com',
  databaseURL: 'https://quiz-13ac3.firebaseio.com',
  projectId: 'quiz-13ac3',
  storageBucket: 'quiz-13ac3.appspot.com',
  messagingSenderId: '762624056836',
  appId: '1:762624056836:web:b3f99cf9e928ec27ed9f51',
  measurementId: 'G-V0Q5LX0677',
}

const authConfig = {
  signInFlow: 'popup',
  signInSuccessWithAuthResult: function (authResult, redirectUrl) {
    // User successfully signed in.
    // Return type determines whether we continue the redirect automatically
    // or whether we leave that to developer to handle.
    return false
  },
  signInOptions: [
    // List of OAuth providers supported.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  // Other config options...
}

firebase.initializeApp(firebaseConfig)
const ui = new firebaseui.auth.AuthUI(firebase.auth())

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    firebase.auth().onAuthStateChanged(setUser)
  }, [])
  useEffect(() => {
    if (ui.isPendingRedirect()) {
      ui.start('#firebaseui-auth-container', authConfig)
    }
  }, [])

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>
          {user ? (
            <>Welcome back, {user.displayName}</>
          ) : (
            <>Sign in to continue</>
          )}
        </p>
        <div id='firebaseui-auth-container'></div>
      </header>
    </div>
  )
}

export default App
