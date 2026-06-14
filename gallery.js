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

// Lazy-load thumbnail previews — only fetch metadata when near the viewport
const thumbObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const video  = entry.target;
        const source = video.querySelector('source[data-src]');
        if (source) {
            source.src = source.dataset.src;
            video.load();
        }
        thumbObserver.unobserve(video);
    });
}, { rootMargin: '300px' });

document.querySelectorAll('.thumb-preview video').forEach(v => {
    v.addEventListener('loadedmetadata', () => {
        v.currentTime = Math.min(3, v.duration * 0.08);
    });
    thumbObserver.observe(v);
});

// Main player elements
const mainVideo   = document.getElementById('mainVideo');
const placeholder = document.getElementById('playerPlaceholder');
const titleEl     = document.getElementById('videoTitle');
const catEl       = document.getElementById('videoCategory');

function loadClip(item) {
    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
    item.classList.add('active');

    mainVideo.src = item.dataset.src;
    mainVideo.style.display = 'block';
    placeholder.style.display = 'none';
    mainVideo.load();
    mainVideo.play().catch(() => {});

    titleEl.textContent = item.dataset.title    || '';
    catEl.textContent   = item.dataset.category || '';
}

// Click on thumbnail strip
document.getElementById('thumbStrip').addEventListener('click', e => {
    const item = e.target.closest('.thumb-item');
    if (item) loadClip(item);
});

// Wheel over thumbnail strip scrolls horizontally
const thumbOuter = document.querySelector('.thumb-strip-outer');
thumbOuter.addEventListener('wheel', (e) => {
    e.preventDefault();
    thumbOuter.scrollLeft += e.deltaY + e.deltaX;
}, { passive: false });

// Auto-advance to next clip when current one ends
mainVideo.addEventListener('ended', () => {
    const active  = document.querySelector('.thumb-item.active');
    const all     = Array.from(document.querySelectorAll('.thumb-item'));
    const nextIdx = (all.indexOf(active) + 1) % all.length;
    loadClip(all[nextIdx]);
});
