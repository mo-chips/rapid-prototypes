// Root application component.
// Manages high-level navigation and shared state
// for quiz flow (generation, play, review, archive),
// keeping screen logic centralized and components loosely coupled.

import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import QuizGenerator from './components/QuizGenerator';
import QuizPlayer from './components/QuizPlayer';
import QuizArchive from './components/QuizArchive';
import QuizViewer from './components/QuizViewer';
import './App.css'
import { quizService } from './services/api';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'

function App() {
    const [activeQuiz, setActiveQuiz] = useState(null);

    const navigate = useNavigate();

    const handleQuizGenerated = (quizData) => {
        setActiveQuiz(quizData);
        navigate('/play');
    }

    const handleFinish = () => {
        setActiveQuiz(null);
        navigate('/');
    }

    const handleViewQuiz = (quizData) => {
        setActiveQuiz(quizData);
        navigate('/view');
    }

    const handleDelete = (quizData) => {
        const idToDelete = quizData.id || quizData.dbId;

        if (!idToDelete) {
            toast.error("Error: Could not find a valid ID for this quiz. Delete failed.")
            return Promise.reject("No ID found");
        }

        return quizService.deleteQuiz(idToDelete)
            .then(() => {
                setActiveQuiz(null);
                navigate('/archive');
            })
    }

    const handleViewResultsAfterCompletion = (completedQuiz) => {
        setActiveQuiz(completedQuiz);
        navigate('/view');
    }

    return (
        <div className='app-container'>
            <Header />
            <main className='main-content'>
                <Toaster position='top-center' reverseOrder={false} />
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/archive' element={<QuizArchive onViewQuiz={handleViewQuiz} />} />
                    <Route path='/create' element={<QuizGenerator onQuizGenerated={handleQuizGenerated} />} />
                    <Route path='/play' element={activeQuiz ?
                        <QuizPlayer
                            quizData={activeQuiz}
                            onFinish={handleFinish}
                            onViewResults={handleViewResultsAfterCompletion} />
                        : (<Navigate to="/" replace />)} />
                    <Route path='/view' element={activeQuiz ?
                        <QuizViewer
                            quizData={activeQuiz}
                            onBack={() => navigate('/archive')}
                            onRetake={handleQuizGenerated}
                            onDelete={handleDelete} />
                        : (<Navigate to="/archive" replace />)} />
                </Routes>
            </main>
            <Footer />
        </div>
    );

}

export default App;