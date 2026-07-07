import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import Landing from './components/Landing'
import Tutorial from './components/Tutorial'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/tutorial" element={<Tutorial />} />
        {/* Tambahkan route lain di sini jika diperlukan */}
        {/* <Route path="/about" element={<About />} /> */}
        {/* <Route path="/projects" element={<Projects />} /> */}
      </Routes>
    </Router>
  )
}

export default App