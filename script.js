// Hero background video cycling — survey-biased playlist
const heroSurvey = [
    'assets/Commercial/commercial-1.mp4',
    'assets/Commercial/Commercial-2.mp4',
    'assets/Commercial/Commercial_WaterDamage.mp4',
    'assets/Commercial/Commercial_WaterDamage2.mp4',
    'assets/Commercial/Commercial_WaterDamage3.mp4',
    'assets/Industrial/industrial-1.mp4',
    'assets/Industrial/industrial-2.mp4',
    'assets/Industrial/industrial-3.mp4',
    'assets/Residential/Sequence 01.mp4',
];

const heroScenic = [
    'assets/Random/broad-1.mp4',
    'assets/Random/broad-3.mp4',
    'assets/Random/Broad-4.mp4',
    'assets/Random/Broad-5.mp4',
    'assets/Random/Broad-6.mp4',
    'assets/Tourism/Broad-Tourism-1.mp4',
    'assets/Tourism/Tourism-1.mp4',
    'assets/Tourism/Tourism-3.mp4',
];

function shuffleArr(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Build a playlist: 3 survey clips then 1 scenic, repeat
function buildHeroPlaylist() {
    const survey = shuffleArr(heroSurvey);
    const scenic = shuffleArr(heroScenic);
    const list = [];
    let si = 0;
    for (let i = 0; i < survey.length; i++) {
        list.push(survey[i]);
        if ((i + 1) % 3 === 0) {
            list.push(scenic[si % scenic.length]);
            si++;
        }
    }
    return list;
}

let heroPlaylist = buildHeroPlaylist();
let heroIndex = Math.floor(Math.random() * heroPlaylist.length);
const heroBg = document.querySelector('.hero-bg-video');

function playHeroVideo(index) {
    heroBg.src = heroPlaylist[index];
    heroBg.load();
    heroBg.play().catch(() => {});
}

playHeroVideo(heroIndex);

heroBg.addEventListener('ended', () => {
    heroIndex++;
    if (heroIndex >= heroPlaylist.length) {
        heroPlaylist = buildHeroPlaylist();
        heroIndex = 0;
    }
    playHeroVideo(heroIndex);
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

// Contact form: simple feedback state
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.form-btn');
        const original = btn.textContent;
        btn.textContent = 'SENT —';
        btn.style.pointerEvents = 'none';
        setTimeout(() => {
            btn.textContent = original;
            btn.style.pointerEvents = '';
            contactForm.reset();
        }, 3000);
    });
}
