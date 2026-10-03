/* PRISMA — pagina di una comunità.
   Legge i dati da <body data-file="..." data-emoji="...">: mappa e elenco dei luoghi si costruiscono da soli. */
(function () {
    var body = document.body;
    var file = body.dataset.file;
    var emoji = body.dataset.emoji || '';

    var conteggio = document.getElementById('conteggio');
    var elenco = document.getElementById('elenco-luoghi');
    var boxMappa = document.getElementById('mini-mappa');

    var map = L.map(boxMappa, PRISMA.opzioniMappa({ center: [43.7696, 11.2558], zoom: 13 }));
    PRISMA.mappaDiBase(map);
    PRISMA.mappaScorrevole(map);

    var icona = L.divIcon({
        html: '<div style="font-size:22px;line-height:28px;text-align:center;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.25));">' + emoji + '</div>',
        iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14], className: ''
    });

    fetch('../data/' + file + '.geojson')
        .then(function (r) { return r.json(); })
        .then(function (d) {
            var ids = PRISMA.slugUnici(file, d.features);
            var gruppo = L.featureGroup().addTo(map);

            d.features.forEach(function (f, i) {
                if (!f.geometry || f.geometry.type !== 'Point') return;
                var p = f.properties || {};
                var c = f.geometry.coordinates;
                var nome = PRISMA.nomeLuogo(p) || 'Luogo senza nome';

                var marker = L.marker([c[1], c[0]], { icon: icona, title: nome })
                    .bindPopup(PRISMA.popupLuogo(p, { mappa: '../index.html?luogo=' + encodeURIComponent(ids[i]) }), { maxWidth: 260 })
                    .addTo(gruppo);

                var tipo = PRISMA.campo(p, ['Sottocategoria', 'sottocategoria', 'Tipo', 'tipo']);
                var indirizzo = PRISMA.campo(p, ['Indirizzo', 'indirizzo']);
                var dettagli = [tipo, indirizzo].filter(Boolean).map(PRISMA.esc).join(', ');

                var li = document.createElement('li');
                li.innerHTML = '<button type="button" class="luogo-nome">' + PRISMA.esc(nome) + '</button>' +
                    (dettagli ? '<span class="luogo-dettagli">' + dettagli + '</span>' : '');
                li.querySelector('button').addEventListener('click', function () {
                    boxMappa.scrollIntoView({ block: 'center' });
                    map.setView(marker.getLatLng(), 16);
                    marker.openPopup();
                });
                elenco.appendChild(li);
            });

            var n = gruppo.getLayers().length;
            conteggio.textContent = n === 0 ? 'Nessun luogo ancora nella mappa' : (n === 1 ? '1 luogo nella mappa' : n + ' luoghi nella mappa');
            if (n) map.fitBounds(gruppo.getBounds().pad(0.2), { maxZoom: 15 });
        })
        .catch(function () {
            conteggio.textContent = 'I dati di questa comunità non sono ancora disponibili.';
        });
})();
