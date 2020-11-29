import { useEffect } from 'react'

export default function AuthPage({ init }) {
  useEffect(() => {
    init()
  }, [init])

  return (
    <>
      <h1>Welcome to Matt's Quiz App</h1>
      <h3>Sign in to continue</h3>
      <div id='firebaseui-auth-container'></div>
    </>
  )
}
