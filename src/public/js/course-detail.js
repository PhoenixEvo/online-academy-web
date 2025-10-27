// course-detail.js - Video preview functionality for course detail page

// Helper functions
function isYouTubeUrl(url) {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
}

function getYouTubeVideoId(url) {
    if (!url) return null;
    
    // Already an embed URL
    if (url.includes('/embed/')) {
        const match = url.match(/embed\/([^?]+)/);
        return match ? match[1] : null;
    }
    
    // youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
        const match = url.match(/[?&]v=([^&]+)/);
        return match ? match[1] : null;
    }
    
    // youtu.be/VIDEO_ID
    if (url.includes('youtu.be/')) {
        const match = url.match(/youtu\.be\/([^?]+)/);
        return match ? match[1] : null;
    }
    
    return null;
}

// Main functionality
document.addEventListener('DOMContentLoaded', function() {
    const previewItems = document.querySelectorAll('.lesson-preview-item');
    const videoModal = document.getElementById('videoPreviewModal');
    
    if (!videoModal || previewItems.length === 0) {
        return; // No preview functionality needed on this page
    }

    const bsModal = new bootstrap.Modal(videoModal);
    const videoPlayer = document.getElementById('videoPlayer');
    const youtubePlayerDiv = document.getElementById('youtubePlayer');
    const plyrYoutubeDiv = document.getElementById('plyr-youtube');
    const videoSource = document.getElementById('videoSource');
    const modalTitle = document.getElementById('videoPreviewModalLabel');
    
    let currentPlayer = null;

    // Setup YouTube player with Plyr
    function setupYouTubePlayer(videoUrl) {
        const videoId = getYouTubeVideoId(videoUrl);
        
        if (!videoId) {
            alert('Invalid YouTube URL');
            return;
        }

        // Show YouTube player, hide regular video
        videoPlayer.style.display = 'none';
        youtubePlayerDiv.style.display = 'block';

        // Clear and recreate the div for Plyr
        plyrYoutubeDiv.innerHTML = '';
        const newDiv = document.createElement('div');
        newDiv.setAttribute('data-plyr-provider', 'youtube');
        newDiv.setAttribute('data-plyr-embed-id', videoId);
        plyrYoutubeDiv.appendChild(newDiv);

        // Initialize Plyr for YouTube
        try {
            currentPlayer = new Plyr(newDiv, {
                controls: [
                    'play-large',
                    'play',
                    'progress',
                    'current-time',
                    'mute',
                    'volume',
                    'fullscreen'
                ],
                youtube: {
                    noCookie: false,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    modestbranding: 1
                }
            });
        } catch (e) {
            const toastEl = document.getElementById('videoErrorToast');
            if (toastEl) {
                const toast = new bootstrap.Toast(toastEl);
                toast.show();
            }
        }
    }

    // Setup regular video player with Plyr
    function setupRegularVideoPlayer(videoUrl) {
        // Hide YouTube player, show regular video
        youtubePlayerDiv.style.display = 'none';
        videoPlayer.style.display = 'block';
        
        videoSource.src = videoUrl;
        videoPlayer.load();

        // Initialize Plyr for regular video
        try {
            currentPlayer = new Plyr(videoPlayer, {
                controls: [
                    'play-large',
                    'play',
                    'progress',
                    'current-time',
                    'mute',
                    'volume',
                    'fullscreen'
                ]
            });
        } catch (e) {
            const toastEl = document.getElementById('videoErrorToast');
            if (toastEl) {
                const toast = new bootstrap.Toast(toastEl);
                toast.show();
            }
        }
    }

    // Handle preview item clicks
    previewItems.forEach(item => {
        item.addEventListener('click', function() {
            const videoUrl = this.getAttribute('data-video-url');
            const lessonTitle = this.getAttribute('data-lesson-title');

            if (!videoUrl) {
                console.warn('No video URL available for preview');
                return;
            }

            modalTitle.textContent = 'Preview: ' + lessonTitle;

            // Destroy previous player if exists
            if (currentPlayer) {
                try {
                    currentPlayer.destroy();
                } catch (e) {
                    const toastEl = document.getElementById('videoErrorToast');
                    if (toastEl) {
                        const toast = new bootstrap.Toast(toastEl);
                        toast.show();
                    }
                }
                currentPlayer = null;
            }

            // Check if it's a YouTube URL
            if (isYouTubeUrl(videoUrl)) {
                setupYouTubePlayer(videoUrl);
            } else {
                setupRegularVideoPlayer(videoUrl);
            }

            bsModal.show();
        });
    });

    // Stop video when modal is closed
    videoModal.addEventListener('hidden.bs.modal', function() {
        if (currentPlayer) {
            try {
                currentPlayer.stop();
            } catch (e) {
                console.warn('Error stopping player:', e);
            }
        }
    });

    // Hover effects for preview items
    previewItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
            this.style.transition = 'background-color 0.2s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
    });
});