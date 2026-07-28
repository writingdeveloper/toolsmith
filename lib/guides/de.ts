import type { GuideCopy } from "./registry";

export const de = {
  hub: {
    metaTitle: "Ratgeber — Dateiformate ohne Umschweife",
    metaDescription:
      "Warum HEIC nicht aufgeht, welches Bildformat passt, warum Ihr PDF so groß ist, MOV gegen MP4. Kurze Antworten aus Dateien, die wir gemessen haben.",
    h1: "Ratgeber",
    lead: "Die Fragen, die vor dem Werkzeug kommen. Jede Antwort hier stammt aus Dateien, die wir geöffnet und gemessen haben, nicht aus einem Datenblatt.",
    breadcrumb: "Ratgeber",
    toolsHeading: "Jetzt erledigen — ohne Upload",
    relatedHeading: "Lesenswert",
    updatedLabel: "Aktualisiert",
  },

  articles: {
    "what-is-heic": {
      metaTitle: "HEIC-Datei: Was das ist und warum sie klemmt",
      metaDescription:
        "HEIC ist das, was Ihr iPhone statt JPEG speichert. Warum es halb so groß ist, warum Windows und viele Websites es ablehnen und was beim Umwandeln wegfällt.",
      h1: "Was ist eine HEIC-Datei, und warum geht sie nicht auf?",
      lead: "Ihr iPhone speichert seit Jahren keine JPEGs mehr. Hier steht, was es stattdessen speichert, warum fast jedes Upload-Formular es abweist und was eine Umwandlung wirklich kostet.",
      sections: [
        {
          h2: "Ein Foto, mit Videotechnik zusammengedrückt",
          body: [
            "Eine HEIC-Datei ist ein Standbild im HEIF-Container, komprimiert mit HEVC — demselben Codec wie bei 4K-Video. Videocodecs sagen viel besser voraus, wie ein Bild weitergeht, als die Mathematik von 1992 in JPEG. Dasselbe Foto landet dadurch bei etwa der Hälfte, ohne sichtbaren Unterschied.",
            "Apple hat die iPhone-Kamera 2017 mit iOS 11 auf HEIC umgestellt. Wenn Ihre Fotos auf .HEIC enden, ist das alles: ein ganz normales Foto in einer neueren Hülle.",
          ],
        },
        {
          h2: "Warum sie auf dem Handy aufgeht und sonst nirgends",
          body: [
            "Apple liefert den Decoder mit, also öffnet HEIC überall unter iOS und macOS. Außerhalb dieser Insel wird es lückenhaft:",
          ],
          list: [
            "Windows 10 und 11 brauchen die HEIF-Bilderweiterungen aus dem Microsoft Store, und dieses Paket stützt sich wiederum auf den HEVC-Codec, der auf manchen Geräten kostenpflichtig ist.",
            "Chrome und Firefox decodieren HEIC nicht. Safari schon.",
            "Die meisten Upload-Formulare — Bewerbungen, Schadensmeldungen, Druckereien — prüfen die Endung und weisen .heic rundweg ab, ganz gleich ob sie es lesen könnten.",
          ],
        },
        {
          h2: "Zwei Auswege, und sie lösen Verschiedenes",
          body: [
            "Sie können Ihrem iPhone das Erzeugen abgewöhnen: Einstellungen → Kamera → Formate → Maximale Kompatibilität. Ab dann speichert die Kamera JPEG. Das regelt die Zukunft und ändert nichts an den Tausenden Fotos, die schon auf dem Gerät liegen.",
            "Oder Sie wandeln um. Für das, was Sie bereits haben, ist das die einzige Möglichkeit — und die richtige, wenn Sie jetzt ein einzelnes Foto aus dem Telefon brauchen.",
          ],
        },
        {
          h2: "Was bei der Umwandlung verloren geht",
          body: [
            "HEIC zu JPEG codiert das Bild neu, ist also verlustbehaftet: mehrfaches Hin und Her weicht es sichtbar auf. Wandeln Sie jedes Mal aus dem Original um, nie aus einer früheren Umwandlung.",
            "Manches übersteht die Reise nicht. Ein Live Photo wird zu einem einzelnen Standbild, weil die Bewegung in einer eigenen Videospur steckt und JPEG dafür keinen Platz hat. Tiefenkarten für den Porträtmodus und HDR-Gain-Maps fallen aus demselben Grund weg. Drehung, Datum und Ort im EXIF kommen mit.",
            "Wenn es Ihnen um Größe geht und nicht um Kompatibilität: Ein JPEG in Standardqualität ist meist größer als das HEIC, aus dem es stammt. Das ist der Handel — HEIC ist kleiner, JPEG geht überall auf.",
          ],
        },
        {
          h2: "Umwandeln, ohne das Foto aus der Hand zu geben",
          body: [
            "HEIC-Dateien sind auf eine Weise persönlich, wie eine Tabelle es nie ist: Sie tragen Gesichter, und das EXIF trägt den Ort, an dem Sie standen. Sie für ein JPEG zu einem kostenlosen Konverter hochzuladen, ist ein schlechter Tausch.",
            "Unser Bildkonverter decodiert HEIC im Browser-Tab. Der Decoder ist rund 1,5 MB groß und wird erst in dem Moment geladen, in dem tatsächlich eine HEIC-Datei ankommt — ohne HEIC wird nichts heruntergeladen. Das Foto selbst geht nirgendwohin.",
          ],
        },
      ],
      faq: [
        {
          q: "Ist HEIC dasselbe wie HEIF?",
          a: "HEIF ist der Container; HEIC heißt eine HEIF-Datei, deren Bilder mit HEVC komprimiert sind. Apple verwendet die Endung .heic. In der Praxis werden beide Wörter durcheinander benutzt.",
        },
        {
          q: "Verliert die Umwandlung Qualität?",
          a: "Ein wenig — JPEG und WebP sind verlustbehaftet, das Bild wird also neu codiert. Eine Umwandlung aus dem Original sieht man in der Regel nicht. Schaden richtet erst das wiederholte Umwandeln bereits umgewandelter Dateien an.",
        },
        {
          q: "Kann ich HEIC auf dem Handy umwandeln?",
          a: "Ja. Die Umwandlung läuft im Browser, ein aktuelles Handy genügt also. Große Stapel dauern dort schlicht länger, weil weniger Rechenleistung da ist.",
        },
      ],
    },

    "image-formats": {
      metaTitle: "PNG, JPG, WebP oder AVIF: Was wann nehmen?",
      metaDescription:
        "Eine Frage entscheidet das Format: Foto oder flächige Farbe mit Text? Was jedes Format wirklich gut kann — samt der Fallen.",
      h1: "PNG, JPG, WebP oder AVIF — was sollten Sie nehmen?",
      lead: "Vier Formate, eine Frage, die das meiste klärt: Ist das Bild eine Fotografie, oder besteht es aus flächiger Farbe, Text und Linien?",
      sections: [
        {
          h2: "Die Frage, die es entscheidet",
          body: [
            "Fotografien bestehen aus allmählicher, rauschender Variation. Verlustbehaftete Formate — JPG, WebP, AVIF — sind genau dafür gebaut und werden klein, indem sie Details wegwerfen, denen Ihr Auge ohnehin nicht folgt.",
            "Bildschirmfotos, Logos, Diagramme und alles mit Text sind das Gegenteil: große glatte Flächen und harte Kanten. Verlustbehaftete Kompression legt sichtbaren Schmutz um Buchstabenränder, und weil es kaum Rauschen zum Wegwerfen gibt, spart sie nicht einmal viel. Dafür gibt es PNG.",
          ],
        },
        {
          h2: "JPG — das, was überall aufgeht",
          body: [
            "Dreißig Jahre alt, von allem verstanden, was je gebaut wurde, und für Fotografien noch immer völlig in Ordnung. Es kann keine Transparenz, und bei stark gesenkter Qualität zeigt es Klötzchen.",
            "Nehmen Sie es, wenn die Datei von Software geöffnet werden muss, die Sie nicht in der Hand haben — eine Druckerei, ein Behördenformular, der alte Laptop einer Kollegin.",
          ],
        },
        {
          h2: "PNG — verlustfrei, transparent und falsch für Fotos",
          body: [
            "PNG wirft kein einziges Pixel weg und beherrscht volle Transparenz. Das macht es richtig für Logos, Bildschirmfotos, Symbole und alles, was Sie später weiterbearbeiten.",
            "Für eine Fotografie ist es ein schlechter Behälter, und hier bleiben viele hängen: Ein fotografisches PNG durch einen Kompressor zu schicken, bringt kaum etwas. Verlustfreier Kompression bleibt beim Bildrauschen fast nichts zu entfernen. Wenn Ihr PNG-Foto 8 MB hat, macht es kein PNG-Optimierer klein — die Umwandlung in JPG oder WebP schon.",
          ],
        },
        {
          h2: "WebP — die vernünftige Voreinstellung fürs Web",
          body: [
            "WebP kann beides: verlustbehaftet für Fotos, verlustfrei mit Transparenz für Grafiken, dazu Animation. Bei vergleichbarer Qualität liegt es meist 25 bis 35 Prozent unter JPEG.",
            "Jeder aktuelle Browser zeigt es an. Der verbleibende Grund dagegen liegt außerhalb des Browsers — manche ältere Desktop-Programme und Druckabläufe öffnen ein .webp noch immer nicht.",
          ],
        },
        {
          h2: "AVIF — am kleinsten, am langsamsten, noch nicht überall",
          body: [
            "AVIF nutzt den Videocodec AV1 und ist bei gegebener Qualität meist das kleinste der vier, besonders bei Fotografien und niedrigen Datenraten. Das Codieren ist langsam — bei einem großen Stapel deutlich spürbar.",
            "Eine Falle lohnt sich zu kennen: Dass ein Browser AVIF **anzeigen** kann, heißt nicht, dass er eines **erzeugen** kann. Die Unterstützung beim Codieren ist schmaler als beim Decodieren, und ein Browser, der ein nicht unterstütztes Format schreiben soll, gibt stillschweigend ein PNG zurück. Deshalb baut unser Konverter seine Formatliste, indem er ein Testbild tatsächlich codiert und prüft, was zurückkam — statt einer Kompatibilitätstabelle zu glauben.",
          ],
        },
        {
          h2: "Kurzfassung",
          body: ["Wenn Sie eine Faustregel statt eines Entscheidungsbaums möchten:"],
          list: [
            "Foto fürs Web → WebP, oder AVIF, wenn Größe wichtiger ist als Codierzeit.",
            "Foto, das überall aufgehen muss → JPG.",
            "Bildschirmfoto, Logo, Diagramm, alles mit Text → PNG.",
            "Transparenz nötig → PNG oder WebP. Nie JPG.",
            "Schon ein JPG und trotzdem zu groß → verkleinern Sie zuerst die Pixelmaße. Halbe Breite bedeutet ein Viertel der Pixel, und das schlägt jeden Qualitätsregler.",
          ],
        },
      ],
      faq: [
        {
          q: "Wird PNG als JPG kleiner?",
          a: "Bei einer Fotografie drastisch — oft um 80 Prozent oder mehr. Bei einem Bildschirmfoto oder Logo kann es größer werden und die Textkanten verwaschen. Sehen Sie erst nach, was das Bild eigentlich ist.",
        },
        {
          q: "Kann man WebP inzwischen bedenkenlos nehmen?",
          a: "Im Browser ja — alle aktuellen Browser zeigen es. Außerhalb ist es lückenhafter; geht die Datei in eine Druckerei oder in ein Desktop-Programm, ist JPG oder PNG die sicherere Übergabe.",
        },
        {
          q: "Warum ist mein komprimiertes PNG gleich groß?",
          a: "Weil PNG-Kompression verlustfrei ist und fotografisches Detail sich kaum komprimieren lässt. Es bleibt nichts übrig, was man gefahrlos entfernen könnte. Wechseln Sie das Format oder verkleinern Sie die Pixelmaße.",
        },
      ],
    },

    "why-pdf-is-large": {
      metaTitle: "Warum Ihr PDF so groß ist — und was hilft",
      metaDescription:
        "Fast jedes zu große PDF ist aus einem Grund zu groß: den Bildern darin. Wie Sie erkennen, welche Sorte Sie haben, und was tatsächlich schrumpft.",
      h1: "Warum Ihr PDF so groß ist — und was es wirklich kleiner macht",
      lead: "Ein 40-MB-PDF und ein 400-KB-PDF können auf dem Bildschirm gleich aussehen. Der Unterschied ist so gut wie nie der Text.",
      sections: [
        {
          h2: "Ein PDF ist eine Kiste, und das Gewicht sind die Bilder",
          body: [
            "PDF ist ein Container. Text wird als Zeichen plus eingebettete Schrift gespeichert — ein paar hundert Kilobyte für ein ganzes Buch. Vektorzeichnungen liegen als Koordinaten vor und sind ähnlich winzig.",
            "Bilder werden als Bilder gespeichert. Ein einziges Handyfoto in einem Dokument kann schwerer wiegen als zweihundert Seiten Text. Wenn ein PDF gewaltig ist, schleppt es Bilder mit sich.",
          ],
        },
        {
          h2: "Finden Sie zuerst heraus, welche Sorte PDF Sie haben",
          body: [
            "Versuchen Sie, einen Satz mit dem Cursor zu markieren. Wenn der Text Wort für Wort hervorgehoben wird, ist es ein Text-PDF — die Zeichen sind echt. Wird nichts markiert oder die ganze Seite als ein Block, dann ist jede Seite eine Fotografie einer Seite.",
            "Dieser eine Test sagt Ihnen, was wirken wird:",
          ],
          list: [
            "Text-PDF und trotzdem groß → es wurde etwas Sperriges eingefügt: Fotos, ein als Bild eingesetztes Diagramm, ein gescanntes Deckblatt. Die Bilder zu komprimieren ist die Lösung.",
            "Gescanntes PDF → die Seiten selbst sind die Bilder. Sie neu zu codieren ist der einzige Hebel, und es gibt eine Grenze, unter der der Scan unleserlich wird.",
          ],
        },
        {
          h2: "Was die Größe wirklich senkt",
          body: [
            "Die eingebetteten JPEGs mit geringerer Qualität neu codieren. Das ist der Haupthebel und reicht meistens: Text, Verweise, Lesezeichen und die Durchsuchbarkeit bleiben unangetastet — keines davon war das Problem.",
            "Seiten entfernen, die Sie nicht brauchen. Naheliegend und regelmäßig der größte Einzelgewinn — der Anhang voller Scans ist oft der Löwenanteil der Datei.",
            "Das Dokument teilen. Wenn nur Kapitel 3 verschickt werden muss, verschicken Sie Kapitel 3.",
            "Die Auflösung der Bilder senken. Ein Scan mit 600 dpi hat viermal so viele Pixel wie derselbe Scan mit 300 dpi, und 300 dpi übersteigt bereits alles, was ein Bildschirm zeigt.",
          ],
        },
        {
          h2: "Was nicht funktioniert",
          body: [
            "In ein ZIP zu packen spart fast nichts. Die Ströme in einem PDF sind bereits komprimiert, und komprimierte Daten zu komprimieren ist eine Nulloperation.",
            "Die andere Falle ist die aggressive Sorte „Komprimieren“: ein Werkzeug, das jede Seite als Rastergrafik zeichnet und das PDF um diese Bilder herum neu baut. Die Zahl wird kleiner, das Dokument ist ruiniert — der Text ist nun eine Fotografie von Text, also nicht durchsuchbar, nicht kopierbar, für Screenreader unlesbar und im Druck weich. Wenn Sie ein PDF komprimiert haben und seinen Text nicht mehr markieren können, ist genau das passiert.",
          ],
        },
        {
          h2: "Was unser Kompressor tut — und wann er ablehnt",
          body: [
            "Er codiert JPEG-Bilder neu und lässt alles andere in Ruhe. Text bleibt Text. Schriften, Verweise und Struktur gehen unverändert durch.",
            "Die Folge ist, dass er manchmal nichts zu tun hat. Wir haben ihn gegen den echten Scan einer Quittung von 1929 laufen lassen, deren Seiten nicht als JPEG gespeichert waren — und er lieferte gar keinen Download, statt eine gleich große Datei mit einer kleiner klingenden Beschriftung zurückzugeben. Wenn Ihr Scan in einem anderen Format vorliegt, ist das die ehrliche Antwort: Es bleibt, die Seitenzahl oder die Auflösung zu senken.",
          ],
        },
      ],
      faq: [
        {
          q: "Wie viel kleiner wird mein PDF?",
          a: "Das hängt ganz davon ab, was darin steckt. Fotolastige Dokumente fallen oft auf die Hälfte oder darunter. Ein reines Text-PDF ist bereits nahe an seiner Untergrenze und bewegt sich kaum — es war von vornherein nichts Schweres darin.",
        },
        {
          q: "Zerstört das Komprimieren Text oder Verweise?",
          a: "Nicht bei einem Verfahren, das nur Bilder anfasst. Nur die eingebetteten Fotos werden neu geschrieben; Zeichen, Schriften, Verweise und Lesezeichen werden übernommen. Werkzeuge, die jede Seite zu einem Bild verflachen, zerstören all das sehr wohl.",
        },
        {
          q: "Mein gescanntes PDF wurde kaum kleiner. Warum?",
          a: "Nicht jeder Scanner legt Seiten als JPEG ab. Liegen sie in einem anderen Bildformat vor, findet ein JPEG-Neucodierer keinen Ansatzpunkt. Ohnehin bringt es meist mehr, nur die wirklich benötigten Seiten herauszulösen.",
        },
      ],
    },

    "mov-vs-mp4": {
      metaTitle: "MOV oder MP4: Was wirklich anders ist",
      metaDescription:
        "MOV und MP4 sind nahe Verwandte, und die Umwandlung braucht meist gar keine Neucodierung. Wann sie gratis ist und wann sie Qualität kostet.",
      h1: "MOV gegen MP4 — was wirklich anders ist",
      lead: "Sie sind einander näher, als die verschiedenen Endungen vermuten lassen. Wie nahe, sagt Ihnen, wann eine Umwandlung gratis ist und wann sie Bildqualität kostet.",
      sections: [
        {
          h2: "Dieselbe Familie, anderer Nachname",
          body: [
            "MOV ist Apples QuickTime-Dateiformat. MP4 ist das ISO Base Media File Format — standardisiert, indem man QuickTime als Ausgangspunkt nahm. Sie sind Eltern und Kind, keine Rivalen.",
            "Beide sind Container: Kisten, die eine Videospur, eine Tonspur, Zeitinformationen und Metadaten enthalten. Das Video darin ist in beiden Fällen meist derselbe Codec — H.264 oder HEVC. Eine .mov von einem iPhone und eine .mp4 desselben iPhones können Byte für Byte gleichwertiges Video enthalten.",
          ],
        },
        {
          h2: "Warum wird MOV dann abgelehnt?",
          body: [
            "Meist wegen der Endung, nicht aus Unvermögen. Upload-Formulare, Videoplattformen, Schnittprogramme und Präsentationssoftware prüfen den Dateinamen und weisen .mov ab, noch bevor sie sie öffnen.",
            "MOV erlaubt außerdem einiges, was MP4 nicht erlaubt — bestimmte Apple-eigene Spuren und Codecs wie ProRes. Software, die MP4 problemlos abspielt, kann deshalb nicht versprechen, jede MOV abzuspielen. Es ist einfacher, die ganze Endung abzulehnen.",
          ],
        },
        {
          h2: "Ohne Neucodierung umwandeln — darauf kommt es an",
          body: [
            "Weil die Videospur bereits in einer Form vorliegt, die MP4 akzeptiert, muss beim Umwandeln von MOV zu MP4 nichts decodiert und neu komprimiert werden. Die Spuren werden aus der QuickTime-Kiste gehoben und in eine MP4-Kiste geschrieben. Das nennt man Remuxen.",
            "Es ist verlustfrei — das Bild ist bitgleich mit dem Original — und dauert Sekunden statt Minuten, weil überhaupt kein Encoder läuft. Ein Werkzeug, das zehn Minuten braucht und weicher zurückkommt als das Original, hat das Falsche getan.",
            "Das Zuschneiden funktioniert genauso: Einen Ausschnitt aus einer MP4 zu holen, braucht ebenfalls keinen Encoder. Der Haken ist, dass Schnitte auf Keyframes fallen, der Anfang also um Bruchteile einer Sekunde verrutschen kann. Das ist eine echte Einschränkung, und man sollte sie vor dem Schneiden kennen, nicht danach.",
          ],
        },
        {
          h2: "Wann Neucodierung unvermeidlich ist",
          body: ["Den Codec zu wechseln statt der Kiste — das kostet Zeit und Qualität:"],
          list: [
            "MP4 zu WebM — eine völlig andere Codec-Familie, also wird jedes Einzelbild decodiert und neu komprimiert.",
            "Die Datei kleiner machen — Kompression ist per Definition Neucodierung; eine kostenlose Variante gibt es nicht.",
            "Video zu GIF — GIF ist etwas ganz anderes, auf 256 Farben begrenzt, und das Ergebnis wird ein Mehrfaches des Videos wiegen, aus dem es stammt.",
          ],
        },
        {
          h2: "Die Drehfalle, vor der niemand warnt",
          body: [
            "Filmen Sie mit dem Handy hochkant, enthält die Datei meist keine hochkanten Pixel. Der Sensor schreibt ein Querformat, und der Container notiert eine Rotationsmatrix mit der Anweisung „beim Abspielen um 90 Grad drehen“. Abspieler lesen sie. Naive Konverter nicht.",
            "So kommt ein Hochformat-Clip aus einem Konverter, der auf der Seite liegt. Wir haben genau das im Juli 2026 in vier eigenen Werkzeugen gemessen — Umwandeln, Zuschneiden, Komprimieren und GIF lieferten allesamt gekipptes Video — und die Korrektur hängt vom Ausgabeformat ab: Bei MP4 schreibt man die Matrix neu; bei WebM und GIF gibt es keine Matrix, dort müssen die Pixel vor dem Codieren tatsächlich gedreht werden.",
            "Es überlebte lange, weil sämtliche Video-Testdateien Querformat waren. Es war kein Fehler, der sich versteckte, sondern ein Loch in den Stichproben.",
          ],
        },
      ],
      faq: [
        {
          q: "Verliert MOV zu MP4 Qualität?",
          a: "Muss es nicht. Liegt das Video bereits als H.264 oder HEVC vor, lassen sich die Spuren unangetastet in einen MP4-Container kopieren, und das ist bitgleich verlustfrei. Nur ein Codec-Wechsel erzwingt eine Neucodierung.",
        },
        {
          q: "Warum ist meine umgewandelte Datei gleich groß?",
          a: "Weil ein Containerwechsel nichts komprimiert — er verschiebt dasselbe Video in eine andere Kiste. Für eine kleinere Datei brauchen Sie Kompression, und die ist eine Neucodierung und ein eigener Arbeitsschritt.",
        },
        {
          q: "Was sollte ich behalten, MOV oder MP4?",
          a: "MP4, sofern Sie nicht in Apples Schnittwerkzeugen bleiben. MP4 wird überall angenommen; MOV wird oft genug allein wegen der Endung abgewiesen, um lästig zu werden.",
        },
      ],
    },
  },
} satisfies GuideCopy;
