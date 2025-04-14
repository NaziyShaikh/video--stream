import React, { useState, useEffect } from 'react';
import './VideoPlayer.css';

const API_URL = 'https://video-stream-hocw.onrender.com';

const VideoPlayer = () => {
    const [videoFile, setVideoFile] = useState('');
    const [videoSrc, setVideoSrc] = useState('');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/videos`);
            if (!response.ok) {
                throw new Error('Failed to fetch videos');
            }
            const data = await response.json();
            setVideos(data);
        } catch (error) {
            console.error('Error fetching videos:', error);
            alert('Failed to fetch videos. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const handleRefresh = () => {
        fetchVideos();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) {
            alert('Please select a video file');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/video/${videoFile}`);
            if (!response.ok) {
                throw new Error('Failed to fetch video');
            }
            setVideoSrc(`${API_URL}/video/${videoFile}`);
        } catch (error) {
            console.error('Error streaming video:', error);
            alert('Failed to stream video. Please try again.');
        } finally {
            setLoading(false);
        }
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
                    <button type="submit" className="stream-btn" disabled={loading}>
                        {loading ? 'Loading...' : 'Stream Video'}
                    </button>
                    <p className="refresh-note">Refresh the page to see available videos</p>
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