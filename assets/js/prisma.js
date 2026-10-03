/* PRISMA — funzioni comuni a tutte le pagine */
var PRISMA = (function () {

    var riduciMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Testo sicuro dentro l'HTML ── */
    function esc(t) {
        return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* ── Legge un campo provando più nomi di colonna ── */
    function campo(p, chiavi) {
        p = p || {};
        for (var i = 0; i < chiavi.length; i++) {
            var v = p[chiavi[i]];
            if (v != null && String(v).trim() !== '') return String(v).trim();
        }
        return '';
    }

    function nomeLuogo(p) { return campo(p, ['Nome', 'nome']); }

    /* ── Slug: "Chiesa di San Marco" → "chiesa-di-san-marco" ── */
    function slug(t) {
        return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    /* Un identificativo unico per ogni luogo di un file.
       Stesso file, stesso ordine → stessi link su tutte le pagine. */
    function slugUnici(prefisso, features) {
        var visti = {};
        return features.map(function (f) {
            var base = prefisso + '-' + (slug(nomeLuogo(f.properties)) || 'luogo');
            var s = base, i = 2;
            while (visti[s]) s = base + '-' + (i++);
            visti[s] = true;
            return s;
        });
    }

    /* ── Popup di un luogo di culto ──
       Colonne lette se presenti: Nome, Sottocategoria, Indirizzo, Orari, Telefono, Sito, Foto */
    function riga(etichetta, valore) {
        return '<div class="popup-riga"><span class="popup-label">' + etichetta + '</span>' + valore + '</div>';
    }

    function popupLuogo(p, opzioni) {
        opzioni = opzioni || {};
        var nome = nomeLuogo(p);
        var tipo = campo(p, ['Sottocategoria', 'sottocategoria', 'Tipo', 'tipo']);
        var indirizzo = campo(p, ['Indirizzo', 'indirizzo']);
        var orari = campo(p, ['Orari', 'orari']);
        var telefono = campo(p, ['Telefono', 'telefono']);
        var sito = campo(p, ['Sito', 'sito', 'Web', 'web']);
        var foto = campo(p, ['Foto', 'foto', 'Immagine', 'immagine']);

        var h = '';
        if (foto) h += '<img class="popup-foto" src="' + esc(foto) + '" alt="' + esc(nome) + '" loading="lazy">';
        h += '<div class="popup-titolo">' + esc(nome) + '</div>';
        if (tipo) h += riga('Tipo', esc(tipo));
        if (indirizzo) h += riga('Indirizzo', esc(indirizzo));
        if (orari) h += riga('Orari', esc(orari));
        if (telefono) h += riga('Telefono', '<a href="tel:' + esc(telefono.replace(/\s+/g, '')) + '">' + esc(telefono) + '</a>');
        if (sito) {
            var url = /^https?:\/\//i.test(sito) ? sito : 'https://' + sito;
            var testo = url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
            h += riga('Sito', '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(testo) + '</a>');
        }
        if (opzioni.copia) h += '<button type="button" class="popup-azione popup-copia" data-link="' + esc(opzioni.copia) + '">Copia link</button>';
        if (opzioni.mappa) h += '<a class="popup-azione" href="' + esc(opzioni.mappa) + '">Apri nella mappa generale</a>';
        return h;
    }

    /* ── Mappa di base in scala di grigi ── */
    function mappaDiBase(map) {
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
            className: 'tiles-grigio'
        }).addTo(map);
    }

    /* ── La pagina scorre, la mappa zooma solo con Ctrl/⌘ + rotella.
          Su smartphone un dito scorre la pagina, due dita muovono la mappa. ── */
    function mappaScorrevole(map) {
        var el = map.getContainer();
        var hint = document.createElement('div');
        hint.className = 'map-hint';
        hint.setAttribute('aria-hidden', 'true');
        el.appendChild(hint);

        var timer, ultimoZoom = 0;
        var isMac = /Mac|iPhone|iPad/i.test(navigator.platform);

        function mostra(testo) {
            hint.textContent = testo;
            hint.classList.add('visible');
            clearTimeout(timer);
            timer = setTimeout(function () { hint.classList.remove('visible'); }, 1200);
        }

        el.addEventListener('wheel', function (e) {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (Date.now() - ultimoZoom < 250) return;
                ultimoZoom = Date.now();
                map.setZoomAround(map.mouseEventToContainerPoint(e), map.getZoom() + (e.deltaY < 0 ? 1 : -1));
            } else {
                mostra(isMac ? 'Tieni premuto ⌘ e scorri per zoomare la mappa' : 'Tieni premuto Ctrl e usa la rotella per zoomare la mappa');
            }
        }, { passive: false });

        if (L.Browser.mobile) {
            el.addEventListener('touchmove', function (e) {
                if (e.touches.length === 1) mostra('Usa due dita per muovere la mappa');
            }, { passive: true });
        }
    }

    function opzioniMappa(extra) {
        var o = { scrollWheelZoom: false, dragging: !L.Browser.mobile };
        for (var k in extra) o[k] = extra[k];
        return o;
    }

    /* ── Tema chiaro / scuro ── */
    function aggiornaPulsantiTema() {
        var scuro = document.documentElement.dataset.theme === 'dark';
        document.querySelectorAll('.tema-toggle').forEach(function (b) {
            b.setAttribute('aria-pressed', scuro ? 'true' : 'false');
            b.setAttribute('aria-label', scuro ? 'Passa al tema chiaro' : 'Passa al tema scuro');
        });
        var meta = document.querySelector('meta[name="theme-color"]:not([media])');
        if (meta) meta.setAttribute('content', scuro ? '#161616' : '#fafafa');
    }

    function impostaTema(t) {
        document.documentElement.dataset.theme = t;
        try { localStorage.setItem('prisma-tema', t); } catch (e) {}
        aggiornaPulsantiTema();
        document.dispatchEvent(new CustomEvent('prisma:tema', { detail: t }));
    }

    /* ── Cursore personalizzato ── */
    function avviaCursore() {
        if (riduciMovimento || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        var dot = document.createElement('div'); dot.id = 'cursor';
        var ring = document.createElement('div'); ring.id = 'cursor-ring';
        document.body.appendChild(dot); document.body.appendChild(ring);
        document.body.classList.add('cursore-attivo');

        var cx = 0, cy = 0, rx = 0, ry = 0;
        document.addEventListener('mousemove', function (e) {
            cx = e.clientX; cy = e.clientY;
            dot.style.left = cx + 'px'; dot.style.top = cy + 'px';

            var el = document.elementFromPoint(cx, cy);
            // Sulla mappa e nei campi di testo resta il cursore normale
            var nascondi = el && el.closest('.leaflet-container, input, textarea');
            var scuro = el && el.closest('.footer');
            var interattivo = el && el.closest('a, button, label, .timeline-scroll');
            dot.classList.toggle('attivo', !nascondi);
            ring.classList.toggle('attivo', !nascondi);
            dot.classList.toggle('su-scuro', !!scuro);
            ring.classList.toggle('su-scuro', !!scuro);
            ring.classList.toggle('grande', !!interattivo);
        });
        document.addEventListener('mouseleave', function () {
            dot.classList.remove('attivo'); ring.classList.remove('attivo');
        });

        (function anima() {
            rx += (cx - rx) * 0.12; ry += (cy - ry) * 0.12;
            ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
            requestAnimationFrame(anima);
        })();
    }

    /* ── Avvio comune ── */
    document.addEventListener('DOMContentLoaded', function () {

        aggiornaPulsantiTema();
        document.querySelectorAll('.tema-toggle').forEach(function (b) {
            b.addEventListener('click', function () {
                impostaTema(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
            });
        });

        // Menu su smartphone
        var hamb = document.querySelector('.nav-hamburger');
        var menu = document.getElementById('nav-mobile');
        if (hamb && menu) {
            hamb.addEventListener('click', function () {
                var aperto = menu.classList.toggle('open');
                hamb.setAttribute('aria-expanded', aperto ? 'true' : 'false');
            });
            menu.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () {
                    menu.classList.remove('open');
                    hamb.setAttribute('aria-expanded', 'false');
                });
            });
        }

        // Ombra della barra e barra di avanzamento
        var nav = document.querySelector('.nav');
        var progress = document.getElementById('progress');
        function alloScroll() {
            if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
            if (progress) {
                var tot = document.documentElement.scrollHeight - window.innerHeight;
                progress.style.width = (tot > 0 ? window.scrollY / tot * 100 : 0) + '%';
            }
        }
        window.addEventListener('scroll', alloScroll, { passive: true });
        alloScroll();

        // Sezioni che compaiono entrando nello schermo
        var osservatore = new IntersectionObserver(function (voci) {
            voci.forEach(function (v) {
                if (!v.isIntersecting) return;
                v.target.classList.add('visible');
                v.target.dispatchEvent(new CustomEvent('prisma:visibile'));
                osservatore.unobserve(v.target);
            });
        }, { threshold: 0.12 });
        document.querySelectorAll('.sezione').forEach(function (s) { osservatore.observe(s); });

        // "Copia link" nei popup
        document.addEventListener('click', function (e) {
            var b = e.target.closest('.popup-copia');
            if (!b) return;
            var link = b.dataset.link;
            var fatto = function () { b.textContent = 'Link copiato'; setTimeout(function () { b.textContent = 'Copia link'; }, 1800); };
            if (navigator.clipboard) navigator.clipboard.writeText(link).then(fatto, function () { window.prompt('Copia il link:', link); });
            else window.prompt('Copia il link:', link);
        });

        avviaCursore();
    });

    return {
        riduciMovimento: riduciMovimento,
        esc: esc,
        campo: campo,
        nomeLuogo: nomeLuogo,
        slugUnici: slugUnici,
        popupLuogo: popupLuogo,
        mappaDiBase: mappaDiBase,
        mappaScorrevole: mappaScorrevole,
        opzioniMappa: opzioniMappa
    };
})();
