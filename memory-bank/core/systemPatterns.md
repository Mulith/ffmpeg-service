# System Patterns and Architecture

## Core Architecture: Stateless Microservice

The application is designed as a classic stateless microservice.

-   **Single Responsibility**: Its sole purpose is to process media files via an API. It does not manage user accounts, sessions, or persistent data.
-   **Statelessness**: Each API request is self-contained. The service holds no memory of past requests. All required data (image URLs, audio, parameters) is provided in the request itself. Temporary files are created for processing but are deleted upon completion or error, ensuring the system returns to its initial state.
-   **API-Driven**: Interaction with the service is exclusively through a RESTful API.

## Key Design Patterns

### 1. API Endpoint as a Facade

The `/create-video` endpoint acts as a **Facade** pattern. It provides a simple, unified interface to a complex subsystem (the entire FFmpeg video generation process). The client doesn't need to know about file downloads, temporary storage, or the intricacies of `fluent-ffmpeg` command construction.

### 2. Asynchronous, Promise-Based Flow

The entire request handling process is asynchronous, leveraging `async/await` and Promises.

-   The `downloadImage` function returns a Promise that resolves when the file stream is finished.
-   The main `/create-video` handler is an `async` function, allowing it to `await` the completion of all image downloads before proceeding.
-   The `fluent-ffmpeg` library is event-driven (`.on('end', ...)` and `.on('error', ...)`), which fits naturally into Node.js's asynchronous model.

### 3. Temporary File Management and Cleanup

A critical pattern in this service is the management of temporary files.

-   **Centralized Temp Directory**: All temporary files are stored in a `temp/` directory.
-   **Unique Naming**: Files are given unique names using `Date.now()` to prevent collisions between concurrent requests.
-   **Guaranteed Cleanup**: A `try...catch...finally` or equivalent event-based cleanup (`.on('end', ...)` and `.on('error', ...)` callbacks) is essential. The current implementation correctly deletes all temporary files both on success (`end` event) and on failure (`error` event), preventing the server's disk from filling up.

### 4. Conditional Logic for Feature Toggling (Parallax Effect)

The service uses a simple conditional check (`if (parallax === 'true')`) to implement different FFmpeg command chains. This is a basic form of a **Strategy** or **Policy** pattern, where the `parallax` parameter determines which video processing algorithm to apply. One branch builds a simple image slideshow, while the other constructs a complex filter graph for the Ken Burns (pan and zoom) effect.
