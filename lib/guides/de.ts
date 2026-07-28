import type { GuideCopy } from "./registry";

export const de = {
  hub: {
    metaTitle: "Ratgeber — Dateiformate ohne Umschweife",
    metaDescription:
      "Warum HEIC nicht aufgeht, welches Bildformat passt, warum Ihr PDF so groß ist, was KI-Vergrößerung nicht kann. Antworten aus gemessenen Dateien.",
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

    "how-background-removal-works": {
      metaTitle: "Wie Freistellen wirklich funktioniert",
      metaDescription:
        "Ein Modell schätzt für jedes Pixel, wie sehr es zum Motiv gehört — geschnitten wird nichts. Das erklärt weiche Haarkanten und Fotos, die gar nicht gehen.",
      h1: "Wie Freistellen wirklich funktioniert — und wann es scheitert",
      lead: "Es wird nichts ausgeschnitten. Ein Modell schätzt Pixel für Pixel, wie viel davon zum Motiv gehört. Wenn Sie das wissen, erklärt sich jedes seltsame Ergebnis, das Sie je gesehen haben.",
      sections: [
        {
          h2: "Heraus kommt eine Maske, kein Ausschnitt",
          body: [
            "Das Modell sieht Ihr Foto an und gibt ein Graustufenbild derselben Form zurück: weiß, wo es sicher ist, dass dieses Pixel zum Motiv gehört, schwarz, wo es sicher Hintergrund ist, und jedes Grau dazwischen, wo es unsicher ist. Dieses Graustufenbild wird unmittelbar zum Transparenzkanal des Ergebnisses.",
            "Es gibt also keine Kontur, keinen Pfad, und nichts wird nachgezeichnet. Zurück kommt **Sicherheit**, gezeichnet als Transparenz. Haare, Fell, Bewegungsunschärfe, Glas und Schatten landen in der Mitte dieses Bereichs — und die weiche Kante dort ist nicht ein schlechtes Modell, sondern ein ehrliches.",
          ],
        },
        {
          h2: "Das Modell sucht die eine auffällige Sache",
          body: [
            "U²-Net, das hier läuft, ist ein Netz zur Erkennung hervorstechender Objekte. Es wurde auf genau eine Frage trainiert: Was fällt in diesem Bild auf? Ein einzelnes Motiv vor einem einigermaßen ruhigen Hintergrund ist exakt sein Fall.",
            "Geben Sie ihm ein Bild ohne eindeutige Antwort, verweigert es nicht — es legt eine schwache, unsichere Maske über alles. Wir haben vierundzwanzig Fotos hindurchgeschickt und die Alphawerte gelesen. Die zehn ohne einzelnes Motiv kamen als durchscheinende Schlieren oder als gar nichts zurück: eine Luftaufnahme von Wald ergab **0,0 %** sichere Pixel und galt formal trotzdem als Erfolg.",
            "Dieses Scheitern ist leise, und deshalb misst das Werkzeug die Maske inzwischen und sagt es Ihnen, statt Ihnen ein leeres PNG zu reichen.",
          ],
          list: [
            "Geht: eine Person, ein Produkt auf einem Tisch, ein Haustier, ein Schuh, ein Fahrrad, ein Berg vor Himmel.",
            "Geht nicht: Menschenmengen, Verkehr, ein Tulpenfeld, ein Bücherregal, ein Korallenriff, Wald von oben.",
            "Dazwischen: eine Gruppe ähnlicher Objekte — einige kommen womöglich durch, und dann halb durchsichtig.",
          ],
        },
        {
          h2: "Warum Kanten weich werden und große Fotos schlechter aussehen",
          body: [
            "Das Modell sieht Ihr Bild unabhängig von seiner tatsächlichen Größe mit 320×320 Pixeln, und die Maske kommt ebenfalls mit 320×320 zurück. Um sie anzuwenden, muss sie auf die Originalmaße gedehnt werden. Bei einem Foto mit 4000 Pixeln deckt ein Maskenpixel rund ein Dutzend echte ab, und das sieht man an der Kontur.",
            "Ein besseres Foto ändert daran nichts — das ist die Form des Verfahrens. Wenn Sie das Ergebnis klein verwenden, spielt es keine Rolle; wenn Sie es groß verwenden, schon.",
            "Es gibt außerdem einen direkten Tausch zwischen Download und Qualität. Das schnelle Modell wiegt 4,4 MB, das genaue 168 MB: vierzigmal so viel, und am selben Foto sichtbar anders. Das kleine lässt gern einen blassen Geist des Hintergrunds stehen; das große trennt Haare und kleine Requisiten sauber ab.",
          ],
        },
        {
          h2: "Wann das Modell nicht auswählen sollte",
          body: [
            "Wenn auf dem Foto mehrere Objekte sind oder das gewünschte nicht der Star des Bildes ist, hilft keine bessere Modellqualität — es wurde nie gefragt, welches Sie meinen.",
            "Dafür gibt es ein anderes Werkzeug. Der Klick-Ausschnitt schickt einmal einen schweren Encoder über das Bild und beantwortet danach jeden Klick nahezu sofort. Wir haben auf der CPU 6,0 Sekunden für den Encoder und 0,10 Sekunden pro Klick gemessen — nur deshalb kann das eine Oberfläche zum Klicken und Sehen sein statt zum Warten und Sehen. Ein Punkt erwischt meist einen Teil eines Objekts; der zweite sagt, was noch dazugehört.",
          ],
        },
        {
          h2: "Als PNG speichern, sonst ist die Transparenz weg",
          body: [
            "JPG hat überhaupt keinen Transparenzkanal. Speichern Sie einen Ausschnitt als JPG, bleibt der transparente Bereich nicht transparent — er kommt weiß oder schwarz zurück, und viele merken das erst hinterher. PNG und WebP führen beide Alpha; nehmen Sie eines davon.",
            "Eines sollte man außerdem laut sagen: Die Fotos, die Menschen freistellen lassen, zeigen meist Menschen. Das läuft im Browser-Tab, das Bild geht also nirgendwohin — aber das Modell muss vorher geladen werden, und wir nennen die Größe, bevor Sie sich darauf einlassen.",
          ],
        },
      ],
      faq: [
        {
          q: "Warum heißt es, es sei kein Motiv gefunden worden?",
          a: "Weil die Maske überall schwach ausfiel statt irgendwo stark. Wir zählen sicher zum Vordergrund gehörende und unsichere Pixel getrennt; gibt es fast keine sicheren oder werden sie von den unsicheren deutlich überstimmt, lautet die ehrliche Antwort: Dieses Foto hat kein einzelnes Motiv zu finden.",
        },
        {
          q: "Bekomme ich eine saubere Kante um Haare?",
          a: "Teilweise. Das genaue Modell ist bei Haaren deutlich besser. Die Maske wird aber mit 320×320 berechnet und vergrößert, also gibt es bei einem hochaufgelösten Foto eine Grenze für die Feinheit dieser Kante — eine von Hand gezogene Maske erreicht sie nie.",
        },
        {
          q: "Es hat das falsche Objekt entfernt. Kann ich wählen?",
          a: "Beim Freistellen nicht — das Modell nimmt, was hervorsticht, und hat keine Möglichkeit zu wissen, was Sie wollten. Nehmen Sie den Klick-Ausschnitt: Dort zeigen Sie auf das gewünschte Objekt und ergänzen Punkte, um Teile aufzunehmen oder auszuschließen.",
        },
      ],
    },

    "does-upscaling-add-detail": {
      metaTitle: "Erzeugt KI-Vergrößerung echte Details?",
      metaDescription:
        "Nein — sie erfindet plausible Details. Deshalb gewinnt sie bei komprimierten Bildern und verschlechtert saubere Fotos. Wir haben beides gemessen.",
      h1: "Erzeugt KI-Vergrößerung echte Details?",
      lead: "Die kurze Antwort lautet nein. Die längere ist nützlicher: Sie erfindet Details, die richtig aussehen — und ob das hilft, hängt ganz davon ab, was mit Ihrem Bild überhaupt nicht stimmte.",
      sections: [
        {
          h2: "Was das Modell tatsächlich tut",
          body: [
            "Gewöhnliches Vergrößern mittelt benachbarte Pixel. Es kann nichts erfinden, das Ergebnis ist also eine größere, weichere Fassung dessen, was Sie hatten — nie eine schärfere.",
            "Ein Vergrößerungsmodell tut etwas anderes. Es wurde an Millionen Bildpaaren trainiert, jeweils ein großes und sein geschrumpfter Zwilling, bis es gelernt hatte, wie eine verkleinerte Wimper, Ziegelwand oder Stoffbindung typischerweise aussieht. Aus einem kleinen Bild schreibt es ein **plausibles** großes zurück.",
            "Das arbeitende Wort ist «plausibel». Die hinzugefügten Details sind nicht wiedergewonnen — die Information wurde beim Verkleinern weggeworfen und ist fort. Zurück kommt eine selbstbewusste Vermutung, die dem ähnelt, was dort wahrscheinlich war.",
          ],
        },
        {
          h2: "Wir haben gemessen, wie es gegen schlichtes Skalieren verliert",
          body: [
            "Wir nahmen eine gemeinfreie Fotografie von 1896, verkleinerten sie auf 240 Pixel und vergrößerten sie vierfach — einmal mit dem Modell, einmal mit gewöhnlichem hochwertigem Resampling.",
            "Das Modell verlor. Einem karierten Stoff im Bild wurde die Bindung vollständig ausradiert — das Modell las dieses feine, regelmäßige Muster als Rauschen und glättete es weg — und das Gesicht wirkte wächsern. Die schlichte Vergrößerung war unschärfer und treuer.",
          ],
        },
        {
          h2: "Und dann gemessen, wie es klar gewinnt",
          body: [
            "Wir speicherten dieselbe Fotografie zunächst als JPEG mit Qualität 35 — ungefähr der Zustand sehr vieler Bilder, die durchs Internet gereicht wurden — und wiederholten den Vergleich. Diesmal gewann das Modell deutlich: Die klotzigen Kompressionsartefakte verschwanden, die Kanten kamen zurück.",
            "Der Grund: Diese Modellgattung ist gebaut, um **Schäden zu reparieren**, nicht um zu vergrößern. Sie entfernt, was sie als Rauschen liest. Kompressionsklötzchen sind Rauschen, also gehen sie und das Bild wird besser. Filmkorn und feine Stoffe werden ebenfalls als Rauschen gelesen, also gehen sie auch und das Bild wird schlechter.",
            "Daraus folgt eine brauchbare Regel. Ist das Problem Ihres Bildes, dass es totkomprimiert, abfotografiert oder immer wieder neu gespeichert wurde, hilft das Modell. Ist es nur klein, aber ansonsten sauber, kann das schlichte Vergrößern das ehrlichere Ergebnis sein.",
          ],
        },
        {
          h2: "Die Größengrenze ist nicht willkürlich",
          body: [
            "Vierfache Breite sind sechzehnfache Pixel. Ein Megapixel hinein ergibt sechzehn Megapixel heraus, und jedes einzelne davon wird von einem neuronalen Netz erzeugt statt kopiert.",
            "Deshalb gibt es eine Obergrenze für die Eingabe, und deshalb sperren wir den Knopf und schreiben den Grund hin, statt Sie es versuchen zu lassen. Den Tab minutenlang einzufrieren und dann nichts zu liefern ist das schlechtestmögliche Ergebnis — und genau das passiert ohne Grenze.",
            "Die 2×-Option entsteht, indem wir das 4×-Ergebnis erzeugen und halbieren, nicht indem wir direkt 2× anfordern. Erfundene Details ordnen sich beim Verkleinern, das Ergebnis wird besser. Die Zeit bleibt gleich, denn der teure Teil ist ohnehin passiert.",
          ],
        },
        {
          h2: "Das schärfste Modell ist nicht das richtige",
          body: [
            "Wir haben zwei Kandidaten mit brauchbarer Lizenz verglichen. Der transformerbasierte ist sichtbar schärfer und brauchte 9,7 Sekunden für ein Bild mit 128×128. Der kompakte Faltungsansatz brauchte 16,5 Sekunden für 512×512 — sechzehnmal so viele Pixel. Pro Pixel ist das rund ein **sechzigfacher** Unterschied.",
            "Eine Grafikkarte rettet den langsamen nicht. Wir haben WebGPU hier etwa **3,4-mal** schneller als die CPU gemessen, nicht zwanzig- oder fünfzigmal, wie viele erwarten — Shader zu kompilieren und Daten auf die Karte zu schaffen kostet echte Zeit. Dreimal schneller ist etwas wert, aber ein Modell, das auf der CPU unbrauchbar ist, bleibt es meist auch auf der GPU.",
            "Das schärfere Modell ist also jenes, auf das niemand warten würde, und ausgeliefert wird jenes, das fertig wird. Nach demselben Maßstab ist jedes Modell auf dieser Seite ausgewählt.",
          ],
        },
      ],
      faq: [
        {
          q: "Kann es ein Nummernschild lesen, wie im Fernsehen?",
          a: "Nein — und das ist das Wichtigste daran. Sind die Zeichen fort, erzeugt das Modell etwas Scharfes, Selbstbewusstes und Falsches. Es erzeugt, was plausibel passt, und ist damit genau das falsche Werkzeug für alles, was stimmen muss.",
        },
        {
          q: "Warum sieht das Ergebnis wächsern oder plastikhaft aus?",
          a: "Weil Ihr Original sauber war. Das Modell entfernt, was es als Rauschen liest, und Filmkorn, Hauttextur und feine Stoffe werden alle so gelesen. Hat die Quelle keinen Kompressionsschaden zu reparieren, ist gewöhnliches Skalieren oft die bessere Wahl.",
        },
        {
          q: "Wie groß darf das Bild sein?",
          a: "Etwa ein Megapixel hinein, denn 4× macht daraus sechzehn Megapixel heraus. Größere Eingaben würden Minuten dauern und könnten den Speicher des Tabs erschöpfen, deshalb lehnt das Werkzeug vorab ab, statt auf halbem Weg zu scheitern.",
        },
      ],
    },

    "srt-vs-vtt": {
      metaTitle: "SRT oder VTT: welche Untertiteldatei?",
      metaDescription:
        "Die beiden trennt eine Kopfzeile und ein Satzzeichen. Hier steht, was welcher Player will — und wo automatisch erzeugte Untertitel danebenliegen.",
      h1: "SRT oder VTT — welche Untertiteldatei brauchen Sie?",
      lead: "Öffnen Sie beide in einem Texteditor, und Sie werden Mühe haben, sie auseinanderzuhalten. Die Unterschiede sind winzig, aber einer davon entscheidet, ob eine Webseite Ihre Untertitel überhaupt abspielt.",
      sections: [
        {
          h2: "Beides ist reiner Text mit Zeitmarken",
          body: [
            "Eine SRT-Datei ist eine nummerierte Liste von Blöcken. Jeder Block hat einen Index, eine Start- und Endzeit wie `00:00:01,000 --> 00:00:04,000` und die anzuzeigenden Zeilen. Das ist das ganze Format. Diese Schlichtheit erklärt, warum es überall auftaucht — Mediaplayer, Fernseher, Schnittprogramme, Videoplattformen.",
            "VTT ist dieselbe Idee, für das Web neu geschrieben. Es wurde standardisiert, damit Browser Untertitel direkt an einem HTML-Videoelement anzeigen können, und schafft Platz für Dinge, für die SRT nie eine Stelle hatte.",
          ],
        },
        {
          h2: "Die Unterschiede, vollständig",
          body: ["Es sind nicht viele, und alle sind rein mechanisch:"],
          list: [
            "Eine VTT-Datei muss mit der Zeile `WEBVTT` beginnen. Fehlt sie, weist der Browser die ganze Datei ab — der mit Abstand häufigste Grund, warum Untertitel wortlos ausbleiben.",
            "Sekundenbruchteile trennt SRT mit Komma, VTT mit Punkt.",
            "SRT verlangt die Blocknummern. VTT behandelt sie als optionale Bezeichner.",
            "VTT kann Position, Ausrichtung, Gestaltung und Sprecherkennzeichnung mitführen. SRT kennt davon nichts.",
            "Das `<track>`-Element von HTML5-Video akzeptiert nur VTT. Ein SRT lädt es nicht.",
          ],
        },
        {
          h2: "Was Sie also nehmen sollten",
          body: [
            "Läuft das Video auf einer Webseite, die Sie kontrollieren: VTT — eine Wahl haben Sie nicht. Für alles andere ist SRT die sicherere Datei: Desktop-Player, Telefone, Fernseher, Schnittprogramme und jede große Videoplattform nehmen sie an, und einige davon nehmen kein VTT.",
            "Weil die Umwandlung rein mechanisch ist, lohnt das Grübeln nicht. Unser Untertitelwerkzeug schreibt beide Dateien aus derselben Transkription, nehmen Sie also die, die das Ziel verlangt.",
          ],
        },
        {
          h2: "Wie automatische Untertitel entstehen — und wie sie scheitern",
          body: [
            "Erzeugte Untertitel kommen aus einem Spracherkennungsmodell. Der Ton wird dekodiert, auf 16 kHz gebracht und an das Modell übergeben, das Text samt Start- und Endzeit jedes Abschnitts zurückgibt. Hier passiert das im Browser-Tab, das Modell muss also zuerst geladen werden — 151 MB oder 291 MB, je nach Wahl. Deshalb nennt das Werkzeug die Zahl **vorher** und nicht hinterher.",
            "Die Fehlerart, die man kennen sollte: Schlechter Ton ergibt nicht etwas schlechteren Text, sondern eine Schleife. Wir gaben ihm eine Redeaufnahme von 1948, und es gab immer wieder dieselbe Silbe zurück. Eine saubere moderne Aufnahme derselben Sprache ergab rund vierzig Wörter mit zwei Fehlern. Das war Aufnahmequalität, nicht Sprachschwierigkeit — und weil es der Fehler ist, dem die meisten begegnen werden, steht er als dauerhafter Hinweis auf der Seite und nicht versteckt in einer FAQ.",
            "Der teuerste Fehler ist allerdings die **Sprachauswahl**. Richten Sie ein Erkennungsmodell auf die falsche Sprache, hört es nicht auf; es erzeugt flüssigen, selbstbewussten Unsinn — wir haben eine englische Aufnahme gemessen, die als hundertzwanzig Zeilen koreanisches Kauderwelsch transkribiert wurde. Liest sich die Transkription wie plausibler Text, der nichts mit dem Ton zu tun hat, prüfen Sie zuerst das.",
          ],
        },
        {
          h2: "Übersetzen ist eine eigene Aufgabe",
          body: [
            "Für die Übersetzung läuft wieder ein anderes Modell: ein mehrsprachiges mit 418 Millionen Parametern, das hundert Sprachen in jede Richtung beherrscht. Es ist klein genug für einen Tab, und diese Größe legt die Qualität fest.",
            "Die ehrliche Beschreibung: Von zwanzig Zeilen kommen etwa fünfzehn gut heraus, fünf sind holprig, aber verständlich. Gewöhnliche Sätze gelingen. Bei Redewendungen rutscht es ab — «let's wrap this up» («lassen Sie uns zum Schluss kommen») kam auf Spanisch wie auf Deutsch ungefähr als «fangen wir an» heraus, und das ist kein kleiner Fehler.",
            "Sehr kurze Ausrufe sind der eine Fall, in dem es nicht bloß abrutscht, sondern in Wiederholung zusammenbricht. Statt das auszuliefern, erkennt das Werkzeug den Zusammenbruch und **lässt die Originalzeile unübersetzt stehen**, damit Sie sehen, welche Zeilen einen Menschen brauchen.",
          ],
        },
      ],
      faq: [
        {
          q: "Kann ich eine .srt einfach in .vtt umbenennen?",
          a: "Nein. Ihr fehlt die Kopfzeile `WEBVTT`, und ihre Zeitmarken verwenden Kommas, wo VTT Punkte erwartet. Ein Browser weist sie rundweg ab. Die Umwandlung ist einfach, aber sie ist kein Umbenennen.",
        },
        {
          q: "Werden die Untertitel ins Video eingebrannt?",
          a: "Nein — die Untertiteldatei liegt neben dem Video, und der Player zeichnet sie. Das ist die bessere Anordnung: Zuschauer können sie abschalten, Sie können einen Tippfehler ohne Neukodierung beheben, und dasselbe Video kann mehrere Sprachen führen.",
        },
        {
          q: "Der Text ist flüssig, hat aber nichts mit dem Ton zu tun.",
          a: "Die Sprache ist falsch eingestellt. Ein Sprachmodell, das nach der falschen Sprache gefragt wird, scheitert nicht — es erzeugt selbstbewusst wohlgeformten Text in dieser Sprache. Stellen Sie die gesprochene Sprache ein und lassen Sie es erneut laufen.",
        },
      ],
    },

    "what-are-stems": {
      metaTitle: "Was sind Stems? Songs entmischen",
      metaDescription:
        "Stems sind die einzelnen Teile einer Mischung. Sie aus einem fertigen Song zu holen ist Schätzung, nicht Wiederherstellung — wir haben gemessen, wie gut.",
      h1: "Was sind Stems — und lässt sich ein fertiger Song wirklich entmischen?",
      lead: "Im Studio gibt es Stems, bevor es die Mischung gibt. Sie aus einer bereits gemischten Datei herauszuholen ist eine völlig andere Aufgabe, und es lohnt sich zu wissen, was man dabei tatsächlich bekommt.",
      sections: [
        {
          h2: "Stems im eigentlichen Sinn",
          body: [
            "Ein Stem ist eine gruppierte Teilmischung, die vom Rest getrennt aufbewahrt wird: alle Drums auf einer, alle Stimmen auf einer anderen, und so weiter. Sie existieren, damit Mastering-Ingenieure, Remixer oder Live-Techniker an einem Teil arbeiten können, ohne die übrigen anzufassen.",
            "Echte Stems sind schlicht Dateien, die jemand aufgehoben hat. Wenn Sie sie haben, muss nichts geschätzt werden — sie wurden nie zusammengeführt.",
          ],
        },
        {
          h2: "Trennung ist etwas anderes",
          body: [
            "Ist ein Stück gemischt, sind alle Teile in zwei Audiokanäle summiert worden. Diese Addition ist nicht umkehrbar; die einzelnen Teile existieren nirgendwo mehr in der Datei.",
            "Ein Trennmodell holt sie also nicht zurück. Es schätzt: Wie klang jeder Teil bei dieser Mischung vermutlich für sich allein? Es hat genug Musik gehört, um darin sehr gut zu sein, aber eine Schätzung bleibt es.",
            "Daher der eigentümliche Charakter der Ergebnisse. Einzeln klingen die Teile meist überzeugend, mit einer schwachen Spur der übrigen, und dichte Passagen bekommen etwas Wässriges, Verschmiertes. Das sind keine zu behebenden Fehler — so klingt eine Schätzung.",
          ],
        },
        {
          h2: "Was herauskommt",
          body: [
            "Vier Spuren: Gesang, Schlagzeug, Bass und alles Übrige. Letzteres ist kein Versehen des Modells — es ist die Kategorie für Gitarren, Tasten, Streicher, Synthesizer und alles, was nicht zu den anderen dreien gehört. Trägt ein Klavier Ihren Song, steckt das Klavier in «Übrige».",
            "Jeder Stem hat die volle Länge des Originals und liegt exakt darauf, Sie können sie also in jeden Editor laden und sie sitzen synchron.",
          ],
        },
        {
          h2: "Wie gut funktioniert das? Wir haben es gemessen",
          body: [
            "«Es lief und erzeugte vier Dateien» beweist überhaupt nichts — vier Dateien plausibel klingenden Breis sähen genauso aus. Also bauten wir eine Mischung, deren Zutaten wir genau kannten: eine Sprachaufnahme, ein 60-Hz-Sinus als Bass und kurze Rauschimpulse als Schlagzeug. Dann korrelierten wir jeden ausgegebenen Stem mit jeder bekannten Zutat.",
            "Jeder Stem traf seine eigene Zutat mit nahezu exakt 1,0 und die übrigen mit nahezu exakt 0. Der Schlagzeug-Stem enthielt die Rauschimpulse und im Wesentlichen nichts sonst; der Bass-Stem den Sinus und im Wesentlichen nichts sonst.",
            "Dieser Test beweist, dass die Trennung echt und richtig verdrahtet ist. Er beweist **nicht**, dass sich jeder Song sauber zerlegen lässt — echte Musik ist viel schwerer als eine synthetische Mischung, und ein dicht geschichtetes oder stark komprimiertes Master ist noch schwerer.",
          ],
        },
        {
          h2: "Es ist langsam, und das ist eine Tatsache über das Verfahren",
          body: [
            "Die Trennung schickt die gesamte Wellenform durch ein neuronales Netz. Wir haben gemessen, dass 7,8 Sekunden Audio 15,1 Sekunden Verarbeitung brauchen — ungefähr das Doppelte der Echtzeit. Ein ganzer Song dauert damit über sechs Minuten.",
            "Deshalb arbeitet das Werkzeug an einer 30-Sekunden-Vorschau und **nennt die Zahl, bevor Sie etwas drücken**, statt in einem Browser-Tab eine Sechs-Minuten-Aufgabe zu starten und zu hoffen, dass Sie bleiben.",
          ],
        },
        {
          h2: "Etwas zu trennen begründet kein Nutzungsrecht",
          body: [
            "Eine Stimme aus einer kommerziellen Aufnahme zu ziehen ändert nichts daran, wem diese Aufnahme gehört. Über ein Instrumental zu üben, ein Arrangement zu studieren oder etwas für sich selbst zu bauen ist die eine Lage; das Ergebnis zu veröffentlichen oder zu verbreiten eine andere, und die Trennung ändert daran nichts.",
            "Nichts, was Sie hier laden, verlässt Ihr Gerät — aber das ist eine Aussage **über Privatsphäre, nicht über Lizenzen**.",
          ],
        },
      ],
      faq: [
        {
          q: "Kann ich aus einem Song eine Karaoke-Fassung machen?",
          a: "Ja — nehmen Sie alle Stems außer dem Gesang und mischen Sie sie wieder zusammen. Rechnen Sie in dichten Passagen mit einem schwachen Gesangsrest; das Modell schätzt, und wo die Stimme laute Instrumente überlagert, kann es beide nicht vollständig trennen.",
        },
        {
          q: "Klingen die Stems so gut wie das Original?",
          a: "Wieder zusammengemischt kommen sie ihm sehr nahe. Einzeln über Kopfhörer hört man Artefakte — vor allem etwas Wässriges und Spuren der anderen Teile. Jeder Stem ist eine Rekonstruktion, keine Entnahme.",
        },
        {
          q: "Warum nur 30 Sekunden?",
          a: "Weil die Verarbeitung im Browser etwa doppelt so lange wie die Echtzeit dauert; ein ganzer Song wäre also über sechs Minuten bei geöffnetem Tab. Mit der Vorschau hören Sie vorher, ob die Trennung für Ihr Stück gut genug ist.",
        },
      ],
    },
  },
} satisfies GuideCopy;
