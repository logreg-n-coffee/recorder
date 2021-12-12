// link the button icon to the javascript

//initialize elements to be used later
const recordButton = document.getElementById('recordButton');
const recordButtonImage = recordButton.firstElementChild;

let chunks = []; //will be used later to record audio
let mediaRecorder = null; //will be used later to record audio
let audioBlob = null; //the blob that will hold the recorded audio

// create a record function and it will be the event listener to the click event on recordButton
function record() {
    //TODO start recording
}

recordButton.addEventListener('click', record);