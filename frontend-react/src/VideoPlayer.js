import React, { useState, useEffect } from 'react';
import './VideoPlayer.css';

const API_URL = 'https://video-stream-hocw.onrender.com';

const VideoPlayer = () => {
    const [videoFile, setVideoFile] = useState('');
    const [videoSrc, setVideoSrc] = useState('');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchVideos = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${API_URL}/api/videos`);
            if (!response.ok) {
                throw new Error('Failed to fetch videos');
            }
            const data = await response.json();
            setVideos(data);
        } catch (error) {
            console.error('Error fetching videos:', error);
            setError('Failed to fetch videos. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const handleRefresh = () => {
        setVideoSrc(''); // Clear current video
        fetchVideos();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) {
            setError('Please select a video file');
            return;
        }

        try {
            setLoading(true);
            setError('');
            // First check if the video exists
            const response = await fetch(`${API_URL}/video/${videoFile}`);
            if (!response.ok) {
                throw new Error('Video not found');
            }
            setVideoSrc(`${API_URL}/video/${videoFile}`);
        } catch (error) {
            console.error('Error streaming video:', error);
            setError('Failed to stream video. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <div className="sidebar">
                <div className="controls">
                    <button onClick={handleRefresh} className="refresh-btn">
                        Refresh Video List
                    </button>
                </div>
                
                <div className="video-list">
                    <h2>Available Videos</h2>
                    {loading ? (
                        <p>Loading videos...</p>
                    ) : (
                        <ul>
                            {videos.map((video) => (
                                <li key={video.name} className="video-item">
                                    {video.name} ({Math.round(video.size / 1024 / 1024)} MB)
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="input-form">
                    <input
                        type="text"
                        value={videoFile}
                        onChange={(e) => setVideoFile(e.target.value)}
                        placeholder="Enter video filename"
                    />
                    <button 
                        type="submit" 
                        className="stream-btn" 
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Stream Video'}
                    </button>
                    {error && <p className="error-message">{error}</p>}
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