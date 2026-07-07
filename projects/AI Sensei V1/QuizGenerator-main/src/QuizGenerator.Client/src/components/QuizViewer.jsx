// Quiz review screen.
// Displays a completed quiz with per-question feedback,
// final score summary, and actions to retake or delete
// the saved quiz record.

import { useState } from 'react'
import '../App.css'
import toast from 'react-hot-toast';


function QuizViewer({ quizData, onBack, onRetake, onDelete }) {
    const [isDeleting, setIsDeleting] = useState(false);

    // Calculate score. Ensure Questions exists and is an array
    const questions = quizData.Questions || [];
    const correctCount = questions.filter(q => q.IsCorrect || q.isCorrect).length;
    const scorePercentage = questions.length > 0
        ? Math.round((correctCount / questions.length) * 100) : 0;

    const handleDeleteClick = () => {

        if (!window.confirm("Are you sure you want to permanently delete this record?")) {
            return;
        }

        setIsDeleting(true);

        const deleteAction = Promise.resolve(onDelete(quizData));

        toast.promise(deleteAction, {
            loading: 'Deleting record...',
            success: "Quiz deleted successfully",
            error: 'Could not delele record',
        }).catch(() => {
            setIsDeleting(false);
        });
    };

    return (
        <div className='app-generator quiz-viewer'>
            <div className='viewer-header'>
                <button className='back-btn' onClick={onBack}> ← Back </button>
                <h2>{quizData.Title}</h2>
                <div className={`score-badge ${scorePercentage >= 70 ? 'good' : 'bad'}`}>
                    Score: {correctCount}/{questions.length} ({scorePercentage}%)
                </div>
            </div>

            <div className='questions-review'>
                {questions.map((q, index) => (
                    <div key={index} className='review-card'>
                        <h4>{index + 1}. {q.QuestionText}</h4>
                        <div className='review-options'>
                            {q.Options.map((opt, i) => {
                                const myAnswer = q.UserAnswer || q.userAnswer;
                                const isSelected = opt === myAnswer;
                                const isActualCorrect = opt === q.CorrectAnswer;

                                let className = 'review-option';
                                if (isActualCorrect) className += ' correct';
                                else if (isSelected && !q.IsCorrect) className += ' wrong';
                                else if (isSelected) className += " selected";

                                return (
                                    <div key={i} className={className}>
                                        {opt}
                                        {isActualCorrect && <span className='icon'> ✓</span>}
                                        {isSelected && !isActualCorrect && <span className='icon'> ✗</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className='viewer-actions'>
                <button className='delete-btn' onClick={handleDeleteClick} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete Record"}
                </button>

                <button className='retake-btn' onClick={() => onRetake(quizData)}>
                    Retake Quiz
                </button>

            </div>
        </div>
    )
}

export default QuizViewer