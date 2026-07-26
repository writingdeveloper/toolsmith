import type { Dictionary } from "./en";

export const ptBR = {
  site: {
    title: "toolsmith — ferramentas de navegador que nunca enviam seus arquivos",
    titleTemplate: "%s | toolsmith",
    description:
      "Seus arquivos nunca saem do seu aparelho. Converta imagens, vídeo e PDF inteiramente dentro do navegador. Sem cadastro e sem upload.",
    tagline: "Sem upload · tudo roda no seu navegador",
    footerNote:
      "Os arquivos que você escolhe nunca são enviados a um servidor. Tudo acontece dentro desta aba do navegador.",
  },

  home: {
    title: "Ferramentas de arquivo que não enviam nada",
    lead: "Imagens, vídeo e PDF são processados dentro do seu navegador. Nada para enviar, nada para esperar e nada para apagar depois.",
    availableHeading: "Disponíveis",
    upcomingHeading: "Em breve",
  },

  localePicker: {
    title: "Escolha seu idioma",
    lead: "O toolsmith processa cada arquivo dentro do seu navegador. Escolha um idioma para continuar.",
  },

  common: {
    chooseFile: "Escolher arquivos",
    download: "Baixar",
    clear: "Limpar",
    downloadAll: "Baixar tudo",
    workerUnsupportedTitle: "Este navegador não consegue executar esta ferramenta.",
    workerUnsupportedHint:
      "Abra em uma versão recente do Chrome, Edge, Firefox ou Safari com suporte a Web Workers.",
  },

  pdfErrors: {
    encrypted: "Este PDF está protegido por senha",
    noPages: "Este PDF não tem páginas",
    tooLarge: "Isso passa de 512 MB",
    invalid: "Este arquivo não pode ser lido como PDF",
    badRange: "Não entendemos esses números de página",
    outOfBounds: "Este PDF não tem essas páginas",
    generic: "Algo deu errado",
  },

  toolNames: {
    "image-convert": "Conversor de imagens",
    "video-convert": "Conversor de vídeo",
    "video-compress": "Compressor de vídeo",
    "video-trim": "Cortar vídeo",
    "video-to-gif": "Vídeo para GIF",
    "audio-extract": "Extrair áudio",
    "pdf-merge": "Juntar PDF",
    "pdf-split": "Dividir PDF",
    "pdf-compress": "Comprimir PDF",
    ocr: "Imagem para texto",
    "data-query": "Consulta CSV e Parquet",
    subtitles: "Gerar legendas",
    "subtitle-translate": "Traduzir legendas",
    "remove-bg": "Remover fundo",
    cutout: "Recorte com um clique",
    upscale: "Ampliar imagem",
    stems: "Separar faixas",
  },

  tools: {
    "image-convert": {
      blurb: "HEIC, PNG, JPG, WebP e AVIF em qualquer direção. Comprima e redimensione de uma vez.",
      metaTitle: "Conversor de imagens — HEIC, PNG, JPG, WebP, AVIF",
      metaDescription:
        "Converta fotos HEIC do iPhone para JPG e PNG para WebP. Tudo no navegador, sem enviar nada. Sem cadastro e sem limite de arquivos.",
      h1: "Conversor e compressor de imagens",
      lead: "Converta entre HEIC, PNG, JPG, WebP e AVIF, reduza a qualidade para economizar espaço e redimensione na mesma passada. Aceita várias imagens de uma vez.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. A conversão acontece dentro desta aba e as imagens escolhidas nunca são enviadas pela rede. Ao fechar a aba, elas somem.",
        },
        {
          q: "Funciona com fotos HEIC do iPhone?",
          a: "Sim. O Safari lê HEIC nativamente; no Chrome e no Firefox o decodificador só é baixado no momento em que você solta um arquivo HEIC. Se você nunca usar HEIC, nada é baixado.",
        },
        {
          q: "Qual formato devo escolher?",
          a: "WebP é o menor na mesma qualidade se a imagem for para a web. Escolha JPG se precisar abrir em qualquer lugar e PNG se precisar de transparência. Só aparecem na lista os formatos que seu navegador realmente consegue gerar.",
        },
      ],
      ui: {
        unsupportedTitle: "Este navegador não consegue converter imagens.",
        unsupportedHint:
          "Abra em uma versão recente do Chrome, Edge, Firefox ou Safari 17+ com suporte a OffscreenCanvas.",
        dropLabel: "Solte suas imagens aqui",
        dropHint: "HEIC · PNG · JPG · WebP · AVIF · GIF · BMP — várias de uma vez",
        formatLabel: "Formato de saída",
        qualityLabel: "Qualidade {value}",
        qualityLossless: "Qualidade (PNG é sem perdas)",
        sizeLabel: "Tamanho",
        sizeOriginal: "Manter o tamanho original",
        sizeMax: "Lado maior {px} px",
        convert: "Converter {n} arquivo(s)",
        converting: "Convertendo…",
        itemWorking: "Convertendo…",
        errUnsupportedInput: "Este navegador não consegue ler esse formato",
        errGeneric: "A conversão falhou",
      },
    },

    "pdf-merge": {
      blurb: "Vários PDFs em um só, na ordem que você quiser. As páginas são copiadas, nunca re-renderizadas.",
      metaTitle: "Juntar PDF — combinar vários PDFs em um",
      metaDescription:
        "Junte vários PDFs na ordem que quiser. Tudo no navegador, sem enviar nada, sem cadastro, sem marca d'água e sem limite de arquivos.",
      h1: "Juntar PDF",
      lead: "Junte vários PDFs em um único arquivo. Reordene a lista e o resultado segue exatamente essa ordem.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. A junção acontece dentro desta aba e os PDFs escolhidos nunca são enviados pela rede. Ao fechar a aba, eles somem.",
        },
        {
          q: "Como defino a ordem das páginas?",
          a: "De cima para baixo na lista: essa é a ordem das páginas no resultado. Use ↑ ↓ para mover um arquivo e ✕ para tirá-lo. Dentro de cada arquivo as páginas mantêm a ordem original.",
        },
        {
          q: "Funciona com PDFs protegidos por senha?",
          a: "Não. PDFs protegidos são marcados como tal e ficam de fora da junção. Preferimos recusar a entregar um arquivo que abriu mas saiu corrompido. Remova a senha antes.",
        },
        {
          q: "A qualidade cai?",
          a: "Não. As páginas são copiadas como estão, em vez de re-renderizadas. Texto continua texto e as imagens mantêm a resolução original.",
        },
      ],
      ui: {
        dropLabel: "Solte seus PDFs aqui",
        dropHint: "Coloque dois ou mais e eles são unidos de cima para baixo",
        listLabel: "Arquivos a juntar",
        reading: "lendo…",
        pageCount: "{n} páginas",
        moveUp: "Mover {name} para cima",
        moveDown: "Mover {name} para baixo",
        remove: "Remover {name}",
        merge: "Juntar {n} arquivos",
        merging: "Juntando…",
        totalPages: "{n} páginas no total",
        needTwo: "São necessários dois PDFs ou mais",
        resultDetail: "{pages} páginas · {size}",
      },
    },

    "pdf-split": {
      blurb: "Tire as páginas que quiser ou separe cada página em seu próprio PDF dentro de um ZIP.",
      metaTitle: "Dividir PDF — extrair páginas ou separar uma a uma",
      metaDescription:
        "Extraia páginas específicas de um PDF ou separe cada página em seu próprio arquivo. Tudo no navegador, sem enviar nada, sem cadastro e sem marca d'água.",
      h1: "Dividir PDF",
      lead: "Extraia as páginas de que precisa em um único PDF, ou separe cada página em seu próprio PDF e receba tudo em um ZIP.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. A divisão acontece dentro desta aba e o PDF escolhido nunca é enviado pela rede. Ao fechar a aba, ele some.",
        },
        {
          q: "Como escrevo os números de página?",
          a: "Assim: 1-3, 5, 8-. Isso quer dizer da página 1 à 3, a página 5 sozinha e da 8 até o fim. A ordem que você escreve é a ordem que você recebe.",
        },
        {
          q: "E se eu pedir uma página que não existe?",
          a: "Avisamos na hora. Cortar 1-99 em silêncio até um arquivo de 10 páginas deixaria você acreditando que recebeu páginas que nunca existiram. Não fazemos isso.",
        },
        {
          q: "A qualidade cai?",
          a: "Não. As páginas são copiadas como estão, em vez de re-renderizadas. Texto continua texto e as imagens mantêm a resolução original.",
        },
      ],
      ui: {
        dropLabel: "Solte um PDF aqui",
        dropHint: "Um de cada vez — tire as páginas que quiser ou separe todas",
        reading: "lendo…",
        pageCount: "{n} páginas",
        modeExtract: "Extrair um intervalo de páginas",
        modeExtractHint: "As páginas escolhidas, reunidas em um só PDF",
        modePages: "Cada página separada",
        modePagesHint: "{n} PDFs de uma página, embrulhados em um único ZIP",
        rangeLabel: "Páginas a extrair",
        rangePlaceholder: "ex.: 1-3, 5, 8-  ({n} páginas no total)",
        selected: "{n} páginas selecionadas",
        needRange: "Diga quais páginas quer tirar",
        runExtract: "Extrair",
        runPages: "Separar página a página",
        processing: "Processando…",
        extractName: "{stem}-extracao.pdf",
        zipName: "{stem}-paginas.zip",
        extractDetail: "{pages} páginas · {size}",
        zipDetail: "{count} PDFs · {size}",
      },
    },
  },
} satisfies Dictionary;
