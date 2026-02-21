document.addEventListener('DOMContentLoaded', () => {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. TYPEWRITER EFFECT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const twEl = document.getElementById('typewriter');
    if (twEl) {
        const phrases = [
            'Python Fullstack Developer',
            'Django & React Specialist',
            'AI & API Integrator'
        ];
        const typeSpeed = 70;
        const eraseSpeed = 35;
        const pauseAfter = 1800;
        const pauseBefore = 400;
        const sleep = ms => new Promise(r => setTimeout(r, ms));

        async function runTypewriter() {
            let idx = 0;
            await sleep(1200);
            while (true) {
                const phrase = phrases[idx % phrases.length];
                for (let i = 0; i <= phrase.length; i++) {
                    twEl.textContent = phrase.slice(0, i);
                    await sleep(typeSpeed + Math.random() * 30);
                }
                await sleep(pauseAfter);
                for (let i = phrase.length; i >= 0; i--) {
                    twEl.textContent = phrase.slice(0, i);
                    await sleep(eraseSpeed);
                }
                await sleep(pauseBefore);
                idx++;
            }
        }
        runTypewriter();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. NEURAL NETWORK PARTICLE CANVAS (full-page)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let W, H, particles;

        // Mouse tracked globally across entire page
        const mouse = { x: null, y: null, radius: 160 };

        const PARTICLE_COUNT = 50;   // reduced for full-page perf
        const MAX_DIST = 140;
        const SPEED = 0.4;
        const COLORS = ['rgba(0,240,255,', 'rgba(138,43,226,', 'rgba(180,100,255,'];

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }

        class Particle {
            constructor() { this.reset(true); }
            reset(initial = false) {
                this.x = Math.random() * W;
                this.y = initial ? Math.random() * H : (Math.random() > 0.5 ? -5 : H + 5);
                this.vx = (Math.random() - 0.5) * SPEED;
                this.vy = (Math.random() - 0.5) * SPEED;
                this.r = Math.random() * 2 + 1;
                this.colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
                this.opacity = Math.random() * 0.45 + 0.2;
            }
            update() {
                if (mouse.x !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        this.x += dx / dist * force * 1.6;
                        this.y += dy / dist * force * 1.6;
                    }
                }
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > W) this.vx *= -1;
                if (this.y < 0 || this.y > H) this.vy *= -1;
                this.x = Math.max(0, Math.min(W, this.x));
                this.y = Math.max(0, Math.min(H, this.y));
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = this.colorBase + this.opacity + ')';
                ctx.fill();
            }
        }

        function initParticles() {
            particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
        }

        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MAX_DIST) {
                        const alpha = (1 - dist / MAX_DIST) * 0.22;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0,240,255,${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, W, H);
            drawLines();
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }

        resize();
        initParticles();
        animate();

        // Resize canvas when window size changes
        window.addEventListener('resize', () => { resize(); initParticles(); });

        // Track mouse across the entire document (not just hero)
        document.addEventListener('mousemove', e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        // When cursor leaves the window
        document.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3. CUSTOM GLOWING CURSOR (desktop only)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    // Only run on non-touch devices
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (dot && ring && !isTouch) {
        let dotX = 0, dotY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', e => {
            dotX = e.clientX;
            dotY = e.clientY;
        });

        // Easing loop: ring trails behind dot with lerp
        function animateCursor() {
            // Ring smoothly follows dot (lerp factor = 0.1 → laggy trailing)
            ringX += (dotX - ringX) * 0.1;
            ringY += (dotY - ringY) * 0.1;

            dot.style.left = dotX + 'px';
            dot.style.top = dotY + 'px';
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Grow ring on hoverable elements
        const hoverables = 'a, button, .btn, .btn-sm, .project-card, .nav-links a, .social-links a';
        document.querySelectorAll(hoverables).forEach(el => {
            el.addEventListener('mouseenter', () => {
                ring.style.transform = 'translate(-50%, -50%) scale(1.7)';
                ring.style.borderColor = 'rgba(0,240,255,0.8)';
                ring.style.boxShadow = '0 0 22px rgba(0,240,255,0.5)';
            });
            el.addEventListener('mouseleave', () => {
                ring.style.transform = 'translate(-50%, -50%) scale(1)';
                ring.style.borderColor = 'rgba(138,43,226,0.65)';
                ring.style.boxShadow = '0 0 14px rgba(138,43,226,0.4)';
            });
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 4. VANILLA TILT — 3D project card tilt + glare
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll('.project-card'), {
            max: 12,       // max tilt angle (degrees)
            speed: 400,      // transition speed
            glare: true,     // enable glare
            'max-glare': 0.18,     // glare intensity (subtle)
            perspective: 900,      // 3D depth
            scale: 1.03,     // slight scale on hover
            easing: 'cubic-bezier(.03,.98,.52,.99)',
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 5. MOBILE MENU TOGGLE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        navItems.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 6. NAVBAR SCROLL BLUR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 7. INTERSECTION OBSERVER — scroll-in animations
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.hidden-up, .hidden-left').forEach(el => observer.observe(el));

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 8. SMOOTH SCROLL (with navbar offset)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

});
