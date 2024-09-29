const playPauseBtn = document.getElementById('playPauseBtn');
let isPlaying = false;
const audio = new Audio('/path/to/song.mp3');

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        playPauseBtn.classList.replace('fa-pause', 'fa-play');
    } else {
        audio.play();
        playPauseBtn.classList.replace('fa-play', 'fa-pause');
    }
    isPlaying = !isPlaying;
});

// Update progress bar and time
audio.addEventListener('timeupdate', () => {
    const progress = document.getElementById('progress');
    const currentTime = document.getElementById('currentTime');
    const duration = document.getElementById('duration');

    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${progressPercent}%`;

    currentTime.textContent = formatTime(audio.currentTime);
    duration.textContent = formatTime(audio.duration);
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsPart = Math.floor(seconds % 60);
    return `${minutes}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
}
