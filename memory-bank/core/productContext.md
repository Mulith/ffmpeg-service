# Product Context: The "Why" and "How"

## The Problem

Many developers need to programmatically create or modify video and audio content. For example, generating a slideshow video from a set of images with a background track, adding watermarks, or changing video formats. The industry-standard tool for this is FFmpeg, a powerful but complex command-line utility.

The challenges developers face are:
-   **Complexity**: FFmpeg has a steep learning curve with a vast number of options and syntaxes.
-   **Environment Restrictions**: Many modern hosting platforms (like serverless environments or shared hosting) do not allow users to install custom binaries, making it impossible to use FFmpeg directly.
-   **Infrastructure Overhead**: Managing a dedicated server with FFmpeg, handling file storage, and ensuring security is a significant distraction from building the core product.

## The Solution: A Simple API

This service solves these problems by wrapping FFmpeg in a simple, easy-to-use RESTful API.

### How It Should Work

A user interacts with the service by sending a `POST` request to an endpoint (e.g., `/create-video`). The body of this request is a JSON object containing all the necessary data and parameters for the video creation job.

**Example Workflow: Creating a Slideshow Video**

1.  The user's application collects a series of image URLs and an audio file (as a Base64 encoded string).
2.  It also defines parameters like the desired output `resolution`, `fps`, and the `duration` each image should be displayed.
3.  It sends a single `POST` request to the `/create-video` endpoint with all this information.
4.  The service downloads the images and decodes the audio.
5.  It constructs and executes the appropriate FFmpeg command based on the user's parameters.
6.  Once the video is generated, the service streams the resulting MP4 file back to the user in the HTTP response.
7.  All temporary files (downloaded images, audio, and the final video) are cleaned up from the server, ensuring the service remains stateless.

### User Experience Goals

-   **Simplicity**: A developer should be able to create a video with a single, well-documented API call.
-   **Clarity**: Error messages should be clear and help the user understand what went wrong (e.g., "Missing audio data," "Failed to download images").
-   **Flexibility**: The API should expose common FFmpeg options (like resolution, effects, and formats) without overwhelming the user.

## Primary Consumer: The `scheduled-content-flow-98` App

This API is not just a standalone tool; it is the engine for the `scheduled-content-flow-98` web application. This app provides a UI for the features exposed by this API, allowing end-users (not just developers) to create video content. The development of this API is therefore directly driven by the needs of that front-end application.
