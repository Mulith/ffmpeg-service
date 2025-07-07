const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.json({ limit: '50mb' }));

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

app.post('/create-video', async (req, res) => {
    const { title, parallax, imageUrls, durations, resolution, fps, audioBase64 } = req.body;

    if (!audioBase64 || !imageUrls || imageUrls.length === 0) {
        return res.status(400).send('Missing audio data or image URLs.');
    }

    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const audioPath = path.join(tempDir, `audio-${Date.now()}.mp3`);
    const audioData = Buffer.from(audioBase64, 'base64');
    fs.writeFileSync(audioPath, audioData);

    const imagePaths = [];
    const outputPath = path.join(tempDir, `video-${Date.now()}.mp4`);

    try {
        for (let i = 0; i < imageUrls.length; i++) {
            const imageUrl = imageUrls[i];
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
        const zoomSpeed = 0.3;
        const complexFilter = imagePaths.map((p, i) => {
            const duration = durations[i] || 3;
            return `[${i}:v]scale=${resolution || '1920x1080'},zoompan=z='min(zoom+${zoomSpeed},1.5)':d=${duration*25}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${resolution || 'hd1080'}[v${i}]`;
        }).join(';');
        const concatFilter = imagePaths.map((p, i) => `[v${i}]`).join('') + `concat=n=${imagePaths.length}:v=1:a=0[v]`;
        imagePaths.forEach(p => command.input(p));
        command.input(audioPath)
            .complexFilter(complexFilter + ';' + concatFilter)
            .outputOptions(['-map [v]', '-map 1:a']);
    } else {
        imagePaths.forEach((imagePath, i) => {
            const duration = durations[i] || 3;
            command.input(imagePath).inputOptions(['-loop 1', `-t ${duration}`]);
        });
        command.input(audioPath);
    }

    command.outputOptions([
            '-c:v libx264',
            '-c:a aac',
            '-pix_fmt yuv420p',
            '-shortest',
            `-r ${fps || 30}`,
            `-s ${resolution || '1080x1920'}`
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
