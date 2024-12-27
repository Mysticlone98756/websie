document.addEventListener('DOMContentLoaded', function () {
    if (window.Howler) {
        console.log('Howler.js is loaded');
    } else {
        console.error('Howler.js is not loaded');
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let audioPlayer = null;
    let isPlaying = false;
    let source = null;
    const progressBar = document.getElementById('progress-bar');
    const playPauseButton = document.getElementById('play-pause');

    playPauseButton.addEventListener('click', togglePlayPause);

    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('audio/')) {
            loadAudio(file);
        }
    });

    function loadAudio(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const audioData = e.target.result;
            const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
            const audioURL = URL.createObjectURL(audioBlob);

            if (source) {
                source.disconnect();
                source = null;
            }

            if (audioPlayer) {
                audioPlayer.unload();
            }

            audioPlayer = new Howl({
                src: [audioURL],
                html5: true,
                volume: 1.0,
                onplay: function () {
                    if (!source) {
                        attachVisualizer();  // Make sure visualizer is attached only when playing
                    }
                    updateProgressBar();
                    playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';                
                    isPlaying = true;
                },
                onpause: function () {
                    playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
                    isPlaying = false;
                },
                onend: function () {
                    resetProgressBar();
                    playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
                    isPlaying = false;
                }
            });
            
            audioContext.resume().then(() => {
                audioPlayer.play();
            });
        };
        reader.readAsArrayBuffer(file);
    }

    function togglePlayPause() {
        if (audioPlayer) {
            if (isPlaying) {
                audioPlayer.pause();
                isPlaying = false;
            } else {
                audioContext.resume().then(() => {
                    audioPlayer.play();
                    isPlaying = true;
                });
            }
        }
    }

    function attachVisualizer() {
        const interval = setInterval(() => {
            if (audioPlayer && audioPlayer._sounds[0] && audioPlayer._sounds[0]._node) {
                clearInterval(interval);
                const audioNode = audioPlayer._sounds[0]._node;
                if (audioNode) {
                    source = audioContext.createMediaElementSource(audioNode);
                    source.connect(analyser);  // Make sure this line is here
                    analyser.connect(audioContext.destination);  // Connect to audio context
                    startVisualizer();
                }
            }
        }, 100);
    }
    

    function startVisualizer() {
        function draw() {
            if (!isPlaying) return;
    
            analyser.getByteFrequencyData(dataArray);  // Get the latest frequency data
            ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
            console.log(dataArray);
            const barWidth = canvas.width / analyser.frequencyBinCount;
            let x = 0;
    
            for (let i = 0; i < analyser.frequencyBinCount; i++) {
                const barHeight = dataArray[i];  // Get the frequency data for each bar
                ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
                x += barWidth;
            }
    
            requestAnimationFrame(draw);  // Continue the drawing loop
        }
    
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        draw();  // Start the drawing loop
    }
    
    

    progressBar.addEventListener('input', function () {
        if (audioPlayer && audioPlayer.playing()) {
            const newTime = (progressBar.value / 100) * audioPlayer.duration();
            audioPlayer.seek(newTime);
        }
    });

    function updateProgressBar() {
        if (audioPlayer && audioPlayer.playing()) {
            const progress = (audioPlayer.seek() / audioPlayer.duration()) * 100;
            progressBar.value = progress;
    
            requestAnimationFrame(updateProgressBar);
        }
    }
    
    

    function resetProgressBar() {
        progressBar.value = 0;
    }

    function setCanvasSize() {
        // Set the canvas width and height based on the display size and pixel ratio
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio); // Prevent blur
    }
    
    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();
    
    
});
