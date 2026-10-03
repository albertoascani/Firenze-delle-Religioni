# PRISMA — Portale della Diversità Religiosa a Firenze

Mappa interattiva e schede di approfondimento sulle comunità religiose presenti a Firenze.

Sito: https://albertoascani.github.io/Firenze-delle-Religioni/

## Struttura

```
index.html               pagina principale con la mappa
chi-siamo.html           progetto, metodo, fonti, contatti
404.html                 pagina per gli indirizzi sbagliati
comunita/                una pagina per ogni comunità
data/                    i dati in formato GeoJSON
assets/css/prisma.css    stili comuni, tema chiaro e scuro
assets/js/prisma.js      funzioni comuni (tema, menu, popup, link)
assets/js/comunita.js    mappa ed elenco delle pagine comunità
assets/fonts/            font Inter
assets/lib/leaflet/      libreria della mappa (Leaflet 1.9.4)
assets/img/              icone e immagine di anteprima
```

## Aggiornare i dati

Ogni comunità ha il suo file in `data/`:

| File | Comunità |
|---|---|
| `cristianecattoliche.geojson` | Cristiane Cattoliche |
| `cristianeortodosse.geojson` | Cristiane Ortodosse |
| `evangelicheprotestanti.geojson` | Evangeliche Protestanti |
| `ebraiche.geojson` | Ebraiche |
| `musulmane.geojson` | Musulmane |
| `buddhiste.geojson` | Buddhiste |
| `altreesperienze.geojson` | Altre Esperienze |

Coordinate in EPSG:4326 (WGS 84). Colonne lette, se presenti:

| Colonna | Contenuto |
|---|---|
| `Nome` | nome del luogo (obbligatoria) |
| `Sottocategoria` | tipo di luogo |
| `Indirizzo` | indirizzo |
| `Orari` | orari di apertura o delle funzioni |
| `Telefono` | numero di telefono |
| `Sito` | sito web |
| `Foto` | indirizzo web di un'immagine |

Numeri, grafici, pagine delle comunità e ricerca si aggiornano da soli quando cambiano i file.

## Link a un singolo luogo

Ogni luogo ha un indirizzo proprio, che si copia dal pulsante **Copia link** nel popup:

```
https://albertoascani.github.io/Firenze-delle-Religioni/?luogo=ebraiche-tempio-maggiore
```

L'identificativo nasce dal nome del file e dal nome del luogo: se rinomini un luogo, il suo vecchio link smette di funzionare.

## Scrivere i testi

Nelle pagine di `comunita/` e in `chi-siamo.html` cerca `SCRIVI QUI` e sostituisci il riquadro tratteggiato con uno o più paragrafi `<p>…</p>`.

## Dominio personalizzato

Se colleghi un dominio, aggiorna gli indirizzi `og:url` e `og:image` in `index.html` e `og:image` nelle altre pagine: servono per l'anteprima del link sui social.

## Crediti

- Mappa: [Leaflet](https://leafletjs.com) (licenza BSD-2)
- Mappa di base e indirizzi: © [OpenStreetMap](https://www.openstreetmap.org/copyright) e contributori (licenza ODbL)
- Tramvia: Open Data del Comune di Firenze
- Font: [Inter](https://rsms.me/inter/) (SIL Open Font License)
