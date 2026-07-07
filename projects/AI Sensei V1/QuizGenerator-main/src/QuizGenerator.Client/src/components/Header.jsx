// Global application header.
// Handles primary navigation entry point and
// houses global UI controls (sound, theme toggles).

import '../App.css'
import { Link } from 'react-router-dom'


function Header() {
    return (
        <header className="app-header">
            <Link className="logo-link">
                <h1>🧠 AI Sensei</h1>
            </Link>
            <nav className="header-nav">
                <button className="nav-btn">
                    🔊 Sound
                </button>
                <button className="nav-btn">
                    🌙 Theme
                </button>
            </nav>
        </header>


    )
}

export default Header