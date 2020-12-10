import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import firebase from 'firebase'
import shuffle from 'underscore/modules/shuffle'

import { reducer, receive, ping, getParticipants, getLeaderboard, newQuestion, chooseAnswer, completeQuestion, getMyAnswer} from "../features/quiz";
import { useAuth } from "../features/auth";

export default function QuizPage() {
  const { quizId } = useParams()
  const {
    state: { user },
  } = useAuth()
  
  const { quiz, quizNotFound, dispatch } = useQuiz(quizId, user)

  const onNewQuestionClick = useCallback(async () => {
    const question = await fetchNewQuestion();
    const { correct_answer, incorrect_answers } = question;
    const answers = shuffle([...incorrect_answers, correct_answer])
    dispatch(newQuestion({...question, answers}))
  }, [dispatch])

  const onAnswerClick = useCallback((event) => {
    dispatch(chooseAnswer(user.uid, event.target.id))
  }, [dispatch, user])
  const onCompleteClick = useCallback(() => dispatch(completeQuestion()), [dispatch])

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
              getParticipants(quiz).map(({userId, displayName, isOnline, isHost}) => (
                <li key={userId}>{displayName} <i>
                  {isOnline ? <>(Online)</> : <>(Offline)</>}
                  {isHost && <>(Host)</>}
                  </i>
                </li>
              ))
            }
          </ul>
          <h2>Leaderboard:</h2>
          <ol>
            {
              getLeaderboard(quiz).map(({userId,displayName,score }) => (
                <li key={userId}>{displayName}: {score}</li>
              ))
            }
          </ol>
          {
            quiz.question ?
              <Question 
                question={quiz.question}
                onAnswerClick={onAnswerClick}
                onCompleteClick={onCompleteClick} 
                myAnswer={getMyAnswer(quiz, user.uid)}
              /> : 
              <button onClick={onNewQuestionClick}>Next question</button>
          }
        </>
        : <>Loading...</>
     }
    </>
}

function Question({ question, onAnswerClick, onCompleteClick, myAnswer }) {
  const { question: questionText, answers } = question
  return (
    <>
      <h2>Current question:</h2>
      <b>{questionText}</b>
      <ul>
        {
          answers.map(answer => (
            <li>
              <input type='radio' name="answer" id={answer} value={answer} checked={answer === myAnswer} onChange={onAnswerClick} />
              <label for={answer}>{answer}</label>
            </li>
          ))
        }
      </ul>
      <button onClick={onCompleteClick}>Complete question</button>
    </>
  );
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
          timestamp: new Date().getTime()
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

async function fetchNewQuestion() {
  const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
  const data = await response.json();
  const question = data.results[0];
  return question;
}