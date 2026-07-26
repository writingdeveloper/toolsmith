import type { Dictionary } from "./en";

export const de = {
  site: {
    title: "toolsmith — Browser-Werkzeuge, die nichts hochladen",
    titleTemplate: "%s | toolsmith",
    description:
      "Ihre Dateien verlassen das Gerät nicht. Bilder, Video und PDF werden vollständig im Browser verarbeitet. Ohne Anmeldung, ohne Upload.",
    tagline: "Kein Upload · alles läuft im Browser",
    footerNote:
      "Die gewählten Dateien werden nie an einen Server geschickt. Alles passiert in diesem Browser-Tab.",
  },

  home: {
    title: "Datei-Werkzeuge, die nichts hochladen",
    lead: "Bilder, Video und PDF werden direkt im Browser verarbeitet. Nichts hochladen, nichts abwarten, nichts hinterher löschen.",
    availableHeading: "Verfügbar",
    upcomingHeading: "In Vorbereitung",
  },

  localePicker: {
    title: "Sprache wählen",
    lead: "toolsmith verarbeitet jede Datei im Browser. Wählen Sie eine Sprache, um fortzufahren.",
  },

  common: {
    chooseFile: "Dateien wählen",
    download: "Herunterladen",
    clear: "Leeren",
    downloadAll: "Alle herunterladen",
    workerUnsupportedTitle: "Dieser Browser kann dieses Werkzeug nicht ausführen.",
    workerUnsupportedHint:
      "Bitte in einem aktuellen Chrome, Edge, Firefox oder Safari mit Web-Worker-Unterstützung öffnen.",
  },

  pdfErrors: {
    encrypted: "Dieses PDF ist passwortgeschützt",
    noPages: "Dieses PDF hat keine Seiten",
    tooLarge: "Das liegt über 512 MB",
    invalid: "Diese Datei lässt sich nicht als PDF lesen",
    badRange: "Diese Seitenangaben ergeben keinen Sinn",
    outOfBounds: "Diese Seiten gibt es in diesem PDF nicht",
    generic: "Da ist etwas schiefgelaufen",
  },

  toolNames: {
    "image-convert": "Bildkonverter",
    "video-convert": "Videokonverter",
    "video-compress": "Video komprimieren",
    "video-trim": "Video zuschneiden",
    "video-to-gif": "Video zu GIF",
    "audio-extract": "Audio extrahieren",
    "pdf-merge": "PDF zusammenfügen",
    "pdf-split": "PDF teilen",
    "pdf-organize": "Seiten drehen und löschen",
    "pdf-compress": "PDF verkleinern",
    ocr: "Bild zu Text",
    "data-query": "CSV- und Parquet-Abfrage",
    subtitles: "Untertitel erzeugen",
    "subtitle-translate": "Untertitel übersetzen",
    "remove-bg": "Hintergrund entfernen",
    cutout: "Freistellen per Klick",
    upscale: "Bild hochskalieren",
    stems: "Spuren trennen",
  },

  tools: {
    "image-convert": {
      blurb: "HEIC, PNG, JPG, WebP und AVIF in jede Richtung. Komprimieren und skalieren in einem Zug.",
      metaTitle: "Bildkonverter — HEIC, PNG, JPG, WebP, AVIF",
      metaDescription:
        "iPhone-HEIC-Fotos in JPG, PNG in WebP umwandeln. Direkt im Browser konvertieren und komprimieren, ohne Upload. Ohne Anmeldung, ohne Mengenbegrenzung.",
      h1: "Bilder konvertieren und komprimieren",
      lead: "Wandeln Sie zwischen HEIC, PNG, JPG, WebP und AVIF um, senken Sie die Qualität für kleinere Dateien und skalieren Sie im selben Durchgang. Auch stapelweise.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. Die Umwandlung läuft in diesem Browser-Tab, und die gewählten Bilder gehen nie über das Netz. Tab schließen und sie sind weg.",
        },
        {
          q: "Funktionieren iPhone-HEIC-Fotos?",
          a: "Ja. Safari liest HEIC direkt; in Chrome und Firefox wird der Decoder erst in dem Moment geladen, in dem Sie eine HEIC-Datei ablegen. Ohne HEIC wird nichts heruntergeladen.",
        },
        {
          q: "Welches Format soll ich nehmen?",
          a: "WebP ist bei gleicher Qualität am kleinsten, wenn das Bild ins Web soll. JPG, wenn es überall aufgehen muss, PNG bei Transparenz. In der Liste stehen nur Formate, die Ihr Browser tatsächlich erzeugen kann.",
        },
      ],
      ui: {
        unsupportedTitle: "Dieser Browser kann keine Bilder umwandeln.",
        unsupportedHint:
          "Bitte in einem aktuellen Chrome, Edge, Firefox oder Safari 17+ mit OffscreenCanvas öffnen.",
        dropLabel: "Bilder hier ablegen",
        dropHint: "HEIC · PNG · JPG · WebP · AVIF · GIF · BMP — mehrere auf einmal",
        formatLabel: "Ausgabeformat",
        qualityLabel: "Qualität {value}",
        qualityLossless: "Qualität (PNG ist verlustfrei)",
        sizeLabel: "Größe",
        sizeOriginal: "Originalgröße behalten",
        sizeMax: "Längste Kante {px} px",
        convert: "{n} Datei(en) umwandeln",
        converting: "Wird umgewandelt…",
        itemWorking: "Wird umgewandelt…",
        errUnsupportedInput: "Dieses Format kann der Browser nicht lesen",
        errGeneric: "Die Umwandlung ist fehlgeschlagen",
      },
    },

    "pdf-merge": {
      blurb: "Mehrere PDFs zu einem, in Ihrer Reihenfolge. Seiten werden kopiert, nicht neu gerendert.",
      metaTitle: "PDF zusammenfügen — mehrere PDFs zu einem verbinden",
      metaDescription:
        "Fügen Sie mehrere PDFs in beliebiger Reihenfolge zusammen. Vollständig im Browser, ohne Upload, ohne Anmeldung, ohne Wasserzeichen und ohne Mengenbegrenzung.",
      h1: "PDF zusammenfügen",
      lead: "Verbinden Sie mehrere PDFs zu einer Datei. Ordnen Sie die Liste um, und das Ergebnis folgt genau dieser Reihenfolge.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. Das Zusammenfügen läuft in diesem Browser-Tab, und die gewählten PDFs gehen nie über das Netz. Tab schließen und sie sind weg.",
        },
        {
          q: "Wie lege ich die Seitenreihenfolge fest?",
          a: "Von oben nach unten in der Liste — das ist die Seitenreihenfolge des Ergebnisses. Mit ↑ ↓ verschieben Sie eine Datei, mit ✕ nehmen Sie sie heraus. Innerhalb jeder Datei bleibt die Reihenfolge erhalten.",
        },
        {
          q: "Gehen passwortgeschützte PDFs?",
          a: "Nein. Geschützte PDFs werden als solche markiert und beim Zusammenfügen ausgelassen. Lieber verweigern wir, als Ihnen eine Datei zu geben, die sich öffnen ließ, aber beschädigt herauskam. Entfernen Sie zuerst das Passwort.",
        },
        {
          q: "Leidet die Qualität?",
          a: "Nein. Die Seiten werden unverändert kopiert statt neu gerendert. Text bleibt Text, Bilder behalten ihre Auflösung.",
        },
      ],
      ui: {
        dropLabel: "PDFs hier ablegen",
        dropHint: "Ab zwei Dateien wird von oben nach unten verbunden",
        listLabel: "Zu verbindende Dateien",
        reading: "wird gelesen…",
        pageCount: "{n} Seiten",
        moveUp: "{name} nach oben",
        moveDown: "{name} nach unten",
        remove: "{name} entfernen",
        merge: "{n} Dateien verbinden",
        merging: "Wird verbunden…",
        totalPages: "{n} Seiten insgesamt",
        needTwo: "Es werden mindestens zwei PDFs gebraucht",
        resultDetail: "{pages} Seiten · {size}",
      },
    },

    "pdf-split": {
      blurb: "Einzelne Seiten herausziehen oder jede Seite als eigenes PDF in einem ZIP.",
      metaTitle: "PDF teilen — Seiten extrahieren oder einzeln auftrennen",
      metaDescription:
        "Ziehen Sie bestimmte Seiten aus einem PDF oder trennen Sie jede Seite in eine eigene Datei. Vollständig im Browser, ohne Upload, ohne Anmeldung, ohne Wasserzeichen.",
      h1: "PDF teilen",
      lead: "Ziehen Sie die gewünschten Seiten in ein einzelnes PDF, oder trennen Sie jede Seite in ein eigenes PDF und erhalten Sie alles als ZIP.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. Das Teilen läuft in diesem Browser-Tab, und das gewählte PDF geht nie über das Netz. Tab schließen und es ist weg.",
        },
        {
          q: "Wie schreibe ich die Seitenzahlen?",
          a: "So: 1-3, 5, 8-. Das heißt Seite 1 bis 3, Seite 5 einzeln und Seite 8 bis zum Ende. Die Reihenfolge, die Sie schreiben, ist die Reihenfolge, die Sie bekommen.",
        },
        {
          q: "Was, wenn ich eine Seite verlange, die es nicht gibt?",
          a: "Wir sagen es sofort. Würden wir 1-99 stillschweigend auf ein 10-seitiges Dokument zurechtstutzen, blieben Sie in dem Glauben, Seiten erhalten zu haben, die es nie gab. Das machen wir nicht.",
        },
        {
          q: "Leidet die Qualität?",
          a: "Nein. Die Seiten werden unverändert kopiert statt neu gerendert. Text bleibt Text, Bilder behalten ihre Auflösung.",
        },
      ],
      ui: {
        dropLabel: "PDF hier ablegen",
        dropHint: "Eine Datei nach der anderen — Seiten herausziehen oder alle auftrennen",
        reading: "wird gelesen…",
        pageCount: "{n} Seiten",
        modeExtract: "Seitenbereich extrahieren",
        modeExtractHint: "Die gewählten Seiten, gesammelt in einem PDF",
        modePages: "Jede Seite einzeln",
        modePagesHint: "{n} einseitige PDFs, verpackt in einem ZIP",
        rangeLabel: "Zu extrahierende Seiten",
        rangePlaceholder: "z. B. 1-3, 5, 8-  (insgesamt {n} Seiten)",
        selected: "{n} Seiten ausgewählt",
        needRange: "Bitte angeben, welche Seiten gezogen werden sollen",
        runExtract: "Extrahieren",
        runPages: "In Einzelseiten auftrennen",
        processing: "Wird verarbeitet…",
        extractName: "{stem}-auszug.pdf",
        zipName: "{stem}-seiten.zip",
        extractDetail: "{pages} Seiten · {size}",
        zipDetail: "{count} PDFs · {size}",
      },
    },

    "pdf-organize": {
      blurb: "Alle Seiten im Blick: quer liegende aufrichten, überflüssige herausnehmen.",
      metaTitle: "PDF drehen und Seiten löschen — Scan im Browser geradeziehen",
      metaDescription:
        "Quer eingescannte Seiten aufrichten und überflüssige Seiten entfernen. Jede Seite wird als Miniatur gezeigt. Vollständig im Browser, ohne Upload und ohne Anmeldung.",
      h1: "PDF drehen und Seiten löschen",
      lead: "Alle Seiten liegen als Miniaturen vor Ihnen. Drehen Sie die quer liegenden, werfen Sie leere heraus und speichern Sie den Rest.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. Sowohl die Miniaturen als auch die gespeicherte Datei entstehen in diesem Browser-Tab, und das gewählte PDF geht nie über das Netz. Tab schließen und es ist weg.",
        },
        {
          q: "Der Scan ist schon gedreht. Geht beim Drehen etwas kaputt?",
          a: "Nein. Die Drehung wird zu dem addiert, was die Seite bereits mitbrachte — was Sie in der Miniatur sehen, bekommen Sie auch. Scanner hinterlegen oft eine eigene Drehung; sie zu überschreiben ist genau der Grund, warum Seiten verkehrt herum herauskommen.",
        },
        {
          q: "Wird die Seite beim Drehen neu gerendert?",
          a: "Nein. Es wird nur ein Drehvermerk geschrieben, der Inhalt wird unverändert kopiert. Text bleibt Text, Bilder behalten ihre Auflösung. Nichts wird unscharf oder neu komprimiert.",
        },
        {
          q: "Kann ich eine gelöschte Seite zurückholen?",
          a: "Ja, solange Sie hier sind. Löschen markiert die Seite nur — mit ↩ auf der Seite oder „Alles zurücksetzen“ ist sie wieder da. Die Originaldatei auf Ihrer Festplatte wird nie verändert.",
        },
      ],
      ui: {
        dropLabel: "PDF hier ablegen",
        dropHint: "Eine Datei nach der anderen — jede Seite wird zur Auswahl gezeigt",
        rendering: "Vorschauen werden gezeichnet…",
        pageCount: "{n} Seiten",
        gridLabel: "Seiten",
        pageAlt: "Seite {n}",
        rotateLeft: "Seite {n} nach links drehen",
        rotateRight: "Seite {n} nach rechts drehen",
        removePage: "Seite {n} löschen",
        restorePage: "Seite {n} zurückholen",
        rotateAll: "Alle nach rechts drehen",
        resetAll: "Alles zurücksetzen",
        save: "{n} Seiten speichern",
        saving: "Wird gespeichert…",
        needOne: "Mindestens eine Seite muss bleiben",
        outputName: "{stem}-bearbeitet.pdf",
        resultDetail: "{pages} Seiten · {size}",
      },
    },
  },
} satisfies Dictionary;
