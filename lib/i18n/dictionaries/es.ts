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
    chooseFile: "Elegir archivos",
    download: "Descargar",
    clear: "Vaciar",
    downloadAll: "Descargar todo",
    workerUnsupportedTitle: "Este navegador no puede ejecutar esta herramienta.",
    workerUnsupportedHint:
      "Ábrela en una versión reciente de Chrome, Edge, Firefox o Safari compatible con Web Workers.",
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
    "video-convert": "Convertidor de vídeo",
    "video-compress": "Compresor de vídeo",
    "video-trim": "Recortar vídeo",
    "video-to-gif": "Vídeo a GIF",
    "audio-extract": "Extraer audio",
    "pdf-merge": "Unir PDF",
    "pdf-split": "Dividir PDF",
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
      metaTitle: "Convertidor de imágenes — HEIC, PNG, JPG, WebP, AVIF",
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
      metaTitle: "Dividir PDF — extraer páginas o separarlas una a una",
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
  },
} satisfies Dictionary;
