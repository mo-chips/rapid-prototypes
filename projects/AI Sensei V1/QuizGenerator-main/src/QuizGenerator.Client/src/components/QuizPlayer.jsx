// Quiz gameplay component.
// Manages timed question flow, scoring, and answer tracking,
// persisting the completed quiz snapshot and handling
// transitions between active play and result review.

import { useState, useEffect, useCallback } from 'react'
import '../App.css'
import { quizService } from '../services/api'
import toast from 'react-hot-toast';

const QUESTION_DURATION = 30;

function QuizPlayer({ quizData, onFinish, onViewResults }) {
    // State for gameplay
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isFinished) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };

    }, [isFinished]);


    const handleAnswerProcessing = useCallback((selectedOption) => {
        // Safety check inside the function
        if (!quizData || !quizData.Questions) return;

        const currentQ = quizData.Questions[currentIndex];
        if (selectedOption === "Time Out") {
            toast.error("Time's up!", { duration: 2000 });
        }

        const isCorrect = selectedOption === currentQ.CorrectAnswer;

        // Update local state helpers
        let newScore = score;
        if (isCorrect) {
            newScore = score + 1;
            setScore(newScore);
        }

        const answeredQuestion = {
            ...currentQ,
            userAnswer: selectedOption,
            isCorrect: isCorrect
        };

        const updateAnswers = [...userAnswers, answeredQuestion];
        setUserAnswers(updateAnswers);

        if (currentIndex + 1 < quizData.Questions.length) {
            setCurrentIndex(currentIndex + 1);
            setTimeLeft(QUESTION_DURATION);
        } else {
            setIsFinished(true);
            const quizToSave = { ...quizData, Questions: updateAnswers };
            toast.promise(
                quizService.saveQuiz(quizToSave),
                {
                    loading: 'Saving your results...',
                    success: 'Results saved to history!',
                    error: 'Could not save results',
                }
            )
                ;
        }
    }, [quizData, currentIndex, score, userAnswers]);

    // Timer Logic
    useEffect(() => {
        if (!quizData || isFinished) return;

        if (timeLeft === 0) {
            const timeoutID = setTimeout(() => {
                handleAnswerProcessing("Time Out");
            }, 500);
            return () => clearTimeout(timeoutID);
        }

        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, isFinished, quizData, handleAnswerProcessing]);

    // If no data passed, show error
    if (!quizData || !quizData.Questions) {
        return <div className='erro-Msg'>Error: No quiz data loaded</div>;
    }

    const currentQuestion = quizData.Questions[currentIndex];

    const handleExit = () => {
        if (window.confirm("Are you sure you want to quit this quiz? Your progress will be lost.")) {
            toast("Game Cancelled", { icon: '🛑' });
            onFinish();
        }
    }

    // --- RENDER: RESULT SCREEN ---
    if (isFinished) {
        const percentage = Math.round((score / quizData.Questions.length) * 100);

        const handleViewDetailsClick = () => {
            const finalQuizState = {
                ...quizData,
                Questions: userAnswers
            };
            onViewResults(finalQuizState)
        }
        return (
            <div className='quiz-player card'>
                <h2>Quiz Completed!</h2>

                <div className='score-box'>
                    <h3>Your Score: {score} / {quizData.Questions.length}</h3>
                    <h1>{percentage}%</h1>
                </div>
                <div className='result-actions'>
                    <button className='secondary-btn' onClick={handleViewDetailsClick}>View Detailed Results</button>
                    <button className='primary-btn' onClick={onFinish}>Return to Home</button>
                </div>
            </div >
        );
    }

    // --- RENDER: GAMEPLAY SCREEN ---
    let timeColor = 'green';
    if (timeLeft < 10) timeColor = 'orange';
    if (timeLeft < 5) timeColor = 'red';

    return (
        <div className='quiz-player card'>
            <div className='quiz-header'>
                <div className={`timer-box ${timeColor}`}>⏱ {timeLeft}s</div>
                <button className='exit-btn-small' onClick={handleExit}>✕ Exit</button>
            </div>
            <div className='quiz-meta'>
                <span className='badge'>{quizData.Topic}</span>
                <span className='progress'>Question {currentIndex + 1} / {quizData.Questions.length}</span>
            </div>
            <hr className='divider' />

            <h3 className='question-text'>{currentQuestion.QuestionText}</h3>

            <div className='options-grid'>
                {currentQuestion.Options.map((option, index) => (
                    <button key={index} className='option-btn' onClick={() => handleAnswerProcessing(option)}>{option}</button>
                ))}
            </div>

        </div>
    )

}

export default QuizPlayer