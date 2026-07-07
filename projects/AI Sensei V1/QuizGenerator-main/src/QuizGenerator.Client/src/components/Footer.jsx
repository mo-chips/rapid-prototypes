// Global application footer.
// Provides consistent branding and layout
// across all screens.

import '../App.css'


function Footer() {
    return (
        <footer className="app-footer">
            <p>&copy; {new Date().getFullYear()} AI Sensei</p>
        </footer>
    )
}

export default Footer