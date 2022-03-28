// create a server that will run on port 3000 unless a port is set in the environment
const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// API endpoint - uploading
const fs = require('fs');
const multer = require('multer');

// claim storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');  // store files in the uploads directory (located in the root)
    },
    filename(req, file, cb) { // saving the files based on the current timestamp with the extension
        const fileNameArr = file.originalname.split('.');
        cb(null, `${Date.now()}.${fileNameArr[fileNameArr.length - 1]}`);
    },
});
const upload = multer({ storage });  // middleware that will upload files

// API endpoint - show recordings
app.get('/recordings', (req, res) => {
    let files = fs.readdirSync(path.join(__dirname, 'uploads'));  // read the files in uploads directory
    files = files.filter((file) => {  // filter files and get mp3 files
        // check that the files are audio files
        const fileNameArr = file.split('.');
        return fileNameArr[fileNameArr.length - 1] === 'mp3';
    }).map((file) => `/${file}`);
    return res.json({ success: true, files }); // return a json with files
});

// expose a directory public/assets - make files inside public/assets accessible
app.use(express.static('public/assets'));

// specify the route to listen to
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// expose uploads - make files inside the uploads directory accessible
app.use(express.static('uploads'));

// upload endpoint - use the upload middleware to upload the audio and return a JSON response
app.post('/record', upload.single('audio'), (req, res) => res.json({ success: true }));

// **listen**
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});