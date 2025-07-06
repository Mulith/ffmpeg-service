const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
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

app.post('/create-video', upload.any(), async (req, res) => {
    const audioFile = req.files.find(f => f.fieldname === 'audioFile');
    const { title, parallax, imageUrls, durations, resolution, fps } = req.body;

    if (!audioFile || !imageUrls) {
        return res.status(400).send('Missing audio file or image URLs.');
    }

    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const imagePaths = [];
    const audioPath = audioFile.path;
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
