// Hero background video cycling — residential first, then shuffled rest
const heroFirst = 'assets/Residential/Sequence 01.mp4';

const heroRest = [
    'assets/Commercial/commercial-1.mp4',
    'assets/Commercial/Commercial-2.mp4',
    'assets/Commercial/Commercial_WaterDamage.mp4',
    'assets/Commercial/Commercial_WaterDamage2.mp4',
    'assets/Commercial/Commercial_WaterDamage3.mp4',
    'assets/Industrial/industrial-1.mp4',
    'assets/Industrial/industrial-2.mp4',
    'assets/Industrial/industrial-3.mp4',
    'assets/Random/broad-1.mp4',
    'assets/Random/broad-3.mp4',
    'assets/Random/Broad-4.mp4',
    'assets/Random/Broad-5.mp4',
    'assets/Tourism/Broad-Tourism-1.mp4',
    'assets/Tourism/Tourism-5.mp4',
];

function shuffleArr(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildHeroPlaylist() {
    return [heroFirst, ...shuffleArr(heroRest)];
}

let heroPlaylist = buildHeroPlaylist();
let heroIndex = 0;

const vidA = document.getElementById('heroBgA');
const vidB = document.getElementById('heroBgB');
let activeVid = vidA;
let nextVid = vidB;
let crossfading = false;

function advanceIndex() {
    heroIndex++;
    if (heroIndex >= heroPlaylist.length) {
        heroPlaylist = buildHeroPlaylist();
        heroIndex = 0;
    }
}

function doCrossfade() {
    if (crossfading) return;
    crossfading = true;
    nextVid.play().catch(() => {});
    nextVid.classList.add('active');
    activeVid.classList.remove('active');
    setTimeout(() => {
        const tmp = activeVid;
        activeVid = nextVid;
        nextVid = tmp;
        nextVid.pause();
        crossfading = false;
        advanceIndex();
        nextVid.src = heroPlaylist[heroIndex];
        nextVid.load();
    }, 1200);
}

// Start first video
vidA.src = heroPlaylist[heroIndex];
vidA.load();
vidA.classList.add('active');
vidA.play().catch(() => {});

// Preload second video
advanceIndex();
vidB.src = heroPlaylist[heroIndex];
vidB.load();

// Trigger crossfade 1.5s before each clip ends
[vidA, vidB].forEach(v => {
    v.addEventListener('timeupdate', () => {
        if (v !== activeVid || crossfading || !v.duration) return;
        if (v.duration - v.currentTime <= 1.5) doCrossfade();
    });
});

// Navbar: transparent at top, frosted glass on scroll
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

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Contact form: submit to Formspree
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.form-btn');
        btn.textContent = 'SENDING...';
        btn.style.pointerEvents = 'none';
        try {
            const res = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
                btn.textContent = 'SENT —';
                contactForm.reset();
            } else {
                btn.textContent = 'ERROR — TRY AGAIN';
                btn.style.pointerEvents = '';
            }
        } catch {
            btn.textContent = 'ERROR — TRY AGAIN';
            btn.style.pointerEvents = '';
        }
        setTimeout(() => {
            btn.textContent = 'SEND REQUEST';
            btn.style.pointerEvents = '';
        }, 3000);
    });
}
