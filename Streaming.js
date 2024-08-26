const express = require("express");
const rangeParser = require("range-parser");
const torrentStream = require("torrent-stream");

const app = express();
const port = 3000;

// Default magnet link
let defaultMagnetLink =
  "magnet:?xt=urn:btih:EC34C231DDE3E92D8D26A17C223152C8541295AA&dn=Oppenheimer+%282023%29+%5B1080p%5D+%5BBluRay%5D+%5B5.1%5D&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2F47.ip-51-68-199.eu%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2780%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2730%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce";

// Initialize torrent engine
let engine = torrentStream(defaultMagnetLink);
let videoFile;

function initializeTorrent(magnetLink) {
  engine = torrentStream(magnetLink);

  engine.on("ready", function () {
    videoFile = null;

    for (const file of engine.files) {
      if (
        file.name.endsWith(".mp4") ||
        file.name.endsWith(".mkv") ||
        file.name.endsWith(".avi") ||
        file.name.endsWith(".mov") ||
        file.name.endsWith(".wmv") ||
        file.name.endsWith(".flv") ||
        file.name.endsWith(".webm") ||
        file.name.endsWith(".mpg") ||
        file.name.endsWith(".mpeg") ||
        file.name.endsWith(".3gp") ||
        file.name.endsWith(".m4v")
      ) {
        videoFile = file;
        break;
      }
    }

    if (!videoFile) {
      console.error("No video file found in the torrent.");
    }
  });
}

// Initialize the engine with the default magnet link
initializeTorrent(defaultMagnetLink);

// Route to check if the API is working
app.get("/", (req, res) => {
  res.send("Streaming API is working!");
});

app.get("/video", function (req, res) {
  // Check if a magnet link was provided as a query parameter
  const magnetLink = req.query.magnetlink
    ? decodeURIComponent(req.query.magnetlink)
    : defaultMagnetLink;

  if (magnetLink !== defaultMagnetLink) {
    // If a new magnet link is provided, initialize the engine with it
    console.log("New magnet link:", magnetLink);
    initializeTorrent(magnetLink);
  }

  if (!videoFile) {
    res.status(404).send("No video file found in the torrent.");
    return;
  }

  console.log("Request headers:", req.headers);
  const range = req.headers.range;

  if (!range) {
    res.status(416).send("Range header is missing");
    return;
  }

  const positions = rangeParser(videoFile.length, range, { combine: true });
  if (!positions) {
    res.status(416).send("Invalid range header");
    return;
  }

  const { start, end } = positions[0];
  const stream = videoFile.createReadStream({ start, end });

  res.status(206);
  res.set("Content-Type", "video/mp4");
  res.set("Content-Range", `bytes ${start}-${end}/${videoFile.length}`);
  res.set("Accept-Ranges", "bytes");

  stream.pipe(res);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
