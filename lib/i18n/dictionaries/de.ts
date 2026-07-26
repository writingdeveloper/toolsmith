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
    relatedHeading: "Weitere Werkzeuge",
    chooseFile: "Dateien wählen",
    download: "Herunterladen",
    clear: "Leeren",
    downloadAll: "Alle herunterladen",
    workerUnsupportedTitle: "Dieser Browser kann dieses Werkzeug nicht ausführen.",
    workerUnsupportedHint:
      "Bitte in einem aktuellen Chrome, Edge, Firefox oder Safari mit Web-Worker-Unterstützung öffnen.",
  },

  mediaErrors: {
    unsupportedContainer: "Diese Datei ist kein MP4 oder MOV, das wir öffnen können",
    noAudioTrack: "Diese Datei hat keinen Ton zum Herausziehen",
    noVideoTrack: "Diese Datei hat keine Videospur",
    unsupportedCodec: "Dieser Browser kann dieses Video nicht dekodieren",
    badRange: "Das Ende muss nach dem Anfang liegen",
    tooLarge: "Das liegt über 512 MB",
    decodeFailed: "Das Video konnte nicht bis zum Ende gelesen werden",
    encodeFailed: "Dieser Browser konnte das Ergebnis nicht kodieren",
    generic: "Da ist etwas schiefgelaufen",
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
    "image-compress": "Bild verkleinern",
    "video-convert": "Videokonverter",
    "video-compress": "Video verkleinern",
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
      metaTitle: "PDF zusammenfügen — mehrere PDFs zu einem",
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
      metaTitle: "PDF teilen — Seiten extrahieren oder auftrennen",
      metaDescription:
        "Ziehen Sie Seiten aus einem PDF oder trennen Sie jede Seite in eine eigene Datei. Im Browser, ohne Upload, ohne Anmeldung, ohne Wasserzeichen.",
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
      metaTitle: "PDF drehen und Seiten löschen — Scan begradigen",
      metaDescription:
        "Quer eingescannte Seiten aufrichten und überflüssige entfernen. Jede Seite wird als Miniatur gezeigt. Im Browser, ohne Upload, ohne Anmeldung.",
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

    "pdf-compress": {
      blurb: "Komprimiert die Fotos im PDF neu. Der Text bleibt Text — nichts wird plattgebügelt.",
      metaTitle: "PDF verkleinern — kleiner werden, Text behalten",
      metaDescription:
        "Verkleinern Sie ein PDF, indem die enthaltenen Fotos neu komprimiert werden. Der Text bleibt markierbar und durchsuchbar. Ohne Upload, ohne Anmeldung.",
      h1: "PDF verkleinern",
      lead: "Verkleinert ein PDF, indem die enthaltenen Fotos neu komprimiert werden. Der Text bleibt unangetastet und damit markierbar und durchsuchbar.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. Das Verkleinern läuft in diesem Browser-Tab, und das gewählte PDF geht nie über das Netz. Tab schließen und es ist weg.",
        },
        {
          q: "Wird der Text unscharf?",
          a: "Nein. Neu codiert werden nur die Fotos; Text und Vektorgrafiken werden unverändert kopiert. Viele Kompressoren backen jede Seite in ein einziges Bild — das schrumpft stärker, aber Ihr Text ist dann kein Text mehr und lässt sich weder markieren noch durchsuchen noch vorlesen. Das machen wir nicht.",
        },
        {
          q: "Warum ist meine Datei kaum kleiner geworden?",
          a: "Weil es wenig auszupressen gab. Ein PDF aus überwiegend Text ist schon klein, und Fotos, die von Anfang an gut gespeichert wurden, lassen sich ohne sichtbaren Schaden nicht viel weiter verkleinern. Dann sagen wir es Ihnen, statt eine gleich große Datei zurückzugeben und sie „komprimiert“ zu nennen.",
        },
        {
          q: "Welche Qualität soll ich einstellen?",
          a: "Etwa 70 ist ein guter Kompromiss für Dokumente, die am Bildschirm gelesen werden. Gehen Sie tiefer für Entwürfe, die nur per Mail rausgehen; lassen Sie Qualität hoch und Auflösung unangetastet, wenn es auf die Fotos ankommt.",
        },
      ],
      ui: {
        dropLabel: "PDF hier ablegen",
        dropHint: "Eine Datei nach der anderen — die Fotos darin werden neu komprimiert",
        reading: "wird gelesen…",
        pageCount: "{n} Seiten",
        qualityLabel: "Fotoqualität {value}",
        qualityAria: "Fotoqualität",
        sizeLabel: "Fotoauflösung",
        sizeOriginal: "Originalauflösung behalten",
        sizeMax: "Längste Kante {px} px",
        run: "Verkleinern",
        working: "Wird verkleinert…",
        outputName: "{stem}-verkleinert.pdf",
        rewroteImages: "{n} von {total} Fotos neu komprimiert",
        noImages: "In diesem PDF gibt es keine Fotos zum Neukomprimieren.",
        alreadySmall: "Die Fotos waren bereits gut komprimiert — kleiner ging es nicht.",
      },
    },

    "data-query": {
      blurb: "Führt SQL auf einer CSV- oder Parquet-Datei aus. Die Datei verlässt Ihr Gerät nicht.",
      metaTitle: "SQL-Abfragen auf CSV und Parquet",
      metaDescription:
        "Öffnen Sie eine CSV- oder Parquet-Datei und fragen Sie sie mit SQL ab. DuckDB läuft in Ihrem Browser — ohne Upload, ohne Anmeldung, ohne Zeilenlimit.",
      h1: "CSV- und Parquet-Abfrage (SQL)",
      lead: "Öffnet eine CSV- oder Parquet-Datei und lässt Sie sie mit echtem SQL abfragen. DuckDB läuft in diesem Tab, die Datei wird nie hochgeladen.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. DuckDB bekommt nur eine Referenz auf die Datei und liest sie direkt von Ihrer Festplatte. Hochgeladen wird nichts. Heruntergeladen wird die DuckDB-Engine selbst, von einem öffentlichen CDN — dieser Verkehr läuft in die andere Richtung.",
        },
        {
          q: "Warum werden vorher etwa 6MB geladen?",
          a: "Weil DuckDB eine echte analytische Datenbank ist, übersetzt nach WebAssembly. Unkomprimiert sind das 35MB, über die Leitung rund 6MB. Wir holen sie in dem Moment, in dem Sie den Knopf drücken, und nicht früher; Ihr Browser behält sie danach.",
        },
        {
          q: "Wie groß darf die Datei sein?",
          a: "Größer als Sie denken, besonders bei Parquet. Die Datei wird nicht vorab in den Speicher geladen — DuckDB liest nur die Teile, die eine Abfrage braucht. Eine Abfrage über zwei Spalten einer breiten Parquet-Datei liest daher fast nichts. Eine CSV muss durchlaufen werden und ist deshalb langsamer.",
        },
        {
          q: "Welches SQL kann ich schreiben?",
          a: "Den Dialekt von DuckDB, der PostgreSQL sehr nahe kommt. Ihre Datei steht als Tabelle `data` bereit, `SELECT * FROM data LIMIT 50` ist also der Einstieg. Joins, Fensterfunktionen, Aggregate und CTEs funktionieren alle. Fehlermeldungen kommen wörtlich von DuckDB, damit Sie sie beheben können.",
        },
        {
          q: "Werden alle Zeilen angezeigt?",
          a: "Die Tabelle auf dem Bildschirm hört bei 200 Zeilen auf, damit die Seite bedienbar bleibt, und sagt Ihnen, wenn sie das tut. Die Abfrage selbst ist nicht begrenzt, und die heruntergeladene CSV enthält alle angezeigten Zeilen.",
        },
      ],
      ui: {
        dropLabel: "CSV- oder Parquet-Datei hier ablegen",
        dropHint: "CSV · TSV · Parquet · JSON — eine nach der anderen",
        downloadNote: "Beim Öffnen wird die DuckDB-Engine geladen, rund {size}.",
        localNote: "Die Datei selbst wird nicht hochgeladen — DuckDB liest sie von Ihrer Festplatte.",
        open: "Öffnen und abfragen",
        opening: "Wird geöffnet…",
        rowCount: "{rows} Zeilen",
        columnCount: "{columns} Spalten",
        schemaLabel: "Spalten",
        sqlLabel: "SQL",
        sqlHint: "Ihre Datei ist die Tabelle `data`.",
        run: "Ausführen",
        running: "Wird ausgeführt…",
        resultSummary: "{rows} Zeilen · {ms}ms",
        showingFirst: "die ersten {n} werden gezeigt",
        noRows: "Diese Abfrage lieferte keine Zeilen.",
        downloadCsv: "CSV herunterladen",
        errEngine: "Die DuckDB-Engine konnte nicht geladen werden",
        errFormat: "Dieser Dateityp lässt sich nicht öffnen — CSV, TSV, Parquet oder JSON",
        errRead: "Die Datei konnte nicht gelesen werden",
      },
    },

    ocr: {
      blurb: "Holt den Text aus einem Foto, Screenshot oder gescannten PDF. Nichts wird hochgeladen.",
      metaTitle: "Bild und PDF zu Text (OCR) im Browser",
      metaDescription:
        "Lesen Sie den Text aus einem Foto, Screenshot oder gescannten PDF, ohne es hochzuladen. Sieben Sprachen, komplett im Browser, ohne Anmeldung.",
      h1: "Bild und PDF zu Text (OCR)",
      lead: "Liest die Wörter aus einem Bild oder einem gescannten PDF und gibt Ihnen reinen Text zum Kopieren. Die Erkennung läuft auf Ihrem Gerät.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. Das Bild wird in diesem Browser-Tab gelesen und nie hochgeladen. Unterwegs ist allein die Erkennungs-Engine, die von einem öffentlichen CDN zu Ihnen herunterkommt — die Richtung ist also umgekehrt.",
        },
        {
          q: "Warum werden vorher ein paar Megabyte geladen?",
          a: "Weil OCR eine echte Engine und ein für die gewählte Sprache trainiertes Modell braucht. Zusammen sind das rund 4 bis 6MB. Wir holen sie in dem Moment, in dem Sie den Knopf drücken, und nicht früher; Ihr Browser behält sie danach, sodass das zweite Dokument sofort startet.",
        },
        {
          q: "Warum ist der Text nicht perfekt?",
          a: "Wir nutzen die kompakten Modelle, die fünf- bis zehnmal kleiner sind als die genauen (Englisch: 2MB gegen 11MB, Japanisch: 1,5MB gegen 16MB). Bei einem sauberen Scan ist der Unterschied klein, bei einem verwackelten Handyfoto zeigt er sich. Wir wollten Ihnen dafür keine 16MB zumuten. Legen Sie die Seite gerade hin und sorgen Sie für Licht — das hilft deutlich.",
        },
        {
          q: "Kann es ein PDF lesen?",
          a: "Ja, bis zu 30 Seiten auf einmal. Jede Seite wird zuerst als Bild gezeichnet und dann gelesen. Wenn im PDF bereits echter Text steckt, ist Kopieren aus einem beliebigen Reader schneller und exakt — OCR ist für die PDFs, die nur Bilder von Papier sind.",
        },
        {
          q: "Bleibt das Layout erhalten?",
          a: "Nein. Sie bekommen die Wörter in Lesereihenfolge, keine Spalten, Tabellen oder Überschriften. Wenn das Layout wichtiger ist als die Wörter, ist dies das falsche Werkzeug.",
        },
      ],
      ui: {
        dropLabel: "Bild oder PDF hier ablegen",
        dropHint: "PNG · JPG · WebP · PDF — eines nach dem anderen",
        pdfLimit: "bis zu {max} Seiten",
        languageLabel: "Sprache im Dokument",
        downloadNote: "Mit dem Knopfdruck werden rund {size} an Engine- und Sprachdaten geladen.",
        cachedNote: "Das geschieht einmal, danach behält Ihr Browser es — das nächste Dokument startet sofort.",
        run: "Text lesen",
        working: "Wird gelesen…",
        stageEngine: "Engine wird geladen {percent}%",
        stageRendering: "Seite {done}/{total} wird gezeichnet",
        stageReading: "Seite {page}/{pages} wird gelesen",
        resultSummary: "{pages} Seite(n) · Konfidenz {confidence}%",
        copy: "Kopieren",
        copied: "Kopiert",
        resultLabel: "Erkannter Text",
        truncated: "Dieses Dokument hat {total} Seiten; gelesen wurden nur die ersten {max}.",
        nothingFound: "In diesem Bild wurde kein Text gefunden.",
        lowConfidence: "Die Konfidenz ist niedrig — gleichen Sie es mit dem Original ab, bevor Sie sich darauf verlassen.",
        errEngine: "Die OCR-Engine konnte nicht geladen werden",
        errTooManyPages: "Es können nur {max} Seiten auf einmal gelesen werden",
        languages: {
          eng: "Englisch",
          kor: "Koreanisch",
          jpn: "Japanisch",
          spa: "Spanisch",
          deu: "Deutsch",
          por: "Portugiesisch",
          chi_sim: "Chinesisch (vereinfacht)",
        },
      },
    },

    "image-compress": {
      blurb: "Macht Fotos kleiner, ohne das Format zu ändern. Sie sehen bei jeder Datei, wie viel gespart wurde.",
      metaTitle: "Bilder verkleinern — JPG, PNG, WebP",
      metaDescription:
        "Verkleinern Sie Fotos im Browser, ohne sie hochzuladen. Das Originalformat bleibt erhalten und jede Datei zeigt ihre Ersparnis. Ohne Anmeldung und Limit.",
      h1: "Bilder verkleinern",
      lead: "Macht Bilddateien kleiner und gibt sie in dem Format zurück, in dem sie hereinkamen. Die Ersparnis sehen Sie vor dem Herunterladen bei jeder Datei.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. Die Komprimierung läuft in diesem Browser-Tab, Ihre Bilder verlassen das Gerät nie. Schließen Sie den Tab, und sie sind weg.",
        },
        {
          q: "Warum wurde mein PNG nicht kleiner?",
          a: "Weil PNG verlustfrei ist — der Qualitätsregler hat nichts herzugeben. Um ein PNG zu verkleinern, müssen Sie die Pixelmaße reduzieren oder auf WebP wechseln, das bei gleicher sichtbarer Qualität meist 60-80% kleiner ist. Beides finden Sie hier.",
        },
        {
          q: "Welche Qualität soll ich nehmen?",
          a: "75 ist ein guter Ausgangspunkt für Fotos fürs Web; kaum jemand unterscheidet sie vom Original. Unter etwa 50 fangen die Kanten an zu verschmieren. Jede Datei zeigt ihr Vorher und Nachher — probieren Sie eine aus und schauen Sie hin.",
        },
        {
          q: "Bleibt mein Format erhalten?",
          a: "Ja, standardmäßig. Ein JPG kommt als JPG zurück und passt dorthin, wo es herkam. Wenn Sie lieber WebP möchten, können Sie das umstellen.",
        },
        {
          q: "Bleiben EXIF-Daten erhalten?",
          a: "Nein. Beim Neukodieren fallen die Metadaten weg, auch die GPS-Koordinaten, die Handykameras hineinschreiben. Für Bilder, die online gehen, ist das meist erwünscht.",
        },
      ],
      ui: {
        dropLabel: "Bilder hier ablegen",
        dropHint: "JPG · PNG · WebP · HEIC — mehrere auf einmal",
        qualityLabel: "Qualität {value}",
        sizeLabel: "Größe",
        sizeOriginal: "Originalgröße behalten",
        sizeMax: "Lange Kante {px}px",
        formatLabel: "Ausgabe",
        formatKeep: "Originalformat behalten",
        losslessNote: "PNG ist verlustfrei, der Qualitätsregler verkleinert es also nicht. Reduzieren Sie die Größe oder stellen Sie die Ausgabe auf WebP.",
        run: "{n} Datei(en) verkleinern",
        working: "Wird verkleinert…",
        total: "{n} Dateien · {before} → {after} ({percent}% kleiner)",
        errUnsupportedInput: "Dieser Browser kann dieses Format nicht lesen",
        errGeneric: "Die Komprimierung ist fehlgeschlagen",
      },
    },

    "video-convert": {
      blurb: "MOV ohne Neukodierung zu MP4, oder MP4 zu WebM fürs Web. Nichts wird hochgeladen.",
      metaTitle: "MOV in MP4 und MP4 in WebM umwandeln",
      metaDescription:
        "Wandeln Sie MOV ohne Neukodierung in MP4 um oder MP4 mit VP9 und Opus in WebM. Läuft in Ihrem Browser — ohne Upload, ohne Anmeldung, ohne Größenlimit.",
      h1: "Video-Konverter",
      lead: "Legt Ihr Video in einen anderen Container. MP4 lässt die Codecs unangetastet; WebM kodiert das Bild neu in VP9 und den Ton in Opus.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. Das Video wird in diesem Browser-Tab gelesen und neu geschrieben, hochgeladen wird nichts. Schließen Sie den Tab, und es ist weg.",
        },
        {
          q: "Warum ist MOV zu MP4 fast sofort fertig?",
          a: "Weil .mov und .mp4 dieselbe Schachtel mit einem anderen Etikett sind. Ein iPhone-.mov enthält bereits H.264- oder HEVC-Bild und AAC-Ton, und all das passt genauso in ein MP4. Wir kopieren die Spuren also unverändert und schreiben nur die Hülle neu. Es wird nichts dekodiert, also geht auch nichts verloren.",
        },
        {
          q: "Warum dauert WebM so viel länger?",
          a: "Weil WebM weder H.264 noch AAC aufnehmen kann. Jedes Einzelbild muss neu als VP9 kodiert werden und der Ton als Opus. Das ist echte Rechenarbeit: Rechnen Sie mit einem guten Teil der Cliplaufzeit und mit einem kleinen Qualitätsverlust, wie bei jeder Neukodierung.",
        },
        {
          q: "Kann ich ein WebM, AVI oder MKV in MP4 umwandeln?",
          a: "Nein. Wir öffnen den Container selbst, statt Ihnen ein 30MB großes Medienpaket in den Browser zu schicken — und öffnen können wir MP4, MOV und M4V. Wir lassen diese Formate lieber von der Liste weg, als die Datei anzunehmen und dann daran zu scheitern.",
        },
        {
          q: "Leidet die Qualität?",
          a: "Auf dem MP4-Weg nicht — dort wird kein einziges Einzelbild neu kodiert. Auf dem WebM-Weg schon, denn Neukodieren kostet immer etwas. Wählen Sie die Qualität, die Ihnen passt; das Werkzeug sagt Ihnen vor dem Klick, auf welchem Weg Sie sind.",
        },
      ],
      ui: {
        dropLabel: "Video hier ablegen",
        dropHint: "MP4 · MOV · M4V — eines nach dem anderen",
        reading: "wird gelesen…",
        seconds: "s",
        noAudio: "ohne Ton",
        targetLabel: "Umwandeln in",
        targetMp4: "MP4",
        targetWebm: "WebM",
        mp4Note: "Die Codecs bleiben unangetastet, nur der Container wird neu geschrieben. Es geht nichts verloren und es dauert Sekunden.",
        webmNote: "H.264 passt nicht in ein WebM, deshalb wird das Bild neu in VP9 und der Ton in Opus kodiert. Das dauert und kostet etwas Qualität.",
        alreadyMp4: "Diese Datei ist bereits ein MP4 — die Umwandlung würde nur den Container neu schreiben.",
        mp4Unavailable: "Der Codec dieses Videos lässt sich nicht unverändert in ein MP4 kopieren.",
        webmUnavailable: "Dieser Browser kann kein WebM kodieren. MP4 funktioniert weiterhin.",
        sizeLabel: "Größe",
        sizeOriginal: "Originalgröße behalten",
        sizeMax: "Lange Kante {px}px",
        qualityLabel: "Qualität",
        qualityHigh: "Hoch — größere Datei",
        qualityBalanced: "Ausgewogen",
        qualitySmall: "Klein — geringere Qualität",
        run: "In {format} umwandeln",
        working: "Wird umgewandelt…",
        outputNameMp4: "{stem}.mp4",
        outputNameWebm: "{stem}.webm",
        resultLossless: "Es wurde nichts neu kodiert.",
        resultReencoded: "Das Bild wurde neu in VP9 kodiert.",
        audioKept: "Der Ton kam ebenfalls mit.",
        audioDropped: "Der Ton konnte nicht mitübernommen werden.",
      },
    },

    "video-compress": {
      blurb: "Verkleinert ein MP4 im Browser. Ohne 30MB Werkzeugkasten — Ihr Gerät erledigt es selbst.",
      metaTitle: "Video verkleinern — MP4 im Browser schrumpfen",
      metaDescription:
        "Machen Sie ein MP4 kleiner, ohne es hochzuladen. Läuft mit dem Video-Encoder des Browsers auf Ihrem Gerät — keine Datei verlässt den Rechner.",
      h1: "Video verkleinern",
      lead: "Kodiert das Bild mit niedrigerer Bitrate neu und lässt den Ton unangetastet. Alles passiert auf Ihrem Gerät.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. Alles läuft in diesem Browser-Tab mit dem Video-Encoder Ihres Geräts. Die Datei wird nie hochgeladen — bei Video wiegt das schwerer als sonst irgendwo, denn es sind meist die größten und persönlichsten Dateien.",
        },
        {
          q: "Warum bleibt der Ton unberührt?",
          a: "Weil Neukodieren ihn nur schlechter machen würde. Der Ton wird unverändert übernommen — verlustfrei und schneller. Nur das Bild wird neu kodiert.",
        },
        {
          q: "Welche Dateien kann ich nehmen?",
          a: "MP4 und MOV. Wir lesen den Container selbst, statt 30MB Medienwerkzeug auszuliefern — das ist die ehrliche Grenze dessen, was wir heute öffnen können. Deshalb stehen AVI und MKV gar nicht erst zur Auswahl, statt angenommen zu werden und dann zu scheitern.",
        },
        {
          q: "Warum sagt mein Browser, er könne das nicht?",
          a: "Video-Kodierung braucht WebCodecs, das älteren Browsern fehlt. Chrome und Edge seit 2021, Safari seit 16.4, Firefox seit 130. Wir fragen Ihren Browser, ob er H.264 wirklich kodieren kann, bevor wir das Werkzeug anbieten.",
        },
      ],
      ui: {
        unsupportedTitle: "Dieser Browser kann keine Videos verkleinern.",
        unsupportedHint:
          "Video-Kodierung braucht WebCodecs — versuchen Sie ein aktuelles Chrome oder Edge, Safari 16.4+ oder Firefox 130+.",
        dropLabel: "Video hier ablegen",
        dropHint: "MP4 und MOV — eine Datei nach der anderen",
        reading: "wird gelesen…",
        seconds: " s",
        noAudio: "ohne Ton",
        qualityLabel: "Qualität",
        quality: { high: "Hoch", balanced: "Ausgewogen", small: "So klein wie möglich" },
        sizeLabel: "Auflösung",
        sizeOriginal: "Originalauflösung behalten",
        sizeMax: "Längste Kante {px} px",
        run: "Verkleinern",
        working: "Wird verkleinert…",
        outputName: "{stem}-verkleinert.mp4",
        audioKept: "Der Ton wurde unverändert übernommen.",
        didNotShrink:
          "Es wurde nicht kleiner — das Original war bereits effizient. Versuchen Sie weniger Qualität oder Auflösung.",
      },
    },

    "video-trim": {
      blurb: "Schneiden Sie einen Ausschnitt heraus, ohne neu zu kodieren. Nichts geht verloren, und es dauert Sekunden.",
      metaTitle: "Video zuschneiden — MP4 im Browser kürzen",
      metaDescription:
        "Schneiden Sie einen Ausschnitt aus einem MP4 oder MOV, ohne es hochzuladen. Nichts wird neu kodiert, die Qualität bleibt und es dauert Sekunden.",
      h1: "Video zuschneiden",
      lead: "Holt einen Ausschnitt aus einem Video und überträgt ihn unverändert — ohne Neukodierung, die Qualität bleibt genau die des Originals.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. Das Video wird in diesem Browser-Tab gelesen und neu geschrieben, nichts wird hochgeladen. Tab schließen und es ist weg.",
        },
        {
          q: "Warum beginnt es etwas früher als gewünscht?",
          a: "Weil ein Schnitt nur auf einem Keyframe landen kann. Keyframes sind die Bilder, die für sich allein darstellbar sind; die dazwischen beschreiben nur, was sich seit einem früheren Bild geändert hat. Schneidet man dazwischen, kommt die erste Sekunde kaputt heraus. Deshalb rücken wir den Anfang auf den nächstgelegenen früheren Keyframe — und sagen Ihnen vor dem Klick, wo der liegt.",
        },
        {
          q: "Geht auch die exakt gewünschte Sekunde?",
          a: "Nur, indem der Anfang neu kodiert wird, und das kostet Qualität und Zeit. Wir zeigen Ihnen lieber den ehrlichen Schnittpunkt, statt diesen Tausch stillschweigend für Sie zu machen. Wer bildgenau schneiden muss, ist mit einem richtigen Schnittprogramm besser bedient.",
        },
        {
          q: "Leidet die Qualität?",
          a: "Nein. Kein einziges Bild wird neu kodiert — Bild und Ton werden genau so übernommen, wie sie waren. Deshalb ist es auch bei großen Dateien fast sofort fertig.",
        },
        {
          q: "Welche Dateien kann ich verwenden?",
          a: "MP4 und MOV. Wir lesen den Container selbst, statt eine 30 MB große Medienbibliothek auszuliefern — deshalb werden AVI und MKV gar nicht erst angeboten, statt angenommen zu werden und dann zu scheitern.",
        },
      ],
      ui: {
        dropLabel: "Video hier ablegen",
        dropHint: "MP4 und MOV — eines nach dem anderen",
        reading: "wird gelesen…",
        seconds: "s",
        noAudio: "kein Ton",
        startLabel: "Anfang (Sekunden)",
        endLabel: "Ende (Sekunden)",
        grabHere: "Abspielposition",
        snapped: "Schneidet bei {actual}s statt {asked}s — das ist der nächste Keyframe davor.",
        onKeyframe: "Dieser Anfang liegt genau auf einem Keyframe.",
        run: "Zuschneiden",
        working: "Wird zugeschnitten…",
        outputName: "{stem}-Ausschnitt.mp4",
        resultRange: "{from}s → {to}s · {length}s lang",
        lossless: "Es wurde nichts neu kodiert.",
        audioKept: "Der Ton wurde unverändert übernommen.",
      },
    },

    "video-to-gif": {
      blurb: "Aus einem Clip wird ein GIF in Dauerschleife. Ohne Upload — Ihr Gerät erledigt das.",
      metaTitle: "Video zu GIF — MP4 im Browser umwandeln",
      metaDescription:
        "Erstellen Sie aus einem MP4 oder MOV ein GIF in Dauerschleife, ohne Upload. Bildrate und Größe wählen, Ergebnis vorab ansehen. Alles im Browser.",
      h1: "Video zu GIF",
      lead: "Macht aus einem Clip ein GIF in Dauerschleife. Sie wählen, wie flüssig und wie groß — alles Weitere passiert auf Ihrem Gerät.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. Das Video wird in diesem Browser-Tab dekodiert und das GIF hier zusammengesetzt. Nichts wird hochgeladen, und den Tab zu schließen ist das ganze Aufräumen.",
        },
        {
          q: "Warum ist das GIF größer als das Video?",
          a: "Weil GIF ein Format von 1987 ist: Jedes Bild wird vollständig mit einer Palette von höchstens 256 Farben gespeichert, Bewegung wird nicht komprimiert. Ein Video-Codec schaut, was sich zwischen zwei Bildern ändert; GIF tut das kaum. Ein Vielfaches des Ausgangs-MP4 ist normal — das liegt am Format, nicht am Werkzeug.",
        },
        {
          q: "Warum weicht die Bildrate leicht ab?",
          a: "GIF speichert die Verzögerung je Bild in Hundertstelsekunden, deshalb lassen sich nur bestimmte Raten exakt schreiben. 20, 10 und 5 fps gehen genau auf; 15 fps werden zu 7/100 s und laufen tatsächlich mit 14,3. Wir zeigen Ihnen die echte Zahl statt der gewünschten.",
        },
        {
          q: "Wie lang darf der Clip sein?",
          a: "Bis zu 400 Bilder — 20 Sekunden bei 20 fps oder 40 bei 10 fps. Darüber wird ein GIF zweistellig megabyteschwer und Browser kommen ins Straucheln; dann hören wir lieber auf, statt Ihnen etwas Unbrauchbares zu geben. Mit einer niedrigeren Bildrate passt ein längerer Clip hinein.",
        },
        {
          q: "Welche Dateien kann ich verwenden?",
          a: "MP4 und MOV. Wir lesen den Container selbst, statt eine 30 MB große Medienbibliothek auszuliefern — deshalb werden AVI und MKV gar nicht erst angeboten, statt angenommen zu werden und dann zu scheitern.",
        },
      ],
      ui: {
        unsupportedTitle: "Dieser Browser kann aus Video kein GIF machen.",
        unsupportedHint:
          "Zum Lesen des Videos wird WebCodecs benötigt — versuchen Sie es mit aktuellem Chrome oder Edge, Safari 16.4+ oder Firefox 130+.",
        dropLabel: "Video hier ablegen",
        dropHint: "MP4 und MOV — eines nach dem anderen",
        reading: "wird gelesen…",
        seconds: "s",
        fpsLabel: "Bildrate",
        fpsOption: "{n} fps",
        fpsActual: "tatsächlich {n} fps",
        sizeLabel: "Größe",
        sizeOriginal: "Originalgröße behalten",
        sizeMax: "Lange Kante {px}px",
        framesEstimate: "etwa {n} Bilder",
        tooManyFrames:
          "Das sind über {max} Bilder. Wählen Sie eine niedrigere Bildrate — ein GIF dieser Länge wäre riesig.",
        run: "GIF erstellen",
        working: "Wird erstellt…",
        outputName: "{stem}.gif",
        resultFrames: "{n} Bilder · {fps} fps",
        truncated: "Es haben nur die ersten {n} Bilder hineingepasst, das Ende des Clips fehlt.",
        biggerNote:
          "Das GIF ist größer als das Video. Das ist normal — GIF komprimiert keine Bewegung.",
        previewAlt: "Das eben erstellte GIF",
      },
    },

    "audio-extract": {
      blurb: "Holt den Ton aus einem Video. Nichts wird neu kodiert, also geht nichts verloren.",
      metaTitle: "Audio aus Video — MP4 zu M4A oder WAV",
      metaDescription:
        "Holen Sie die Tonspur aus einem MP4 oder MOV, ohne Upload. Verlustfrei als M4A behalten oder als WAV, das sich überall öffnet. Alles im Browser.",
      h1: "Audio aus Video extrahieren",
      lead: "Holt die Tonspur aus einem Video. Keine der beiden Varianten kodiert den Ton neu — unterwegs geht nichts verloren.",
      faq: [
        {
          q: "Wohin gehen meine Dateien?",
          a: "Nirgendwohin. Das Extrahieren läuft in diesem Browser-Tab, und das Video wird nie hochgeladen. Tab schließen und es ist weg.",
        },
        {
          q: "M4A oder WAV?",
          a: "M4A, wenn Sie einfach den Ton wollen: die Originalspur wird unverändert herausgehoben, ist also identisch mit dem, was im Video steckte, und bleibt klein. WAV, wenn etwas weiter hinten reines PCM braucht — bei Schnittprogrammen und älterer Software oft der Fall. WAV ist deutlich größer, weil unkomprimiert.",
        },
        {
          q: "Leidet die Klangqualität?",
          a: "Nein. M4A kopiert den Originalton exakt, Bit für Bit. WAV dekodiert ihn zurück in rohe Samples, was gegenüber dem Videoinhalt ebenfalls verlustfrei ist. Keiner der beiden Wege komprimiert den Ton erneut.",
        },
        {
          q: "Geht auch MP3?",
          a: "Heute nicht. Browser können MP3 abspielen, aber nicht erzeugen, und wir liefern dafür keinen 30MB-Encoder aus. M4A übernimmt dieselbe Rolle — komprimiert, klein, überall zu öffnen — und kommt ohne Qualitätsverlust direkt aus Ihrer Datei.",
        },
      ],
      ui: {
        unsupportedTitle: "Dieser Browser kann kein Audio extrahieren.",
        unsupportedHint:
          "Dafür braucht es WebCodecs — versuchen Sie ein aktuelles Chrome oder Edge, Safari 16.4+ oder Firefox 130+.",
        dropLabel: "Video hier ablegen",
        dropHint: "MP4 und MOV — eine Datei nach der anderen",
        reading: "wird gelesen…",
        seconds: " s",
        channels: "{n} Kanäle",
        formatM4a: "M4A — Original behalten",
        formatM4aHint: "Hebt die Spur unverändert heraus. Klein und identisch mit dem Videoton.",
        formatWav: "WAV — öffnet sich überall",
        formatWavHint: "Unkomprimiertes PCM für Schnittprogramme und ältere Software. Viel größer.",
        run: "Audio extrahieren",
        working: "Wird extrahiert…",
        outputNameM4a: "{stem}.m4a",
        outputNameWav: "{stem}.wav",
        losslessNote: "identisch mit der Originalspur",
      },
    },
  },
} satisfies Dictionary;
