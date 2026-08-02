import type { GuideCopy } from "./registry";

export const es = {
  hub: {
    metaTitle: "Guías — formatos de archivo sin rodeos",
    metaDescription:
      "Por qué HEIC no abre, qué formato de imagen elegir, por qué tu PDF pesa tanto, qué no puede hacer la IA. Respuestas sacadas de archivos que medimos.",
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

    "how-background-removal-works": {
      metaTitle: "Cómo funciona quitar el fondo de verdad",
      metaDescription:
        "Un modelo adivina qué parte de cada píxel es el sujeto; no recorta nada. Eso explica el pelo difuso y las fotos con las que sencillamente no puede.",
      h1: "Cómo funciona quitar el fondo de verdad — y cuándo falla",
      lead: "No se está recortando nada. Un modelo adivina, píxel a píxel, cuánto de cada uno pertenece al sujeto. Sabiendo eso, todos los resultados raros que has visto tienen explicación.",
      sections: [
        {
          h2: "Lo que sale es una máscara, no un recorte",
          body: [
            "El modelo mira tu foto y devuelve una imagen en blanco y negro con su misma forma: blanca donde está seguro de que ese píxel es el sujeto, negra donde está seguro de que es fondo, y de mil grises donde duda. Esa imagen se convierte directamente en el canal de transparencia del resultado.",
            "Así que no hay contorno, no hay trazado y no se ha calcado nada. Lo que vuelve es **confianza**, dibujada como transparencia. El pelo, el pelaje, el movimiento borroso, el cristal y las sombras caen en mitad de ese rango, y esa suavidad del borde no es que el modelo sea malo: es que está siendo honesto.",
          ],
        },
        {
          h2: "El modelo busca una sola cosa evidente",
          body: [
            "U²-Net, que es lo que corre aquí, es una red de detección de objetos salientes. La entrenaron para responder a una única pregunta: en esta imagen, ¿qué destaca? Un sujeto sobre un fondo razonablemente sencillo es exactamente su terreno.",
            "Si le das una imagen sin una respuesta única, no se niega: extiende una máscara débil e insegura por encima de todo. Pasamos veinticuatro fotografías y leímos los valores de alfa. Las diez que no tenían un sujeto claro volvieron como manchas translúcidas o como nada: una toma aérea de bosque produjo un **0.0%** de píxeles seguros y aun así «funcionó» formalmente.",
            "Ese fallo es silencioso, y por eso ahora la herramienta mide la máscara y te lo dice en lugar de entregarte un PNG vacío.",
          ],
          list: [
            "Funciona: una persona, un producto sobre una mesa, una mascota, un zapato, una bicicleta, una montaña contra el cielo.",
            "No funciona: multitudes, tráfico, un campo de tulipanes, una estantería, un arrecife, un bosque visto desde arriba.",
            "A medias: un grupo de objetos parecidos — puede que salgan algunos, y medio transparentes.",
          ],
        },
        {
          h2: "Por qué se ablandan los bordes y por qué empeora en fotos grandes",
          body: [
            "El modelo ve tu imagen a 320×320 píxeles sea cual sea su tamaño real, y la máscara vuelve también a 320×320. Para aplicarla hay que estirarla hasta las dimensiones originales. En una foto de 4000 píxeles, un píxel de máscara cubre más de una decena de píxeles reales, y eso se nota en el contorno.",
            "Elegir una foto mejor no lo arregla: es la forma del método. Si vas a usar el resultado en pequeño, dará igual; si lo vas a usar en grande, no.",
            "También hay un canje directo entre descarga y calidad. El modelo rápido pesa 4,4 MB y el preciso 168 MB: cuarenta veces más, y con resultados visiblemente distintos sobre la misma foto. El pequeño suele dejar un fantasma tenue del fondo; el grande separa limpiamente el pelo y los objetos pequeños.",
          ],
        },
        {
          h2: "Cuándo el modelo no debería ser quien elige",
          body: [
            "Si la foto tiene varios objetos, o lo que quieres no es el protagonista del encuadre, subir la calidad del modelo no sirve de nada: nunca le preguntaron a cuál te referías.",
            "Para eso hay otra herramienta. El recorte por clic pasa un codificador pesado sobre la imagen una sola vez y luego responde a cada clic casi al instante. Medimos 6,0 segundos de codificador y 0,10 segundos por clic en CPU, y por eso puede ser una interfaz de pulsar y ver en lugar de esperar y ver. Un punto suele coger parte de un objeto; el segundo punto le dice qué más forma parte de él.",
          ],
        },
        {
          h2: "Guárdalo en PNG o la transparencia desaparece",
          body: [
            "JPG no tiene canal de transparencia. Si guardas un recorte como JPG, la zona transparente no sigue siéndolo: vuelve en blanco o en negro, y mucha gente se lleva la sorpresa después. PNG y WebP sí llevan alfa; usa uno de los dos.",
            "Una cosa más conviene decirla en voz alta: las fotos que la gente pasa por un quitafondos suelen ser de personas. Esto corre dentro de la pestaña del navegador, así que la imagen no se envía a ninguna parte — pero el modelo sí hay que descargarlo antes de empezar, y te decimos su tamaño antes de que te comprometas.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Por qué dice que no encontró ningún sujeto?",
          a: "Porque la máscara salió débil por todas partes en vez de fuerte en algún sitio. Contamos por separado los píxeles claramente de primer plano y los dudosos; si casi no hay seguros, o los dudosos los superan de largo, la respuesta honesta es que esa foto no tiene un sujeto único que encontrar.",
        },
        {
          q: "¿Puedo conseguir un borde limpio en el pelo?",
          a: "En parte. El modelo preciso es mucho mejor con el pelo. Pero la máscara se calcula a 320×320 y se amplía, así que en una foto de alta resolución hay un límite a lo fino que puede ser ese borde: nunca igualará a una máscara hecha a mano.",
        },
        {
          q: "Ha quitado el objeto equivocado. ¿Puedo elegir?",
          a: "Con el quitafondos no: el modelo escoge lo que destaca y no tiene forma de saber qué querías. Usa el recorte por clic, donde señalas el objeto que quieres y añades puntos para incluir o excluir partes.",
        },
      ],
    },

    "does-upscaling-add-detail": {
      metaTitle: "¿La IA añade detalle real al ampliar?",
      metaDescription:
        "No: se lo inventa de forma verosímil. Por eso gana con imágenes comprimidas y empeora una fotografía limpia. Lo medimos en los dos sentidos.",
      h1: "¿La IA añade detalle real al ampliar una imagen?",
      lead: "La respuesta corta es que no. La larga es más útil: se inventa detalle que parece correcto, y que eso ayude depende por completo de qué le pasaba a tu imagen.",
      sections: [
        {
          h2: "Lo que hace el modelo en realidad",
          body: [
            "Una ampliación normal promedia los píxeles vecinos. No puede inventar nada, así que el resultado es una versión más grande y más blanda de lo que tenías, nunca más nítida.",
            "Un modelo de ampliación hace otra cosa. Lo entrenaron con millones de pares de imágenes — una grande y su gemela encogida — hasta que aprendió qué aspecto suele tener una pestaña, un muro de ladrillo o un tejido cuando se reduce. Dada una imagen pequeña, escribe una grande **verosímil**.",
            "La palabra que trabaja ahí es «verosímil». El detalle que añade no está recuperado: la información se tiró cuando la imagen se hizo pequeña y ya no está. Lo que vuelve es una conjetura segura de sí misma que se parece a lo que probablemente había.",
          ],
        },
        {
          h2: "Lo medimos perdiendo contra un redimensionado normal",
          body: [
            "Cogimos una fotografía de dominio público de 1896, la redujimos a 240 píxeles y la ampliamos cuatro veces con el modelo y con un remuestreo normal de buena calidad.",
            "El modelo perdió. A un tejido de cuadros de la imagen se le borró la trama por completo — el modelo leyó ese patrón fino y regular como ruido y lo alisó — y la cara quedó como de cera. La ampliación normal era más borrosa y más fiel.",
          ],
        },
        {
          h2: "Y después lo medimos ganando con claridad",
          body: [
            "Guardamos la misma fotografía como JPEG de calidad 35 — más o menos el estado de muchísimas imágenes que circulan por internet — y repetimos la comparación. Esta vez el modelo ganó de largo: los bloques de compresión desaparecieron y los bordes volvieron.",
            "El motivo es que esta clase de modelo está hecha para **reparar daño**, no para agrandar. Elimina lo que lee como ruido. El bloqueo por compresión es ruido, así que se va y la imagen mejora. El grano de película y los tejidos finos también se leen como ruido, así que también se van y la imagen empeora.",
            "De ahí sale una regla utilizable. Si el problema de tu imagen es que la han comprimido, capturado o vuelto a guardar hasta matarla, el modelo ayuda. Si el problema es solo que es pequeña pero por lo demás está limpia, la ampliación normal puede ser el resultado más honesto.",
          ],
        },
        {
          h2: "El muro del tamaño no es arbitrario",
          body: [
            "Cuatro veces el ancho son dieciséis veces los píxeles. Un megapíxel de entrada sale convertido en dieciséis, y cada uno de ellos lo produce una red neuronal en vez de copiarse.",
            "Por eso hay un límite de entrada y por eso desactivamos el botón y explicamos el motivo en lugar de dejarte probar. Congelar la pestaña varios minutos para no dar nada es el peor resultado posible, y es lo que pasa si no se pone el límite.",
            "El ×2 se hace produciendo el ×4 y reduciéndolo a la mitad, no pidiendo ×2 directamente. El detalle inventado se ordena al encogerse, así que el resultado es mejor. Tarda lo mismo, porque la parte cara ya ha ocurrido igualmente.",
          ],
        },
        {
          h2: "El modelo más nítido no es el modelo correcto",
          body: [
            "Comparamos dos candidatos con licencia aceptable. El basado en transformadores es visiblemente más nítido y tardó 9,7 segundos con una imagen de 128×128. El convolucional compacto tardó 16,5 segundos con una de 512×512, dieciséis veces más píxeles. Por píxel, la diferencia es de unas **sesenta veces**.",
            "Y una tarjeta gráfica no rescata al lento. Aquí medimos WebGPU unas **3,4 veces** más rápido que la CPU, no las veinte o cincuenta que espera la gente, porque compilar sombreadores y mover datos a la tarjeta cuesta tiempo real. Tres veces se agradece, pero un modelo inservible en CPU suele seguir siendo inservible en GPU.",
            "Así que el modelo más nítido es el que nadie esperaría, y el que va montado es el que termina. Es el mismo criterio con el que se ha elegido cada modelo de este sitio.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Puede leer una matrícula, como en la tele?",
          a: "No, y es lo más importante que hay que entender. Si los caracteres ya no están, el modelo producirá algo nítido, seguro y falso. Genera lo que encaja de forma verosímil, que es justo lo contrario de lo que necesitas cuando algo tiene que ser cierto.",
        },
        {
          q: "¿Por qué queda con aspecto de cera o de plástico?",
          a: "Porque tu original estaba limpio. El modelo quita lo que lee como ruido, y el grano de película, la textura de la piel y los tejidos finos se leen así. Si el origen no tiene daño de compresión que reparar, un redimensionado normal suele ser mejor opción.",
        },
        {
          q: "¿Qué tamaño de imagen puedo ampliar?",
          a: "Alrededor de un megapíxel de entrada, porque el ×4 lo convierte en dieciséis de salida. Con entradas mayores tardaría minutos y podría agotar la memoria de la pestaña, así que la herramienta lo rechaza antes en vez de fallar a mitad.",
        },
      ],
    },

    "srt-vs-vtt": {
      metaTitle: "SRT o VTT: qué archivo de subtítulos",
      metaDescription:
        "Los separa una línea de cabecera y un signo de puntuación. Aquí tienes cuál quiere cada reproductor y dónde se equivocan los subtítulos automáticos.",
      h1: "SRT o VTT — ¿qué archivo de subtítulos necesitas?",
      lead: "Ábrelos en un editor de texto y te costará distinguirlos. Las diferencias son mínimas, pero una de ellas decide si una página web llegará siquiera a mostrar tus subtítulos.",
      sections: [
        {
          h2: "Los dos son texto plano con marcas de tiempo",
          body: [
            "Un archivo SRT es una lista numerada de bloques. Cada bloque tiene un índice, una hora de inicio y fin del estilo `00:00:01,000 --> 00:00:04,000`, y las líneas que hay que mostrar. Ese es el formato entero. Su sencillez explica que aparezca en todas partes: reproductores, televisores, programas de edición, plataformas de vídeo.",
            "VTT es la misma idea reescrita para la web. Se estandarizó para que los navegadores pudieran mostrar subtítulos directamente en un elemento de vídeo HTML, y añade sitio para cosas que en SRT no lo tenían.",
          ],
        },
        {
          h2: "Las diferencias, todas",
          body: ["No son muchas y todas son mecánicas:"],
          list: [
            "Un archivo VTT tiene que empezar por la línea `WEBVTT`. Si falta, el navegador rechaza el archivo entero: es el motivo más común de que los subtítulos no aparezcan sin decir nada.",
            "Las fracciones de segundo se separan con coma en SRT y con punto en VTT.",
            "SRT exige los números de bloque. VTT los trata como etiquetas opcionales.",
            "VTT puede llevar posición, alineación, estilo e identificación de quien habla. SRT no tiene noción de nada de eso.",
            "El elemento `<track>` del vídeo HTML5 solo acepta VTT. No cargará un SRT.",
          ],
        },
        {
          h2: "Entonces, ¿cuál quieres?",
          body: [
            "Si el vídeo se reproduce en una página web que controlas, VTT: no hay elección. Para todo lo demás, SRT es el archivo seguro — reproductores de escritorio, móviles, televisores, programas de edición y todas las plataformas grandes lo aceptan, y varios de ellos no aceptan VTT.",
            "Como la conversión es mecánica, no merece la pena agonizar. Nuestra herramienta de subtítulos escribe los dos archivos a partir de la misma transcripción, así que llévate el que pida el destino.",
          ],
        },
        {
          h2: "Cómo se generan los subtítulos automáticos y cómo fallan",
          body: [
            "Los subtítulos generados salen de un modelo de reconocimiento de voz. El audio se decodifica, se remuestrea a 16 kHz y se le pasa al modelo, que devuelve texto junto con el momento de inicio y fin de cada segmento. Aquí eso ocurre dentro de la pestaña, lo que significa que primero hay que descargar el modelo — 151 MB o 291 MB según el que elijas — así que la herramienta dice la cifra **antes** de empezar, no después.",
            "El modo de fallo que conviene conocer es que un audio malo no da un texto algo peor: da un bucle. Le dimos una grabación de un discurso de 1948 y devolvió la misma sílaba una y otra vez. Una grabación moderna limpia en el mismo idioma dio unas cuarenta palabras con dos errores. Era calidad de grabación, no dificultad del idioma; y como es el fallo con el que más gente se topará, está como aviso permanente en la página y no escondido en unas preguntas frecuentes.",
            "Pero el error que más caro sale es el **selector de idioma**. Apunta un modelo de reconocimiento al idioma equivocado y no se detendrá: producirá disparates fluidos y seguros de sí mismos — medimos una grabación en inglés transcrita como ciento veinte líneas de galimatías en coreano. Si la transcripción parece texto plausible que no tiene nada que ver con el audio, empieza por ahí.",
          ],
        },
        {
          h2: "Traducirlos es otro trabajo distinto",
          body: [
            "La traducción usa otro modelo más: uno multilingüe de 418 millones de parámetros que maneja cien idiomas en cualquier dirección. Es lo bastante pequeño para correr en una pestaña, y ese tamaño marca la calidad.",
            "La descripción honesta: de veinte líneas, unas quince salen bien y cinco quedan torpes pero se entienden. Las frases normales van bien. Donde resbala es en los modismos — «let's wrap this up» («vamos a ir terminando») salió con el sentido de «vamos a empezar» tanto en español como en alemán, y eso no es un error pequeño.",
            "Las exclamaciones muy cortas son el único caso en el que no resbala sino que se derrumba y repite. En vez de entregar eso, la herramienta detecta el derrumbe y **deja la línea original sin traducir**, para que veas qué líneas necesitan una persona.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Puedo renombrar un .srt a .vtt y ya está?",
          a: "No. Le faltará la línea de cabecera `WEBVTT` y sus marcas de tiempo usan comas donde VTT espera puntos. El navegador lo rechazará sin más. La conversión es sencilla, pero no es un cambio de nombre.",
        },
        {
          q: "¿Los subtítulos quedan incrustados en el vídeo?",
          a: "No: el archivo de subtítulos va al lado del vídeo y lo dibuja el reproductor. Es la mejor disposición — quien mira puede quitarlos, tú puedes corregir una errata sin recodificar, y el mismo vídeo puede llevar varios idiomas.",
        },
        {
          q: "El texto es fluido pero no tiene nada que ver con el audio.",
          a: "El idioma está mal puesto. Un modelo de voz al que se le pide el idioma equivocado no falla: produce con total seguridad un texto bien formado en ese idioma. Ajusta el idioma hablado y vuelve a ejecutarlo.",
        },
      ],
    },

    "what-are-stems": {
      metaTitle: "Qué son los stems y se puede desmezclar",
      metaDescription:
        "Los stems son las partes separadas de una mezcla. Sacarlas de una canción terminada es una estimación, no una recuperación: medimos cuánto acierta.",
      h1: "Qué son los stems — ¿y de verdad se puede desmezclar una canción?",
      lead: "En un estudio, los stems existen antes que la mezcla. Sacarlos de un archivo que ya está mezclado es una operación completamente distinta, y conviene saber qué te están entregando en realidad.",
      sections: [
        {
          h2: "Stems, en sentido propio",
          body: [
            "Un stem es una submezcla agrupada que se guarda aparte del resto: toda la batería en uno, toda la voz en otro, y así. Existen para que un ingeniero de masterización, un remezclador o un técnico de directo pueda trabajar sobre una parte sin tocar las demás.",
            "Los stems de verdad son sencillamente archivos que alguien conservó. Si los tienes, no hay nada que estimar: nunca llegaron a combinarse.",
          ],
        },
        {
          h2: "La separación no es lo mismo",
          body: [
            "Cuando un tema está mezclado, todas las partes se han sumado en dos canales de audio. Esa suma no es reversible: las partes individuales ya no existen en ninguna parte del archivo.",
            "Así que un modelo de separación no las recupera. Estima: dada esta mezcla, ¿cómo sonaba probablemente cada parte por su cuenta? Ha escuchado suficiente música como para acertar mucho, pero sigue siendo una conjetura.",
            "De ahí el carácter tan concreto de los resultados. Cada parte suele convencer por sí sola, con un rastro tenue de las demás todavía audible, y los pasajes densos adquieren una cualidad algo acuosa y emborronada. No son fallos que haya que arreglar: es a lo que suena una estimación.",
          ],
        },
        {
          h2: "Qué te devuelve",
          body: [
            "Cuatro pistas: voz, batería, bajo y todo lo demás. Esa última no es un descuido del modelo: es la categoría de guitarras, teclados, cuerdas, sintetizadores y cualquier cosa que no sea una de las otras tres. Si tu canción se sostiene sobre un piano, el piano está en «otros».",
            "Todos los stems tienen la duración del original y encajan exactamente con él, así que puedes cargarlos en cualquier editor y quedarán sincronizados.",
          ],
        },
        {
          h2: "¿Cómo de bien funciona? Lo medimos",
          body: [
            "«Se ejecutó y salieron cuatro archivos» no demuestra absolutamente nada: cuatro archivos de papilla verosímil se verían igual. Así que construimos una mezcla cuyos ingredientes conocíamos con exactitud: una grabación de voz, una onda sinusoidal de 60 Hz haciendo de bajo y ráfagas cortas de ruido haciendo de batería. Después correlacionamos cada stem de salida con cada ingrediente conocido.",
            "Cada stem coincidió con su propio ingrediente casi exactamente en 1,0 y con los demás casi exactamente en 0. El stem de batería contenía las ráfagas de ruido y prácticamente nada más; el de bajo contenía la sinusoide y prácticamente nada más.",
            "Esa prueba demuestra que la separación es real y está bien conectada. **No demuestra que cualquier canción vaya a separarse limpiamente**: la música real es mucho más difícil que una mezcla sintética, y una producción muy densa o muy comprimida lo es todavía más.",
          ],
        },
        {
          h2: "Es lento, y eso es un hecho sobre el método",
          body: [
            "La separación pasa la forma de onda entera por una red neuronal. Medimos 7,8 segundos de audio tardando 15,1 segundos en procesarse, aproximadamente el doble del tiempo real. Una canción completa, por tanto, pasa de seis minutos.",
            "Por eso la herramienta trabaja sobre una vista previa de 30 segundos y **te dice la cifra antes de que pulses nada**, en lugar de arrancar un trabajo de seis minutos en una pestaña y confiar en que te quedes.",
          ],
        },
        {
          h2: "Separar algo no te da derecho a usarlo",
          body: [
            "Sacar la voz de un disco comercial no cambia de quién es esa grabación. Practicar sobre un instrumental, estudiar un arreglo o hacer algo para ti es una situación; publicar o distribuir el resultado es otra distinta, y la separación no influye en eso.",
            "Nada de lo que cargues aquí sale de tu equipo, pero eso es una afirmación **sobre privacidad, no sobre licencias**.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Puedo hacer un karaoke de una canción?",
          a: "Sí: coge todos los stems menos la voz y vuelve a mezclarlos. Espera un rastro tenue de voz en las partes densas; el modelo estima, y donde la voz se solapa con instrumentos fuertes no puede separarlas del todo.",
        },
        {
          q: "¿Sonarán los stems tan bien como el original?",
          a: "Sumados de nuevo, quedan muy cerca. Escuchados por separado con auriculares se oyen artefactos, sobre todo una cualidad algo acuosa y restos de las otras partes. Cada stem es una reconstrucción, no una extracción.",
        },
        {
          q: "¿Por qué solo 30 segundos?",
          a: "Porque el proceso corre a aproximadamente el doble del tiempo real en un navegador, así que una canción entera pasaría de seis minutos con la pestaña abierta. La vista previa te deja oír si la separación es lo bastante buena para tu tema antes de comprometerte.",
        },
      ],
    },

    "why-pdf-wont-open": {
      metaTitle: "¿Por qué no se abre mi PDF?",
      metaDescription: "Un PDF que falla suele fallar por una de cinco razones, y cada una pide un arreglo distinto. Aquí tienes cómo saber cuál te ha tocado.",
      h1: "¿Por qué no se abre mi PDF?",
      lead: "«No se puede abrir este archivo» cubre al menos cinco problemas completamente distintos. Distinguirlos lleva unos diez segundos y te ahorra probar el arreglo equivocado.",
      sections: [
        {
          h2: "Primero: ¿falla en todas partes o solo en un sitio?",
          body: [
            "Arrastra el archivo a una pestaña del navegador. Los navegadores tienen su propio motor de PDF, así que esto te dice si el archivo está roto o si lo está tu lector.",
            "Si abre en el navegador pero no en tu lector de escritorio, el archivo está bien. Actualiza el lector o simplemente usa el navegador. Si falla en los dos, sigue leyendo.",
          ],
        },
        {
          h2: "Pide contraseña — y hay dos clases",
          body: [
            "Un PDF puede llevar dos contraseñas distintas y poca gente lo sabe. La **contraseña de usuario** impide abrir el documento. La **contraseña de propietario** lo deja legible pero restringe imprimir, copiar o editar.",
            "Esto importa porque las herramientas se comportan distinto. Un archivo con solo contraseña de propietario abre sin problema en casi cualquier lector, así que parece desprotegido — pero muchas herramientas se niegan a modificarlo, lo que parece un archivo roto cuando en realidad es un permiso.",
            "No hay forma honesta de saltarse una contraseña de usuario: el contenido está realmente cifrado. Nuestras herramientas de PDF rechazan los archivos cifrados y lo dicen, en vez de devolver algo vacío. Lo probamos con archivos cifrados con AES reales y con otros escritos por LibreOffice; las cuatro herramientas los rechazaron correctamente.",
          ],
        },
        {
          h2: "El texto está pero sale como cuadros vacíos",
          body: [
            "Es un problema de fuentes, muy común en documentos en chino, japonés y coreano. Los caracteres existen en el archivo, pero la fuente que los dibuja no se incrustó, así que el lector sustituye otra que no tiene esos glifos y salen filas de rectángulos huecos.",
            "Conviene saber que es un fallo de *dibujado*, no de datos. Copia el texto y estará intacto. Si necesitas que se vea bien, el arreglo está en la máquina que hizo el PDF: incrusta las fuentes al exportar.",
          ],
        },
        {
          h2: "Páginas en blanco, o un escaneo que no muestra nada",
          body: [
            "Algunos PDF guardan sus imágenes en formatos que no todos los motores implementan — JBIG2 y JPEG 2000 son los habituales, y ambos abundan en documentos escaneados con equipos de oficina. Un motor sin esos decodificadores dibuja una página en blanco en lugar de dar un error.",
            "La señal es que la página está vacía pero el archivo pesa mucho. Las páginas realmente en blanco son diminutas.",
          ],
        },
        {
          h2: "Está truncado o corrupto",
          body: [
            "Un PDF guarda su índice de objetos **al final** del archivo. Por eso un PDF descargado a medias falla del todo en vez de mostrar las primeras páginas: el lector busca el índice, no lo encuentra y se rinde.",
            "Si llegó por correo o descarga, compara su tamaño con el original. Un archivo que se corta no se repara de ninguna forma significativa; consíguelo otra vez.",
          ],
        },
        {
          h2: "Qué hacer una vez sabes cuál es",
          body: [
            "Emparejar el arreglo con la causa ahorra mucho tiempo:",
          ],
          list: [
            "Abre en el navegador pero no en tu lector → es el lector. Usa el navegador o actualízalo.",
            "Pide contraseña → necesitas la contraseña. Ninguna herramienta puede saltársela honestamente.",
            "Cuadros vacíos en vez de caracteres → no se incrustaron las fuentes. El texto está bien; vuelve a exportar desde el origen.",
            "Páginas en blanco y archivo grande → un formato de imagen que tu lector no decodifica. Prueba otro lector.",
            "Falla al instante y el archivo parece pequeño → está truncado. Descárgalo de nuevo.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Puede una herramienta quitar la contraseña de un PDF?",
          a: "La que cifra el contenido, no. Si un documento necesita contraseña para abrirse, los bytes están cifrados y no hay nada con lo que trabajar. Las herramientas que dicen lo contrario o adivinan contraseñas o tratan el caso de solo permisos.",
        },
        {
          q: "¿Por qué el mismo PDF se ve distinto en dos programas?",
          a: "Porque cada lector tiene su propio motor y difieren en qué fuentes sustituyen y qué formatos de imagen decodifican. Un PDF describe una página; no garantiza que dos motores la dibujen igual.",
        },
        {
          q: "Mi PDF abre pero no puedo seleccionar el texto.",
          a: "Entonces no hay capa de texto: las páginas son imágenes. Pasa con los escaneos y también con archivos que algunos compresores producen aplanando cada página. El reconocimiento de texto puede devolver esa capa.",
        },
      ],
    },

    "csv-vs-excel": {
      metaTitle: "CSV frente a Excel: qué cambia de verdad",
      metaDescription: "Un CSV no tiene tipos, ni formato, ni hojas: es solo texto. Ese único hecho explica todo lo raro que hace Excel al abrir uno.",
      h1: "CSV frente a Excel — qué cambia de verdad",
      lead: "Casi todo lo confuso que le pasa a un CSV viene de un hecho: el archivo no tiene ni idea de qué significan sus valores. Excel lo adivina, y en esas adivinanzas es donde se estropean los datos.",
      sections: [
        {
          h2: "Un CSV es texto. Ese es el formato entero.",
          body: [
            "Un CSV son líneas de caracteres separadas por comas. No hay nada más: ni tipos de celda, ni fórmulas, ni formato, ni varias hojas, ni anchos de columna. `007` en un CSV son tres caracteres, ni un número ni una cadena; el archivo no dice cuál.",
            "Un .xlsx es lo contrario: un paquete comprimido que registra, para cada celda, qué clase de valor contiene y cómo debe verse. Por eso pesa más y por eso sobrevive intacto a una ida y vuelta.",
          ],
        },
        {
          h2: "Lo que Excel le hace a tus datos al abrir un CSV",
          body: [
            "Como el archivo no declara tipos, Excel los infiere. Sus conjeturas son razonables en el caso medio y destructivas en casos concretos:",
          ],
          list: [
            "Los ceros a la izquierda desaparecen. `007` se vuelve `7`. Códigos postales, números de cuenta y referencias son las víctimas habituales.",
            "Lo que parece una fecha se vuelve fecha. `1-2` pasa a ser 2 de enero. Esto obligó a los genetistas a renombrar genes porque Excel convertía SEPT2 en una fecha.",
            "Los números largos pasan a notación científica y pierden su cola. Un identificador de 16 dígitos puede volver como `1.23457E+15`, y los dígitos perdidos no se recuperan cambiando el formato después.",
            "Y el daño se guarda cuando guardas. El archivo original era correcto; el que Excel escribe de vuelta, no.",
          ],
        },
        {
          h2: "Por qué tu CSV sale con caracteres raros o todo en una columna",
          body: [
            "Dos problemas distintos, ambos sobre supuestos que el archivo no puede declarar.",
            "**La codificación.** Un CSV no registra su codificación de caracteres. Excel en Windows ha asumido históricamente la página de códigos local en vez de UTF-8, y por eso llegan destrozados los textos con acentos, el coreano o el japonés. Una marca de orden de bytes UTF-8 al principio suele arreglarlo.",
            "**El separador.** En los países donde la coma es el separador decimal, las hojas de cálculo escriben y esperan punto y coma. Abre uno de esos archivos en otro sitio y cada fila cae en una sola columna. El archivo no está roto; los dos programas no se ponen de acuerdo sobre qué significa una coma.",
          ],
        },
        {
          h2: "Cuando el archivo es sencillamente demasiado grande",
          body: [
            "Una hoja de cálculo tiene un techo duro de algo más de 1.048.576 filas, y se vuelve lenta mucho antes porque carga todo en memoria para que todo sea editable.",
            "Pasado cierto tamaño lo correcto es dejar de abrir el archivo y empezar a hacerle preguntas. Selecciona unas columnas, filtra, agrupa, cuenta: tienes la respuesta en segundos sin que la máquina intente dibujar millones de celdas que nunca ibas a mirar.",
          ],
        },
        {
          h2: "Parquet, en breve",
          body: [
            "Si el CSV te falla una y otra vez, Parquet es a donde se pasó el mundo del análisis. Guarda los tipos dentro del archivo, así que no se adivina nada. Guarda por columnas en vez de por filas, así que leer tres columnas de cincuenta lee más o menos tres columnas de bytes. Y comprime bien: suele ocupar entre cinco y diez veces menos que el mismo CSV.",
            "El precio es que no puedes abrirlo en un editor de texto. Es un formato para consultar, no para mirar.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Cómo evito que Excel destroce mi CSV?",
          a: "No lo abras con doble clic. Usa Datos → Desde texto/CSV, que te deja fijar la codificación y marcar columnas como texto antes de que se convierta nada. O consulta el archivo directamente y que ninguna hoja de cálculo lo toque.",
        },
        {
          q: "¿Un CSV pesa menos que un archivo de Excel?",
          a: "Normalmente no, y sorprende. Un .xlsx es un paquete comprimido, y el zip comprime bien el texto repetitivo. Un CSV son caracteres sin comprimir. Parquet gana a los dos por mucho.",
        },
        {
          q: "¿Puedo consultar un CSV sin base de datos?",
          a: "Sí. Nuestra herramienta de datos ejecuta un motor SQL dentro de la pestaña y lee el archivo directamente de tu disco: no se sube nada y no hay servidor ni base de datos que montar.",
        },
      ],
    },

    "can-ai-summarize": {
      metaTitle: "¿Se puede fiar uno de un resumen de IA?",
      metaDescription: "Los modelos pequeños de resumen fallan de formas concretas y repetibles: copian, inventan y se equivocan en los hechos. Esto es lo que medimos.",
      h1: "¿Se puede fiar uno de un resumen hecho por IA?",
      lead: "A veces, y los fallos son lo bastante concretos como para merecer aprenderlos. Probamos cuatro modelos con los mismos documentos; dos de ellos no resumían en absoluto.",
      sections: [
        {
          h2: "Qué hace realmente un modelo de resumen",
          body: [
            "Un modelo de resumen no extrae frases y las cose. Lee el documento y luego escribe frases nuevas, palabra a palabra, eligiendo cada una por lo que suele venir después.",
            "Por eso el resultado se lee con naturalidad, y también por eso puede equivocarse de formas en que un copiar y pegar nunca podría: nada ancla el texto generado al original salvo lo que el modelo aprendió.",
          ],
        },
        {
          h2: "Fallo uno: copia en vez de resumir",
          body: [
            "Fue la mayor sorpresa de nuestras pruebas. Dos modelos con licencias limpias y permisivas — uno de 600 millones de parámetros, otro de 350 — no resumían prosa narrativa. Reproducían el comienzo del documento tal cual.",
            "Ambos manejaban bien los artículos de enciclopedia. El comportamiento solo apareció cuando añadimos un texto narrativo. Si hubiéramos probado únicamente con material de referencia, habríamos publicado un modelo que copia.",
            "Forzarlo a no copiar lo empeoró en vez de mejorarlo: envuelto en delimitadores, el mismo modelo produjo una frase fluida que decía algo que el documento nunca decía.",
          ],
        },
        {
          h2: "Fallo dos: inventa cuando no hay con qué trabajar",
          body: [
            "Con una entrada vacía, un modelo produjo el resumen de una campaña de salud pública. Con la sola palabra «hola», escribió tres líneas de un diario.",
            "Un modelo siempre produce algo: no existe un estado en el que no devuelva nada. Si la entrada es demasiado corta para resumirse, lo que sale no es un mal resumen, es ficción. Por eso nuestra herramienta tiene una longitud mínima y se niega por debajo en vez de complacer.",
          ],
        },
        {
          h2: "Fallo tres: se equivoca en los hechos, con fluidez",
          body: [
            "En una ejecución el modelo desarrolló la abreviatura NADPH en un nombre químico que no es lo que NADPH significa. La frase estaba bien formada y sonaba segura.",
            "Fluidez y exactitud son cosas distintas y fallan por separado. Este es el fallo que no puedes detectar leyendo solo el resumen, y precisamente por eso un resumen sirve para decidir si leer algo, no para sustituir la lectura.",
          ],
        },
        {
          h2: "En qué es realmente bueno",
          body: [
            "En saber si un documento largo te interesa. En captar la idea de un informe en un idioma que lees despacio. En producir un primer borrador de un resumen que luego corriges.",
            "Un límite más que conviene conocer: pedir el resumen en un idioma distinto al del original es donde los modelos pequeños se deshacen — inventan palabras que no existen o ignoran la instrucción y responden en el idioma de origen. Resumir y traducir son dos trabajos; pídelos de uno en uno.",
          ],
        },
        {
          h2: "Si el documento es un escaneo, nada de lo anterior aplica todavía",
          body: [
            "Un PDF escaneado no tiene texto, solo imágenes de texto. Un modelo de resumen que recibe ese archivo no recibe nada — y, según el segundo fallo, un modelo sin nada igualmente escribirá algo.",
            "Pasa primero el reconocimiento de texto, revisa el resultado y luego resume. El reconocimiento sobre un escaneo malo produce sus propios errores, y resumirlos los agrava en silencio.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Puedo fiarme de un resumen de IA para algo importante?",
          a: "Úsalo para decidir qué leer, no como sustituto de leer. Los errores que comete son fluidos y seguros de sí mismos, o sea que no parecen errores — justo la propiedad que los hace peligrosos para decidir.",
        },
        {
          q: "¿Por qué la herramienta rechaza documentos muy largos en vez de recortarlos?",
          a: "Porque resumir la primera parte y presentarla como resumen del todo es una mentira que el lector no puede detectar. Negarse es honesto; recortar en silencio, no.",
        },
        {
          q: "¿Se sube mi documento?",
          a: "No. El modelo se descarga a tu navegador y el documento se lee ahí. Es la disposición contraria a un servicio alojado: viaja el modelo, no tu archivo.",
        },
      ],
    },

    "wav-vs-mp3": {
      metaTitle: "WAV o MP3: ¿cuál necesitas de verdad?",
      metaDescription:
        "WAV guarda todas las muestras y cuesta unos 10 MB por minuto. MP3 tira casi todo. Cuándo importa esa diferencia y por qué pasar de MP3 a WAV no recupera nada.",
      h1: "WAV o MP3: ¿cuál necesitas realmente?",
      lead: "Uno de los dos descarta sonido dando por hecho que no lo echarás de menos. El otro lo guarda todo y te cobra unos diez megabytes por minuto. Cuál conviene depende por completo de adónde va el archivo después.",
      sections: [
        {
          h2: "Qué es cada uno en realidad",
          body: [
            "MP3 es un formato **con pérdida**. Su codificador decide qué partes del sonido tienes menos probabilidad de notar, las tira y comprime lo que queda. De ahí sale la reducción de unas diez veces: no de empaquetar con astucia, sino de **borrar**.",
            "WAV no es realmente un formato de compresión. Un archivo WAV es una cabecera de 44 bytes seguida de las muestras en bruto, una detrás de otra. Ese es todo el diseño. Guarda lo que midió el micrófono, sin modificar.",
            "Así que la comparación no es \"cuál comprime mejor\". Solo uno de los dos comprime.",
          ],
        },
        {
          h2: "La diferencia de tamaño es aritmética, no opinión",
          body: [
            "El tamaño de un WAV sale directo de tres números: muestras por segundo, canales y bytes por muestra. En calidad CD son 44.100 × 2 × 2 = 176.400 bytes cada segundo, es decir **unos 10,6 MB por minuto**, o 42 MB para una canción de cuatro minutos.",
            "La misma canción en MP3 a 192 kbps ronda los 5,8 MB. Nada de la música cambia esa proporción; la fija el formato.",
            "Esa previsibilidad a veces es justo lo que se busca. Con la duración de un WAV sabes exactamente dónde está cada muestra, y por eso les gusta a los editores y a las herramientas de análisis.",
          ],
        },
        {
          h2: "Pasar de MP3 a WAV no recupera nada",
          body: [
            "Es el malentendido más común sobre estos dos formatos. El detalle que descartó el codificador MP3 no está escondido en el archivo esperando a descomprimirse: **ya no está**. Decodificar a WAV produce un archivo más grande con exactamente el mismo audio.",
            "Eso no hace inútil la conversión. Mucho software solo acepta WAV, y dárselo es perfectamente razonable. Solo conviene entender que estás **reempaquetando**, no reparando.",
            "Es también la razón de que nuestra extracción de audio nunca reencode. Sacarlo como M4A copia los datos comprimidos originales a otro contenedor byte a byte; sacarlo como WAV los decodifica una vez a muestras en bruto. Ninguna de las dos rutas añade una segunda generación de compresión sobre la primera.",
          ],
        },
        {
          h2: "Cuándo WAV es la respuesta correcta",
          body: [
            "Siempre que el archivo vaya a **procesarse otra vez**. Cada paso por un codificador con pérdida añade otra generación de daño, y se acumulan: si vas a editar, mezclar, filtrar o dar el audio a un modelo, quieres la versión que aún no ha pasado por el molino.",
            "Nuestro separador de pistas escribe WAV exactamente por eso. Sus cuatro salidas existen para entrar en un editor, y entregarte MP3 de una estimación sería sumar una aproximación a otra.",
            "El archivado es el otro caso. Si esta es la única copia que va a existir, quédate con la que no ha tirado nada.",
          ],
        },
        {
          h2: "Cuándo MP3 es la respuesta correcta",
          body: [
            "Para escuchar, enviar y guardar mucho. A 192 kbps o más, con equipo normal, casi nadie distingue el MP3 de forma fiable. Y ocupa la décima parte.",
            "La compatibilidad es la otra mitad. MP3 se abre prácticamente en todo, incluido hardware anterior a cualquier alternativa que estuvieras considerando.",
            "No vamos a decirte qué oye tu oído; eso no podemos medirlo por ti. Sí podemos decirte que el archivo es diez veces más pequeño y que la diferencia es **borrado, no degradación**.",
          ],
        },
        {
          h2: "Algo incómodo del propio MP3",
          body: [
            "MP3 **no tiene contenedor**. Es una tirada pelada de tramas, cada una con su cabecerita, puestas una detrás de otra. No hay índice ni tabla de contenidos, así que el software que quiera trabajar con un MP3 tiene que **rastrear los límites de trama** en vez de consultar nada.",
            "Ese rastreador tuvimos que escribirlo nosotros, y dos detalles nos pillaron. La etiqueta ID3v2 del principio guarda su propia longitud en bytes \"syncsafe\" que solo usan siete bits cada uno, así que leerla como un número normal te deja en mitad del audio. Y la primera trama suele ser una trama Xing o Info con metadatos en lugar de sonido: si la decodificas, te sale un golpe de silencio al inicio.",
            "La consecuencia práctica es que MP3 va mal para saltar a un punto exacto y su duración declarada es a menudo una estimación. WAV tiene la propiedad contraria: sin compresión que deshacer, toda posición es exacta.",
          ],
        },
      ],
      faq: [
        {
          q: "¿WAV tiene más calidad que MP3?",
          a: "WAV está sin modificar, que no es exactamente lo mismo. Si el WAV se hizo a partir de un MP3, su calidad es la del MP3 en un archivo más grande. WAV solo suena mejor cuando nunca pasó por un codificador con pérdida.",
        },
        {
          q: "Si paso de WAV a MP3 y vuelvo, ¿recupero el WAV original?",
          a: "No. Obtienes un WAV del MP3. La ida y vuelta no es simétrica: el primer paso borra información y el segundo no puede inventarla otra vez.",
        },
        {
          q: "¿En qué formato extraigo el audio de un vídeo?",
          a: "M4A si solo quieres el sonido tal y como ya existe, porque esa ruta copia el audio comprimido sin tocarlo. WAV si el archivo va a un editor o a una herramienta de análisis que necesita muestras en bruto.",
        },
      ],
    },

    "what-is-a-codec": {
      metaTitle: "Códec y contenedor: ¿qué es un códec?",
      metaDescription:
        "MP4 es la caja; H.264 es lo que va dentro. Confundirlos explica por qué unas conversiones son instantáneas y sin pérdida y otras tardan y cuestan calidad.",
      h1: "¿Qué es un códec y en qué se diferencia de MP4?",
      lead: "Casi todo lo confuso de los archivos de vídeo viene de una sola distinción: la extensión nombra la caja, no lo que hay dentro. Separa esas dos cosas y la mayor parte del misterio desaparece.",
      sections: [
        {
          h2: "La caja y el contenido",
          body: [
            "Un **contenedor** —MP4, MOV, WebM, MKV— describe cómo están dispuestas las partes del archivo: dónde está el flujo de vídeo, dónde el de audio, cómo encajan en el tiempo y dónde vive el índice.",
            "Un **códec** —H.264, HEVC, VP9, AV1 para la imagen; AAC, Opus, MP3 para el sonido— es cómo se comprimió ese contenido en primer lugar.",
            "Así que `.mp4` te dice la forma de la caja y casi nada de lo que hay dentro. Dos archivos terminados en `.mp4` pueden contener códecs completamente distintos, y uno puede no reproducirse en un aparato donde el otro va perfecto.",
          ],
        },
        {
          h2: "Por eso unas conversiones salen gratis y otras no",
          body: [
            "MOV a MP4 es casi gratis. Ambos son la misma familia de formato y el vídeo dentro de un MOV suele ser ya H.264, que MP4 acepta. Así que los datos comprimidos se copian sin cambios y se escribe un índice nuevo alrededor. No se decodifica ni se recomprime nada. Es **sin pérdida y casi instantáneo**. El nombre propio de esto es remultiplexado.",
            "MP4 a WebM es lo contrario. WebM no acepta H.264, así que hay que decodificar cada fotograma y comprimirlo de nuevo como VP9, y el audio como Opus. Eso lleva tiempo real y cuesta una generación de calidad.",
            "Las dos operaciones comparten la palabra \"convertir\" y nada más, y por eso nuestro conversor te dice cuál de las dos vas a ejecutar antes de que pulses nada.",
          ],
        },
        {
          h2: "Se puede hacer bastante sin ningún códec",
          body: [
            "Recortar, por ejemplo, es solo elegir qué muestras ya comprimidas se conservan. No se decodifica nada, así que la calidad es idéntica bit a bit y la operación termina casi al momento.",
            "Hay un coste, y sale directamente de cómo funciona la compresión. Solo puedes empezar en un **fotograma clave**, uno que se sostiene solo. Los fotogramas intermedios se guardan como descripciones de en qué se diferencian de los anteriores, así que si cortas en mitad de esa cadena, los primeros segundos no tienen a qué referirse y salen rotos.",
            "Por eso llevamos el inicio hacia atrás, al fotograma clave más cercano antes del punto que pediste, y te enseñamos dónde caerá el corte de verdad. La alternativa es reencodear el principio para clavar el fotograma exacto, y eso cuesta calidad: debería ser tu decisión, no un cambio silencioso.",
            "Extraer el audio como M4A funciona igual: los datos AAC comprimidos se levantan a otro contenedor sin tocarlos.",
          ],
        },
        {
          h2: "El soporte va por códec, no por extensión",
          body: [
            "Cuando un aparato dice que no puede reproducir un MP4, el contenedor casi nunca es el problema. Lo habitual es que el **códec de dentro** no esté soportado; HEVC dentro de un `.mp4` es el caso típico, porque es lo que graban los móviles nuevos y lo que rechaza el software viejo.",
            "Esto explica también por qué renombrar no sirve de nada. Cambiar `.mov` por `.mp4` reetiqueta la caja dejando la caja y el contenido exactamente como estaban.",
          ],
        },
        {
          h2: "De dónde salen nuestros propios límites",
          body: [
            "Nuestro demultiplexor lee ISOBMFF, la familia a la que pertenecen MP4, MOV y M4V. No tenemos código que abra Matroska, que es sobre lo que está construido WebM, así que \"WebM a MP4\" no está en la lista aunque suene a lo contrario de algo que ya hacemos. Ponerlo sería atribuirnos una capacidad que no tenemos.",
            "Codificar es tarea del navegador, no nuestra, y qué códecs puede codificar varía según la máquina y el sistema. Así que se lo preguntamos directamente y ofrecemos solo eso, en lugar de imprimir un menú y fallar a mitad.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Por qué mi .mp4 no se reproduce en este aparato?",
          a: "Casi siempre por el códec de dentro y no por el contenedor. Vídeo HEVC en un MP4 es el sospechoso habitual: lo graban los móviles nuevos y los reproductores viejos no lo decodifican. Reencodear a H.264 lo arregla; renombrar el archivo no.",
        },
        {
          q: "¿Cambiar la extensión convierte el vídeo?",
          a: "No. La extensión es una etiqueta, no el formato. Renombrar puede hacer que un reproductor intente abrir un archivo que si no ignoraría, pero los bytes de dentro siguen igual y fallará si de verdad no puede leerlos.",
        },
        {
          q: "¿Convertir MOV a MP4 pierde calidad?",
          a: "No cuando el vídeo de dentro ya es H.264, que suele ser el caso. Los datos comprimidos se copian al nuevo contenedor sin tocarlos, así que el resultado es la misma imagen en otra caja.",
        },
      ],
    },

    "why-video-is-sideways": {
      metaTitle: "¿Por qué mi vídeo sale de lado?",
      metaDescription:
        "Tu móvil graba el vídeo vertical como píxeles horizontales más una marca de rotación. Los reproductores que la leen lo ven bien; el resto lo tumba de lado.",
      h1: "¿Por qué mi vídeo sale de lado?",
      lead: "El archivo no está dañado y tu móvil no se equivocó. Un vídeo vertical suele guardarse como una imagen horizontal con una nota pegada, y todo depende de si el siguiente programa se molesta en leer la nota.",
      sections: [
        {
          h2: "Tu móvil no giró nada",
          body: [
            "El sensor de la cámara tiene forma horizontal, y sigue así sostengas el aparato como lo sostengas. Así que al grabar de pie los fotogramas se escriben igualmente **como imágenes horizontales**, y junto a ellos el archivo lleva una matriz de 3×3 en la cabecera de pista que dice \"gira esto un cuarto de vuelta antes de dibujarlo\".",
            "El reproductor de tu propio móvil lee esa matriz, la aplica y te enseña un vídeo vertical. Por lo que a ti respecta, el vídeo es vertical. Entrega el mismo archivo a algo que ignore la matriz y dibujará exactamente lo que hay guardado: una imagen horizontal, tumbada de lado.",
          ],
        },
        {
          h2: "Por eso se ve bien en un sitio y mal en otro",
          body: [
            "Entre los dos programas la imagen no cambió en nada. Uno respetó la nota y el otro no, y técnicamente ninguno leyó mal el archivo.",
            "Lo que significa que \"en mi móvil se ve bien\" no es prueba de que el archivo esté bien. Es prueba de que tu móvil lee marcas de rotación, algo que ya sabías.",
          ],
        },
        {
          h2: "Nosotros mismos lo hicimos mal",
          body: [
            "Durante un tiempo nuestras herramientas de vídeo no leían la matriz en absoluto. El 2026-07-27 lo medimos como es debido y encontramos que **cuatro herramientas —convertir, recortar, comprimir y GIF— sacaban vídeo de lado** con entrada vertical. Nadie lo había reportado y todas las pruebas estaban en verde.",
            "La razón de que siguiera oculto vale más que el fallo. Todas las muestras de vídeo que teníamos eran horizontales, así que la ruta de rotación no se había ejercitado ni una sola vez. No fue un defecto que apareciera: fue un **agujero en el conjunto de muestras** que llevaba ahí desde el principio.",
            "El arreglo llegó con cuatro archivos del mismo metraje escritos a 0, 90, 180 y 270 grados, de modo que la orientación es lo único que cambia entre ellos. Es el tipo de muestra que hace imposible pasar por alto toda una categoría de error.",
          ],
        },
        {
          h2: "El tamaño no demuestra la orientación",
          body: [
            "Es una trampa fácil. Una rotación de 180 grados deja el ancho y el alto completamente iguales, y 90 y 270 los intercambian exactamente igual, así que comprobar las dimensiones pasa tan contento con un vídeo que sale del revés o girado hacia el lado equivocado.",
            "Lo único que los separa es comparar la imagen de verdad. Y cada resultado hay que comprobarlo contra **su propia fuente**: por un momento dimos por hecho que nuestras cuatro muestras eran el mismo vídeo, cuando en realidad eran los mismos píxeles guardados con marcas distintas, lo que hace inútil comparar las salidas entre sí.",
          ],
        },
        {
          h2: "Arreglarlo depende de adónde vaya el vídeo",
          body: [
            "Si la salida es MP4, la nota se puede reescribir. Los píxeles se quedan tal cual y solo cambia la matriz, que además es la única opción en rutas que nunca decodifican nada, como recortar o cambiar de contenedor.",
            "Si la salida es WebM o GIF, esa vía está cerrada. La rotación en Matroska tiene soporte desigual entre reproductores y GIF no tiene el concepto siquiera. Ahí la imagen hay que girarla de verdad y hornearla, lo que significa redibujar cada fotograma.",
            "Así que \"girar el vídeo\" son dos operaciones distintas según el destino, y elegir mal te da un archivo que se ve correcto en tu reproductor y mal en todos los demás sitios: exactamente el problema que intentabas resolver.",
          ],
        },
        {
          h2: "Qué comprobar",
          body: ["Una lista corta que cubre casi todos los casos:"],
          list: [
            "Bien en el móvil, de lado tras subirlo → una marca de rotación ignorada, no un archivo roto.",
            "Las dimensiones parecen al revés → te están enseñando el tamaño guardado y no el tamaño mostrado.",
            "Va a MP4 → la marca se puede reescribir, píxeles intactos, calidad igual.",
            "Va a WebM o GIF → hay que redibujar los fotogramas, así que cuenta con un reencodeado.",
            "Comprobar si el arreglo funcionó → compara fotogramas. Las dimensiones no distinguen 180 grados de correcto.",
          ],
        },
      ],
      faq: [
        {
          q: "¿Está dañado mi archivo de vídeo?",
          a: "Casi seguro que no. Un vídeo de lado suele ser un archivo perfectamente válido cuya marca de rotación está ignorando el programa actual. El mismo archivo se verá bien en un reproductor que lea la marca.",
        },
        {
          q: "¿Por qué las dimensiones salen intercambiadas?",
          a: "Porque muestran lo que hay guardado y no lo que se ve. Un vídeo vertical de móvil se guarda de verdad como fotogramas horizontales, así que una herramienta que dé los números en bruto dirá 1920 por 1080 de algo que ves como 1080 por 1920.",
        },
        {
          q: "¿Girar un vídeo baja la calidad?",
          a: "Depende de la salida. Hacia un MP4 la rotación se escribe como marca y no se toca ni un píxel, así que no se pierde nada. Hacia WebM o GIF hay que redibujar los fotogramas, lo que implica reencodear y con ello una generación de calidad.",
        },
      ],
    },
  },
} satisfies GuideCopy;
