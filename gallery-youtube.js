// Videos live in an unlisted YouTube playlist — add new clips here,
// no HTML editing required. `id` is the YouTube video ID.
const videos = [
    { id: '0qkvdJvuWf8', title: 'Residential 1', category: 'Residential' },
    { id: 'Iwlw57pvyLU', title: 'Commercial 1',  category: 'Commercial'  },
    { id: 'UrRgK5WiKuA', title: 'Industrial 1',  category: 'Industrial'  },
    { id: 'A8UYZlQK_Ec', title: 'Winter 1',      category: 'Tourism'     },
    { id: 'FbDurye1l74', title: 'Winter 2',      category: 'Tourism'     },
    { id: '16mnDScwozM', title: 'Summer 1',      category: 'Tourism'     },
];

// Navbar scroll state
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');
mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    mobileToggle.classList.toggle('active');
});
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.classList.remove('active');
    });
});

// Build thumbnail strip from the videos array
const thumbStrip = document.getElementById('thumbStrip');
videos.forEach(v => {
    const item = document.createElement('div');
    item.className = 'thumb-item';
    item.dataset.ytId = v.id;
    item.dataset.title = v.title;
    item.dataset.category = v.category;
    item.innerHTML = `
        <div class="thumb-preview">
            <img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="${v.title}" loading="lazy">
            <div class="thumb-play">&#9654;</div>
        </div>
        <div class="thumb-label">${v.title}</div>
    `;
    thumbStrip.appendChild(item);
});

// Main player elements
const placeholder = document.getElementById('playerPlaceholder');
const titleEl      = document.getElementById('videoTitle');
const catEl        = document.getElementById('videoCategory');

let ytPlayer   = null;
let apiReady   = false;
let pendingId  = null;

function onYouTubeIframeAPIReady() {
    apiReady = true;
    if (pendingId) {
        createPlayer(pendingId);
        pendingId = null;
    }
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function createPlayer(videoId) {
    ytPlayer = new YT.Player('ytPlayer', {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
            autoplay: 1,
            rel: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
        },
        events: {
            onStateChange: onPlayerStateChange,
        },
    });
}

function onPlayerStateChange(e) {
    if (e.data === YT.PlayerState.ENDED) advanceToNext();
}

function advanceToNext() {
    const active  = document.querySelector('.thumb-item.active');
    const all     = Array.from(document.querySelectorAll('.thumb-item'));
    const nextIdx = (all.indexOf(active) + 1) % all.length;
    loadClip(all[nextIdx]);
}

function loadClip(item) {
    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
    item.classList.add('active');
    placeholder.style.display = 'none';

    const videoId = item.dataset.ytId;

    if (ytPlayer && ytPlayer.loadVideoById) {
        ytPlayer.loadVideoById(videoId);
    } else if (apiReady) {
        createPlayer(videoId);
    } else {
        pendingId = videoId;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }

    titleEl.textContent = item.dataset.title    || '';
    catEl.textContent   = item.dataset.category || '';
}

// Click on thumbnail strip
thumbStrip.addEventListener('click', e => {
    const item = e.target.closest('.thumb-item');
    if (item) loadClip(item);
});

// Wheel over thumbnail strip scrolls horizontally
const thumbOuter = document.querySelector('.thumb-strip-outer');
thumbOuter.addEventListener('wheel', (e) => {
    e.preventDefault();
    thumbOuter.scrollLeft += e.deltaY + e.deltaX;
}, { passive: false });
