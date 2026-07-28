import type { GuideCopy } from "./registry";

export const es = {
  hub: {
    metaTitle: "Guías — formatos de archivo sin rodeos",
    metaDescription:
      "Por qué HEIC no abre, qué formato de imagen elegir, por qué tu PDF pesa tanto, MOV frente a MP4. Respuestas cortas sacadas de archivos que medimos.",
    h1: "Guías",
    lead: "Las preguntas que vienen antes de la herramienta. Cada respuesta sale de archivos que abrimos y medimos, no de una hoja de especificaciones.",
    breadcrumb: "Guías",
    toolsHeading: "Hazlo ahora, sin subir nada",
    relatedHeading: "Vale la pena leer",
    updatedLabel: "Actualizado",
  },

  articles: {
    "what-is-heic": {
      metaTitle: "Qué es un archivo HEIC y por qué no abre",
      metaDescription:
        "HEIC es lo que tu iPhone guarda en lugar de JPEG. Por qué pesa la mitad, por qué Windows y casi cualquier web lo rechazan y qué pierdes al convertirlo.",
      h1: "Qué es un archivo HEIC y por qué no abre",
      lead: "Tu iPhone dejó de guardar JPEG hace años. Esto es lo que guarda en su lugar, por qué casi todos los formularios lo rechazan y qué te cuesta de verdad convertirlo.",
      sections: [
        {
          h2: "Es una foto comprimida con tecnología de vídeo",
          body: [
            "Un archivo HEIC es una imagen fija dentro del contenedor HEIF, comprimida con HEVC: el mismo códec del vídeo 4K. Los códecs de vídeo predicen mucho mejor cómo continúa una imagen que las matemáticas de 1992 que hay dentro de JPEG, así que la misma foto cabe en más o menos la mitad sin diferencia visible.",
            "Apple cambió la cámara del iPhone a HEIC con iOS 11, en 2017. Si tus fotos terminan en .HEIC, no hay más misterio: es una foto normal en una envoltura más nueva.",
          ],
        },
        {
          h2: "Por qué abre en tu móvil y en ningún otro sitio",
          body: [
            "Apple incluye el decodificador, así que HEIC abre en cualquier parte de iOS y macOS. Fuera de esa isla la cosa se vuelve irregular:",
          ],
          list: [
            "Windows 10 y 11 necesitan las Extensiones de imagen HEIF de la Microsoft Store, y ese paquete se apoya a su vez en el códec HEVC, que en algunos equipos es de pago.",
            "Chrome y Firefox no decodifican HEIC. Safari sí.",
            "La mayoría de formularios de subida —candidaturas de empleo, partes de seguro, servicios de impresión— miran la extensión y rechazan .heic sin más, puedan leerlo o no.",
          ],
        },
        {
          h2: "Dos salidas, y resuelven problemas distintos",
          body: [
            "Puedes impedir que tu iPhone los cree: Ajustes → Cámara → Formatos → Más compatible. A partir de ahí la cámara guarda JPEG. Eso arregla el futuro y no hace nada por las miles de fotos que ya tienes.",
            "O conviertes. Es la única opción para lo que ya está guardado, y es la correcta cuando necesitas sacar una foto del teléfono ahora mismo.",
          ],
        },
        {
          h2: "Qué pierdes en la conversión",
          body: [
            "Pasar de HEIC a JPEG vuelve a codificar la imagen, así que hay pérdida: ir y venir varias veces la ablanda de forma visible. Convierte siempre desde el original, nunca desde una conversión anterior.",
            "Algunas cosas no sobreviven al viaje. Una Live Photo se queda en una sola imagen fija, porque el movimiento vive en una pista de vídeo aparte y JPEG no tiene dónde ponerla. Los mapas de profundidad del modo Retrato y los mapas de ganancia HDR se pierden por la misma razón. La rotación, la fecha y la ubicación del EXIF sí pasan.",
            "Si lo que persigues es tamaño y no compatibilidad, ten en cuenta esto: un JPEG con la calidad por defecto suele pesar más que el HEIC del que salió. Ese es el trato: HEIC es más pequeño, JPEG abre en todas partes.",
          ],
        },
        {
          h2: "Convertir sin entregarle la foto a nadie",
          body: [
            "Los archivos HEIC son personales de una forma en que una hoja de cálculo no lo es: llevan caras, y el EXIF lleva dónde estabas de pie. Subirlos a un conversor gratuito para recibir un JPEG es un mal trato.",
            "Nuestro conversor de imágenes decodifica HEIC dentro de la pestaña del navegador. El decodificador pesa alrededor de 1,5 MB y se descarga solo en el momento en que entra un archivo HEIC de verdad: si nunca usas HEIC, no se descarga nada. La foto en sí no se envía a ninguna parte.",
          ],
        },
      ],
      faq: [
        {
          q: "¿HEIC es lo mismo que HEIF?",
          a: "HEIF es el contenedor; HEIC es el nombre de un archivo HEIF cuyas imágenes están comprimidas con HEVC. Apple usa la extensión .heic. En la práctica las dos palabras se usan indistintamente.",
        },
        {
          q: "¿Convertir pierde calidad?",
          a: "Un poco: JPEG y WebP tienen pérdida, así que la imagen se vuelve a codificar. Una conversión desde el original suele ser invisible. Lo que hace daño es convertir una y otra vez un archivo ya convertido.",
        },
        {
          q: "¿Puedo convertir HEIC desde el móvil?",
          a: "Sí. La conversión ocurre en el navegador, así que un móvil sirve mientras el navegador esté al día. Los lotes grandes van más lentos simplemente porque hay menos CPU.",
        },
      ],
    },

    "image-formats": {
      metaTitle: "PNG, JPG, WebP o AVIF: cuál usar",
      metaDescription:
        "Una sola pregunta decide el formato: ¿es una foto o es color plano y texto? Esto es lo que se le da bien a cada uno, con sus trampas.",
      h1: "PNG, JPG, WebP o AVIF: ¿cuál deberías usar?",
      lead: "Cuatro formatos y una pregunta que resuelve casi todo: ¿la imagen es una fotografía o es color plano, texto y líneas?",
      sections: [
        {
          h2: "La pregunta que lo decide",
          body: [
            "Las fotografías están hechas de variación gradual y ruidosa. Los formatos con pérdida —JPG, WebP, AVIF— están construidos justo para eso y se hacen pequeños tirando detalle que tu ojo no sigue.",
            "Las capturas de pantalla, los logotipos, los diagramas y cualquier cosa con texto son lo contrario: grandes zonas planas y bordes duros. La compresión con pérdida deja suciedad visible alrededor de las letras y, como hay poco ruido que descartar, tampoco ahorra gran cosa. Para eso está PNG.",
          ],
        },
        {
          h2: "JPG — el que abre en todas partes",
          body: [
            "Tiene treinta años, lo entiende todo lo que se ha construido jamás y sigue siendo perfectamente válido para fotografías. No guarda transparencia y muestra bloques si bajas mucho la calidad.",
            "Elígelo cuando el archivo tenga que abrirlo software que tú no controlas: una imprenta, un formulario de la administración, el portátil viejo de un compañero.",
          ],
        },
        {
          h2: "PNG — sin pérdida, con transparencia y malo para fotos",
          body: [
            "PNG no descarta ni un píxel y admite transparencia completa. Eso lo hace adecuado para logotipos, capturas, iconos y cualquier cosa que vayas a volver a editar.",
            "Es un mal contenedor para una fotografía, y aquí es donde la gente se atasca: pasar un PNG fotográfico por un compresor apenas ayuda. A la compresión sin pérdida casi no le queda nada que quitar del ruido fotográfico. Si tu PNG de 8 MB es una foto, ningún optimizador de PNG lo hará pequeño; convertirlo a JPG o WebP sí.",
          ],
        },
        {
          h2: "WebP — el valor por defecto sensato para la web",
          body: [
            "WebP hace los dos trabajos: con pérdida para fotos, sin pérdida y con transparencia para gráficos, y además animación. A calidad comparable suele quedar entre un 25 % y un 35 % por debajo de JPEG.",
            "Todos los navegadores actuales lo muestran. La razón que queda para evitarlo está fuera del navegador: algunas aplicaciones de escritorio antiguas y ciertos flujos de imprenta todavía no abren un .webp.",
          ],
        },
        {
          h2: "AVIF — el más pequeño, el más lento y todavía no está en todas partes",
          body: [
            "AVIF usa el códec de vídeo AV1 y suele ser el más pequeño de los cuatro a una calidad dada, sobre todo en fotografías y a tasas bajas. Codificar es lento, y se nota con un lote grande.",
            "Hay una trampa que conviene conocer: que un navegador pueda **mostrar** AVIF no significa que pueda **crearlo**. El soporte de codificación es más estrecho que el de decodificación, y un navegador al que le pides un formato que no admite te devuelve un PNG en silencio. Por eso nuestro conversor construye su lista de formatos codificando una imagen de prueba y comprobando qué volvió de verdad, en vez de fiarse de una tabla de compatibilidad.",
          ],
        },
        {
          h2: "Versión corta",
          body: ["Si quieres una regla rápida en lugar de un árbol de decisión:"],
          list: [
            "Foto que va a una web → WebP, o AVIF si el tamaño importa más que el tiempo de codificación.",
            "Foto que tiene que abrir en cualquier sitio → JPG.",
            "Captura, logotipo, diagrama, cualquier cosa con texto → PNG.",
            "Necesitas transparencia → PNG o WebP. Nunca JPG.",
            "Ya es un JPG y sigue siendo enorme → reduce primero las dimensiones en píxeles. Partir el ancho por dos deja el número de píxeles en la cuarta parte, y eso gana a cualquier control de calidad.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Pasar de PNG a JPG lo hace más pequeño?",
          a: "En una fotografía, muchísimo: a menudo un 80 % o más. En una captura o un logotipo puede hacerlo más grande y además emborrona los bordes del texto. Mira qué es la imagen antes de convertirla.",
        },
        {
          q: "¿Ya se puede usar WebP con tranquilidad?",
          a: "En el navegador, sí: todos los navegadores actuales lo muestran. Fuera del navegador es más irregular, así que si el archivo va a una imprenta o a una aplicación de escritorio, JPG o PNG es la entrega más segura.",
        },
        {
          q: "¿Por qué mi PNG comprimido pesa lo mismo?",
          a: "Porque la compresión PNG es sin pérdida y el detalle fotográfico es casi incompresible. No queda nada que se pueda quitar sin riesgo. Cambia el formato o reduce las dimensiones.",
        },
      ],
    },

    "why-pdf-is-large": {
      metaTitle: "Por qué tu PDF pesa tanto y qué lo reduce",
      metaDescription:
        "Casi todo PDF enorme lo es por un solo motivo: las imágenes que lleva dentro. Cómo saber cuál tienes y qué lo reduce de verdad.",
      h1: "Por qué tu PDF pesa tanto y qué lo reduce de verdad",
      lead: "Un PDF de 40 MB y otro de 400 KB pueden verse idénticos en pantalla. La diferencia casi nunca es el texto.",
      sections: [
        {
          h2: "Un PDF es una caja, y el peso son las imágenes",
          body: [
            "PDF es un contenedor. El texto se guarda como caracteres más una fuente incrustada: unos cientos de kilobytes para un libro entero. Los dibujos vectoriales se guardan como coordenadas y son igual de diminutos.",
            "Las imágenes se guardan como imágenes. Una sola foto de móvil metida en un documento puede pesar más que doscientas páginas de texto. Cuando un PDF es descomunal, es que carga con fotos.",
          ],
        },
        {
          h2: "Primero averigua qué tipo de PDF tienes",
          body: [
            "Intenta seleccionar una frase con el cursor. Si el texto se resalta palabra a palabra, es un PDF de texto: los caracteres son reales. Si no se resalta nada, o la página entera se resalta como un bloque, cada página es una fotografía de una página.",
            "Esa única prueba te dice qué va a funcionar:",
          ],
          list: [
            "PDF de texto que pesa mucho → se ha insertado algo voluminoso: fotos, un gráfico pegado como imagen, una portada escaneada. Comprimir las imágenes es la solución.",
            "PDF escaneado → las páginas son las imágenes. Volver a codificarlas es la única palanca, y hay un suelo por debajo del cual el escaneo deja de leerse.",
          ],
        },
        {
          h2: "Lo que reduce el tamaño de verdad",
          body: [
            "Volver a codificar los JPEG incrustados con menos calidad. Es la palanca principal y suele bastar: el texto, los enlaces, los marcadores y la búsqueda salen intactos, porque ninguno de ellos era el problema.",
            "Quitar páginas que no necesitas. Es obvio y, de forma rutinaria, es la mayor ganancia: el anexo de escaneos suele ser casi todo el archivo.",
            "Dividir el documento. Si solo hace falta enviar el capítulo 3, envía el capítulo 3.",
            "Bajar la resolución de las imágenes. Un escaneo a 600 ppp tiene cuatro veces los píxeles del mismo escaneo a 300 ppp, y 300 ppp ya supera lo que muestra cualquier pantalla.",
          ],
        },
        {
          h2: "Lo que no funciona",
          body: [
            "Meterlo en un ZIP no ahorra casi nada. Los flujos dentro de un PDF ya están comprimidos, y comprimir datos comprimidos no hace nada.",
            "La otra trampa es la versión agresiva de «comprimir»: una herramienta que dibuja cada página como un mapa de bits y reconstruye el PDF alrededor de esas fotos. El número baja y el documento queda arruinado: el texto pasa a ser una fotografía de texto, así que no se puede buscar, no se puede copiar, no lo lee un lector de pantalla y se imprime blando. Si comprimiste un PDF y ya no puedes seleccionar su texto, esto es lo que pasó.",
          ],
        },
        {
          h2: "Qué hace nuestro compresor y cuándo se niega",
          body: [
            "Vuelve a codificar las imágenes JPEG y no toca nada más. El texto sigue siendo texto. Fuentes, enlaces y estructura pasan sin cambios.",
            "La consecuencia es que a veces no tiene nada que hacer. Lo probamos con el escaneo real de un recibo de 1929 cuyas páginas no estaban guardadas como JPEG, y no produjo ninguna descarga en lugar de devolver un archivo del mismo tamaño con una etiqueta que sonara a menos. Si tu escaneo está en otro formato, esa es la respuesta honesta: lo que queda es reducir el número de páginas o la resolución.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Cuánto se va a reducir mi PDF?",
          a: "Depende por completo de lo que lleve dentro. Los documentos con muchas fotos suelen bajar a la mitad o menos. Un PDF de solo texto ya está cerca de su suelo y apenas se moverá: no había nada pesado dentro.",
        },
        {
          q: "¿Comprimir rompe el texto o los enlaces?",
          a: "No con un enfoque que solo toca imágenes. Solo se reescriben las fotos incrustadas; caracteres, fuentes, enlaces y marcadores se copian tal cual. Las herramientas que aplanan cada página a imagen sí destruyen todo eso.",
        },
        {
          q: "Mi PDF escaneado apenas se redujo. ¿Por qué?",
          a: "No todos los escáneres guardan las páginas como JPEG. Si están en otro formato de imagen, un recodificador de JPEG no tiene de dónde agarrar. De todos modos, extraer solo las páginas que necesitas suele ganar más.",
        },
      ],
    },

    "mov-vs-mp4": {
      metaTitle: "MOV frente a MP4: qué cambia de verdad",
      metaDescription:
        "MOV y MP4 son parientes cercanos y convertir entre ellos no suele requerir recodificar nada. Cuándo sale gratis y cuándo cuesta calidad.",
      h1: "MOV frente a MP4: qué cambia de verdad",
      lead: "Están mucho más cerca de lo que sugieren las extensiones distintas. Saber cuánto te dice cuándo una conversión sale gratis y cuándo te cuesta calidad de imagen.",
      sections: [
        {
          h2: "Misma familia, distinto apellido",
          body: [
            "MOV es el formato de archivo QuickTime de Apple. MP4 es el formato base de medios de ISO, que se estandarizó tomando QuickTime como punto de partida. Son padre e hijo, no rivales.",
            "Los dos son contenedores: cajas que guardan una pista de vídeo, una de audio, información de tiempos y metadatos. El vídeo de dentro suele ser el mismo códec en ambos casos, H.264 o HEVC. Un .mov de un iPhone y un .mp4 del mismo iPhone pueden llevar vídeo equivalente byte a byte.",
          ],
        },
        {
          h2: "¿Entonces por qué algo rechaza MOV?",
          body: [
            "Sobre todo por la extensión, no por incapacidad. Formularios de subida, plataformas de vídeo, editores y programas de presentaciones miran el nombre del archivo y rechazan .mov antes siquiera de abrirlo.",
            "MOV además permite unas cuantas cosas que MP4 no: ciertas pistas propias de Apple y códecs como ProRes. Así que un software que reproduce MP4 sin problema no puede prometer que reproducirá cualquier MOV. Es más fácil rechazar la extensión entera.",
          ],
        },
        {
          h2: "Convertir sin recodificar es lo importante",
          body: [
            "Como la pista de vídeo ya está en una forma que MP4 acepta, convertir MOV a MP4 no necesita descodificar ni volver a comprimir nada. Las pistas se sacan de la caja QuickTime y se escriben en una caja MP4. Eso se llama remultiplexar.",
            "Es sin pérdida —la imagen es idéntica bit a bit al original— y tarda segundos en lugar de minutos, porque no llega a ejecutarse ningún codificador. Cualquier herramienta que tarde diez minutos y devuelva algo más blando que el original hizo lo que no debía.",
            "Recortar funciona igual: sacar un fragmento de un MP4 tampoco necesita codificador. La pega es que los cortes caen en fotogramas clave, así que el inicio de un recorte puede desplazarse una fracción de segundo. Es una limitación real y conviene saberla antes de cortar, no después.",
          ],
        },
        {
          h2: "Cuándo recodificar es inevitable",
          body: ["Cambiar el códec, y no la caja, es lo que cuesta tiempo y calidad:"],
          list: [
            "MP4 a WebM: familia de códecs completamente distinta, así que cada fotograma se descodifica y se vuelve a comprimir.",
            "Hacer el archivo más pequeño: comprimir es recodificar por definición; no hay versión gratuita.",
            "Vídeo a GIF: GIF es otra cosa por completo, limitado a 256 colores, y el resultado será varias veces más grande que el vídeo del que salió.",
          ],
        },
        {
          h2: "La trampa de la rotación de la que nadie avisa",
          body: [
            "Graba algo en vertical con el móvil y el archivo normalmente no contiene píxeles verticales. El sensor escribe un fotograma horizontal y el contenedor anota una matriz de rotación que dice «gira esto 90 grados al reproducir». Los reproductores la leen. Los conversores ingenuos no.",
            "Así es como un clip vertical sale de un conversor tumbado de lado. Nosotros medimos exactamente esto en cuatro de nuestras propias herramientas en julio de 2026 —convertir, recortar, comprimir y GIF entregaban vídeo girado— y la corrección depende de la salida: en MP4 se reescribe la matriz; en WebM y GIF no hay matriz, así que hay que rotar los píxeles de verdad antes de codificar.",
            "Sobrevivió mucho tiempo porque todos nuestros archivos de prueba de vídeo eran horizontales. No era un fallo que se escondiera: era un agujero en las muestras.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Convertir MOV a MP4 pierde calidad?",
          a: "No tiene por qué. Si el vídeo ya es H.264 o HEVC, las pistas se pueden copiar intactas a un contenedor MP4, y eso es idéntico bit a bit. Solo un cambio de códec obliga a recodificar.",
        },
        {
          q: "¿Por qué mi archivo convertido pesa lo mismo?",
          a: "Porque cambiar de contenedor no comprime nada: mueve el mismo vídeo a otra caja. Si quieres un archivo más pequeño necesitas compresión, que es una recodificación y una operación aparte.",
        },
        {
          q: "¿Cuál me conviene conservar, MOV o MP4?",
          a: "MP4, salvo que te quedes dentro de las herramientas de edición de Apple. Todo acepta MP4; MOV lo rechazan por la extensión con la frecuencia suficiente para molestar.",
        },
      ],
    },
  },
} satisfies GuideCopy;
