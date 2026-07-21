# Incanto – Arbeitsstand

## Erledigt

- 26 eigenständige Routen mit Detailtexten
- Interaktive Italienkarte mit Einzelrouten-Navigation
- Statische Straßenverläufe aus OSRM/OpenStreetMap
- Getrennte Darstellung von Straße, Fähre und Boot
- iPhone-kompatible Kartenbedienung
- Ortssuche: Ort → passende Routen
- Kartenmarker: Ort antippen → passende Routen
- Quellen pro Route in der ausführlichen Übersicht unter „Quellen und Grundlagen dieser Planung“
- Quellenmix aus Wohnmobilportalen, Italia.it und offiziellen Regionalportalen
- Automatischer Prüfbericht für Straßenverläufe
- Automatischer Quellen-Audit für fehlende, doppelte und zu allgemeine Links

## Quellenprinzip

- Keine nahezu identischen Routen mehrfach nebeneinander
- Externe Grundrouten werden zu einer eigenständigen Incanto-Route zusammengeführt
- Wohnmobilquellen liefern Logistik und Routengerüst
- Offizielle Tourismusportale liefern Orte, Kultur, Landschaft und regionale Vertiefung
- Italia.it ist eine Quelle unter mehreren, nicht die alleinige Grundlage
- Bereits vorhandene Detailquellen bleiben erhalten
- `source` und `source2` der Grundroute werden zusätzlich in denselben Quellenblock der ausführlichen Übersicht übernommen
- Doppelte URLs werden bei der Anzeige automatisch entfernt
- Quellen erscheinen nicht mehr im Kartenbedienfeld

## Vergleichsansicht – festgelegtes Konzept

Die Vergleichsansicht soll keine zweite überladene Routendatenbank werden. Sie soll eine Entscheidung zwischen wenigen Favoriten erleichtern.

### Auswahl

- maximal drei Routen gleichzeitig vergleichen
- Auswahl direkt an den Routenkarten und aus der Detailansicht
- mobile Darstellung untereinander, Desktop als Spalten

### Vergleichskriterien

- Reisedauer
- Kilometer vor Ort
- Anreiseaufwand und Fähre
- Meer, Strand, Wein, Kultur, Berge und Städte
- Wohnmobil-Eignung
- Sommerferien-Eignung
- notwendige Reservierungen
- anspruchsvolle Wanderungen ja/nein
- Incanto-Herzen
- charakteristisches Reisegefühl in einem Satz

### Entscheidungshilfe

- keine automatische „Siegerroute“
- stattdessen klare Unterschiede und Hinweise wie „stärkste Meerroute“, „kürzeste Anreise“ oder „beste Genussroute“
- direkter Sprung von jeder Vergleichsspalte in die vollständige Routenübersicht

## Offene Merkliste

1. Ergebnis des Quellen-Audits prüfen und schwache oder zu allgemeine Links routeweise ersetzen
2. Karten-Ortssuche später um Orte aus Tagesplänen und Geheimtipps erweitern, nicht nur Hauptstopps
3. Optional: Stadtmarker auch außerhalb einer ausgewählten Route als eigener Kartenmodus
4. Comer-See-Darstellung nach realem Nutzungstest nochmals prüfen
5. Bilder und visuelle Qualität der Routenkarten später separat überarbeiten
6. Vergleichsansicht nach dem festgelegten Konzept technisch umsetzen

## Nicht vorgesehen

- Live-Routing bei jedem Seitenaufruf
- Wohnmobilspezifische Navigation auf der Website
- Ersatz für ein echtes Navigationsgerät vor Ort
- Gleichzeitige Anzeige aller 26 Straßenverläufe