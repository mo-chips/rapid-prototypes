// Quiz archive screen.
// Loads and displays previously saved quizzes by
// deserializing stored JSON snapshots, allowing
// users to review or revisit past attempts.

import { useState, useEffect } from 'react';
import { quizService } from '../services/api';
import { Link } from 'react-router-dom';
import '../App.css'
import toast from 'react-hot-toast';

function QuizArchive({ onViewQuiz }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        quizService.getAllQuizzes()
            .then(response => {
                console.log("API Data: ", response.data);
                // Parse the JSON strings from the DB
                const parsedData = response.data.map(item => {
                    const jsonString = item.content || item.Content;

                    if (!jsonString) {
                        console.error("Missing content in item:", item);
                        return null;
                    }

                    const quizObject = JSON.parse(jsonString);
                    quizObject.id = item.id || item.Id;
                    return quizObject;
                }).filter(q => q !== null);

                setHistory(parsedData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load history", err);
                toast.error("Could not load history!");
                setLoading(false);
            });
    }, []);

    if (loading) return <div className='archive-loading'>Loading archive...</div>;

    return (
        <div className='app-archive'>
            <div className='archive-head'>
                <h2>Quiz Archive ({history.length} Saved)</h2>
                <Link to="/" className='archive-link'>← Back </Link>
            </div>

            {history.length === 0 ? <p>No saved quizzes found. Time to create one!</p> : (
                <div className='archive-div'>
                    {history.map((quiz, index) => (
                        <div key={index} className='archive-card'>
                            <h4>{quiz.Title}</h4>
                            <p>Topic: **{quiz.Topic}**</p>
                            <p>Difficulty: **{quiz.Difficulty}/5**</p>
                            <button onClick={() => onViewQuiz(quiz)} className='archive-btn'>
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


export default QuizArchive;