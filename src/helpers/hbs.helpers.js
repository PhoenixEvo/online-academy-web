import Handlebars from "handlebars";

// Sort helpers
function normalizeToken(token) {
    if (token === 'newest') return { field: 'date', dir: 'desc' };
    if (token === 'oldest') return { field: 'date', dir: 'asc' };
    const [field, dir] = token.split('_');
    return { field, dir: (dir === 'asc' ? 'asc' : 'desc') };
}

export function parseSortList(sortStr) {
    if (!sortStr) return [];
    return String(sortStr).split(',').map(s => s.trim()).filter(Boolean).map(normalizeToken);
}

Handlebars.registerHelper('buildSetSortUrl', function (baseUrl, currentSort, field, dir) {
    if (!baseUrl) {
        console.error('buildSetSortUrl: baseUrl is undefined');
        return '#';
    }
    const url = new URL(baseUrl, 'http://localhost:3000');
    const list = parseSortList(url.searchParams.get('sort') || currentSort || '');

    const rest = list.filter(x => x.field !== field);
    rest.unshift({ field, dir: (dir === 'asc' ? 'asc' : 'desc') });

    url.searchParams.set('sort', rest.map(x => `${x.field}_${x.dir}`).join(','));
    return url.pathname + url.search;
});

Handlebars.registerHelper('buildRemoveSortUrl', function (baseUrl, currentSort, field) {
    const url = new URL(baseUrl, 'http://localhost:3000');
    const list = parseSortList(url.searchParams.get('sort') || currentSort || '');
    const kept = list.filter(x => x.field !== field);

    if (kept.length) url.searchParams.set('sort', kept.map(x => `${x.field}_${x.dir}`).join(','));
    else url.searchParams.delete('sort');

    return url.pathname + url.search;
});

Handlebars.registerHelper("buildSortUrl", function (baseUrl, newSort) {
    // Remove existing sort parameter and add new one, keep other parameters
    const url = new URL(baseUrl, 'http://localhost:3000');
    url.searchParams.delete('sort');
    url.searchParams.set('sort', newSort);
    return url.pathname + url.search;
});

// Build URL with multiple parameters
Handlebars.registerHelper("buildUrl", function (baseUrl, params) {
    const url = new URL(baseUrl, 'http://localhost:3000');

    // Update parameters
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });

    return url.pathname + url.search;
});

Handlebars.registerHelper("buildSortUrlWithFilters", function (baseUrl, newSort, currentCategory, currentSearch) {
    const url = new URL(baseUrl, 'http://localhost:3000');

    // Set sort (remove if empty)
    if (newSort && newSort.trim() !== '') {
        url.searchParams.set('sort', newSort);
    } else {
        url.searchParams.delete('sort');
    }

    // Keep category if exists
    if (currentCategory) {
        url.searchParams.set('category', currentCategory);
    }

    // Keep search if exists
    if (currentSearch) {
        url.searchParams.set('q', currentSearch);
    }

    // CRITICAL: Keep current page parameter to avoid reset to page 1
    const currentPage = url.searchParams.get('page');
    if (currentPage && currentPage !== '1') {
        url.searchParams.set('page', currentPage);
    } else {
        url.searchParams.delete('page'); // Remove page=1 to keep URL clean
    }

    return url.pathname + url.search;
});

Handlebars.registerHelper('hasSort', function (currentSort, field) {
    if (!currentSort) return false;
    const list = parseSortList(currentSort);
    return list.some(x => x.field === field);
});

Handlebars.registerHelper('sortDir', function (currentSort, field) {
    if (!currentSort) return null;
    const list = parseSortList(currentSort);
    const hit = list.find(x => x.field === field);
    return hit ? hit.dir : null;
});

Handlebars.registerHelper('buildMultiSortUrl', function (baseUrl, currentSort, field) {
    const url = new URL(baseUrl, 'http://localhost:3000');
    const list = parseSortList(url.searchParams.get('sort') || currentSort || '');

    const idx = list.findIndex(x => x.field === field);
    if (idx === -1) {
        list.unshift({ field, dir: 'asc' });
    } else if (list[idx].dir === 'asc') {
        list[idx].dir = 'desc';
        const [it] = list.splice(idx, 1);
        list.unshift(it);
    } else {
        list.splice(idx, 1);
    }

    if (list.length) {
        url.searchParams.set('sort', list.map(x => `${x.field}_${x.dir}`).join(','));
    } else {
        url.searchParams.delete('sort');
    }

    return url.pathname + url.search;
});

// Math helpers
Handlebars.registerHelper("increment", (v) => v + 1);
Handlebars.registerHelper("decrement", (v) => v - 1);
Handlebars.registerHelper("gt", (a, b) => a > b);
Handlebars.registerHelper("lt", (a, b) => a < b);
Handlebars.registerHelper("eq", (a, b) => a === b);

// Format number with commas
Handlebars.registerHelper("format_number", (value) => {
    return new Intl.NumberFormat('en-US').format(value);
});

// ========== VIDEO HELPERS ==========

// Check if URL is YouTube
export function isYouTubeUrl(url) {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
}

// Get YouTube video ID
export function getYouTubeVideoId(url) {
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

// Register Handlebars helpers for YouTube
Handlebars.registerHelper('isYouTubeUrl', function(url) {
    return isYouTubeUrl(url);
});

Handlebars.registerHelper('getYouTubeVideoId', function(url) {
    return getYouTubeVideoId(url);
});

Handlebars.registerHelper('convertToYouTubeEmbed', function(url) {
    return convertToYouTubeEmbed(url);
});

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

// Register format duration helper
Handlebars.registerHelper("formatDuration", function (seconds) {
    return formatDuration(seconds);
});
export default Handlebars;