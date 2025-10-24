import Handlebars from "handlebars";

// Math helpers
Handlebars.registerHelper("increment", (v) => v + 1);
Handlebars.registerHelper("decrement", (v) => v - 1);
Handlebars.registerHelper("gt", (a, b) => a > b);
Handlebars.registerHelper("lt", (a, b) => a < b);
Handlebars.registerHelper("eq", (a, b) => a === b); // NEW: Equal comparison

// Format number with commas
Handlebars.registerHelper("format_number", (value) => {
    return new Intl.NumberFormat('en-US').format(value);
});

// Format duration helper for Handlebars
Handlebars.registerHelper("formatDuration", function(seconds) {
    return formatDuration(seconds);
});

// Check if URL is YouTube
export function isYouTubeUrl(url) {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
}

// Convert YouTube URL to embed URL
export function convertToYouTubeEmbed(url) {
    if (!url) return '';

    // Already an embed URL
    if (url.includes('/embed/')) {
        return url;
    }

    // youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1];
        if (!videoId) return url;
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
            return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
        }
        return `https://www.youtube.com/embed/${videoId}`;
    }

    // youtu.be/VIDEO_ID
    if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        if (!videoId) return url;
        // Remove any query parameters
        const cleanVideoId = videoId.split('?')[0];
        return `https://www.youtube.com/embed/${cleanVideoId}`;
    }

    return url;
}

// Format duration from seconds to human readable
export function formatDuration(seconds) {
    if (!seconds) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default Handlebars;