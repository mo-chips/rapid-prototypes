// Quiz generation screen.
// Collects user input and triggers AI-powered quiz generation,
// handling basic validation and loading state before passing
// the generated quiz back to the application flow.

import '../App.css'
import { useState } from 'react';
import { quizService } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function QuizGenerator({ onQuizGenerated }) {

    const languages = ['C++', 'Python', 'C#', 'Java', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'PHP', 'Kotlin', 'Swift', 'C', 'Ruby'];
    const languageOptions = [...new Set(languages)].sort().map(l => <option key={l} value={l}>{l}</option>);
    const topics = ['Arrays', 'Strings', 'Algorithms', 'Loops', 'Pointers', 'Recursion', 'Data Structures', 'Time Complexity', 'Searching', 'Sorting', 'OOP', 'Memory Management', 'Concurrency', 'Error Handling', 'Dynamic Programming'];
    const topicOptions = [...new Set(topics)].sort().map(t => <option key={t} value={t}>{t}</option>);

    const [language, setLanguage] = useState('');
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleLanguage = (event) => {
        setLanguage(event.target.value);
    }

    const handleTopic = (event) => {
        setTopic(event.target.value);
    }

    const handleDifficulty = (event) => {
        let value = Number(event.target.value);
        if (value < 1) value = 1;
        if (value > 5) value = 5;
        setDifficulty(value);
    }

    const generateQuiz = () => {
        if (!language || !topic) {
            toast.error("Please select both a language and a topic.");
            return;
        }

        setLoading(true);

        const quizPromise = quizService.generateQuiz(language, difficulty, topic);

        toast.promise(quizPromise, {
            loading: 'Sensei is crafting your lesson...',
            success: 'Lesson ready! Good luck',
            error: 'Failed to generated lesson. Try again later.',
        });

        quizPromise
            .then(response => {
                setLoading(false);
                onQuizGenerated(response.data);
            }).catch(err => {
                console.error("Failed to generate quiz", err);
                setLoading(false);
            });
    }
    return (
        <div className='app-generator'>
            <h2>Generate Quiz</h2>

            <label>Language:</label>
            <select value={language} onChange={handleLanguage}>
                <option value="">Select language</option>
                {languageOptions}
            </select>

            <label>Topic</label>
            <select value={topic} onChange={handleTopic}>
                <option value="">Select topic</option>
                {topicOptions}
            </select>

            <label>Difficulty (1-5):</label>
            <input value={difficulty} type='number' onChange={handleDifficulty} disabled={loading} />



            <button className='generator-btn' onClick={generateQuiz} disabled={loading}>
                {loading ? "Generating.." : "Generate Quiz"}
            </button>

            <Link to="/" className='generator-link' >Home</Link>

        </div>)
}

export default QuizGenerator