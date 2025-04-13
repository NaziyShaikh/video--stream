import React, { useState, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = () => {
    const [videoFile, setVideoFile] = useState('');
    const [videoSrc, setVideoSrc] = useState('');
    const [videos, setVideos] = useState([]);

    const fetchVideos = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/videos');
            const data = await response.json();
            setVideos(data);
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setVideoSrc(`http://localhost:3000/video/${videoFile}`);
    };

    return (
        <div className="app-container">
            <div className="sidebar">
                <div className="controls">
                    <button onClick={handleRefresh} className="refresh-btn">
                        Refresh Page
                    </button>
                </div>
                
                <div className="video-list">
                    <h2>Available Videos</h2>
                    <ul>
                        {videos.map((video) => (
                            <li key={video.name} className="video-item">
                                {video.name} ({Math.round(video.size / 1024 / 1024)} MB)
                            </li>
                        ))}
                    </ul>
                </div>

                <form onSubmit={handleSubmit} className="input-form">
                    <input
                        type="text"
                        value={videoFile}
                        onChange={(e) => setVideoFile(e.target.value)}
                        placeholder="Enter video filename"
                    />
                    <button type="submit" className="stream-btn">Stream Video</button>
                    <>refresh the page to stream the available video</>
                </form>
            </div>

            <div className="player-container">
                {videoSrc && (
                    <div className="player">
                        <video controls autoPlay>
                            <source src={videoSrc} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;