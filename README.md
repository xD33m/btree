<img src="https://img.shields.io/badge/react%20-%2320232a.svg?&style=flat&logo=react&logoColor=%2361DAFB"/> <img src="https://img.shields.io/badge/firebase%20-%23039BE5.svg?&style=flat&logo=firebase"/> <img src="https://img.shields.io/badge/node.js%20-%2343853D.svg?&style=flat&logo=node.js&logoColor=white"/>

> Das Applikation ist unter [https://btree.lucask.dev](https://btree.lucask.dev) gehostet.

## 1. Manuelle Installation / Ausführung

Für das Installieren und Ausführen wird [Git](https://git-scm.com/downloads) und [Yarn](https://classic.yarnpkg.com/en/docs/install/) benötigt

**1.1 Repository Klonen**

`git clone https://github.com/xD33m/btree.git`

**1.2 Abhängigkeiten installieren**

`yarn install`

**1.3** **Applikation ausführen**

`yarn start`

Anschließend wird eine lokale Entwicklungsumgebung gestartet und die Applikation ist unter [`http://localhost:3000`](http://localhost:3000) einsehbar.

## 2. Die Applikation

### 2.1 Funktionen/Features

-   Einfügen/Löschen von Einzelwerten
-   Einfügen/Löschen von Werten auf einmal
-   Suche nach einem Wert mit graphischer Darstellung
-   Automatisches Einfügen / Löschen von Schlüsseln mit Anzeige der Zwischenergebnisse
-   Festlegen der Einfüge-/Löschgeschwindigkeit
-   "Zurück" & "Vorwärts" - Button beim manuellen Einfügen
-   Ändern der Ordnung
-   Gernerieren von Schlüssen, wo Unter-, Obergrenze & die Anzahl spezifiziert werden können.
-   CSV-Import von Schlüsseln
-   Graphfische Darstellung des B-Baums
-   Eingabe-Validierung
-   Zoom-Funktion

### 2.2 Struktur des Projeks

```
📦src
 ┣ 📂Components ------------------ **React Komponenten**
 ┃ ┣ 📜Controls.jsx -------------- Buttons, Textfields, Slider etc.
 ┃ ┣ 📜Graph.jsx ----------------- Die Komponente, die den Graph darstellt
 ┃ ┣ 📜Home.jsx ------------------ Die Hauptkomponente
 ┃ ┗ 📜RandomNumberDialog.jsx ---- Die Komponente, die zufällige Schlüssel generiert
 ┣ 📂js -------------------------- **Der B-Baum Algorithmus & Hilfsfunktionen**
 ┃ ┣ 📜BTree.js ------------------ Haupt-Klasse des B-Baums
 ┃ ┣ 📜BTreeNode.js -------------- Klasse eines Knotens
 ┃ ┗ 📜helpers.js ---------------- Hilfsfunktionen
 ┣ ...
```

### 2.3 Verwendete Frameworks / Libraries

-   [React](https://reactjs.org/): Eine Library für moderne Front-End entwicklung
-   [Webpack](https://webpack.js.org/): Ein Modul-Bundler
-   [Material-UI](https://material-ui.com/): Ein React-Framework für Front-End Komponenten
-   [Graphviz-react](https://www.npmjs.com/package/graphviz-react): Ein Modul, welches das ursprüngliche [Graphviz-Tool](https://graphviz.org/) für React bereitstellt

### 2.4 Die Darstellung des B-Baums

Der in JavaScript implementierte Algorithmus generiert ein selbst gewähltes JSON-Format eines B-Baums. Das JSON-Format wird anschließend manuell in das [dot-Format](https://graphviz.org/doc/info/lang.html) geparsed, welches von Graphviz interpretiert und dargestellt werden kann.

![https://puu.sh/GX90k/98f5833389.png](https://puu.sh/GX90k/98f5833389.png)

### 2.5 Anmerkung zum B-Baum Algorithmus

-   Die "Ordnung" wird verschieden interpretiert. Hier wurde sich für die aus der Vorlesung vorgestellte Definition entschieden: Bei einer Ordnung `m`, gelten folgende Regeln:
    -   Jeder Knoten hat mindestens ![](https://latex.codecogs.com/gif.latex?\lceil%20m/2%20\rceil) Söhne (daraus folgt, dass ein Knoten mindestens ![](https://latex.codecogs.com/gif.latex?\lceil%20m/2-1%20\rceil) Schlüssel beinhaltet)
    -   Die maximal erlaubte Anzahl an Kindknoten eines Knotens ist `m`
-   Es wurde auf Hilfs-Libraries wie JQuery verzichtet, um den Overhead zu reduzieren und die Performance zu steigern.
