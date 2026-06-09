function buildHeroPlaylist() {
    const tail = [
        'assets/Residential/szarka.mp4',
        'assets/Residential/1130D.1080.fade.mp4',
        'assets/Residential/204B.1080.fade.mp4',
        'assets/Commercial/CommrecialWaterDamage1.mp4',
        'assets/Industrial/industrial-1.mp4',
    ];
    // Fisher-Yates shuffle
    for (let i = tail.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tail[i], tail[j]] = [tail[j], tail[i]];
    }
    return [
        'assets/Residential/Sequence 02.mp4',  // always first
        'assets/Residential/D956.1080.fade.mp4', // always second
        ...tail,
    ];
}

let heroPlaylist = buildHeroPlaylist();
let heroIndex = 0;
let transitioning = false;

const heroBg = document.getElementById('heroBg');
const heroFade = document.getElementById('heroFade');

function advanceIndex() {
    heroIndex++;
    if (heroIndex >= heroPlaylist.length) {
        heroPlaylist = buildHeroPlaylist();
        heroIndex = 0;
    }
}

function playClip(src) {
    heroBg.src = src;
    heroBg.load();
    heroBg.addEventListener('canplay', () => {
        heroBg.play().catch(() => {});
    }, { once: true });
    heroBg.addEventListener('error', () => {
        advanceIndex();
        playClip(heroPlaylist[heroIndex]);
    }, { once: true });
}

function doTransition() {
    if (transitioning) return;
    transitioning = true;

    heroFade.style.opacity = '1';

    setTimeout(() => {
        advanceIndex();
        playClip(heroPlaylist[heroIndex]);

        let fadedBack = false;
        const fadeBack = () => {
            if (fadedBack) return;
            fadedBack = true;
            heroFade.style.opacity = '0';
            transitioning = false;
        };
        heroBg.addEventListener('canplay', fadeBack, { once: true });
        setTimeout(fadeBack, 2000);
    }, 500);
}

playClip(heroPlaylist[heroIndex]);

heroBg.addEventListener('timeupdate', () => {
    if (transitioning || !heroBg.duration) return;
    if (heroBg.duration - heroBg.currentTime <= 1.5) doTransition();
});

heroBg.addEventListener('ended', () => {
    if (!transitioning) doTransition();
});

// Section snap scrolling
(function () {
    const sections = Array.from(document.querySelectorAll('section'));
    let blocked = false;

    // Cache positions to avoid forced reflow on every scroll event
    let sectionTops = sections.map(s => s.offsetTop);
    window.addEventListener('resize', () => {
        sectionTops = sections.map(s => s.offsetTop);
    });

    function ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function scrollToSection(index) {
        if (index < 0 || index >= sections.length) return;
        const startY = window.scrollY;
        const targetY = sectionTops[index];
        const dist = targetY - startY;
        if (Math.abs(dist) < 2) return;

        const duration = 600;
        const t0 = performance.now();
        blocked = true;

        (function tick(now) {
            const p = Math.min((now - t0) / duration, 1);
            window.scrollTo(0, startY + dist * ease(p));
            if (p < 1) {
                requestAnimationFrame(tick);
            } else {
                setTimeout(() => { blocked = false; }, 250);
            }
        }(performance.now()));
    }

    function getTargetIndex(dir) {
        const y = window.scrollY + 8;
        let current = 0;
        for (let i = sectionTops.length - 1; i >= 0; i--) {
            if (sectionTops[i] <= y) { current = i; break; }
        }
        return current + dir;
    }

    window.addEventListener('wheel', (e) => {
        if (e.target.closest('textarea')) return;
        e.preventDefault();
        if (blocked) return;
        scrollToSection(getTargetIndex(e.deltaY > 0 ? 1 : -1));
    }, { passive: false });

    let touchY = 0;
    window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchend', (e) => {
        if (blocked) return;
        const dy = touchY - e.changedTouches[0].clientY;
        if (Math.abs(dy) < 40) return;
        scrollToSection(getTargetIndex(dy > 0 ? 1 : -1));
    }, { passive: true });
}());

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

