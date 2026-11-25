# 🦊 Fuxis Mathe-Abenteuer · 2. Klasse (Baden-Württemberg)

Eine touch-optimierte Mathe-Lern-App für Kinder der 2. Klasse – komplett offline,
ohne Login, ohne Dependencies. Vanilla HTML/CSS/JS, optimiert für Tablet & Handy.

## Dateien
| Datei | Inhalt |
|---|---|
| `index.html` | Markup & komplettes Design (Glassmorphismus, Gradients, Konfetti-Canvas) |
| `fuxi-core.js` | 10 Module mit Aufgaben-Generatoren, Sound, XP/Level-Logik, Zustand |
| `fuxi-ui.js` | Rendering, Quiz-Logik, Event-Delegation, XP-Anzeige, Overlays |

## V2 – Features
- **10 Module**: Zahlen bis 100 · Plus & Minus · Kleines Einmaleins · Zerlegen & Verdoppeln · Uhrzeit · Euro & Geld · Formen · Muster · Längen & Messen · Sachaufgaben
- **Beispiele haben Vorrang**: vor jeder Übungsrunde erscheinen Erklär-Beispiele mit Schritt-für-Schritt-Navigation
- **Pädagogisches Fehlerfeedback**: 1. Versuch falsch → Lerntipp + erneuter Versuch · 2. Versuch falsch → Lösung zeigen & gemeinsam weiter
- **XP- & Level-System**: +6 XP pro Treffer im 1. Versuch (ab Serie 3: +8), +3 XP beim 2. Versuch · Levelaufstieg mit Konfetti-Overlay · 🔥 Streak-Anzeige
- **Bestleistungen** pro Modul werden gespeichert (localStorage, auf dem Gerät)
- Touch: keine Doppeltipp-Zooms, große Buttons, Safe-Area-Support für iOS, Vibrationsfeedback
- **Funktioniert offline** – nach einmaligem Laden sogar ohne Internet (Google Fonts-Load ist optional (Fallback: System-Fonts))

## Start
Einfach `index.html` öffnen – oder als GitHub Pages hosten:
`Settings → Pages → Deploy from branch: main` → `https://timharri.github.io/Lily_Lern-App_Mathe-2.-Klasse/`

## Qualität
- End-to-End getestet (jsdom): alle 10 Module komplett durchspielbar – Beispiele → 10 Fragen → Ergebnis
- Aufgaben-Generatoren so gebaut, dass Antworten niemals negativ oder unmöglich sind
