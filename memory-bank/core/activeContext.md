# Active Context: Initial Setup

## Current Focus

The primary focus is on establishing the foundational documentation for the project. The goal is to create a comprehensive "memory bank" that allows any developer (or AI) to quickly understand the project's purpose, technology, and architecture.

## Recent Changes

-   Initialized the `memory-bank/` directory.
-   Created the initial versions of:
    -   `projectbrief.md`
    -   `productContext.md`
    -   `techContext.md`
    -   `systemPatterns.md`

## Next Steps

1.  Create the initial `progress.md` file to document the current state of functionality.
2.  Perform a "code autopsy" of the existing `src/index.js` to ensure the documentation accurately reflects the implementation.
3.  Identify any discrepancies or areas for improvement in the code or documentation.

## Key Decisions and Considerations

-   The documentation should be written from the perspective of someone with no prior knowledge of the project.
-   The file structure of the memory bank is intentionally hierarchical, with the `projectbrief.md` serving as the root.
-   The `ffmpeg-service` is not being developed in a vacuum. It is the backend for the `scheduled-content-flow-98` application, and its development should be guided by the needs of that primary consumer.
-   A `context-pools` directory has been added to the memory bank to hold information about related but separate systems.
