function buildHeroPlaylist() {
    // One random clip from each sector with clips, sectors shuffled each cycle
    const sectors = Object.keys(heroSectorPlaylists).filter(s => heroSectorPlaylists[s]);
    for (let i = sectors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sectors[i], sectors[j]] = [sectors[j], sectors[i]];
    }
    return sectors.map(s => {
        const clips = heroSectorPlaylists[s];
        return clips[Math.floor(Math.random() * clips.length)];
    });
}

const heroSectorPlaylists = {
    residential:  [
        'assets/Residential/Sequence 02.mp4',
        'assets/Residential/Residential03.mp4',
        'assets/Residential/Residential04.mp4',
        'assets/Residential/Residential05.mp4',
        'assets/Residential/Residential06.mp4',
    ],
    commercial:   [
        'assets/Commercial/commercial-1.mp4',
        'assets/Commercial/CommrecialWaterDamage1.mp4',
        'assets/Commercial/CommrecialWaterDamage2.mp4',
        'assets/Commercial/CommrecialWaterDamage3.mp4',
    ],
    industrial:   [
        'assets/Industrial/industrial-1.mp4',
        'assets/Industrial/industrial-2.mp4',
        'assets/Industrial/industrial-3.mp4',
    ],
    institutional: null,
    tourism:      [
        'assets/Tourism/Hero Autumn 1of2.h265.mp4',
        'assets/Tourism/Hero Autumn 2of2.h265.mp4',
        'assets/Tourism/Hero Summer 1of2.h265.mp4',
        'assets/Tourism/Hero Summer 2of2.h265.mp4',
    ],
};

// Default to a random sector on load
const _sectorsWithClips = Object.keys(heroSectorPlaylists).filter(s => heroSectorPlaylists[s]);
let activeSector  = _sectorsWithClips[Math.floor(Math.random() * _sectorsWithClips.length)];
let heroPlaylist  = heroSectorPlaylists[activeSector].slice();
let heroIndex     = 0;
let transitioning = false;

const heroBg = document.getElementById('heroBg');
const heroFade = document.getElementById('heroFade');

function advanceIndex() {
    heroIndex++;
    if (heroIndex >= heroPlaylist.length) {
        if (activeSector && heroSectorPlaylists[activeSector]) {
            heroIndex = 0;
        } else {
            heroPlaylist = buildHeroPlaylist();
            heroIndex = 0;
        }
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

// Mark the default sector button active on load
document.querySelectorAll('.hero-sector-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.sector === activeSector);
});

playClip(heroPlaylist[heroIndex]);

setInterval(() => {
    if (transitioning || !heroBg.duration) return;
    if (heroBg.duration - heroBg.currentTime <= 1.5) doTransition();
}, 500);

heroBg.addEventListener('ended', () => {
    if (!transitioning) doTransition();
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

// Sector explorer
const sectorTabs       = document.querySelectorAll('.sector-tab');
const sectorInfoPanels = document.querySelectorAll('.sector-info-panel');
const sectorInfo       = document.getElementById('sectorInfo');
const sectorVideoA     = document.getElementById('sectorVideoA');
const sectorVideoB     = document.getElementById('sectorVideoB');

// Arrays = random pick per click; strings = fixed clip
const sectorSources = {
    residential: [
        'assets/Residential/Sequence 02.mp4',
        'assets/Residential/Residential03.mp4',
        'assets/Residential/Residential04.mp4',
        'assets/Residential/Residential05.mp4',
        'assets/Residential/Residential06.mp4',
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

// Hero sector filter buttons
document.querySelectorAll('.hero-sector-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const sector = btn.dataset.sector;
        const clips  = heroSectorPlaylists[sector];

        if (activeSector === sector) return;

        activeSector = sector;
        document.querySelectorAll('.hero-sector-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (clips && clips.length) {
            heroPlaylist = clips.slice();
            heroIndex    = Math.floor(Math.random() * clips.length) - 1;
            if (!transitioning) doTransition();
        }
        // Institutional (no clips): button highlights, current clip finishes, then mixed resumes
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
