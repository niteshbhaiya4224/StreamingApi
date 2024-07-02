// const express = require('express');
// const rangeParser = require('range-parser');
// const torrentStream = require('torrent-stream');

// const app = express();
// const port = 3000;

// if (process.argv.length < 3) {
//   console.error('Please provide the magnet link as a command-line argument.');
//   process.exit(1);
// }

// const magnetLink = process.argv[2];
// const engine = torrentStream(magnetLink);

// engine.on('ready', function() {
//   let videoFile;

//   // Iterate through the files and choose the first one with a video extension
//   for (const file of engine.files) {
//     if (
//       file.name.endsWith('.mp4') ||
//       file.name.endsWith('.mkv') ||
//       file.name.endsWith('.avi') ||
//       file.name.endsWith('.mov') ||
//       file.name.endsWith('.wmv') ||
//       file.name.endsWith('.flv') ||
//       file.name.endsWith('.webm') ||
//       file.name.endsWith('.mpg') ||
//       file.name.endsWith('.mpeg') ||
//       file.name.endsWith('.3gp') ||
//       file.name.endsWith('.m4v')
//     ) {
//       videoFile = file;
//       break;
//     }
//   }

//   if (!videoFile) {
//     console.error('No video file found in the torrent.');
//     return;
//   }

//   app.get('/video', function(req, res) {
//     console.log('Request headers:', req.headers);

//     const range = req.headers.range;

//     if (!range) {
//       // Handle the case where the range header is missing
//       console.error('Range header is missing');
//       res.status(416).send('Range header is missing');
//       return;
//     }

//     const positions = rangeParser(videoFile.length, range, { combine: true });

//     if (!positions) {
//       // Handle the case where the range header is invalid
//       console.error('Invalid range header');
//       res.status(416).send('Invalid range header');
//       return;
//     }

//     const { start, end } = positions[0];
//     const stream = videoFile.createReadStream({ start, end });

//     res.status(206); // 206 Partial Content
//     res.set('Content-Type', 'video/mp4');
//     res.set('Content-Range', `bytes ${start}-${end}/${videoFile.length}`);
//     res.set('Accept-Ranges', 'bytes');

//     stream.pipe(res);
//   });

//   app.listen(port, () => {
//     console.log(`Server is running at http://localhost:${port}`);
//   });
// });


const express = require('express');
const rangeParser = require('range-parser');
const torrentStream = require('torrent-stream');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://127.0.0.1:5500'  // Update with your frontend URL
}));

app.post('/magneturl', function(req, res) {
  const magnetLink = req.body.magnetLink;

  if (!magnetLink) {
    return res.status(400).json({ error: 'Magnet link is required' });
  }

  const engine = torrentStream(magnetLink);

  engine.on('ready', function() {
    let videoFile;

    // Iterate through the files and choose the first one with a video extension
    for (const file of engine.files) {
      if (
        file.name.endsWith('.mp4') ||
        file.name.endsWith('.mkv') ||
        file.name.endsWith('.avi') ||
        file.name.endsWith('.mov') ||
        file.name.endsWith('.wmv') ||
        file.name.endsWith('.flv') ||
        file.name.endsWith('.webm') ||
        file.name.endsWith('.mpg') ||
        file.name.endsWith('.mpeg') ||
        file.name.endsWith('.3gp') ||
        file.name.endsWith('.m4v')
      ) {
        videoFile = file;
        break;
      }
    }

    if (!videoFile) {
      console.error('No video file found in the torrent.');
      return res.status(404).json({ error: 'No video file found in the torrent' });
    }

    app.get('/video', function(req, res) {
      console.log('Request headers:', req.headers);

      const range = req.headers.range;

      if (!range) {
        // Handle the case where the range header is missing
        console.error('Range header is missing');
        res.status(416).send('Range header is missing');
        return;
      }

      const positions = rangeParser(videoFile.length, range, { combine: true });

      if (!positions) {
        // Handle the case where the range header is invalid
        console.error('Invalid range header');
        res.status(416).send('Invalid range header');
        return;
      }

      const { start, end } = positions[0];
      const stream = videoFile.createReadStream({ start, end });

      res.status(206); // 206 Partial Content
      res.set('Content-Type', 'video/mp4');
      res.set('Content-Range', `bytes ${start}-${end}/${videoFile.length}`);
      res.set('Accept-Ranges', 'bytes');

      stream.pipe(res);
    });

    // Notify that the server is running with the video stream endpoint
    res.json({ message: `Streaming server is running at http://localhost:${port}/video` });
  });

  engine.on('error', function(err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Error occurred while processing the torrent' });
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
