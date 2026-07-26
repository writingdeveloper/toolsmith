import type { Dictionary } from "./en";

export const es = {
  site: {
    title: "toolsmith — herramientas de navegador que nunca suben tus archivos",
    titleTemplate: "%s | toolsmith",
    description:
      "Tus archivos nunca salen de tu dispositivo. Convierte imágenes, vídeo y PDF enteramente dentro del navegador. Sin registro y sin subidas.",
    tagline: "Sin subidas · todo se ejecuta en tu navegador",
    footerNote:
      "Los archivos que eliges nunca se envían a un servidor. Todo ocurre dentro de esta pestaña del navegador.",
  },

  home: {
    title: "Herramientas de archivos que no suben nada",
    lead: "Las imágenes, el vídeo y los PDF se procesan dentro de tu navegador. Nada que subir, nada que esperar y nada que borrar después.",
    availableHeading: "Disponibles",
    upcomingHeading: "Próximamente",
  },

  localePicker: {
    title: "Elige tu idioma",
    lead: "toolsmith procesa cada archivo dentro de tu navegador. Elige un idioma para continuar.",
  },

  common: {
    relatedHeading: "Otras herramientas",
    chooseFile: "Elegir archivos",
    download: "Descargar",
    clear: "Vaciar",
    downloadAll: "Descargar todo",
    workerUnsupportedTitle: "Este navegador no puede ejecutar esta herramienta.",
    workerUnsupportedHint:
      "Ábrela en una versión reciente de Chrome, Edge, Firefox o Safari compatible con Web Workers.",
  },

  mediaErrors: {
    unsupportedContainer: "Este archivo no es un MP4 o MOV que podamos abrir",
    noAudioTrack: "Este archivo no tiene sonido que extraer",
    noVideoTrack: "Este archivo no tiene pista de vídeo",
    unsupportedCodec: "Este navegador no puede descodificar este vídeo",
    badRange: "El final tiene que ir después del inicio",
    tooLarge: "Eso supera los 512 MB",
    decodeFailed: "No se ha podido leer el vídeo hasta el final",
    encodeFailed: "Este navegador no ha podido codificar el resultado",
    generic: "Algo ha salido mal",
  },

  pdfErrors: {
    encrypted: "Este PDF está protegido con contraseña",
    noPages: "Este PDF no tiene páginas",
    tooLarge: "Eso supera los 512 MB",
    invalid: "Este archivo no se puede leer como PDF",
    badRange: "No entendemos esos números de página",
    outOfBounds: "Este PDF no tiene esas páginas",
    generic: "Algo ha salido mal",
  },

  toolNames: {
    "image-convert": "Convertidor de imágenes",
    "image-compress": "Comprimir imagen",
    "image-resize": "Redimensionar y recortar",
    "video-convert": "Convertidor de vídeo",
    "video-compress": "Comprimir vídeo",
    "video-trim": "Recortar vídeo",
    "video-to-gif": "Vídeo a GIF",
    "audio-extract": "Extraer audio",
    "pdf-merge": "Unir PDF",
    "pdf-split": "Dividir PDF",
    "pdf-organize": "Girar y borrar páginas",
    "pdf-compress": "Comprimir PDF",
    ocr: "Imagen a texto",
    "data-query": "Consultas CSV y Parquet",
    subtitles: "Generar subtítulos",
    "subtitle-translate": "Traducir subtítulos",
    "remove-bg": "Quitar el fondo",
    cutout: "Recorte con un clic",
    upscale: "Ampliar imagen",
    stems: "Separar pistas",
  },

  tools: {
    "image-convert": {
      blurb: "HEIC, PNG, JPG, WebP y AVIF en cualquier dirección. Comprime y redimensiona de una vez.",
      metaTitle: "Convertidor de imágenes — HEIC, PNG, JPG, WebP",
      metaDescription:
        "Convierte fotos HEIC del iPhone a JPG y PNG a WebP. Todo dentro del navegador, sin subir nada. Sin registro y sin límite de archivos.",
      h1: "Convertidor y compresor de imágenes",
      lead: "Convierte entre HEIC, PNG, JPG, WebP y AVIF, baja la calidad para ahorrar espacio y redimensiona en la misma pasada. Admite muchas imágenes a la vez.",
      faq: [
        {
          q: "¿A dónde van mis archivos?",
          a: "A ninguna parte. La conversión ocurre dentro de esta pestaña y las imágenes que eliges nunca se envían por la red. Al cerrar la pestaña desaparecen.",
        },
        {
          q: "¿Funciona con fotos HEIC del iPhone?",
          a: "Sí. Safari lee HEIC de forma nativa; en Chrome y Firefox el decodificador se descarga solo en el momento en que sueltas un archivo HEIC. Si nunca usas HEIC, no se descarga nada.",
        },
        {
          q: "¿Qué formato debo elegir?",
          a: "WebP es el más pequeño a igual calidad si la imagen va a la web. Elige JPG si tiene que abrirse en cualquier sitio y PNG si necesitas transparencia. En la lista solo aparecen los formatos que tu navegador puede generar de verdad.",
        },
      ],
      ui: {
        unsupportedTitle: "Este navegador no puede convertir imágenes.",
        unsupportedHint:
          "Ábrelo en una versión reciente de Chrome, Edge, Firefox o Safari 17+ compatible con OffscreenCanvas.",
        dropLabel: "Suelta tus imágenes aquí",
        dropHint: "HEIC · PNG · JPG · WebP · AVIF · GIF · BMP — varias a la vez",
        formatLabel: "Formato de salida",
        qualityLabel: "Calidad {value}",
        qualityLossless: "Calidad (PNG no tiene pérdidas)",
        sizeLabel: "Tamaño",
        sizeOriginal: "Mantener el tamaño original",
        sizeMax: "Lado largo {px} px",
        convert: "Convertir {n} archivo(s)",
        converting: "Convirtiendo…",
        itemWorking: "Convirtiendo…",
        errUnsupportedInput: "Este navegador no puede leer ese formato",
        errGeneric: "La conversión ha fallado",
      },
    },

    "pdf-merge": {
      blurb: "Varios PDF en uno solo, en el orden que elijas. Las páginas se copian, nunca se rerenderizan.",
      metaTitle: "Unir PDF — combinar varios PDF en uno",
      metaDescription:
        "Une varios PDF en el orden que quieras. Todo dentro del navegador, sin subir nada, sin registro, sin marcas de agua y sin límite de archivos.",
      h1: "Unir PDF",
      lead: "Junta varios PDF en un único archivo. Reordena la lista y el resultado sigue exactamente ese orden.",
      faq: [
        {
          q: "¿A dónde van mis archivos?",
          a: "A ninguna parte. La unión ocurre dentro de esta pestaña y los PDF que eliges nunca se envían por la red. Al cerrar la pestaña desaparecen.",
        },
        {
          q: "¿Cómo se define el orden de las páginas?",
          a: "De arriba abajo en la lista: ese es el orden del resultado. Usa ↑ ↓ para mover un archivo y ✕ para quitarlo. Dentro de cada archivo las páginas mantienen su orden original.",
        },
        {
          q: "¿Funciona con PDF protegidos con contraseña?",
          a: "No. Los PDF protegidos se marcan como tales y quedan fuera de la unión. Preferimos negarnos antes que entregarte un archivo que se abrió pero salió corrupto. Quita la contraseña primero.",
        },
        {
          q: "¿Se pierde calidad?",
          a: "No. Las páginas se copian tal cual en lugar de rerenderizarse. El texto sigue siendo texto y las imágenes conservan su resolución original.",
        },
      ],
      ui: {
        dropLabel: "Suelta tus PDF aquí",
        dropHint: "Añade dos o más y se unen de arriba abajo",
        listLabel: "Archivos que se unirán",
        reading: "leyendo…",
        pageCount: "{n} páginas",
        moveUp: "Subir {name}",
        moveDown: "Bajar {name}",
        remove: "Quitar {name}",
        merge: "Unir {n} archivos",
        merging: "Uniendo…",
        totalPages: "{n} páginas en total",
        needTwo: "Hacen falta dos PDF o más",
        resultDetail: "{pages} páginas · {size}",
      },
    },

    "pdf-split": {
      blurb: "Saca las páginas que quieras o separa cada página en su propio PDF dentro de un ZIP.",
      metaTitle: "Dividir PDF — extraer o separar páginas",
      metaDescription:
        "Extrae páginas concretas de un PDF o separa cada página en su propio archivo. Todo dentro del navegador, sin subir nada, sin registro y sin marcas de agua.",
      h1: "Dividir PDF",
      lead: "Extrae las páginas que necesitas en un solo PDF, o separa cada página en su propio PDF y recíbelas en un ZIP.",
      faq: [
        {
          q: "¿A dónde van mis archivos?",
          a: "A ninguna parte. La división ocurre dentro de esta pestaña y el PDF que eliges nunca se envía por la red. Al cerrar la pestaña desaparece.",
        },
        {
          q: "¿Cómo se escriben los números de página?",
          a: "Así: 1-3, 5, 8-. Eso significa de la página 1 a la 3, la página 5 suelta y de la 8 hasta el final. El orden en que lo escribes es el orden que obtienes.",
        },
        {
          q: "¿Y si pido una página que no existe?",
          a: "Te lo decimos al momento. Recortar 1-99 en silencio hasta un archivo de 10 páginas te dejaría creyendo que llegaron páginas que nunca tuviste. No hacemos eso.",
        },
        {
          q: "¿Se pierde calidad?",
          a: "No. Las páginas se copian tal cual en lugar de rerenderizarse. El texto sigue siendo texto y las imágenes conservan su resolución original.",
        },
      ],
      ui: {
        dropLabel: "Suelta un PDF aquí",
        dropHint: "De uno en uno — saca las páginas que quieras o separa todas",
        reading: "leyendo…",
        pageCount: "{n} páginas",
        modeExtract: "Extraer un rango de páginas",
        modeExtractHint: "Las páginas elegidas, reunidas en un solo PDF",
        modePages: "Cada página por separado",
        modePagesHint: "{n} PDF de una página, dentro de un único ZIP",
        rangeLabel: "Páginas que extraer",
        rangePlaceholder: "p. ej. 1-3, 5, 8-  ({n} páginas en total)",
        selected: "{n} páginas seleccionadas",
        needRange: "Indica qué páginas quieres sacar",
        runExtract: "Extraer",
        runPages: "Separar página a página",
        processing: "Procesando…",
        extractName: "{stem}-extraccion.pdf",
        zipName: "{stem}-paginas.zip",
        extractDetail: "{pages} páginas · {size}",
        zipDetail: "{count} PDF · {size}",
      },
    },

    "pdf-organize": {
      blurb: "Mira todas las páginas, endereza las que salieron de lado y quita las que sobran.",
      metaTitle: "Girar PDF y borrar páginas — arregla un escaneo",
      metaDescription:
        "Endereza las páginas escaneadas de lado y quita las que no necesitas. Cada página se ve en miniatura. Todo en el navegador, sin subir nada.",
      h1: "Girar PDF y borrar páginas",
      lead: "Todas las páginas aparecen como miniaturas. Gira las que salieron de lado, quita las que están en blanco y guarda lo que queda.",
      faq: [
        {
          q: "¿A dónde van mis archivos?",
          a: "A ninguna parte. Tanto las miniaturas como el archivo final se generan dentro de esta pestaña, y el PDF que eliges nunca se envía por la red. Al cerrar la pestaña desaparece.",
        },
        {
          q: "El escaneo ya viene girado. ¿Se estropeará si lo giro?",
          a: "No. El giro se suma al que la página ya traía, así que lo que ves en la miniatura es lo que obtienes. Los escáneres suelen guardar su propio giro, y sobrescribirlo es justo lo que hace que las páginas salgan al revés.",
        },
        {
          q: "¿Girar vuelve a renderizar la página?",
          a: "No. Solo se escribe una marca de rotación; el contenido se copia intacto. El texto sigue siendo texto y las imágenes conservan su resolución. Nada se difumina ni se recomprime.",
        },
        {
          q: "¿Puedo recuperar una página borrada?",
          a: "Sí, mientras no te vayas. Borrar solo marca la página: pulsa ↩ sobre ella, o deshaz todo, para recuperarla. El archivo original de tu disco nunca se modifica.",
        },
      ],
      ui: {
        dropLabel: "Suelta un PDF aquí",
        dropHint: "De uno en uno — se muestran todas las páginas para que elijas",
        rendering: "dibujando vistas previas…",
        pageCount: "{n} páginas",
        gridLabel: "Páginas",
        pageAlt: "Página {n}",
        rotateLeft: "Girar la página {n} a la izquierda",
        rotateRight: "Girar la página {n} a la derecha",
        removePage: "Borrar la página {n}",
        restorePage: "Recuperar la página {n}",
        rotateAll: "Girar todas a la derecha",
        resetAll: "Deshacer todo",
        save: "Guardar {n} páginas",
        saving: "Guardando…",
        needOne: "Tiene que quedar al menos una página",
        outputName: "{stem}-editado.pdf",
        resultDetail: "{pages} páginas · {size}",
      },
    },

    "pdf-compress": {
      blurb: "Recomprime las fotos que hay dentro del PDF. El texto sigue siendo texto.",
      metaTitle: "Comprimir PDF sin perder el texto",
      metaDescription:
        "Reduce el tamaño de un PDF recomprimiendo las fotos que lleva dentro. El texto sigue siendo seleccionable y buscable. Todo en el navegador.",
      h1: "Comprimir PDF",
      lead: "Reduce un PDF recomprimiendo las fotos que contiene. El texto se deja tal cual, así que sigue pudiéndose seleccionar y buscar.",
      faq: [
        {
          q: "¿A dónde van mis archivos?",
          a: "A ninguna parte. La compresión ocurre dentro de esta pestaña y el PDF que eliges nunca se envía por la red. Al cerrar la pestaña desaparece.",
        },
        {
          q: "¿Se emborrona el texto?",
          a: "No. Solo se recodifican las fotos; el texto y los dibujos vectoriales se copian intactos. Muchos compresores aplanan cada página en una sola imagen: encogen más, pero tu texto deja de ser texto y ya no se puede seleccionar, buscar ni leer en voz alta. Nosotros no hacemos eso.",
        },
        {
          q: "¿Por qué apenas se ha reducido?",
          a: "Porque había poco que exprimir. Un PDF de solo texto ya es pequeño, y las fotos bien guardadas de origen no se pueden encoger mucho más sin daño visible. Cuando pasa, te lo decimos en lugar de devolverte un archivo del mismo tamaño y llamarlo comprimido.",
        },
        {
          q: "¿Qué calidad debería poner?",
          a: "Alrededor de 70 va bien para documentos que se van a leer en pantalla. Baja más para borradores que solo vas a enviar por correo; súbela y deja la resolución intacta si las fotos importan.",
        },
      ],
      ui: {
        dropLabel: "Suelta un PDF aquí",
        dropHint: "De uno en uno — se recomprimen las fotos de dentro",
        reading: "leyendo…",
        pageCount: "{n} páginas",
        qualityLabel: "Calidad de las fotos {value}",
        qualityAria: "Calidad de las fotos",
        sizeLabel: "Resolución de las fotos",
        sizeOriginal: "Mantener la resolución original",
        sizeMax: "Lado largo {px} px",
        run: "Comprimir",
        working: "Comprimiendo…",
        outputName: "{stem}-comprimido.pdf",
        rewroteImages: "Se han recomprimido {n} de {total} fotos",
        noImages: "Este PDF no tiene fotos que recomprimir.",
        alreadySmall: "Las fotos ya estaban bien comprimidas: no se ha podido reducir más.",
      },
    },

    "data-query": {
      blurb: "Ejecuta SQL sobre un CSV o Parquet. El archivo no sale de tu dispositivo.",
      metaTitle: "Consultas SQL sobre CSV y Parquet",
      metaDescription:
        "Abre un archivo CSV o Parquet y consúltalo con SQL. Con DuckDB dentro de tu navegador: sin subidas, sin registro y sin límite de filas.",
      h1: "Consulta de CSV y Parquet (SQL)",
      lead: "Abre un archivo CSV o Parquet y te deja consultarlo con SQL de verdad. DuckDB se ejecuta en esta pestaña, así que el archivo nunca se sube.",
      faq: [
        {
          q: "¿Adónde van mis archivos?",
          a: "A ninguna parte. A DuckDB se le pasa una referencia al archivo y lo lee directamente de tu disco. No se sube nada. Lo que sí se descarga es el motor DuckDB, desde una CDN pública: ese tráfico va en el sentido contrario.",
        },
        {
          q: "¿Por qué descarga unos 6MB antes?",
          a: "Porque DuckDB es una base de datos analítica de verdad compilada a WebAssembly. Ocupa 35MB sin comprimir y unos 6MB por la red. Lo descargamos en el momento en que pulsas el botón y no antes, y tu navegador lo conserva.",
        },
        {
          q: "¿Qué tamaño de archivo aguanta?",
          a: "Más de lo que esperarías, sobre todo en Parquet. El archivo no se carga entero en memoria: DuckDB lee solo las partes que la consulta necesita, así que consultar dos columnas de un Parquet ancho apenas lee nada. Un CSV hay que recorrerlo, así que es más lento.",
        },
        {
          q: "¿Qué SQL puedo escribir?",
          a: "El dialecto de DuckDB, muy cercano a PostgreSQL. Tu archivo está disponible como la tabla `data`, así que `SELECT * FROM data LIMIT 50` es el punto de partida. Funcionan joins, funciones de ventana, agregados y CTE. Los errores llegan tal cual los da DuckDB para que puedas corregirlos.",
        },
        {
          q: "¿Muestra todas las filas?",
          a: "La tabla en pantalla se detiene en 200 filas para que la página siga siendo usable, y te avisa cuando lo hace. La consulta en sí no tiene límite, y el CSV descargado contiene todas las filas mostradas.",
        },
      ],
      ui: {
        dropLabel: "Suelta aquí un CSV o Parquet",
        dropHint: "CSV · TSV · Parquet · JSON — de uno en uno",
        downloadNote: "Abrir el archivo descarga el motor DuckDB, unos {size}.",
        localNote: "El archivo no se sube: DuckDB lo lee desde tu disco.",
        open: "Abrir y consultar",
        opening: "Abriendo…",
        rowCount: "{rows} filas",
        columnCount: "{columns} columnas",
        schemaLabel: "Columnas",
        sqlLabel: "SQL",
        sqlHint: "Tu archivo es la tabla `data`.",
        run: "Ejecutar",
        running: "Ejecutando…",
        resultSummary: "{rows} filas · {ms}ms",
        showingFirst: "mostrando las primeras {n}",
        noRows: "Esta consulta no devolvió filas.",
        downloadCsv: "Descargar CSV",
        errEngine: "No se pudo cargar el motor DuckDB",
        errFormat: "No se puede abrir este tipo de archivo: CSV, TSV, Parquet o JSON",
        errRead: "No se pudo leer el archivo",
      },
    },

    ocr: {
      blurb: "Saca el texto de una foto, una captura o un PDF escaneado. Nada se sube.",
      metaTitle: "Imagen y PDF a texto (OCR) en el navegador",
      metaDescription:
        "Extrae el texto de una foto, una captura o un PDF escaneado sin subirlo. Siete idiomas, todo ocurre en tu navegador y sin registro.",
      h1: "Imagen y PDF a texto (OCR)",
      lead: "Lee las palabras de una imagen o de un PDF escaneado y te devuelve texto plano que puedes copiar. El reconocimiento ocurre en tu dispositivo.",
      faq: [
        {
          q: "¿Adónde van mis archivos?",
          a: "A ninguna parte. La imagen se lee dentro de esta pestaña del navegador y nunca se sube. Lo único que viaja es el motor de reconocimiento, que se descarga desde una CDN pública — va en el sentido contrario.",
        },
        {
          q: "¿Por qué descarga unos megabytes antes de empezar?",
          a: "Porque el OCR necesita un motor real y un modelo entrenado para el idioma elegido. Entre los dos suman unos 4 a 6MB. Lo descargamos en el momento en que pulsas el botón y no antes, y tu navegador lo conserva, así que el segundo documento empieza al instante.",
        },
        {
          q: "¿Por qué el texto no es perfecto?",
          a: "Usamos los modelos compactos, que son entre cinco y diez veces más pequeños que los precisos (inglés: 2MB frente a 11MB; japonés: 1,5MB frente a 16MB). En un escaneo limpio la diferencia es pequeña; en una foto movida se nota. Preferimos no hacerte descargar 16MB para descubrirlo. Endereza la página y dale más luz y mejora bastante.",
        },
        {
          q: "¿Puede leer un PDF?",
          a: "Sí, hasta 30 páginas de una vez. Cada página se dibuja primero como imagen y luego se lee. Si el PDF ya contiene texto real, copiarlo desde cualquier lector será más rápido y exacto — el OCR es para los que solo son fotos de papel.",
        },
        {
          q: "¿Mantiene la maquetación?",
          a: "No. Obtienes las palabras en orden de lectura, no columnas, tablas ni encabezados. Si la maquetación importa más que las palabras, esta no es la herramienta.",
        },
      ],
      ui: {
        dropLabel: "Suelta una imagen o un PDF aquí",
        dropHint: "PNG · JPG · WebP · PDF — de uno en uno",
        pdfLimit: "hasta {max} páginas",
        languageLabel: "Idioma del documento",
        downloadNote: "Al pulsar el botón se descargan unos {size} de motor y datos de idioma.",
        cachedNote: "Se descarga una sola vez y tu navegador lo conserva: el siguiente documento empieza enseguida.",
        run: "Leer el texto",
        working: "Leyendo…",
        stageEngine: "preparando el motor {percent}%",
        stageRendering: "dibujando página {done}/{total}",
        stageReading: "leyendo página {page}/{pages}",
        resultSummary: "{pages} página(s) · confianza {confidence}%",
        copy: "Copiar",
        copied: "Copiado",
        resultLabel: "Texto reconocido",
        truncated: "Este documento tiene {total} páginas; solo se leyeron las {max} primeras.",
        nothingFound: "No se encontró texto en esta imagen.",
        lowConfidence: "La confianza es baja: compáralo con el original antes de fiarte.",
        errEngine: "No se pudo cargar el motor de OCR",
        errTooManyPages: "Solo se pueden leer {max} páginas a la vez",
        languages: {
          eng: "Inglés",
          kor: "Coreano",
          jpn: "Japonés",
          spa: "Español",
          deu: "Alemán",
          por: "Portugués",
          chi_sim: "Chino simplificado",
        },
      },
    },

    "image-compress": {
      blurb: "Reduce el peso de las fotos sin cambiar su formato. Verás cuánto ahorra cada archivo.",
      metaTitle: "Comprimir imágenes — JPG, PNG, WebP",
      metaDescription:
        "Reduce el peso de tus fotos en el navegador sin subirlas. Mantiene el formato original y muestra cuánto ahorra cada archivo. Sin registro ni límite.",
      h1: "Comprimir imágenes",
      lead: "Hace más pequeños los archivos de imagen y te los devuelve en el formato en que entraron. Ves el ahorro de cada archivo antes de descargar.",
      faq: [
        {
          q: "¿Adónde van mis archivos?",
          a: "A ninguna parte. La compresión ocurre dentro de esta pestaña y tus imágenes nunca salen por la red. Al cerrar la pestaña desaparecen.",
        },
        {
          q: "¿Por qué no se redujo mi PNG?",
          a: "Porque PNG no tiene pérdida: el control de calidad no tiene nada que ceder. Para reducir un PNG hay que bajar su tamaño en píxeles o pasarlo a WebP, que suele pesar entre un 60 y un 80% menos con la misma calidad visible. Ambas opciones están aquí.",
        },
        {
          q: "¿Qué calidad elijo?",
          a: "75 es un buen punto de partida para fotos que van a la web; casi nadie las distingue del original. Por debajo de 50 los bordes empiezan a emborronarse. Cada archivo muestra su antes y después, así que prueba uno y míralo.",
        },
        {
          q: "¿Mantiene mi formato?",
          a: "Sí, por defecto. Un JPG vuelve como JPG y encaja donde ya lo usabas. Puedes cambiarlo si prefieres WebP.",
        },
        {
          q: "¿Se conservan los EXIF?",
          a: "No. Al recodificar se pierden los metadatos, incluidas las coordenadas GPS que escriben los móviles. Para publicar fotos, eso suele ser lo que quieres.",
        },
      ],
      ui: {
        dropLabel: "Suelta tus imágenes aquí",
        dropHint: "JPG · PNG · WebP · HEIC — varias a la vez",
        qualityLabel: "Calidad {value}",
        sizeLabel: "Tamaño",
        sizeOriginal: "Mantener el tamaño original",
        sizeMax: "Lado largo {px}px",
        formatLabel: "Salida",
        formatKeep: "Mantener el formato original",
        losslessNote: "PNG no tiene pérdida, así que la calidad no lo reducirá. Baja el tamaño o cambia la salida a WebP.",
        run: "Comprimir {n} archivo(s)",
        working: "Comprimiendo…",
        total: "{n} archivos · {before} → {after} ({percent}% menos)",
        errUnsupportedInput: "Este navegador no puede leer ese formato",
        errGeneric: "Falló la compresión",
      },
    },

    "image-resize": {
      blurb: "Ajusta el ancho de tus fotos y recórtalas en cuadrado, 4:5 o 16:9. Nada se sube.",
      metaTitle: "Redimensionar y recortar imágenes",
      metaDescription:
        "Ajusta una foto al ancho exacto y recórtala en cuadrado o 4:5 para redes. Todo en tu navegador, sin subidas, sin registro y sin marca de agua.",
      h1: "Redimensionar y recortar imágenes",
      lead: "Ajusta la foto al ancho que quieras y, si eliges una proporción, recorta el mayor rectángulo centrado que encaje. Ves el tamaño final antes de pulsar.",
      faq: [
        {
          q: "¿Adónde van mis archivos?",
          a: "A ninguna parte. El redimensionado ocurre dentro de esta pestaña y tus imágenes nunca salen por la red. Al cerrar la pestaña desaparecen.",
        },
        {
          q: "¿Cómo funciona el recorte?",
          a: "Eliges una proporción y tomamos el mayor rectángulo de esa forma desde el centro de la imagen. Es lo adecuado para formatos sociales: cuadrado para la cuadrícula, 4:5 para una publicación vertical. Si necesitas decidir exactamente qué parte conservar, usa un editor; preferimos hacer bien una cosa predecible.",
        },
        {
          q: "¿Amplía una imagen pequeña?",
          a: "No. Si pides un ancho mayor del que tiene la imagen, la recibes en su tamaño real y te lo decimos. Inventar píxeles solo la emborrona mientras el número en pantalla sube, lo que parece una mejora y no lo es.",
        },
        {
          q: "¿El tamaño que muestra coincide con el archivo?",
          a: "Exactamente. La pantalla y el worker usan la misma función para calcularlo, así que no pueden desviarse.",
        },
        {
          q: "¿Qué formato sale?",
          a: "El que metiste, salvo que lo cambies. HEIC es la excepción: los navegadores lo leen pero no lo escriben, así que sale como JPG.",
        },
      ],
      ui: {
        dropLabel: "Suelta tus imágenes aquí",
        dropHint: "JPG · PNG · WebP · HEIC — varias a la vez",
        widthLabel: "Ancho (px)",
        cropLabel: "Recortar a",
        cropNone: "Mantener la proporción original",
        qualityLabel: "Calidad {value}",
        formatLabel: "Salida",
        formatKeep: "Mantener el formato original",
        preview: "{from} → {to}",
        noUpscale: "no se ha ampliado",
        run: "Procesar {n} archivo(s)",
        working: "Procesando…",
        errUnsupportedInput: "Este navegador no puede leer ese formato",
        errGeneric: "El procesado falló",
      },
    },

    "video-convert": {
      blurb: "De MOV a MP4 sin recodificar, o de MP4 a WebM para la web. Nada se sube.",
      metaTitle: "Convertir MOV a MP4 y MP4 a WebM",
      metaDescription:
        "Convierte MOV a MP4 sin recodificar, o MP4 a WebM con VP9 y Opus. Todo ocurre en tu navegador: sin subidas, sin registro y sin límite de tamaño.",
      h1: "Convertidor de vídeo",
      lead: "Pone tu vídeo en otro contenedor. MP4 deja los códecs tal cual; WebM recodifica la imagen a VP9 y el sonido a Opus.",
      faq: [
        {
          q: "¿Adónde van mis archivos?",
          a: "A ninguna parte. El vídeo se lee y se reescribe dentro de esta pestaña del navegador y no se sube nada. Al cerrar la pestaña desaparece.",
        },
        {
          q: "¿Por qué MOV a MP4 termina al instante?",
          a: "Porque .mov y .mp4 son la misma caja con otra etiqueta. Un .mov de iPhone ya lleva vídeo H.264 o HEVC y sonido AAC, y todo eso cabe igual en un MP4. Así que copiamos las pistas intactas y solo reescribimos la envoltura. No se descodifica nada, así que no se pierde nada.",
        },
        {
          q: "¿Por qué WebM tarda tanto más?",
          a: "Porque WebM no admite H.264 ni AAC. Hay que descodificar y volver a codificar cada fotograma como VP9 y el sonido como Opus. Eso es trabajo real: espera un tiempo proporcional a la duración del clip y una pérdida pequeña de calidad, como en cualquier recodificación.",
        },
        {
          q: "¿Puedo convertir un WebM, AVI o MKV a MP4?",
          a: "No. Abrimos el contenedor nosotros mismos en lugar de enviar a tu navegador un kit multimedia de 30MB, y lo que sabemos abrir es MP4, MOV y M4V. Preferimos dejar esos formatos fuera de la lista antes que aceptarlos y fallar.",
        },
        {
          q: "¿Baja la calidad?",
          a: "En la ruta MP4 no: ahí no se recodifica ni un fotograma. En la ruta WebM sí, porque recodificar siempre cuesta algo. Elige la calidad que prefieras; la herramienta te dice en qué ruta estás antes de pulsar el botón.",
        },
      ],
      ui: {
        dropLabel: "Suelta un vídeo aquí",
        dropHint: "MP4 · MOV · M4V — de uno en uno",
        reading: "leyendo…",
        seconds: "s",
        noAudio: "sin sonido",
        targetLabel: "Convertir a",
        targetMp4: "MP4",
        targetWebm: "WebM",
        mp4Note: "No se tocan los códecs: solo se reescribe el contenedor. No se pierde nada y tarda segundos.",
        webmNote: "H.264 no cabe en un WebM, así que la imagen se recodifica a VP9 y el sonido a Opus. Tarda un rato y cuesta algo de calidad.",
        alreadyMp4: "Este archivo ya es un MP4; convertirlo solo reescribiría el contenedor.",
        mp4Unavailable: "El códec de este vídeo no se puede copiar tal cual a un MP4.",
        webmUnavailable: "Este navegador no puede codificar WebM. MP4 sí funciona.",
        sizeLabel: "Tamaño",
        sizeOriginal: "Mantener el tamaño original",
        sizeMax: "Lado largo {px}px",
        qualityLabel: "Calidad",
        qualityHigh: "Alta — archivo mayor",
        qualityBalanced: "Equilibrada",
        qualitySmall: "Pequeña — menos calidad",
        run: "Convertir a {format}",
        working: "Convirtiendo…",
        outputNameMp4: "{stem}.mp4",
        outputNameWebm: "{stem}.webm",
        resultLossless: "No se recodificó nada.",
        resultReencoded: "La imagen se recodificó a VP9.",
        audioKept: "El sonido también se trasladó.",
        audioDropped: "El sonido no se pudo trasladar.",
      },
    },

    "video-compress": {
      blurb: "Reduce un MP4 en tu navegador. Sin descargar 30MB de herramientas: lo hace tu propio equipo.",
      metaTitle: "Comprimir vídeo — reduce un MP4 en el navegador",
      metaDescription:
        "Haz un MP4 más pequeño sin subirlo. Funciona en tu equipo con el codificador de vídeo del navegador: nada que instalar y ningún archivo se va.",
      h1: "Comprimir vídeo",
      lead: "Vuelve a codificar la imagen a menos bitrate y deja el sonido exactamente como estaba. Todo ocurre en tu equipo.",
      faq: [
        {
          q: "¿A dónde van mis archivos?",
          a: "A ninguna parte. Todo ocurre dentro de esta pestaña usando el codificador de vídeo de tu equipo. El archivo nunca se sube, y en vídeo eso importa más que en nada: suelen ser los archivos más grandes y más personales que tiene la gente.",
        },
        {
          q: "¿Por qué no se toca el sonido?",
          a: "Porque recodificarlo solo lo empeoraría. El audio se copia tal cual, sin pérdidas y más rápido. Solo se recodifica la imagen.",
        },
        {
          q: "¿Qué archivos puedo usar?",
          a: "MP4 y MOV. Leemos el contenedor nosotros mismos en lugar de repartir 30MB de herramientas, y ese es el límite honesto de lo que hoy sabemos abrir. Por eso AVI y MKV no se ofrecen, en vez de aceptarlos y fallar después.",
        },
        {
          q: "¿Por qué mi navegador dice que no puede?",
          a: "Codificar vídeo necesita WebCodecs, que los navegadores antiguos no tienen. Chrome y Edge desde 2021, Safari desde 16.4, Firefox desde 130. Antes de ofrecer la herramienta le preguntamos a tu navegador si de verdad puede codificar H.264.",
        },
      ],
      ui: {
        unsupportedTitle: "Este navegador no puede comprimir vídeo.",
        unsupportedHint:
          "Codificar vídeo necesita WebCodecs: prueba con un Chrome o Edge reciente, Safari 16.4+ o Firefox 130+.",
        dropLabel: "Suelta un vídeo aquí",
        dropHint: "MP4 y MOV — de uno en uno",
        reading: "leyendo…",
        seconds: " s",
        noAudio: "sin sonido",
        qualityLabel: "Calidad",
        quality: { high: "Alta", balanced: "Equilibrada", small: "Lo más pequeño" },
        sizeLabel: "Resolución",
        sizeOriginal: "Mantener la resolución original",
        sizeMax: "Lado largo {px} px",
        run: "Comprimir",
        working: "Comprimiendo…",
        outputName: "{stem}-comprimido.mp4",
        audioKept: "El sonido se ha copiado sin tocarlo.",
        didNotShrink:
          "No ha salido más pequeño: el original ya era eficiente. Prueba con menos calidad o resolución.",
      },
    },

    "video-trim": {
      blurb: "Recorta un fragmento de un vídeo sin recodificarlo. No se pierde nada y tarda segundos.",
      metaTitle: "Recortar vídeo — corta un MP4 en el navegador",
      metaDescription:
        "Recorta un fragmento de un MP4 o MOV sin subirlo. No se recodifica nada, así que la calidad queda intacta y termina en segundos. Todo en tu navegador.",
      h1: "Recortar vídeo",
      lead: "Saca un fragmento de un vídeo y lo copia tal cual: sin recodificar, así que la calidad es exactamente la de partida.",
      faq: [
        {
          q: "¿Adónde van mis archivos?",
          a: "A ninguna parte. El vídeo se lee y se vuelve a escribir dentro de esta pestaña, y no se sube nada. Al cerrar la pestaña desaparece.",
        },
        {
          q: "¿Por qué empieza un poco antes de lo que pedí?",
          a: "Porque un corte solo puede caer en un fotograma clave. Los fotogramas clave se dibujan solos; los que hay entre medias únicamente describen lo que cambió respecto a uno anterior. Si cortas entre ellos, el primer segundo sale roto, así que movemos el inicio al fotograma clave más cercano anterior y te decimos dónde queda antes de pulsar el botón.",
        },
        {
          q: "¿Puedo obtener el segundo exacto que pedí?",
          a: "Solo recodificando el principio, lo que cuesta calidad y tiempo. Preferimos enseñarte el punto de corte real antes que hacer ese cambio por ti en silencio. Si necesitas precisión de fotograma, un editor completo es la herramienta adecuada.",
        },
        {
          q: "¿Baja la calidad?",
          a: "No. No se recodifica ni un solo fotograma: la imagen y el sonido se copian exactamente como estaban. Por eso también termina casi al instante, incluso con archivos grandes.",
        },
        {
          q: "¿Qué archivos puedo usar?",
          a: "MP4 y MOV. Leemos el contenedor nosotros mismos en lugar de enviarte una cadena de herramientas de 30 MB, así que AVI y MKV no se ofrecen en vez de aceptarse y luego fallar.",
        },
      ],
      ui: {
        dropLabel: "Suelta un vídeo aquí",
        dropHint: "MP4 y MOV — de uno en uno",
        reading: "leyendo…",
        seconds: "s",
        noAudio: "sin sonido",
        startLabel: "Inicio (segundos)",
        endLabel: "Fin (segundos)",
        grabHere: "Posición actual",
        snapped: "Corta en el segundo {actual}, no en el {asked}: es el fotograma clave más cercano antes.",
        onKeyframe: "Este inicio cae justo en un fotograma clave.",
        run: "Recortar",
        working: "Recortando…",
        outputName: "{stem}-recorte.mp4",
        resultRange: "{from}s → {to}s · {length}s de duración",
        lossless: "No se ha recodificado nada.",
        audioKept: "El sonido se copió intacto.",
      },
    },

    "video-to-gif": {
      blurb: "Convierte un clip en un GIF en bucle. Sin subidas: lo hace tu dispositivo.",
      metaTitle: "Vídeo a GIF — de MP4 a GIF en el navegador",
      metaDescription:
        "Crea un GIF en bucle desde un MP4 o MOV sin subirlo. Elige los fotogramas y el tamaño y mira el resultado antes de guardarlo. Todo en tu navegador.",
      h1: "Vídeo a GIF",
      lead: "Convierte un clip en un GIF en bucle. Elige cuán fluido y cuán grande debe ser; todo lo demás ocurre en tu dispositivo.",
      faq: [
        {
          q: "¿Adónde van mis archivos?",
          a: "A ninguna parte. El vídeo se descodifica y el GIF se construye dentro de esta pestaña del navegador. No se sube nada, y cerrar la pestaña es toda la limpieza que hace falta.",
        },
        {
          q: "¿Por qué el GIF es más grande que el vídeo?",
          a: "Porque GIF es un formato de 1987 que guarda cada fotograma completo con una paleta de 256 colores como máximo y no comprime el movimiento. Un códec de vídeo mira qué cambió entre fotogramas; GIF casi no lo hace. Es normal que ocupe varias veces el MP4 de origen: es el formato, no la herramienta.",
        },
        {
          q: "¿Por qué la velocidad de fotogramas sale algo distinta?",
          a: "GIF guarda el retardo de cada fotograma en centésimas de segundo, así que solo algunas velocidades se pueden escribir exactamente. 20, 10 y 5 fps encajan justo; 15 fps se convierte en 7/100 s, que se reproduce a 14,3. Te mostramos el número real, no el que pediste.",
        },
        {
          q: "¿Qué duración admite?",
          a: "Hasta 400 fotogramas: 20 segundos a 20 fps o 40 a 10 fps. Más allá, un GIF llega a decenas de megabytes y el navegador empieza a sufrir, así que preferimos parar antes que darte algo inservible. Baja la velocidad de fotogramas para que quepa un clip más largo.",
        },
        {
          q: "¿Qué archivos puedo usar?",
          a: "MP4 y MOV. Leemos el contenedor nosotros mismos en lugar de enviarte una cadena de herramientas de 30 MB, así que AVI y MKV no se ofrecen en vez de aceptarse y luego fallar.",
        },
      ],
      ui: {
        unsupportedTitle: "Este navegador no puede crear GIF a partir de vídeo.",
        unsupportedHint:
          "Leer el vídeo requiere WebCodecs: prueba con un Chrome o Edge actualizado, Safari 16.4+ o Firefox 130+.",
        dropLabel: "Suelta un vídeo aquí",
        dropHint: "MP4 y MOV — de uno en uno",
        reading: "leyendo…",
        seconds: "s",
        fpsLabel: "Fotogramas por segundo",
        fpsOption: "{n} fps",
        fpsActual: "en realidad {n} fps",
        sizeLabel: "Tamaño",
        sizeOriginal: "Mantener el tamaño original",
        sizeMax: "Lado largo {px}px",
        framesEstimate: "unos {n} fotogramas",
        tooManyFrames:
          "Supera los {max} fotogramas. Elige menos fotogramas por segundo: un GIF así de largo sería enorme.",
        run: "Crear GIF",
        working: "Creando…",
        outputName: "{stem}.gif",
        resultFrames: "{n} fotogramas · {fps} fps",
        truncated: "Solo cupieron los primeros {n} fotogramas, así que falta el final del clip.",
        biggerNote:
          "El GIF es más grande que el vídeo. Es normal: GIF no comprime el movimiento.",
        previewAlt: "El GIF recién creado",
      },
    },

    "audio-extract": {
      blurb: "Saca el sonido de un vídeo. No se recodifica nada, así que no se pierde nada.",
      metaTitle: "Extraer audio de un vídeo — de MP4 a M4A o WAV",
      metaDescription:
        "Saca la banda sonora de un MP4 o MOV sin subirlo. Consérvala sin pérdidas en M4A o llévate un WAV que se abre en cualquier parte. Todo en el navegador.",
      h1: "Extraer audio de un vídeo",
      lead: "Saca la banda sonora de un vídeo. Ninguna de las dos opciones recodifica el sonido, así que no se pierde nada por el camino.",
      faq: [
        {
          q: "¿A dónde van mis archivos?",
          a: "A ninguna parte. La extracción ocurre dentro de esta pestaña y el vídeo nunca se sube. Al cerrar la pestaña desaparece.",
        },
        {
          q: "¿M4A o WAV?",
          a: "M4A si solo quieres el audio: levanta la pista original intacta, así que es idéntica a la que había en el vídeo y ocupa poco. WAV si algo más adelante necesita PCM puro, como suele pasar con editores y software antiguo. El WAV es mucho más grande porque no está comprimido.",
        },
        {
          q: "¿Baja la calidad del sonido?",
          a: "No. El M4A copia el audio original exactamente como estaba, bit a bit. El WAV lo devuelve a muestras crudas, que también es sin pérdidas respecto a lo que contenía el vídeo. Ninguna de las dos vías vuelve a comprimir el sonido.",
        },
        {
          q: "¿Puedo obtener un MP3?",
          a: "Hoy no. Los navegadores saben descodificar MP3 pero no crearlo, y no vamos a repartir un codificador de 30MB solo para eso. El M4A cumple la misma función: comprimido, pequeño, compatible en todas partes, y sale directo de tu archivo sin coste de calidad.",
        },
      ],
      ui: {
        unsupportedTitle: "Este navegador no puede extraer audio.",
        unsupportedHint:
          "Esto necesita WebCodecs: prueba con un Chrome o Edge reciente, Safari 16.4+ o Firefox 130+.",
        dropLabel: "Suelta un vídeo aquí",
        dropHint: "MP4 y MOV — de uno en uno",
        reading: "leyendo…",
        seconds: " s",
        channels: "{n} canales",
        formatM4a: "M4A — conserva el original",
        formatM4aHint: "Levanta la pista intacta. Pequeña e idéntica al audio del vídeo.",
        formatWav: "WAV — se abre en cualquier parte",
        formatWavHint: "PCM sin comprimir para editores y software antiguo. Mucho más grande.",
        run: "Extraer audio",
        working: "Extrayendo…",
        outputNameM4a: "{stem}.m4a",
        outputNameWav: "{stem}.wav",
        losslessNote: "idéntico a la pista original",
      },
    },
  },
} satisfies Dictionary;
