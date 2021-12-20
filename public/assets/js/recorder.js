// recorder.js
// inspired by https://www.sitepoint.com/mediastream-api-record-audio/

// Use MediaStream API objects to capture media tracks
// link the button icon to the javascript

// hold the necessary elements
const recordButton = document.getElementById('recordButton');  //record button
const recordButtonImage = recordButton.firstElementChild;
const recordedAudioContainer = document.getElementById('recordedAudioContainer');  // recorded audio
const discardAudioButton = document.getElementById('discardButton');  // hold the discard button element
const saveAudioButton = document.getElementById('saveButton');  // hold the save button element
const recordingsContainer = document.getElementById('recordings');//hold the #recordings element- fetched files

//initialize elements to be used later
let chunks = []; // will be used later to record audio
let mediaRecorder = null; // will be used later to record audio; default value is null (there’s no ongoing recording)
let audioBlob = null; // the blob that will hold the recorded audio

// record click event - create a record function and it will be the event listener to the click event on recordButton
function record() {
    // start recording: use the mediaDevices.getUserMedia()
    // getUserMedia returns a promise. If the user allows the website to record,
    // the promise’s fulfillment handler receives a MediaStream object which we can use to media
    // capture video or audio streams of the user.

    // check if browser supports getUserMedia
    // check whether navigator.mediaDevices and navigator.mediaDevices.getUserMedia are defined
    // using getUserMedia requires secure websites: a page loaded using HTTPS, file://, or from localhost
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support recording!');
        return;
    }

    // browser supports getUserMedia then change image in button
    recordButtonImage.src = `/images/${mediaRecorder && mediaRecorder.state === 'recording' ? 'microphone' : 'stop'}.png`;

    if (!mediaRecorder) {  // check if mediaRecorder (refined at the beginning) is null (no ongoing recording)
        // start recording
        navigator.mediaDevices.getUserMedia({ // prompt whether user allows microphone access
            audio: true, // only record audio
        })
            .then((stream) => { // fulfillment handler: get a MediaStream instance to start recording
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                mediaRecorder.ondataavailable = mediaRecorderDataAvailable;  // bound to a event handler
                mediaRecorder.onstop = mediaRecorderStop;  // bound to a event handler
            })
            .catch((err) => {
                alert(`The following error occurred: ${err}`);
                // change image in button
                recordButtonImage.src = '/images/microphone.png';
            });
    } else {
        // stop recording
        mediaRecorder.stop();
    }
}

// mediaRecorderDataAvailable function handles the dataAvailable event
// by adding the Blob audio track in the received BlobEvent parameter to the chunks array
function mediaRecorderDataAvailable(e) {
    chunks.push(e.data);
}

// mediaRecorderStop function removes any audio element that was previously recorded and not saved,
// creates a new audio media element, sets the src to be the Blob of the recorded stream, and shows the container
function mediaRecorderStop() {
    //check if there are any previous recordings and remove them
    if (recordedAudioContainer.firstElementChild.tagName === 'AUDIO') {
        recordedAudioContainer.firstElementChild.remove();
    }
    //create a new audio element that will hold the recorded audio
    const audioElm = document.createElement('audio');
    audioElm.setAttribute('controls', ''); //add controls
    //create the Blob from the chunks
    audioBlob = new Blob(chunks, { type: 'audio/mp3' });
    const audioURL = window.URL.createObjectURL(audioBlob);
    audioElm.src = audioURL;
    //show audio
    recordedAudioContainer.insertBefore(audioElm, recordedAudioContainer.firstElementChild);
    recordedAudioContainer.classList.add('d-flex');
    recordedAudioContainer.classList.remove('d-none');
    //reset to default
    mediaRecorder = null;
    chunks = [];
}

//  discard click event handler - functions discardRecording and resetRecording
function discardRecording() {
    //show the user the prompt to confirm they want to discard
    if (confirm('Are you sure you want to discard the recording?')) {
        //discard audio just recorded
        resetRecording();
    }
}

function resetRecording() {
    if (recordedAudioContainer.firstElementChild.tagName === 'AUDIO') {
        //remove the audio
        recordedAudioContainer.firstElementChild.remove();
        //hide recordedAudioContainer
        recordedAudioContainer.classList.add('d-none');
        recordedAudioContainer.classList.remove('d-flex');
    }
    //reset audioBlob for the next recording
    audioBlob = null;
}

// save click event handler - upload the recording(s) to the server using Fetch API when user clicks Save button
function saveRecording () {
    //the form data that will hold the Blob to upload
    const formData = new FormData();
    //add the Blob to formData
    formData.append('audio', audioBlob, 'recording.mp3');
    //send the request to the endpoint
    fetch('/record', {
        method: 'POST',
        body: formData
    })
        .then((response) => response.json())
        .then(() => {
            alert("Your recording is saved");
            //reset for next recording
            resetRecording();
            //reset for next recording
            resetRecording();
            //fetch recordings
            fetchRecordings();
        })
        .catch((err) => {
            console.error(err);
            alert("An error occurred, please try again later");
            //reset for next recording
            resetRecording();
        })
}

// fetchRecordings calls the endpoint created in index.js
function fetchRecordings() {
    fetch('/recordings')
        .then((response) => response.json())
        .then((response) => {
            if (response.success && response.files) {
                //remove all previous recordings shown
                recordingsContainer.innerHTML = '';
                response.files.forEach((file) => {
                    //create the recording element
                    const recordingElement = createRecordingElement(file);
                    //add it the the recordings container
                    recordingsContainer.appendChild(recordingElement);
                })
            }
        })
        .catch((err) => console.error(err));
}

//create the recording element - render the elements that will be the audio players.
function createRecordingElement (file) {
    //container element
    const recordingElement = document.createElement('div');
    recordingElement.classList.add('col-lg-2', 'col', 'recording', 'mt-3');
    //audio element
    const audio = document.createElement('audio');
    audio.src = file;
    audio.onended = (e) => {
        //when the audio ends, change the image inside the button to play again
        e.target.nextElementSibling.firstElementChild.src = 'images/play.png';
    };
    recordingElement.appendChild(audio);
    //button element
    const playButton = document.createElement('button');
    playButton.classList.add('play-button', 'btn', 'border', 'shadow-sm', 'text-center', 'd-block', 'mx-auto');
    //image element inside button
    const playImage = document.createElement('img');
    playImage.src = '/images/play.png';
    playImage.classList.add('img-fluid');
    playButton.appendChild(playImage);
    //add event listener to the button to play the recording
    playButton.addEventListener('click', playRecording);
    recordingElement.appendChild(playButton);
    //return the container element
    return recordingElement;
}


function playRecording (e) {
    let button = e.target;
    if (button.tagName === 'IMG') {
        //get parent button
        button = button.parentElement;
    }
    //get audio sibling
    const audio = button.previousElementSibling;
    if (audio && audio.tagName === 'AUDIO') {
        if (audio.paused) {
            //if audio is paused, play it
            audio.play();
            //change the image inside the button to pause
            button.firstElementChild.src = 'images/pause.png';
        } else {
            //if audio is playing, pause it
            audio.pause();
            //change the image inside the button to play
            button.firstElementChild.src = 'images/play.png';
        }
    }
}


//add the event listeners to the button
recordButton.addEventListener('click', record);  //record
discardAudioButton.addEventListener('click', discardRecording);  //discard audio button
saveAudioButton.addEventListener('click', saveRecording);  //save audio button
