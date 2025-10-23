// Toast notification helper
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    const toast = new bootstrap.Toast(toastEl);

    toastEl.className = `toast align-items-center text-white border-0 ${type === 'success' ? 'bg-success' : 'bg-danger'}`;
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
                        'Content-Type': 'application/json'
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

    // ========== YOUTUBE IFRAME API INTEGRATION ==========
    let player;
    let progressUpdateInterval;
    let lastSavedTime = 0;
    let hasAutoCompleted = false;
    let initialProgressLoaded = false;
    let lessonDuration = 0; // Store lesson duration

    const iframe = document.querySelector('iframe[src*="youtube.com"]');
    if (iframe) {
        iframe.id = 'lesson-video-player';

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = function() {
            player = new YT.Player('lesson-video-player', {
                events: {
                    'onStateChange': onPlayerStateChange,
                    'onReady': onPlayerReady
                }
            });
        };

        if (window.YT && window.YT.Player) {
            player = new YT.Player('lesson-video-player', {
                events: {
                    'onStateChange': onPlayerStateChange,
                    'onReady': onPlayerReady
                }
            });
        }
    }

    async function onPlayerReady(event) {
        console.log('YouTube player ready');

        // Get lesson duration from player
        lessonDuration = Math.floor(player.getDuration());

        const lessonId = markCompleteBtn ? markCompleteBtn.getAttribute('data-lesson-id') : null;
        if (!lessonId) return;

        try {
            const response = await fetch(`/learn/${lessonId}/get-progress`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success && data.progress) {
                const watchedSec = data.progress.watched_sec || 0;
                const completed = data.progress.completed || false;

                // Resume from last position if not completed
                if (!completed && watchedSec > 5) {
                    player.seekTo(watchedSec, true);
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

            initialProgressLoaded = true;
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    function onPlayerStateChange(event) {
        const lessonId = markCompleteBtn ? markCompleteBtn.getAttribute('data-lesson-id') : null;
        if (!lessonId) return;

        if (event.data === YT.PlayerState.PLAYING) {
            startProgressTracking();
        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.BUFFERING) {
            stopProgressTracking();
            saveProgress(false);
        } else if (event.data === YT.PlayerState.ENDED) {
            stopProgressTracking();
            if (!hasAutoCompleted) {
                saveProgress(true);
            }
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
        if (!player || !player.getCurrentTime) return;

        const lessonId = markCompleteBtn ? markCompleteBtn.getAttribute('data-lesson-id') : null;
        if (!lessonId) return;

        const currentTime = Math.floor(player.getCurrentTime());

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
                    'Content-Type': 'application/json'
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

    // ========== REGULAR VIDEO TAG SUPPORT ==========
    const video = document.querySelector('video');
    let regularVideoInterval;
    let videoHasAutoCompleted = false;
    let videoDuration = 0;

    if (video) {
        video.addEventListener('loadedmetadata', function() {
            videoDuration = Math.floor(video.duration);
        });

        loadVideoProgress();

        video.addEventListener('play', function() {
            regularVideoInterval = setInterval(updateVideoProgress, 3000);
        });

        video.addEventListener('pause', function() {
            clearInterval(regularVideoInterval);
            updateVideoProgress();
        });

        video.addEventListener('ended', function() {
            clearInterval(regularVideoInterval);
            if (!videoHasAutoCompleted) {
                updateVideoProgress(true);
            }
        });

        async function loadVideoProgress() {
            const lessonId = markCompleteBtn ? markCompleteBtn.getAttribute('data-lesson-id') : null;
            if (!lessonId) return;

            try {
                const response = await fetch(`/learn/${lessonId}/get-progress`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success && data.progress) {
                    const watchedSec = data.progress.watched_sec || 0;
                    const completed = data.progress.completed || false;

                    if (!completed && watchedSec > 5) {
                        video.currentTime = watchedSec;
                        showToast(`Resuming from ${formatTime(watchedSec)}`, 'info');
                    }

                    if (completed && markCompleteBtn) {
                        markCompleteBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Completed';
                        markCompleteBtn.classList.remove('btn-success');
                        markCompleteBtn.classList.add('btn-outline-success');
                        markCompleteBtn.setAttribute('data-completed', 'true');
                        videoHasAutoCompleted = true;
                    }
                }
            } catch (error) {
                console.error('Error loading progress:', error);
            }
        }

        async function updateVideoProgress(autoComplete = false) {
            const lessonId = markCompleteBtn ? markCompleteBtn.getAttribute('data-lesson-id') : null;
            if (!lessonId) return;

            const watchedSec = Math.floor(video.currentTime);

            // Auto-complete if watched >= 95%
            const watchPercentage = (watchedSec / videoDuration) * 100;
            const shouldAutoComplete = watchPercentage >= 95 && !videoHasAutoCompleted;

            try {
                const response = await fetch(`/learn/${lessonId}/progress`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        watched_sec: watchedSec,
                        completed: autoComplete || shouldAutoComplete
                    })
                });

                const data = await response.json();

                if (data.success && (autoComplete || shouldAutoComplete) && !videoHasAutoCompleted) {
                    videoHasAutoCompleted = true;

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
                console.error('Error updating progress:', error);
            }
        }
    }

    // ========== CRITICAL: Save on page unload/navigation ==========
    let isUnloading = false;

    // Save progress when user tries to leave
    window.addEventListener('beforeunload', function(e) {
        isUnloading = true;

        // Use sendBeacon for reliable sending even when page is closing
        const lessonId = markCompleteBtn ? markCompleteBtn.getAttribute('data-lesson-id') : null;
        if (!lessonId) return;

        let currentTime = 0;

        if (player && player.getCurrentTime) {
            currentTime = Math.floor(player.getCurrentTime());
        } else if (video) {
            currentTime = Math.floor(video.currentTime);
        }

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
        if (document.hidden && !isUnloading) {
            if (player && player.getCurrentTime) {
                saveProgress(false);
            } else if (video) {
                updateVideoProgress(false);
            }
        }
    });

    // Save periodically when video is playing (backup)
    setInterval(function() {
        if (player && player.getPlayerState && player.getPlayerState() === YT.PlayerState.PLAYING) {
            saveProgress(false);
        } else if (video && !video.paused) {
            updateVideoProgress(false);
        }
    }, 5000);
});