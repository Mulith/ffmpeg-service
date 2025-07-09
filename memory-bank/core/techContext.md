# Technical Context: Stack and Dependencies

## Core Technologies

-   **Node.js**: The runtime environment for the application. It's asynchronous, event-driven nature is well-suited for handling I/O-bound operations like downloading files and processing API requests.
-   **Express.js**: A minimal and flexible Node.js web application framework that provides a robust set of features for building the API, including routing, middleware, and request/response handling.

## Key Dependencies

-   **`fluent-ffmpeg`**: A Node.js wrapper for FFmpeg that provides a "fluent" or chainable API for building complex FFmpeg commands in a programmatic and readable way. This is the core library for interacting with FFmpeg.
-   **`ffmpeg-static`**: Provides a static binary of FFmpeg for the current platform. This is crucial as it allows the service to run without requiring a system-wide installation of FFmpeg, making the application self-contained and portable.
-   **`express`**: The web server framework, as mentioned above.
-   **`multer`**: A Node.js middleware for handling `multipart/form-data`, which is primarily used for uploading files. While the current implementation uses Base64-encoded data, Multer might be used in the future for direct file uploads.
-   **`axios`**: A promise-based HTTP client for Node.js. It is used here to download the images from the URLs provided by the user.

## Development and Execution

-   **Entry Point**: The application starts from `src/index.js`.
-   **Starting the Service**: The service is started by running `npm start`, which executes `node src/index.js`.
-   **Containerization**: A `Dockerfile` is present, indicating that the service is designed to be built and run as a Docker container. This ensures a consistent and isolated environment for the application.
