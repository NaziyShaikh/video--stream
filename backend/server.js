const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');
const path = require('path');

app.use(cors());

// Serve React build files
app.use(express.static(path.join(__dirname, '../frontend-react/build')));

// Root route - serves the main page
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../frontend-react/build', 'index.html'));
    } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(404).send('Not Found');
    }
});

// added the videolist to see the videos to streem videos in page 
app.get('/api/videos', (req, res) => {
    try {
        const videosDir = path.join(__dirname, 'videos');
        if (!fs.existsSync(videosDir)) {
            fs.mkdirSync(videosDir);
        }

        fs.readdir(videosDir, (err, files) => {
            if (err) {
                console.error('Error reading videos directory:', err);
                res.status(500).json({ error: 'Failed to fetch videos' });
                return;
            }

            const videoFiles = files
                .filter(file => file.endsWith('.mp4') || file.endsWith('.mkv') || file.endsWith('.avi'))
                .map(file => ({
                    name: file,
                    size: fs.statSync(path.join(videosDir, file)).size,
                    path: path.join('videos', file)
                }));

            res.json(videoFiles);
        });
    } catch (error) {
        console.error('Error in /api/videos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/video/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const videoPath = path.join(__dirname, 'videos', filename);

        if (!fs.existsSync(videoPath)) {
            res.status(404).json({ error: 'Video not found' });
            return;
        }

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if (start >= fileSize || end >= fileSize) {
                res.status(416).send('Requested range not satisfiable');
                return;
            }

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': end - start + 1,
                'Content-Type': 'video/mp4',
            });

            const stream = fs.createReadStream(videoPath, { start, end });
            stream.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            });

            const stream = fs.createReadStream(videoPath);
            stream.pipe(res);
        }
    } catch (error) {
        console.error('Error streaming video:', error);
        res.status(500).json({ error: 'Failed to stream video' });
    }
});

// Handle all other routes
app.get('*', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../frontend-react/build', 'index.html'));
    } catch (error) {
        console.error('Error serving other routes:', error);
        res.status(404).send('Not Found');
    }
});

// Error handling middleware added
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something went wrong!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});