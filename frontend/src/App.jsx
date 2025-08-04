import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChatBot from './components/Chatbot'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatBox from './components/Chatbot';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chat/:chatId" element={<ChatBox />} />
        <Route path="/" element={<ChatBox />} /> {/* Could redirect or create new chat */}
      </Routes>
    </BrowserRouter>
  );
}

export default App
