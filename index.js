
// create a server that will run on port 3000 unless a port is set in the environment
const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// expose a directory public/assets
app.use(express.static('public/assets'));

// specify the route to listen to
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// listen
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});