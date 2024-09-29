const audioUpload = document.getElementById('audio-upload');
const audioPlayer = document.getElementById('audio-player');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let audioContext;
let analyser;
let dataArray;
let bufferLength;

// Initialize Audio Context and Analyser
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audioPlayer);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

// Render the Visualizer
function renderVisualizer() {
    requestAnimationFrame(renderVisualizer);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
    }
}

// Handle Audio Upload
audioUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const objectUrl = URL.createObjectURL(file);
        audioPlayer.src = objectUrl;
        audioPlayer.load();
        audioPlayer.play();
        initAudio();
        renderVisualizer();
    }
});

// Extract Metadata (optional)
audioUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        jsmediatags.read(file, {
            onSuccess: function(tag) {
                console.log(tag);
                // Optional: Use metadata to display song info
            },
            onError: function(error) {
                console.error('Error reading metadata:', error.type, error.info);
            }
        });
    }
});

