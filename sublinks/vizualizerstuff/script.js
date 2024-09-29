document.addEventListener("DOMContentLoaded", function () {
    const audioUpload = document.getElementById('youraudioUpload');

    if (!audioUpload) {
        console.error('Audio element not found!');
        return;
    }

    audioUpload.addEventListener('play', () => {
        console.log('Audio is playing.');
    });

    audioUpload.addEventListener('pause', () => {
        console.log('Audio is paused.');
    });

    audioUpload.addEventListener('error', (e) => {
        console.error('Audio error:', e);
    });


    const audio = new Audio();
    const playPauseButton = document.getElementById('playPause');
    const volumeSlider = document.getElementById('volume');
    const volumeIcon = document.getElementById('volumeIcon');
    const songTitle = document.getElementById('songTitle');
    const artistName = document.getElementById('artistName');
    const canvas = document.getElementById('visualizer');
    const canvasCtx = canvas.getContext('2d');

    audio.volume = 0.5;

    audioUpload.addEventListener('change', function () {
    const files = this.files;
    if (files.length === 0) return;
    const file = files[0];

    // Extract and display metadata using jsmediatags
        jsmediatags.read(file, {
            onSuccess: function (tag) {
                songTitle.textContent = `Title: ${tag.tags.title || 'Unknown'}`;
                artistName.textContent = `Artist: ${tag.tags.artist || 'Unknown'}`;
            },
            onError: function (error) {
            console.error('Error reading metadata:', error);
            }
        });
    });


    playPauseButton.addEventListener('click', function () {
        if (audio.paused) {
            audio.play();
            this.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            this.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    volumeSlider.addEventListener('input', function () {
        audio.volume = this.value;

        if (this.value == 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (this.value < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    });

    function visualizeAudio() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaElementSource(audio);

        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;

            const r = barHeight + 25 * (i / bufferLength);
            const g = 250 * (i / bufferLength);
            const b = 50;

            canvasCtx.fillStyle = `rgb(${r},${g},${b})`;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }
    draw();
}});