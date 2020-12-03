import { useCallback, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { useAuth } from '../features/auth'
import { useDatabase } from '../features/quiz'

export default function HomePage() {
  const history = useHistory()
  const {
    state: { signedIn, user },
  } = useAuth()

  const [code, setCode] = useState('')
  const handleCodeChange = useCallback(
    (event) => setCode(event.target.value),
    []
  )

  const database = useDatabase()

  const handleJoinClick = useCallback(() => {
    if (code) history.push(`/quiz/${code}`)
  }, [
    history,
    code,
  ])

  const handleNewQuizClick = useCallback(() => {
    const newQuizId = Math.random().toString().split('.')[1].substr(0, 4)
    database.ref(`quizzes/${newQuizId}`).set(
      {
        id: newQuizId,
        name: `${user.displayName}'s Quiz`,
      },
      (error) => {
        if (error) {
          console.log(error)
        } else {
          history.push(`/quiz/${newQuizId}`)
        }
      }
    )
  }, [database, history, user])

  if (signedIn) {
    return (
      <>
        <h1>Welcome to my Quiz app, {user.displayName}!</h1>
        <section>
          <p>
            <label htmlFor='join'>Please enter a code to join a quiz:</label>
          </p>
          <input id='join' value={code} onChange={handleCodeChange} />
          <button onClick={handleJoinClick} disabled={!code}>Join</button>
          <p>or</p>
          <button onClick={handleNewQuizClick}>Start a new quiz</button>
        </section>
      </>
    )
  } else {
    return <>Loading...</>
  }
}
