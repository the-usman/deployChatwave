import React from 'react';
import {  Route, Routes, } from 'react-router-dom';
import Home from './assets/Pages/Home'
import './App.css'
import Chat from './assets/Pages/Chat';

function App() {
  return (
    <div className='App'>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;