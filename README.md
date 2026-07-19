# Incanto

**Viviamo il sogno.**

Incanto ist das private Italien-Reisemagazin von David & Kay. Die erste Version konzentriert sich auf kuratierte Reiserouten, nachvollziehbare Quellen und eigene „Incanto-Abzweigungen“ jenseits des reinen Pflichtprogramms.

## Enthalten

- luxuriöse responsive Startseite
- neun kuratierte Italienrouten
- Detailansichten mit Grundroute, Einordnung und Abzweigungen
- Quellen pro Route
- Filter und Volltextsuche
- private Markenführung ohne Social-Media-Elemente

## Lokal öffnen

Da die Routendaten per `fetch()` geladen werden, bitte über einen kleinen lokalen Webserver starten:

```bash
python3 -m http.server 8000
```

Danach `http://localhost:8000` öffnen.

## Struktur

- `index.html` – Magazin und Dialoge
- `styles.css` – visuelles System
- `app.js` – Routen, Filter, Suche und Navigation
- `routes.json` – zentrale Routensammlung
