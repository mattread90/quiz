import { useRef } from 'react'
import firebase from 'firebase'

export function useDatabase() {
  const ref = useRef(null)
  function get() {
    if (!ref.current) {
      ref.current = firebase.database()
    }
    return ref.current
  }
  return get()
}
