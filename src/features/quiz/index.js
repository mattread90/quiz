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

export function reducer(quiz, action) {
  switch (action.type) {
    case 'RECEIVE':
      return {
        ...action.payload,
        participants: action.payload.participants || {},
        scores: action.payload.scores || {},
        currentQuestionId: action.payload.currentQuestionId || null,
      }
    case 'PING': {
      const { userId, displayName, timestamp } = action.payload
      return {
        ...quiz,
        participants: {
          ...quiz.participants,
          [userId]: {
            ...quiz.participants[userId],
            userId,
            displayName,
            lastPing: timestamp,
          },
        },
      }
    }
    default:
      throw new Error('Unrecognized action in quiz reducer:', action.type)
  }
}

export function receive(quiz) {
  return {
    type: 'RECEIVE',
    payload: quiz,
  }
}

export function ping({ userId, displayName, timestamp }) {
  return {
    type: 'PING',
    payload: {
      userId,
      displayName,
      timestamp,
    },
  }
}

export function isOnline(user) {
  const now = new Date()
  const lastPing = new Date(user.lastPing)
  return now.getTime() - lastPing.getTime() <= 5000
}
