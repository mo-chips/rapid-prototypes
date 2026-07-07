import axios from 'axios';

// Centralized API client for quiz-related backend calls.
// Abstracts HTTP details behind semantic methods so UI
// components remain decoupled from endpoint structure
// and request configuration.


const API_BASE_URL = 'http://localhost:5158/api/quiz';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const quizService = {

    getAllQuizzes: () => api.get('/GetAll'),
    getQuizById: (id) => api.get(`/${id}`),
    generateQuiz: (language, difficulty, topic) => api.post('/generate', {
        language,
        difficulty,
        topic
    }),
    saveQuiz: (quizData) => api.post('/save', quizData),
    deleteQuiz: (id) => api.delete(`/${id}`)
};

export default api;