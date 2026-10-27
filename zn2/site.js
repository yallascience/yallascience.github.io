/* ==========================================================================
   Dr. Zain Yamani — site interactions
   Scroll reveal · counters · typing · tabs · mobile nav · particle canvas
   ========================================================================== */
(function () {
    'use strict';
    var doc = document.documentElement;
    doc.classList.remove('no-js');

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', function () {
        var navbar = document.querySelector('.navbar');
        var progress = document.querySelector('.scroll-progress');
        var toTop = document.querySelector('.back-to-top');

        /* ---------- Scroll: navbar state, progress bar, back-to-top ---------- */
        function onScroll() {
            var y = window.scrollY;
            if (navbar) navbar.classList.toggle('scrolled', y > 10);
            if (progress) {
                var h = document.body.scrollHeight - window.innerHeight;
                progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
            }
            if (toTop) toTop.classList.toggle('show', y > 600);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

        /* ---------- Mobile nav ---------- */
        var toggle = document.querySelector('.nav-toggle');
        if (toggle) {
            toggle.addEventListener('click', function () {
                var open = document.body.classList.toggle('nav-open');
                toggle.setAttribute('aria-expanded', open);
            });
            document.querySelectorAll('.nav-links a').forEach(function (a) {
                a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
            });
        }

        /* ---------- Active nav link ---------- */
        var page = document.body.getAttribute('data-page');
        if (page) {
            var active = document.querySelector('.nav-links a[data-nav="' + page + '"]');
            if (active) active.classList.add('active');
        }

        /* ---------- Reveal on scroll ---------- */
        var revealEls = document.querySelectorAll('[data-reveal], .section-head');
        if ('IntersectionObserver' in window && !reduceMotion) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            revealEls.forEach(function (el) { io.observe(el); });
        } else {
            revealEls.forEach(function (el) { el.classList.add('is-visible'); });
        }

        /* Auto-stagger children of [data-stagger] */
        document.querySelectorAll('[data-stagger]').forEach(function (group) {
            var step = parseFloat(group.getAttribute('data-stagger')) || 0.1;
            Array.prototype.forEach.call(group.children, function (child, i) {
                if (child.hasAttribute('data-reveal')) child.style.setProperty('--d', (i * step).toFixed(2) + 's');
            });
        });

        /* ---------- Animated counters ---------- */
        function animateCount(el) {
            var target = parseFloat(el.getAttribute('data-count'));
            var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
            var duration = 1800, start = null;
            function tick(ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / duration, 1);
                var eased = 1 - Math.pow(1 - p, 4);
                el.textContent = (target * eased).toFixed(decimals);
                if (p < 1) requestAnimationFrame(tick);
            }
            if (reduceMotion) { el.textContent = target; return; }
            requestAnimationFrame(tick);
        }
        var counters = document.querySelectorAll('[data-count]');
        if ('IntersectionObserver' in window) {
            var co = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
                });
            }, { threshold: 0.5 });
            counters.forEach(function (c) { co.observe(c); });
        } else {
            counters.forEach(function (c) { c.textContent = c.getAttribute('data-count'); });
        }

        /* ---------- Typing effect ---------- */
        var typed = document.querySelector('[data-typed]');
        if (typed) {
            var words = typed.getAttribute('data-typed').split('|');
            var wi = 0, ci = 0, deleting = false;
            (function type() {
                var w = words[wi];
                typed.textContent = w.substring(0, ci);
                if (!deleting && ci < w.length) { ci++; setTimeout(type, 65); }
                else if (!deleting) { deleting = true; setTimeout(type, 1800); }
                else if (ci > 0) { ci--; setTimeout(type, 32); }
                else { deleting = false; wi = (wi + 1) % words.length; setTimeout(type, 300); }
            })();
        }

        /* ---------- Tabs ---------- */
        document.querySelectorAll('[data-tabs]').forEach(function (wrap) {
            var btns = wrap.querySelectorAll('.tab-btn');
            btns.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var id = btn.getAttribute('data-tab');
                    btns.forEach(function (b) { b.classList.toggle('active', b === btn); });
                    wrap.querySelectorAll('.tab-panel').forEach(function (p) {
                        p.classList.toggle('active', p.id === id);
                        if (p.id === id) p.querySelectorAll('[data-reveal]').forEach(function (r) { r.classList.add('is-visible'); });
                    });
                });
            });
        });

        /* ---------- Card tilt (subtle, desktop only) ---------- */
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
            document.querySelectorAll('[data-tilt]').forEach(function (card) {
                card.addEventListener('mousemove', function (e) {
                    var r = card.getBoundingClientRect();
                    var x = (e.clientX - r.left) / r.width - 0.5;
                    var y = (e.clientY - r.top) / r.height - 0.5;
                    card.style.transform = 'perspective(900px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-6px)';
                });
                card.addEventListener('mouseleave', function () { card.style.transform = ''; });
            });
        }

        /* ---------- Footer year ---------- */
        document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

        /* ---------- Section sub-nav: scrollspy + stuck state ---------- */
        var subnav = document.querySelector('.subnav');
        if (subnav) {
            var spyLinks = Array.prototype.slice.call(subnav.querySelectorAll('a[href^="#"]'));
            var spySections = spyLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
            var navH = navbar ? navbar.offsetHeight : 76;
            var lastActive = null;
            function spy() {
                subnav.classList.toggle('stuck', subnav.getBoundingClientRect().top <= navH + 1);
                var line = navH + subnav.offsetHeight + window.innerHeight * 0.25;
                var current = null;
                spySections.forEach(function (sec, i) {
                    if (sec && sec.getBoundingClientRect().top <= line) current = spyLinks[i];
                });
                if (current !== lastActive) {
                    spyLinks.forEach(function (a) { a.classList.toggle('active', a === current); });
                    if (current) {
                        current.setAttribute('aria-current', 'location');
                        var list = current.closest('.subnav-links');
                        if (list && list.scrollWidth > list.clientWidth) {
                            list.scrollTo({ left: current.offsetLeft - list.clientWidth / 2 + current.offsetWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
                        }
                    }
                    if (lastActive) lastActive.removeAttribute('aria-current');
                    lastActive = current;
                }
            }
            window.addEventListener('scroll', spy, { passive: true });
            window.addEventListener('resize', spy);
            spy();
        }

        /* ---------- Publication search + topic filter ---------- */
        var pubList = document.getElementById('pub-list');
        if (pubList) {
            var pubs = Array.prototype.slice.call(pubList.querySelectorAll('.pub'));
            var search = document.getElementById('pub-search');
            var filterBtns = document.querySelectorAll('.filter-btn');
            var countEl = document.getElementById('pub-count');
            var emptyEl = document.getElementById('pub-empty');
            var activeFilter = 'all';
            function applyPubFilter() {
                var q = (search ? search.value : '').trim().toLowerCase();
                var shown = 0;
                pubs.forEach(function (p) {
                    var tags = (p.getAttribute('data-tags') || '').split(/\s+/);
                    var ok = (activeFilter === 'all' || tags.indexOf(activeFilter) > -1) && (!q || p.textContent.toLowerCase().indexOf(q) > -1);
                    var wasHidden = p.classList.contains('is-filtered');
                    p.classList.toggle('is-filtered', !ok);
                    if (ok) {
                        shown++;
                        p.classList.add('is-visible');
                        if (wasHidden) { p.classList.remove('pop-in'); void p.offsetWidth; p.classList.add('pop-in'); }
                    }
                });
                if (countEl) countEl.textContent = 'Showing ' + shown + ' of ' + pubs.length + ' item' + (pubs.length === 1 ? '' : 's');
                if (emptyEl) emptyEl.hidden = shown !== 0;
            }
            filterBtns.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    activeFilter = btn.getAttribute('data-filter');
                    filterBtns.forEach(function (b) {
                        b.classList.toggle('active', b === btn);
                        b.setAttribute('aria-pressed', b === btn);
                    });
                    applyPubFilter();
                });
            });
            if (search) search.addEventListener('input', applyPubFilter);
            var resetBtn = document.getElementById('pub-reset');
            if (resetBtn) resetBtn.addEventListener('click', function () {
                if (search) search.value = '';
                var allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allBtn) allBtn.click(); else applyPubFilter();
            });
            applyPubFilter();
        }

        /* ---------- Gallery search + category filter ---------- */
        var galleryGrid = document.getElementById('gallery-grid');
        if (galleryGrid) {
            var items = Array.prototype.slice.call(galleryGrid.querySelectorAll('.gallery-card'));
            var gSearch = document.getElementById('gallery-search');
            var gFilterBtns = document.querySelectorAll('.gallery-filter-btn');
            var gCountEl = document.getElementById('gallery-count');
            var gEmptyEl = document.getElementById('gallery-empty');
            var activeCat = 'all';

            function applyGalleryFilter() {
                var q = (gSearch ? gSearch.value : '').trim().toLowerCase();
                var shown = 0;
                items.forEach(function (card) {
                    var cat = card.getAttribute('data-category') || '';
                    var text = card.textContent.toLowerCase();
                    var matchCat = (activeCat === 'all' || cat.indexOf(activeCat) > -1);
                    var matchText = (!q || text.indexOf(q) > -1);
                    var ok = matchCat && matchText;
                    var wasHidden = card.classList.contains('is-filtered');
                    card.classList.toggle('is-filtered', !ok);
                    if (ok) {
                        shown++;
                        card.classList.add('is-visible');
                        if (wasHidden) { card.classList.remove('pop-in'); void card.offsetWidth; card.classList.add('pop-in'); }
                    }
                });
                if (gCountEl) gCountEl.textContent = 'Showing ' + shown + ' of ' + items.length + ' photos';
                if (gEmptyEl) gEmptyEl.hidden = shown !== 0;
            }

            gFilterBtns.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    activeCat = btn.getAttribute('data-filter');
                    gFilterBtns.forEach(function (b) {
                        b.classList.toggle('active', b === btn);
                        b.setAttribute('aria-pressed', b === btn);
                    });
                    applyGalleryFilter();
                });
            });

            if (gSearch) gSearch.addEventListener('input', applyGalleryFilter);
            var gResetBtn = document.getElementById('gallery-reset');
            if (gResetBtn) gResetBtn.addEventListener('click', function () {
                if (gSearch) gSearch.value = '';
                var allBtn = document.querySelector('.gallery-filter-btn[data-filter="all"]');
                if (allBtn) allBtn.click(); else applyGalleryFilter();
            });
            applyGalleryFilter();
        }

        /* ---------- Image lightbox ---------- */
        var lbImgs = document.querySelectorAll('img[data-lightbox]');
        if (lbImgs.length) {
            var lb = document.createElement('div');
            lb.className = 'lightbox';
            lb.setAttribute('role', 'dialog');
            lb.setAttribute('aria-modal', 'true');
            lb.setAttribute('aria-label', 'Image preview');
            lb.innerHTML = '<button class="lightbox-close" id="lightbox-close" aria-label="Close preview"><i class="fa-solid fa-xmark"></i></button><figure><img alt=""><figcaption></figcaption></figure>';
            document.body.appendChild(lb);
            var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), lbClose = lb.querySelector('.lightbox-close');
            var lastFocus = null;
            function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
            lbImgs.forEach(function (img) {
                img.setAttribute('tabindex', '0');
                function openLb() {
                    lastFocus = img;
                    lbImg.src = img.currentSrc || img.src;
                    lbImg.alt = img.alt;
                    var cap = img.closest('figure') && img.closest('figure').querySelector('figcaption strong');
                    lbCap.textContent = cap ? cap.textContent : img.alt;
                    lb.classList.add('open');
                    document.body.style.overflow = 'hidden';
                    lbClose.focus();
                }
                img.addEventListener('click', openLb);
                img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(); } });
            });
            lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lightbox-close')) closeLb(); });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });
        }

        /* ---------- Hero molecule network canvas ---------- */
        var canvas = document.getElementById('hero-canvas');
        if (canvas && !reduceMotion) initCanvas(canvas);
    });

    function initCanvas(canvas) {
        var ctx = canvas.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var W, H, nodes = [], mouse = { x: -9999, y: -9999 };
        var GREEN = '39,126,60', GOLD = '201,162,39';
        /* data-tone="light" renders white links for dark backgrounds (sub-page heroes) */
        if (canvas.getAttribute('data-tone') === 'light') { GREEN = '255,255,255'; GOLD = '255,224,138'; }

        function resize() {
            var r = canvas.getBoundingClientRect();
            W = r.width; H = r.height;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var count = Math.round(Math.min(80, (W * H) / 16000));
            nodes = [];
            for (var i = 0; i < count; i++) {
                nodes.push({
                    x: Math.random() * W, y: Math.random() * H,
                    vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
                    r: Math.random() * 2.2 + 1.2, gold: Math.random() < 0.12
                });
            }
        }
        canvas.parentElement.addEventListener('mousemove', function (e) {
            var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
        });
        canvas.parentElement.addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });

        function frame() {
            ctx.clearRect(0, 0, W, H);
            for (var i = 0; i < nodes.length; i++) {
                var a = nodes[i];
                a.x += a.vx; a.y += a.vy;
                if (a.x < 0 || a.x > W) a.vx *= -1;
                if (a.y < 0 || a.y > H) a.vy *= -1;
                var dxm = a.x - mouse.x, dym = a.y - mouse.y, dm = Math.sqrt(dxm * dxm + dym * dym);
                if (dm < 120) { a.x += dxm / dm * 0.8; a.y += dym / dm * 0.8; }
                for (var j = i + 1; j < nodes.length; j++) {
                    var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
                    if (d < 15000) {
                        ctx.strokeStyle = 'rgba(' + GREEN + ',' + (0.16 * (1 - d / 15000)) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                    }
                }
                ctx.fillStyle = 'rgba(' + (a.gold ? GOLD : GREEN) + ',.55)';
                ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
            }
            requestAnimationFrame(frame);
        }
        window.addEventListener('resize', resize);
        resize(); frame();
    }
})();
