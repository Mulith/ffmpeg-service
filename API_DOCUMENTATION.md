# FFmpeg Service API Documentation

This document provides instructions on how to use the FFmpeg service to create videos from images and audio.

## Endpoint: `/create-video`

-   **Method**: `POST`
-   **Content-Type**: `application/json`

This endpoint processes a set of images and an audio file to generate a video. It can optionally apply a parallax (Ken Burns) effect to the images.

### Request Body

The request body must be a JSON object with the following properties:

| Field Name    | Type     | Required | Description                                                                                                                            |
|---------------|----------|----------|----------------------------------------------------------------------------------------------------------------------------------------|
| `imageUrls`   | String[] | Yes      | An array of public URLs for the images to be included in the video. The order of the URLs determines their sequence.                     |
| `durations`   | Number[] | No       | An array of numbers specifying the duration (in seconds) each image should be displayed. If omitted, a default duration will be used.     |
| `audioBase64` | String   | Yes      | A Base64-encoded string of the audio file to be used as the soundtrack.                                                                |
| `audioType`   | String   | No       | The type of the audio file (e.g., 'mp3', 'wav'). Defaults to 'mp3' if not provided.                                                      |
| `resolution`  | String   | No       | The output video resolution in `widthxheight` format (e.g., '1080x1920'). Defaults to '1080x1920'.                                       |
| `fps`         | Number   | No       | The frames per second of the output video. Defaults to 30.                                                                             |
| `title`       | String   | No       | A title for the video. This is not currently used in the video itself but is good practice to include.                                   |
| `parallax`    | String   | No       | A string that can be set to `"true"` to enable a parallax (zoom and pan) effect on the images. If omitted, the images will be static. |

### Success Response

-   **Code**: `200 OK`
-   **Content-Type**: `video/mp4`

If the request is successful, the service will respond with the generated video file as a downloadable attachment.

### Error Responses

-   **Code**: `400 Bad Request`
    -   **Content**: `Missing audio data or image URLs.`
    -   **Reason**: The request did not include the required `audioBase64` or `imageUrls`.
-   **Code**: `500 Internal Server Error`
    -   **Content**: `Error creating video.` or `Failed to download images.`
    -   **Reason**: An unexpected error occurred during FFmpeg processing or image downloading.

### Example Usage

Here is an example of how to call the API using `curl`:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrls": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.png"
    ],
    "durations": [5, 5],
    "audioBase64": "...",
    "audioType": "wav",
    "resolution": "1920x1080",
    "fps": 30,
    "title": "My Awesome Video",
    "parallax": "true"
  }' \
  https://your-ffmpeg-service-url.com/create-video \
  --output generated-video.mp4
```

**Note**: Replace `...` with your actual Base64-encoded audio data and `https://your-ffmpeg-service-url.com` with the actual URL of your deployed service.
