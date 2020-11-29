import { useAuth } from '../features/auth'

export default function HomePage() {
  const {
    state: { signedIn, user },
  } = useAuth()
  if (signedIn) {
    return <h1>Welcome to my Quiz app, {user.displayName}!</h1>
  } else {
    return <>Loading...</>
  }
}
