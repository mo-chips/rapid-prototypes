// Home screen component.
// Serves as the entry point for users to start a new quiz
// or access their saved quiz archive.

import '../App.css'
import { Link } from 'react-router-dom'

function Home() {
    return (
        <div className="app-home">
            <h2>Welcome to AI Sensei — your personal quiz master.</h2>
            <p>Sharpen your knowledge, challenge your mind, and level up one question at a time.</p>
            <Link to="/create" className="home-link">Play</Link>
            <Link to="/archive" className="home-link">Archive</Link>
        </div >
    )
}

export default Home