// Sector explorer
const sectorTabs       = document.querySelectorAll('.sector-tab');
const sectorInfoPanels = document.querySelectorAll('.sector-info-panel');
const sectorInfo       = document.getElementById('sectorInfo');
const sectorVideoA     = document.getElementById('sectorVideoA');
const sectorVideoB     = document.getElementById('sectorVideoB');

// Arrays = random pick per click; strings = fixed clip
const sectorSources = {
    // Sequence 02 is reserved for the hero — pick randomly from the rest
    residential: [
        'assets/Residential/D956.1080.fade.mp4',
        'assets/Residential/szarka.mp4',
        'assets/Residential/1130D.1080.fade.mp4',
        'assets/Residential/204B.1080.fade.mp4',
    ],
    commercial:  'assets/Commercial/CommrecialWaterDamage1.mp4',
    industrial:  'assets/Industrial/industrial-1.mp4',
    legal:       'assets/Commercial/CommrecialWaterDamage2.mp4',
};

function pickSrc(sector) {
    const entry = sectorSources[sector];
    return Array.isArray(entry)
        ? entry[Math.floor(Math.random() * entry.length)]
        : entry || '';
}

if (sectorTabs.length && sectorInfo && sectorVideoA) {
    // A is front (visible), B is back (loading)
    let frontVideo = sectorVideoA;
    let backVideo  = sectorVideoB;
    let sectorLoaded = false;

    function crossfadeTo(src) {
        const filename = src.split('/').pop();
        const alreadyBuffered = backVideo.readyState >= 3 &&
                                backVideo.currentSrc.endsWith(filename);

        const doFade = () => {
            backVideo.play().catch(() => {});
            backVideo.style.opacity  = '1';
            frontVideo.style.opacity = '0';
            const prev = frontVideo;
            frontVideo = backVideo;
            backVideo  = prev;
            setTimeout(() => { backVideo.pause(); }, 450);
        };

        if (alreadyBuffered) {
            doFade();
        } else {
            if (!backVideo.currentSrc.endsWith(filename)) {
                backVideo.src = src;
                backVideo.load();
            }
            backVideo.addEventListener('canplay', doFade, { once: true });
        }
    }

    // Match tab column height to video height on load and resize
    function syncTabHeight() {
        const wrap = document.querySelector('.sector-video-wrap');
        const tabs = document.querySelector('.sector-tabs');
        if (wrap && tabs) tabs.style.height = wrap.offsetHeight + 'px';
    }
    window.addEventListener('load',   syncTabHeight);
    window.addEventListener('resize', syncTabHeight);
    syncTabHeight();

    let switching = false;

    // Preload on hover — GPU decoder initialises before the click so the
    // spike doesn't land during the transition animation
    sectorTabs.forEach(tab => {
        tab.addEventListener('mouseenter', () => {
            if (tab.classList.contains('active') || switching) return;
            const src = pickSrc(tab.dataset.sector);
            const filename = src.split('/').pop();
            if (!backVideo.currentSrc.endsWith(filename)) {
                backVideo.src = src;
                backVideo.load();
            }
        });
    });

    sectorTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.sector;
            if (tab.classList.contains('active') || switching) return;
            switching = true;

            sectorTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Slide out current panel text
            sectorInfoPanels.forEach(p => p.classList.remove('active'));

            // Slide in new panel text after slide-out completes
            setTimeout(() => {
                const next = document.getElementById('info-' + target);
                if (next) next.classList.add('active');
                switching = false;
            }, 280);

            // Defer video load until text animations have had two frames to
            // reach the compositor — avoids GPU contention mid-transition
            requestAnimationFrame(() => requestAnimationFrame(() => {
                crossfadeTo(pickSrc(target));
            }));
        });
    });

    // Load and play sector video only when services section is actually in view
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (!sectorLoaded) {
                    sectorLoaded = true;
                    frontVideo.src = pickSrc('residential');
                    frontVideo.load();
                }
                frontVideo.play().catch(() => {});
            } else {
                frontVideo.pause();
                backVideo.pause();
            }
        }, { threshold: 0.5 }).observe(servicesSection);
    }
}

// Pause hero video when hero section is off-screen
new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        heroBg.play().catch(() => {});
    } else {
        heroBg.pause();
    }
}, { threshold: 0.5 }).observe(document.getElementById('hero'));

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
