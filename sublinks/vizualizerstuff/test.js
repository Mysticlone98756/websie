const audioFile = document.getElementById('audioFile');
const lyricsFile = document.getElementById('lyricsFile');
const startButton = document.getElementById('startButton');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const lyricsDisplay = document.getElementById('lyricsDisplay');

let audioContext, analyser, source, bufferLength, dataArray, audio, isPlaying = false, animationId;
let lyrics = [];
let currentLyricIndex = 0;

startButton.addEventListener('click', () => {
    if (isPlaying) return;
    visualize();
    isPlaying = true;

    const file = audioFile.files[0];
    const lyricsFileObj = lyricsFile.files[0];
    if (!file || !lyricsFileObj) {
        alert("Please select both an audio and lyrics file!");
        return;
    }

    audio = new Audio(URL.createObjectURL(file));

    // Load and parse the lyrics file
    const reader = new FileReader();
    reader.onload = function(event) {
        lyrics = parseLyrics(event.target.result);
        console.log("Parsed Lyrics:", lyrics); // Verify parsed lyrics
    };
    reader.readAsText(lyricsFileObj);

    audio.play().then(() => {
        console.log("Audio started playing");
        updateLyrics();
    });
    audio.addEventListener('ended', () => {
        cancelAnimationFrame(animationId);
        startButton.disabled = false;
        isPlaying = false;
        lyricsDisplay.textContent = "Audio has ended.";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    audio.play().then(() => {
        console.log("Audio started playing");
        visualize();
        lyricsDisplay.textContent = "Test Lyrics Display"; // Replace this line in updateLyrics

    });

    startButton.disabled = true;
});

function visualize() {
    console.log("Visualizer running")
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
        analyser.getByteFrequencyData(dataArray);
    } catch (error) {
        console.error("Error getting frequency data:", error);
    }
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
    }

    animationId = requestAnimationFrame(visualize);
}

audio.play().then(() => {
    console.log("Audio started playing");
    updateLyrics();
});

function parseLyrics(lyricsText) {
    const lines = lyricsText.split('\n');
    return lines.map(line => {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.+)/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3]) * 10;
            const time = minutes * 60 + seconds + milliseconds / 1000;
            return { time, text: match[4].trim() };
        }
        return null;
    }).filter(line => line !== null);
}

function updateLyrics() {
    if (lyrics.length === 0 || !audio) return;

    const currentTime = audio.currentTime;

    if (currentLyricIndex < lyrics.length - 1 && currentTime >= lyrics[currentLyricIndex + 1].time) {
        currentLyricIndex++;
    }

    // Update lyrics text
    lyricsDisplay.textContent = lyrics[currentLyricIndex]?.text || "";

    // Apply slide-up effect
    lyricsDisplay.classList.remove('visible'); // Reset
    void lyricsDisplay.offsetWidth; // Trigger reflow to restart CSS animation
    lyricsDisplay.classList.add('visible');

    requestAnimationFrame(updateLyrics);
}