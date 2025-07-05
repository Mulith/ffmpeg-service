const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const upload = multer({ dest: 'uploads/' });

const downloadImage = async (url, filepath) => {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('finish', () => resolve())
            .on('error', e => reject(e));
    });
};

app.post('/create-video', upload.single('audio'), async (req, res) => {
    const audio = req.file;
    const { title, parallax, imageUrls } = req.body;

    if (!audio || !imageUrls) {
        return res.status(400).send('Missing audio file or image URLs.');
    }

    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const parsedImageUrls = JSON.parse(imageUrls);
    const imagePaths = [];
    const audioPath = audio.path;
    const outputPath = path.join(tempDir, `video-${Date.now()}.mp4`);

    try {
        for (let i = 0; i < parsedImageUrls.length; i++) {
            const imageUrl = parsedImageUrls[i];
            const imagePath = path.join(tempDir, `image-${i}.jpg`);
            await downloadImage(imageUrl, imagePath);
            imagePaths.push(imagePath);
        }
    } catch (error) {
        console.error('Failed to download images:', error);
        return res.status(500).send('Failed to download images.');
    }

    const command = ffmpeg();

    if (parallax === 'true') {
        const videoDuration = 3; // seconds per image
        const zoomSpeed = 0.1;

        const complexFilter = imagePaths.map((p, i) => {
            return `[${i}:v]scale=1920x1080,zoompan=z='min(zoom+${zoomSpeed},1.5)':d=${videoDuration*25}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=hd1080[v${i}]`;
        }).join(';');

        const concatFilter = imagePaths.map((p, i) => `[v${i}]`).join('') + `concat=n=${imagePaths.length}:v=1:a=0[v]`;

        imagePaths.forEach(p => command.input(p));
        
        command.input(audioPath)
            .complexFilter(complexFilter + ';' + concatFilter, ['v']);

    } else {
        imagePaths.forEach(imagePath => {
            command.input(imagePath).inputOptions(['-loop 1', '-t 3']);
        });
        command.input(audioPath);
    }

    command.outputOptions([
            '-c:v libx264',
            '-c:a aac',
            '-pix_fmt yuv420p',
            '-shortest'
        ])
        .on('end', () => {
            res.download(outputPath, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                }
                // Cleanup
                fs.unlinkSync(outputPath);
                imagePaths.forEach(p => fs.unlinkSync(p));
                fs.unlinkSync(audioPath);
            });
        })
        .on('error', (err) => {
            console.error('Error during FFmpeg processing:', err);
            res.status(500).send('Error creating video.');
            // Cleanup
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            imagePaths.forEach(p => fs.unlinkSync(p));
            fs.unlinkSync(audioPath);
        })
        .save(outputPath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`FFmpeg service listening on port ${PORT}`);
});
