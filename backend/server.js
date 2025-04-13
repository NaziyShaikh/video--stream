const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');
const path = require('path');

app.use(cors());

app.use(express.static(path.join(__dirname, '../frontend-react/build')));


app.get('/api/videos', (req, res) => {
    const videosDir = path.join(__dirname, 'videos');
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
});

app.get('/video/:filename', (req, res) => {
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
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});