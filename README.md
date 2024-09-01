# Streaming API

A simple streaming API built with Node.js and Express. This API uses the `torrent-stream` library to stream video files from a torrent magnet link.

## Features

- **Streaming**: Stream video files in various formats (e.g., MP4, MKV, AVI) from a torrent.
- **Magnet Link Support**: Specify different magnet links to stream different videos.
- **Range Requests**: Support for HTTP range requests, allowing for streaming of partial content.

## Getting Started

### Prerequisites

- Node.js
- npm (Node Package Manager)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/niteshbhaiya4224/StreamingApi.git
   cd StreamingApi
   npm install
   ```

2. **Start the server:**

   ```bash
   node index.js
   ```

   The server will start on [http://localhost:3000](http://localhost:3000).

## API Endpoints

### GET /

Check if the API is working.

**Response:**

- `200 OK`: "Streaming API is working!"

### GET /video

Stream video from the torrent.

**Query Parameters:**

- `magnetlink` (optional): A URL-encoded magnet link to stream a different video.

**Response:**

- `206 Partial Content`: Streams the video file.
- `404 Not Found`: If no video file is found.
- `416 Range Not Satisfiable`: If the Range header is missing or invalid.

## Deployment

The API is deployed and available at: [https://streaming-api-seven.vercel.app/](https://streaming-api-seven.vercel.app/)

## Example Usage

To stream the default video:

```http
GET https://streaming-api-seven.vercel.app/video
```

To stream a video from a specific magnet link:

```http
GET https://streaming-api-seven.vercel.app/video?magnetlink=<your-magnet-link>
```

## Contributors

- **Nitesh Bhaiya** - Project Lead

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---
