# FFmpeg Service API Documentation

This document provides instructions on how to use the FFmpeg service to create videos from images and audio.

## Endpoint: `/create-video`

- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

This endpoint processes a set of images and an audio file to generate a video. It can optionally apply a parallax (Ken Burns) effect to the images.

### Request Parameters

The request must be sent as `multipart/form-data` with the following fields:

| Field Name | Type   | Required | Description                                                                                             |
|------------|--------|----------|---------------------------------------------------------------------------------------------------------|
| `images`   | File[] | Yes      | An array of image files to be included in the video. The order of the files determines their sequence.    |
| `audio`    | File   | Yes      | A single audio file to be used as the soundtrack for the video.                                         |
| `title`    | String | No       | A title for the video. This is not currently used in the video itself but is good practice to include. |
| `parallax` | String | No       | A string that can be set to `"true"` to enable a parallax (zoom and pan) effect on the images. If omitted or set to any other value, the images will be static. |

### Success Response

- **Code**: `200 OK`
- **Content-Type**: `video/mp4`

If the request is successful, the service will respond with the generated video file as a downloadable attachment.

### Error Responses

- **Code**: `400 Bad Request`
  - **Content**: `Missing images or audio file.`
  - **Reason**: The request did not include the required `images` or `audio` files.

- **Code**: `500 Internal Server Error`
  - **Content**: `Error creating video.`
  - **Reason**: An unexpected error occurred during the FFmpeg processing.

### Example Usage

Here is an example of how to call the API using `curl`:

```bash
curl -X POST \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "audio=@/path/to/narration.mp3" \
  -F "title=My Awesome Video" \
  -F "parallax=true" \
  https://your-ffmpeg-service-url.com/create-video \
  --output generated-video.mp4
```

**Note**: Replace `https://your-ffmpeg-service-url.com` with the actual URL of your deployed service.
