# Related Projects: Consumers of the API

## `scheduled-content-flow-98` (The App)

This is the primary front-end consumer of the FFmpeg-as-a-Service API. It is a web application designed to help users create and schedule video content.

### Project Purpose

The app's goal is to streamline the content creation process for social media, marketing, and other platforms. It allows users to assemble video slideshows from images, add background audio, and schedule when the content should be published. This project serves as both a real-world testbed for the FFmpeg API and a standalone product intended for market.

### Core Features

-   **Video Assembly**: Provides a user interface for selecting images, uploading audio, and configuring video parameters (resolution, durations, etc.).
-   **API Integration**: It directly calls the `ffmpeg-service` to generate the videos.
-   **Scheduling**: (Intended feature) Will allow users to schedule the generated content for future publishing.
-   **Backend**: Uses Supabase for its backend services, likely for user authentication, data storage (e.g., saved projects, user assets), and other business logic.

### Relationship to `ffmpeg-service`

-   **Client-Server**: `scheduled-content-flow-98` is the client, and `ffmpeg-service` is the server.
-   **Testing and Validation**: It is the primary tool for testing the API in a realistic scenario, helping to drive requirements and identify bugs.
-   **Production Pathway**: The success of this app is tied to the reliability and feature set of the API. As the app evolves, it will likely demand more features from the `ffmpeg-service`.
