// Toast notification helper
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

function showToast(message, type = 'success') {
    const toastEl = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    const toast = new bootstrap.Toast(toastEl);

    toastEl.className = `toast align-items-center text-white border-0 ${type === 'success' ? 'bg-success' : type === 'info' ? 'bg-info' : 'bg-danger'}`;
    toastMessage.textContent = message;
    toast.show();
}

// Star rating functionality
document.addEventListener('DOMContentLoaded', function() {
    const stars = document.querySelectorAll('.star-rating i');
    const ratingText = document.getElementById('rating-text');
    const ratingInput = document.getElementById('rating-input');
    let selectedRating = 5;

    if (stars.length > 0) {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                selectedRating = parseInt(this.getAttribute('data-value'));
                if (ratingInput) {
                    ratingInput.value = selectedRating;
                }
                updateStars(selectedRating);
                if (ratingText) {
                    ratingText.textContent = `You rated: ${selectedRating} star${selectedRating > 1 ? 's' : ''}`;
                }
            });

            star.addEventListener('mouseenter', function() {
                const value = parseInt(this.getAttribute('data-value'));
                updateStars(value);
            });
        });

        const starRating = document.querySelector('.star-rating');
        if (starRating) {
            starRating.addEventListener('mouseleave', function() {
                updateStars(selectedRating);
            });
        }

        function updateStars(rating) {
            stars.forEach(star => {
                const value = parseInt(star.getAttribute('data-value'));
                if (value <= rating) {
                    star.classList.remove('bi-star');
                    star.classList.add('bi-star-fill');
                    star.style.color = '#ffc107';
                } else {
                    star.classList.remove('bi-star-fill');
                    star.classList.add('bi-star');
                    star.style.color = '#ddd';
                }
            });
        }
    }

    // Mark as complete/uncomplete functionality
    const markCompleteBtn = document.getElementById('mark-complete-btn');
    if (markCompleteBtn) {
        markCompleteBtn.addEventListener('click', async function() {
            const lessonId = this.getAttribute('data-lesson-id');
            const isCompleted = this.getAttribute('data-completed') === 'true';
            const action = isCompleted ? 'uncomplete' : 'complete';

            try {
                const response = await fetch(`/learn/${lessonId}/${action}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': csrfToken
                    }
                });

                const data = await response.json();

                if (data.success) {
                    if (action === 'complete') {
                        this.innerHTML = '<i class="bi bi-check-circle-fill"></i> Completed';
                        this.classList.remove('btn-success');
                        this.classList.add('btn-outline-success');
                        this.setAttribute('data-completed', 'true');
                        showToast('Lesson marked as complete!');
                    } else {
                        this.innerHTML = '<i class="bi bi-circle"></i> Mark as Complete';
                        this.classList.remove('btn-outline-success');
                        this.classList.add('btn-success');
                        this.setAttribute('data-completed', 'false');
                        showToast('Lesson marked as incomplete');
                    }

                    if (data.progress) {
                        const progressBar = document.querySelector('.progress-bar');
                        if (progressBar) {
                            progressBar.style.width = `${data.progress.percentage}%`;
                            progressBar.textContent = `${data.progress.completed}/${data.progress.total} lessons (${data.progress.percentage}%)`;
                        }
                    }

                    updateSidebarCheckmarks();
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Failed to update lesson status', 'error');
            }
        });
    }

    function updateSidebarCheckmarks() {
        const currentLessonId = markCompleteBtn ? markCompleteBtn.getAttribute('data-lesson-id') : null;
        if (!currentLessonId) return;

        const lessonLink = document.querySelector(`.list-group-item[href="/learn/${currentLessonId}"]`);
        if (lessonLink) {
            const icon = lessonLink.querySelector('i');
            const isCompleted = markCompleteBtn.getAttribute('data-completed') === 'true';

            if (icon) {
                if (isCompleted) {
                    icon.className = 'bi bi-check-circle-fill text-success';
                } else {
                    icon.className = 'bi bi-circle text-muted';
                }
            }
        }
    }

    // ========== PLYR VIDEO PLAYER INTEGRATION ==========
    let player;
    let progressUpdateInterval;
    let lastSavedTime = 0;
    let hasAutoCompleted = false;
    let lessonDuration = 0;

    // Initialize Plyr for YouTube
    const youtubePlayer = document.getElementById('plyr-youtube-player');
    if (youtubePlayer) {
        player = new Plyr(youtubePlayer, {
            controls: [
                'play-large',
                'play',
                'progress',
                'current-time',
                'mute',
                'volume',
                'captions',
                'settings',
                'pip',
                'airplay',
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

        // Plyr events for YouTube
        player.on('ready', onPlayerReady);
        player.on('playing', startProgressTracking);
        player.on('pause', () => {
            stopProgressTracking();
            saveProgress(false);
        });
        player.on('ended', () => {
            stopProgressTracking();
            if (!hasAutoCompleted) {
                saveProgress(true);
            }
        });
    }

    // Initialize Plyr for regular video
    const regularVideo = document.getElementById('lesson-video-player');
    if (regularVideo) {
        player = new Plyr(regularVideo, {
            controls: [
                'play-large',
                'play',
                'progress',
                'current-time',
                'mute',
                'volume',
                'captions',
                'settings',
                'pip',
                'airplay',
                'fullscreen'
            ]
        });

        // Plyr events for regular video
        player.on('ready', onPlayerReady);
        player.on('playing', startProgressTracking);
        player.on('pause', () => {
            stopProgressTracking();
            saveProgress(false);
        });
        player.on('ended', () => {
            stopProgressTracking();
            if (!hasAutoCompleted) {
                saveProgress(true);
            }
        });
    }

    async function onPlayerReady(event) {
        console.log('Plyr player ready');

        // Get lesson duration
        lessonDuration = Math.floor(player.duration);

        const lessonId = markCompleteBtn ? markCompleteBtn.getAttribute('data-lesson-id') : null;
        if (!lessonId) return;

        try {
            const response = await fetch(`/learn/${lessonId}/get-progress`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                }
            });

            const data = await response.json();

            if (data.success && data.progress) {
                const watchedSec = data.progress.watched_sec || 0;
                const completed = data.progress.completed || false;

                // Resume from last position if not completed
                if (!completed && watchedSec > 5) {
                    player.currentTime = watchedSec;
                    showToast(`Resuming from ${formatTime(watchedSec)}`, 'info');
                }

                // Mark as completed if already completed
                if (completed && markCompleteBtn) {
                    markCompleteBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Completed';
                    markCompleteBtn.classList.remove('btn-success');
                    markCompleteBtn.classList.add('btn-outline-success');
                    markCompleteBtn.setAttribute('data-completed', 'true');
                    hasAutoCompleted = true;
                }
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    function startProgressTracking() {
        if (progressUpdateInterval) return;

        // Save every 3 seconds for better accuracy
        progressUpdateInterval = setInterval(() => {
            saveProgress(false);
        }, 3000);
    }

    function stopProgressTracking() {
        if (progressUpdateInterval) {
            clearInterval(progressUpdateInterval);
            progressUpdateInterval = null;
        }
    }

    async function saveProgress(autoComplete = false) {
        if (!player || !player.currentTime) return;

        const lessonId = markCompleteBtn ? markCompleteBtn.getAttribute('data-lesson-id') : null;
        if (!lessonId) return;

        const currentTime = Math.floor(player.currentTime);

        // Don't save if time hasn't changed and not auto-completing
        if (Math.abs(currentTime - lastSavedTime) < 2 && !autoComplete) return;

        lastSavedTime = currentTime;

        // Auto-complete if watched >= 95% of video
        const watchPercentage = (currentTime / lessonDuration) * 100;
        const shouldAutoComplete = watchPercentage >= 95 && !hasAutoCompleted;

        try {
            const response = await fetch(`/learn/${lessonId}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({
                    watched_sec: currentTime,
                    completed: autoComplete || shouldAutoComplete
                })
            });

            const data = await response.json();

            if (data.success && (autoComplete || shouldAutoComplete) && !hasAutoCompleted) {
                hasAutoCompleted = true;

                if (markCompleteBtn) {
                    markCompleteBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Completed';
                    markCompleteBtn.classList.remove('btn-success');
                    markCompleteBtn.classList.add('btn-outline-success');
                    markCompleteBtn.setAttribute('data-completed', 'true');
                }

                if (data.progress) {
                    const progressBar = document.querySelector('.progress-bar');
                    if (progressBar) {
                        progressBar.style.width = `${data.progress.percentage}%`;
                        progressBar.textContent = `${data.progress.completed}/${data.progress.total} lessons (${data.progress.percentage}%)`;
                    }
                }

                updateSidebarCheckmarks();
                showToast('🎉 Lesson completed! Well done!');
            }
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ========== CRITICAL: Save on page unload/navigation ==========
    let isUnloading = false;

    // Save progress when user tries to leave
    window.addEventListener('beforeunload', function(e) {
        isUnloading = true;

        // Use sendBeacon for reliable sending even when page is closing
        const lessonId = markCompleteBtn ? markCompleteBtn.getAttribute('data-lesson-id') : null;
        if (!lessonId || !player) return;

        const currentTime = Math.floor(player.currentTime);

        if (currentTime > 0) {
            // Use sendBeacon for guaranteed delivery
            const data = JSON.stringify({
                watched_sec: currentTime,
                completed: false
            });

            navigator.sendBeacon(`/learn/${lessonId}/progress`, data);
        }
    });

    // Also save on page visibility change (switching tabs)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && !isUnloading && player) {
            saveProgress(false);
        }
    });

    // Save periodically when video is playing (backup)
    setInterval(function() {
        if (player && player.playing) {
            saveProgress(false);
        }
    }, 5000);
});