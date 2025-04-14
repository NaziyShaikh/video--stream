import React from 'react';
import ReactDOM from 'react-dom/client';
import VideoPlayer from './VideoPlayer';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <VideoPlayer />
  </React.StrictMode>
);

reportWebVitals();