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
    case 'NEW_QUESTION':
      return {
        ...quiz,
        question: {
          ...action.payload,
          userAnswers: { _: 'blank' },
        },
      }
    case 'CHOOSE_ANSWER':
      return {
        ...quiz,
        question: {
          ...quiz.question,
          userAnswers: {
            ...quiz.question.userAnswers,
            [action.payload.userId]: action.payload.answer,
          },
        },
      }
    case 'COMPLETE_QUESTION': {
      const { correct_answer, userAnswers } = quiz.question
      return {
        ...quiz,
        question: null,
        scores: Object.values(quiz.participants).reduce(
          (newScores, participant) => {
            const { userId } = participant
            const currentScore = quiz.scores[userId] || 0
            if (userAnswers[userId] === correct_answer) {
              newScores[userId] = currentScore + 1
            } else {
              newScores[userId] = currentScore
            }
            return newScores
          },
          {}
        ),
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

export function newQuestion(question) {
  return {
    type: 'NEW_QUESTION',
    payload: question,
  }
}

export function chooseAnswer(userId, answer) {
  return {
    type: 'CHOOSE_ANSWER',
    payload: { userId, answer },
  }
}

export function completeQuestion() {
  return {
    type: 'COMPLETE_QUESTION',
  }
}

function isOnline(user) {
  const now = new Date()
  const lastPing = new Date(user.lastPing)
  return now.getTime() - lastPing.getTime() <= 5000
}

export function getParticipants(quiz) {
  return Object.values(quiz.participants).map((participant) => ({
    ...participant,
    isHost: participant.userId === quiz.host,
    isOnline: isOnline(participant),
  }))
}

export function getLeaderboard(quiz) {
  return Object.values(quiz.participants)
    .map((participant) => ({
      ...participant,
      score: quiz.scores[participant.userId] || 0,
    }))
    .sort((a, b) => b.score - a.score)
}

export function getMyAnswer(quiz, userId) {
  return quiz.question.userAnswers[userId]
}
