import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useDatabase } from "../features/quiz";

export default function QuizPage() {
  const {quizId} = useParams()

  const database = useDatabase();

  const [quiz, setQuiz] = useState(null);
  const [quizNotFound, setQuizNotFound] = useState(false);

  useEffect(() => {
    const quiz = database.ref(`quizzes/${quizId}`);
    quiz.on('value', (snapshot) => {
      if (!snapshot.exists()) {
        setQuizNotFound(true)
      }else {
        const data = snapshot.val();
        setQuiz(data);
      }
    });
    return () => quiz.off()
  }, [database, quizId]);

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
        </>
        : <>Loading...</>
     }
    </>
}