import { useCallback, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  Redirect,
} from 'react-router-dom'
import firebase from 'firebase/app'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import { AuthProvider, useAuth } from './features/auth'
import QuizPage from './pages/QuizPage'

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
  signInOptions: [
    // List of OAuth providers supported.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  // Other config options...
}

firebase.initializeApp(firebaseConfig)
const ui = new firebaseui.auth.AuthUI(firebase.auth())

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes />
      </Router>
    </AuthProvider>
  )
}

function Routes() {
  const { actions } = useAuth()
  const { signIn, signOut } = actions

  const history = useHistory()

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      console.log('user: ', user)
      if (user) {
        signIn(user)
        history.replace('/home')
      } else {
        signOut()
        history.replace('/auth')
      }
      return false
    })
  }, [history, signIn, signOut])

  const initAuth = useCallback(() => {
    ui.start('#firebaseui-auth-container', authConfig)
  }, [])

  return (
    <Switch>
      <Route path='/auth'>
        <AuthPage init={initAuth} />
      </Route>
      <Route path='/home'>
        <HomePage />
      </Route>
      <Route path='/quiz/:quizId'>
        <QuizPage/>
      </Route>
      <Redirect to='/auth' />
    </Switch>
  )
}

export default App
