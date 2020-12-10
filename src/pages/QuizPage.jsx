import { useEffect, useReducer, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import firebase from 'firebase'

import { reducer, receive, ping, isOnline} from "../features/quiz";
import { useAuth } from "../features/auth";

export default function QuizPage() {
  const { quizId } = useParams()
  const {
    state: { user },
  } = useAuth()
  
  const { quiz, quizNotFound } = useQuiz(quizId, user)  

  return <>
    <header>
      <Link to={'/home'}>Back to home</Link>
    </header>
     {
       quizNotFound ? <p>Sorry, we couldn't find your quiz</p> :
       quiz ?
        <>
          <h1>{quiz.name}</h1>
          <h2>Invite code: {quiz.id}</h2>
          <h2>Participants:</h2>
          <ul>
            {
              Object.values(quiz.participants || {}).map(participant => (
                <li>{participant.displayName} <i>
                  {isOnline(participant) ? <>(Online)</> : <>(Offline)</>}
                  </i>
                </li>
              ))
            }
          </ul>
        </>
        : <>Loading...</>
     }
    </>
}

function useQuiz(quizId, user) {
  const [quiz, dispatch] = useReducer(reducer, null);
  const [quizNotFound, setQuizNotFound] = useState(false);

  const document = useDocument(`quizzes/${quizId}`);

  useEffect(() => {
    document.on('value', (snapshot) => {
      if (!snapshot.exists()) {
        setQuizNotFound(true)
      } else {
        const data = snapshot.val();
        dispatch(receive(data));
      }
    });
    return () => document.off()
  }, [document, quizId]);

  useEffect(() => {
    if (quiz) document.update(quiz)
  }, [document, quiz])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user) {
        dispatch(ping({
          userId: user.uid,
          displayName: user.displayName,
          timestamp: new Date().toString()
        }))
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [user])

  return { quiz, quizNotFound, dispatch }
}

function useDocument(docRef) {
  const ref = useRef(null)
  function get() {
    if (!ref.current) {
      ref.current = firebase.database().ref(docRef);
    }
    return ref.current
  }
  return get()
}