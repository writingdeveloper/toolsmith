import type { Dictionary } from "./en";

export const ptBR = {
  site: {
    title:
      "toolsmith — ferramentas de navegador que nunca enviam seus arquivos",
    titleTemplate: "%s | toolsmith",
    description:
      "Seus arquivos nunca saem do seu aparelho. Converta imagens, vídeo e PDF inteiramente dentro do navegador. Sem cadastro e sem upload.",
    tagline: "Sem upload · tudo roda no seu navegador",
    footerNote:
      "Os arquivos que você escolhe nunca são enviados a um servidor. Tudo acontece dentro desta aba do navegador.",
    themeLabel: "Aparência",
    themeNames: { system: "Sistema", light: "Claro", dark: "Escuro" },
  },

  home: {
    familyImage: "Imagens",
    familyVideo: "Vídeo e áudio",
    familyPdf: "Documentos",
    familyData: "Dados",
    title: "Ferramentas de arquivo que não enviam nada",
    lead: "Imagens, vídeo e PDF são processados dentro do seu navegador. Nada para enviar, nada para esperar e nada para apagar depois.",
    availableHeading: "Disponíveis",
    searchLabel: "Encontrar uma ferramenta",
    searchPlaceholder: "Buscar — HEIC, PDF, legendas…",
    searchEmpty:
      "Nenhuma ferramenta corresponde. Tente um formato, como HEIC ou MP4.",
    upcomingHeading: "Em breve",
  },

  localePicker: {
    title: "Escolha seu idioma",
    lead: "O toolsmith processa cada arquivo dentro do seu navegador. Escolha um idioma para continuar.",
  },

  common: {
    breadcrumbLabel: "Trilha de navegação",
    relatedHeading: "Outras ferramentas",
    sendToHeading: "Continuar com este resultado:",
    notFoundTitle: "Esta página não existe",
    notFoundLead:
      "O endereço pode estar incorreto ou a página pode ter sido movida.",
    notFoundHome: "Ir para a lista de ferramentas",
    chooseFile: "Escolher arquivos",
    download: "Baixar",
    clear: "Limpar",
    downloadAll: "Baixar tudo",
    workerUnsupportedTitle:
      "Este navegador não consegue executar esta ferramenta.",
    workerUnsupportedHint:
      "Abra em uma versão recente do Chrome, Edge, Firefox ou Safari com suporte a Web Workers.",
  },

  mediaErrors: {
    unsupportedContainer:
      "Este arquivo não é um MP4 ou MOV que consigamos abrir",
    noAudioTrack: "Este arquivo não tem som para extrair",
    noVideoTrack: "Este arquivo não tem faixa de vídeo",
    unsupportedCodec: "Este navegador não consegue decodificar este vídeo",
    badRange: "O fim precisa vir depois do início",
    tooLarge: "Isso passa de 512 MB",
    decodeFailed: "Não foi possível ler o vídeo até o fim",
    encodeFailed: "Este navegador não conseguiu codificar o resultado",
    generic: "Algo deu errado",
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
    "image-compress": "Comprimir imagem",
    "image-resize": "Redimensionar e cortar",
    "video-convert": "Conversor de vídeo",
    "video-compress": "Comprimir vídeo",
    "video-trim": "Cortar vídeo",
    "video-to-gif": "Vídeo para GIF",
    "audio-extract": "Extrair áudio",
    "pdf-merge": "Juntar PDF",
    "pdf-split": "Dividir PDF",
    "pdf-organize": "Girar e apagar páginas",
    "pdf-compress": "Comprimir PDF",
    ocr: "Imagem para texto",
    "data-query": "Consulta CSV e Parquet",
    subtitles: "Gerar legendas",
    "subtitle-translate": "Traduzir legendas",
    "remove-bg": "Remover fundo",
    cutout: "Recorte com um clique",
    upscale: "Ampliar imagem",
    stems: "Separar faixas",
    summarize: "Resumo de documentos",
  },

  tools: {
    "image-convert": {
      blurb:
        "HEIC, PNG, JPG, WebP e AVIF em qualquer direção. Comprima e redimensione de uma vez.",
      metaTitle: "Conversor de imagens — HEIC, PNG, JPG, WebP",
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
        animatedNote:
          "Esta imagem é animada. Apenas o primeiro quadro é mantido — a animação se perde.",
        unsupportedTitle: "Este navegador não consegue converter imagens.",
        unsupportedHint:
          "Abra em uma versão recente do Chrome, Edge, Firefox ou Safari 17+ com suporte a OffscreenCanvas.",
        dropLabel: "Solte suas imagens aqui",
        dropHint:
          "HEIC · PNG · JPG · WebP · AVIF · GIF · BMP — várias de uma vez",
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
      blurb:
        "Vários PDFs em um só, na ordem que você quiser. As páginas são copiadas, nunca re-renderizadas.",
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
      blurb:
        "Tire as páginas que quiser ou separe cada página em seu próprio PDF dentro de um ZIP.",
      metaTitle: "Dividir PDF — extrair ou separar páginas",
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

    "pdf-organize": {
      blurb:
        "Veja todas as páginas, endireite as que saíram deitadas e tire as que sobram.",
      metaTitle: "Girar PDF e apagar páginas no navegador",
      metaDescription:
        "Endireite páginas digitalizadas de lado e remova as que você não precisa. Cada página aparece em miniatura. Tudo no navegador, sem enviar nada e sem cadastro.",
      h1: "Girar PDF e apagar páginas",
      lead: "Todas as páginas aparecem como miniaturas. Gire as que saíram deitadas, tire as em branco e salve o que restar.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. Tanto as miniaturas quanto o arquivo salvo são feitos dentro desta aba, e o PDF escolhido nunca é enviado pela rede. Ao fechar a aba, ele some.",
        },
        {
          q: "O digitalizado já vem girado. Girar vai estragar?",
          a: "Não. O giro é somado ao que a página já trazia, então o que você vê na miniatura é o que recebe. Scanners costumam gravar um giro próprio, e sobrescrevê-lo é justamente o que faz as páginas saírem ao contrário.",
        },
        {
          q: "Girar re-renderiza a página?",
          a: "Não. Só é gravada uma marca de rotação; o conteúdo é copiado intacto. Texto continua texto e as imagens mantêm a resolução. Nada fica borrado nem é recomprimido.",
        },
        {
          q: "Dá para recuperar uma página apagada?",
          a: "Dá, enquanto você não sair. Apagar apenas marca a página: aperte ↩ nela, ou desfaça tudo, para trazê-la de volta. O arquivo original no seu disco nunca é alterado.",
        },
      ],
      ui: {
        dropLabel: "Solte um PDF aqui",
        dropHint:
          "Um de cada vez — todas as páginas aparecem para você escolher",
        rendering: "desenhando as prévias…",
        pageCount: "{n} páginas",
        gridLabel: "Páginas",
        pageAlt: "Página {n}",
        rotateLeft: "Girar a página {n} para a esquerda",
        rotateRight: "Girar a página {n} para a direita",
        removePage: "Apagar a página {n}",
        restorePage: "Recuperar a página {n}",
        rotateAll: "Girar todas para a direita",
        resetAll: "Desfazer tudo",
        save: "Salvar {n} páginas",
        saving: "Salvando…",
        needOne: "Pelo menos uma página precisa ficar",
        outputName: "{stem}-editado.pdf",
        resultDetail: "{pages} páginas · {size}",
      },
    },

    "pdf-compress": {
      blurb:
        "Recomprime as fotos de dentro do PDF. O texto continua texto — nada é achatado.",
      metaTitle: "Comprimir PDF sem perder o texto",
      metaDescription:
        "Diminua um PDF recomprimindo as fotos que ele carrega. O texto continua selecionável e pesquisável. Tudo no navegador, sem enviar nada e sem cadastro.",
      h1: "Comprimir PDF",
      lead: "Diminui um PDF recomprimindo as fotos de dentro dele. O texto fica intocado, então continua dando para selecionar e pesquisar.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. A compressão acontece dentro desta aba e o PDF escolhido nunca é enviado pela rede. Ao fechar a aba, ele some.",
        },
        {
          q: "O texto fica borrado?",
          a: "Não. Só as fotos são recodificadas; texto e desenhos vetoriais são copiados intactos. Muitos compressores achatam cada página numa única imagem — encolhe mais, mas seu texto deixa de ser texto e não dá mais para selecionar, pesquisar nem ler em voz alta. Não fazemos isso.",
        },
        {
          q: "Por que quase não diminuiu?",
          a: "Porque havia pouco a espremer. Um PDF só de texto já é pequeno, e fotos bem salvas desde o início não encolhem muito mais sem estrago visível. Quando é o caso, avisamos, em vez de devolver um arquivo do mesmo tamanho e chamar de comprimido.",
        },
        {
          q: "Qual qualidade devo usar?",
          a: "Perto de 70 vai bem para documentos que serão lidos na tela. Baixe mais para rascunhos que você só vai mandar por e-mail; mantenha alta e deixe a resolução intacta se as fotos importam.",
        },
      ],
      ui: {
        dropLabel: "Solte um PDF aqui",
        dropHint: "Um de cada vez — as fotos de dentro são recomprimidas",
        reading: "lendo…",
        pageCount: "{n} páginas",
        qualityLabel: "Qualidade das fotos {value}",
        qualityAria: "Qualidade das fotos",
        sizeLabel: "Resolução das fotos",
        sizeOriginal: "Manter a resolução original",
        sizeMax: "Lado maior {px} px",
        run: "Comprimir",
        working: "Comprimindo…",
        outputName: "{stem}-comprimido.pdf",
        rewroteImages: "Recomprimimos {n} de {total} fotos",
        keepOriginal:
          "Fique com o arquivo que você já tem — este não ficaria menor.",
        noImages: "Este PDF não tem fotos para recomprimir.",
        alreadySmall:
          "As fotos já estavam bem comprimidas — não deu para diminuir mais.",
      },
    },

    "data-query": {
      blurb:
        "Roda SQL sobre um CSV ou Parquet. O arquivo não sai do seu aparelho.",
      metaTitle: "Consultas SQL em CSV e Parquet",
      metaDescription:
        "Abra um arquivo CSV ou Parquet e consulte com SQL. Com DuckDB dentro do navegador: sem envio, sem cadastro e sem limite de linhas.",
      h1: "Consulta de CSV e Parquet (SQL)",
      lead: "Abre um arquivo CSV ou Parquet e deixa você consultar com SQL de verdade. O DuckDB roda nesta aba, então o arquivo nunca é enviado.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. O DuckDB recebe apenas uma referência ao arquivo e lê direto do seu disco. Nada é enviado. O que é baixado é o próprio motor DuckDB, de uma CDN pública — esse tráfego vai no sentido contrário.",
        },
        {
          q: "Por que ele baixa cerca de 6MB antes?",
          a: "Porque o DuckDB é um banco de dados analítico de verdade compilado para WebAssembly. São 35MB descompactados e cerca de 6MB na rede. Buscamos no momento em que você aperta o botão e não antes, e o navegador guarda depois.",
        },
        {
          q: "Qual o tamanho de arquivo que aguenta?",
          a: "Maior do que você imagina, principalmente em Parquet. O arquivo não é carregado inteiro na memória — o DuckDB lê só as partes que a consulta precisa, então consultar duas colunas de um Parquet largo quase não lê nada. Um CSV precisa ser percorrido, então é mais lento.",
        },
        {
          q: "Que SQL posso escrever?",
          a: "O dialeto do DuckDB, bem próximo do PostgreSQL. Seu arquivo fica disponível como a tabela `data`, então `SELECT * FROM data LIMIT 50` é o ponto de partida. Joins, funções de janela, agregações e CTEs funcionam. Os erros voltam com as palavras do próprio DuckDB para você corrigir.",
        },
        {
          q: "Ele mostra todas as linhas?",
          a: "A tabela na tela para em 200 linhas para a página continuar utilizável, e avisa quando faz isso. A consulta em si não tem limite, e o CSV baixado contém todas as linhas exibidas.",
        },
      ],
      ui: {
        dropLabel: "Solte um CSV ou Parquet aqui",
        dropHint: "CSV · TSV · Parquet · JSON — um por vez",
        downloadNote: "Abrir o arquivo baixa o motor DuckDB, cerca de {size}.",
        localNote: "O arquivo em si não é enviado — o DuckDB lê do seu disco.",
        open: "Abrir e consultar",
        opening: "Abrindo…",
        rowCount: "{rows} linhas",
        columnCount: "{columns} colunas",
        schemaLabel: "Colunas",
        sqlLabel: "SQL",
        sqlHint: "Seu arquivo é a tabela `data`.",
        run: "Executar",
        running: "Executando…",
        resultSummary: "{rows} linhas · {ms}ms",
        showingFirst: "mostrando as primeiras {n}",
        noRows: "Esta consulta não retornou linhas.",
        downloadCsv: "Baixar CSV",
        errEngine: "Não foi possível carregar o motor DuckDB",
        errFormat:
          "Não dá para abrir este tipo de arquivo — CSV, TSV, Parquet ou JSON",
        errRead: "Não foi possível ler o arquivo",
      },
    },

    ocr: {
      blurb:
        "Tira o texto de uma foto, captura de tela ou PDF digitalizado. Nada é enviado.",
      metaTitle: "Imagem e PDF para texto (OCR) no navegador",
      metaDescription:
        "Extraia o texto de uma foto, captura de tela ou PDF digitalizado sem enviá-lo. Sete idiomas, tudo no seu navegador e sem cadastro.",
      h1: "Imagem e PDF para texto (OCR)",
      lead: "Lê as palavras de uma imagem ou de um PDF digitalizado e devolve texto simples que você pode copiar. O reconhecimento acontece no seu aparelho.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. A imagem é lida dentro desta aba do navegador e nunca é enviada. A única coisa que trafega é o motor de reconhecimento, que desce de uma CDN pública — o sentido é o contrário.",
        },
        {
          q: "Por que ele baixa alguns megabytes antes de começar?",
          a: "Porque o OCR precisa de um motor de verdade e de um modelo treinado no idioma escolhido. Juntos dão cerca de 4 a 6MB. Buscamos no momento em que você aperta o botão e não antes, e o seu navegador guarda depois, então o segundo documento começa na hora.",
        },
        {
          q: "Por que o texto não sai perfeito?",
          a: "Usamos os modelos compactos, que são de cinco a dez vezes menores que os precisos (inglês: 2MB contra 11MB; japonês: 1,5MB contra 16MB). Em uma digitalização limpa a diferença é pequena; em uma foto tremida ela aparece. Preferimos não fazer você baixar 16MB para descobrir isso. Deixe a página reta e com boa luz e melhora bastante.",
        },
        {
          q: "Ele lê PDF?",
          a: "Sim, até 30 páginas por vez. Cada página é desenhada como imagem antes de ser lida. Se o PDF já tem texto de verdade, copiar de qualquer leitor será mais rápido e exato — o OCR é para os que são só fotos de papel.",
        },
        {
          q: "O layout é preservado?",
          a: "Não. Você recebe as palavras na ordem de leitura, não colunas, tabelas ou títulos. Se o layout importa mais que as palavras, esta não é a ferramenta.",
        },
      ],
      ui: {
        dropLabel: "Solte uma imagem ou PDF aqui",
        dropHint: "PNG · JPG · WebP · PDF — um por vez",
        pdfLimit: "até {max} páginas",
        languageLabel: "Idioma do documento",
        downloadNote:
          "Ao apertar o botão são baixados cerca de {size} de motor e dados de idioma.",
        cachedNote:
          "Isso acontece uma vez e o navegador guarda — o próximo documento começa direto.",
        run: "Ler o texto",
        working: "Lendo…",
        stageEngine: "preparando o motor {percent}%",
        stageRendering: "desenhando página {done}/{total}",
        stageReading: "lendo página {page}/{pages}",
        resultSummary: "{pages} página(s) · confiança {confidence}%",
        copy: "Copiar",
        copied: "Copiado",
        resultLabel: "Texto reconhecido",
        truncated:
          "Este documento tem {total} páginas; apenas as {max} primeiras foram lidas.",
        nothingFound: "Nenhum texto foi encontrado nesta imagem.",
        lowConfidence:
          "A confiança está baixa — confira com o original. A causa mais comum é o idioma do documento selecionado acima não ser o real.",
        errEngine: "Não foi possível carregar o motor de OCR",
        errTooManyPages: "Só é possível ler {max} páginas por vez",
        languages: {
          eng: "Inglês",
          kor: "Coreano",
          jpn: "Japonês",
          spa: "Espanhol",
          deu: "Alemão",
          por: "Português",
          chi_sim: "Chinês simplificado",
        },
      },
    },

    "image-compress": {
      blurb:
        "Deixa as fotos mais leves sem mudar o formato. Você vê quanto cada arquivo economizou.",
      metaTitle: "Comprimir imagens — JPG, PNG, WebP",
      metaDescription:
        "Deixe suas fotos mais leves no navegador sem enviá-las. Mantém o formato original e mostra quanto cada arquivo economizou. Sem cadastro nem limite.",
      h1: "Comprimir imagens",
      lead: "Deixa os arquivos de imagem menores e devolve no formato em que entraram. Você vê a economia de cada arquivo antes de baixar.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. A compressão roda dentro desta aba e suas imagens nunca saem pela rede. Ao fechar a aba, acabou.",
        },
        {
          q: "Por que meu PNG não diminuiu?",
          a: "Porque PNG é sem perdas: o controle de qualidade não tem o que ceder. Para reduzir um PNG é preciso diminuir os pixels ou passar para WebP, que costuma pesar de 60 a 80% menos com a mesma qualidade visível. As duas opções estão aqui.",
        },
        {
          q: "Qual qualidade escolher?",
          a: "75 é um bom ponto de partida para fotos que vão para a web; quase ninguém distingue do original. Abaixo de 50 as bordas começam a borrar. Cada arquivo mostra o antes e o depois, então teste um e olhe.",
        },
        {
          q: "Ele mantém meu formato?",
          a: "Sim, por padrão. Um JPG volta como JPG e encaixa onde já era usado. Dá para mudar se preferir WebP.",
        },
        {
          q: "Os EXIF são mantidos?",
          a: "Não. A recodificação descarta os metadados, inclusive as coordenadas de GPS que os celulares gravam. Para fotos que vão para a internet, normalmente é o que se quer.",
        },
      ],
      ui: {
        dropLabel: "Solte suas imagens aqui",
        dropHint: "JPG · PNG · WebP · HEIC — várias de uma vez",
        qualityLabel: "Qualidade {value}",
        sizeLabel: "Tamanho",
        sizeOriginal: "Manter o tamanho original",
        sizeMax: "Lado maior {px}px",
        formatLabel: "Saída",
        formatKeep: "Manter o formato original",
        keptNote: "já está o menor possível — mantivemos o original",
        losslessNote:
          "PNG é sem perdas, então a qualidade não vai reduzi-lo. Diminua o tamanho ou mude a saída para WebP.",
        run: "Comprimir {n} arquivo(s)",
        working: "Comprimindo…",
        total: "{n} arquivos · {before} → {after} ({percent}% menor)",
        errUnsupportedInput: "Este navegador não consegue ler esse formato",
        errGeneric: "A compressão falhou",
      },
    },

    "image-resize": {
      blurb:
        "Ajusta a largura das fotos e corta em quadrado, 4:5 ou 16:9. Nada é enviado.",
      metaTitle: "Redimensionar e cortar imagens — 1:1, 4:5",
      metaDescription:
        "Ajuste uma foto à largura exata e corte em quadrado ou 4:5 para redes. Tudo no navegador, sem envio, sem cadastro e sem marca d'água.",
      h1: "Redimensionar e cortar imagens",
      lead: "Coloca a foto na largura que você quiser e, se escolher uma proporção, corta o maior retângulo centralizado que se encaixa. Você vê o tamanho final antes de apertar.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. O redimensionamento acontece dentro desta aba e suas imagens nunca saem pela rede. Ao fechar a aba, acabou.",
        },
        {
          q: "Como funciona o corte?",
          a: "Você escolhe uma proporção e pegamos o maior retângulo daquele formato a partir do centro da imagem. É o certo para formatos de redes sociais — quadrado para o feed, 4:5 para um post vertical. Se precisa decidir exatamente qual parte manter, um editor é a ferramenta; preferimos fazer bem uma coisa previsível.",
        },
        {
          q: "Ele amplia uma imagem pequena?",
          a: "Não. Se pedir uma largura maior do que a imagem tem, você a recebe no tamanho original e avisamos. Inventar pixels só deixa embaçado enquanto o número na tela sobe, o que parece melhora e não é.",
        },
        {
          q: "O tamanho mostrado bate com o arquivo?",
          a: "Exatamente. A tela e o worker chamam a mesma função para calcular, então não têm como divergir.",
        },
        {
          q: "Qual formato sai?",
          a: "O mesmo que você colocou, a menos que mude. HEIC é a exceção: navegadores leem mas não escrevem, então sai como JPG.",
        },
      ],
      ui: {
        dropLabel: "Solte suas imagens aqui",
        dropHint: "JPG · PNG · WebP · HEIC — várias de uma vez",
        widthLabel: "Largura (px)",
        cropLabel: "Cortar em",
        cropNone: "Manter a proporção original",
        qualityLabel: "Qualidade {value}",
        formatLabel: "Saída",
        formatKeep: "Manter o formato original",
        preview: "{from} → {to}",
        noUpscale: "não foi ampliada",
        run: "Processar {n} arquivo(s)",
        working: "Processando…",
        errUnsupportedInput: "Este navegador não consegue ler esse formato",
        errGeneric: "O processamento falhou",
      },
    },

    "video-convert": {
      blurb:
        "De MOV para MP4 sem recodificar, ou de MP4 para WebM. Nada é enviado.",
      metaTitle: "Converter MOV para MP4 e MP4 para WebM",
      metaDescription:
        "Converta MOV para MP4 sem recodificar, ou MP4 para WebM com VP9 e Opus. Tudo no seu navegador: sem envio, sem cadastro e sem limite de tamanho.",
      h1: "Conversor de vídeo",
      lead: "Coloca seu vídeo em outro contêiner. MP4 mantém os codecs como estão; WebM recodifica a imagem em VP9 e o som em Opus.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. O vídeo é lido e reescrito dentro desta aba do navegador e nada é enviado. Ao fechar a aba, acabou.",
        },
        {
          q: "Por que MOV para MP4 termina quase na hora?",
          a: "Porque .mov e .mp4 são a mesma caixa com outro rótulo. Um .mov de iPhone já traz vídeo H.264 ou HEVC e som AAC, e tudo isso cabe igual em um MP4. Então copiamos as faixas intactas e só reescrevemos o invólucro. Nada é decodificado, então nada se perde.",
        },
        {
          q: "Por que WebM demora tanto mais?",
          a: "Porque WebM não aceita H.264 nem AAC. Cada quadro precisa ser decodificado e codificado de novo como VP9, e o som como Opus. Isso é trabalho de verdade: conte com um tempo proporcional à duração do clipe e com uma pequena perda de qualidade, como em qualquer recodificação.",
        },
        {
          q: "Posso converter um WebM, AVI ou MKV para MP4?",
          a: "Não. Abrimos o contêiner nós mesmos em vez de mandar um kit de mídia de 30MB para o seu navegador, e o que sabemos abrir é MP4, MOV e M4V. Preferimos deixar esses formatos fora da lista a aceitar o arquivo e falhar nele.",
        },
        {
          q: "A qualidade cai?",
          a: "No caminho MP4 não — ali nenhum quadro é recodificado. No caminho WebM cai, porque recodificar sempre custa algo. Escolha a qualidade que preferir; a ferramenta diz em qual caminho você está antes de apertar o botão.",
        },
      ],
      ui: {
        dropLabel: "Solte um vídeo aqui",
        dropHint: "MP4 · MOV · M4V — um por vez",
        reading: "lendo…",
        seconds: "s",
        noAudio: "sem som",
        targetLabel: "Converter para",
        targetMp4: "MP4",
        targetWebm: "WebM",
        mp4Note:
          "Os codecs não são tocados: só o contêiner é reescrito. Nada se perde e leva segundos.",
        webmNote:
          "H.264 não cabe em um WebM, então a imagem é recodificada em VP9 e o som em Opus. Demora um pouco e custa alguma qualidade.",
        alreadyMp4:
          "Este arquivo já é um MP4 — converter apenas reescreveria o contêiner.",
        mp4Unavailable:
          "O codec deste vídeo não pode ser copiado como está para um MP4.",
        webmUnavailable:
          "Este navegador não consegue codificar WebM. MP4 continua funcionando.",
        sizeLabel: "Tamanho",
        sizeOriginal: "Manter o tamanho original",
        sizeMax: "Lado maior {px}px",
        qualityLabel: "Qualidade",
        qualityHigh: "Alta — arquivo maior",
        qualityBalanced: "Equilibrada",
        qualitySmall: "Pequena — menos qualidade",
        run: "Converter para {format}",
        working: "Convertendo…",
        outputNameMp4: "{stem}.mp4",
        outputNameWebm: "{stem}.webm",
        resultLossless: "Nada foi recodificado.",
        resultReencoded: "A imagem foi recodificada em VP9.",
        audioKept: "O som veio junto.",
        audioDropped: "O som não pôde ser transportado.",
      },
    },

    "video-compress": {
      blurb:
        "Diminui um MP4 no navegador. Sem baixar 30MB de ferramentas — seu aparelho faz o trabalho.",
      metaTitle: "Comprimir vídeo — diminua um MP4 no navegador",
      metaDescription:
        "Deixe um MP4 menor sem enviá-lo. Roda no seu aparelho com o codificador de vídeo do navegador: nada para instalar e nada sai da sua máquina.",
      h1: "Comprimir vídeo",
      lead: "Recodifica a imagem com bitrate menor e deixa o som exatamente como estava. Tudo acontece no seu aparelho.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. Tudo acontece dentro desta aba usando o codificador de vídeo do seu aparelho. O arquivo nunca é enviado — e em vídeo isso pesa mais do que em qualquer outro lugar: costumam ser os arquivos maiores e mais pessoais.",
        },
        {
          q: "Por que o som não é mexido?",
          a: "Porque recodificar só pioraria. O áudio é copiado como está, sem perdas e mais rápido. Só a imagem é recodificada.",
        },
        {
          q: "Quais arquivos posso usar?",
          a: "MP4 e MOV. Lemos o contêiner por conta própria em vez de entregar 30MB de ferramentas, e esse é o limite honesto do que conseguimos abrir hoje. Por isso AVI e MKV não são oferecidos, em vez de aceitos e depois falharem.",
        },
        {
          q: "Por que meu navegador diz que não consegue?",
          a: "Codificar vídeo precisa de WebCodecs, que navegadores antigos não têm. Chrome e Edge desde 2021, Safari desde 16.4, Firefox desde 130. Antes de oferecer a ferramenta, perguntamos ao seu navegador se ele realmente consegue codificar H.264.",
        },
      ],
      ui: {
        unsupportedTitle: "Este navegador não consegue comprimir vídeo.",
        unsupportedHint:
          "Codificar vídeo precisa de WebCodecs — tente um Chrome ou Edge recente, Safari 16.4+ ou Firefox 130+.",
        dropLabel: "Solte um vídeo aqui",
        dropHint: "MP4 e MOV — um de cada vez",
        reading: "lendo…",
        seconds: " s",
        noAudio: "sem som",
        qualityLabel: "Qualidade",
        quality: {
          high: "Alta",
          balanced: "Equilibrada",
          small: "O menor possível",
        },
        sizeLabel: "Resolução",
        sizeOriginal: "Manter a resolução original",
        sizeMax: "Lado maior {px} px",
        run: "Comprimir",
        working: "Comprimindo…",
        outputName: "{stem}-comprimido.mp4",
        audioKept: "O som foi copiado sem alteração.",
        didNotShrink:
          "Não ficou menor — o original já era eficiente. Tente qualidade ou resolução menor.",
      },
    },

    "video-trim": {
      blurb:
        "Corte um trecho do vídeo sem recodificar. Nada se perde e leva segundos.",
      metaTitle: "Cortar vídeo — recorte um MP4 no navegador",
      metaDescription:
        "Corte um trecho de um MP4 ou MOV sem enviá-lo. Nada é recodificado, então a qualidade fica intacta e termina em segundos. Tudo no seu navegador.",
      h1: "Cortar vídeo",
      lead: "Tira um trecho do vídeo e copia do jeito que está — sem recodificar, então a qualidade é exatamente a original.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. O vídeo é lido e reescrito dentro desta aba do navegador, e nada é enviado. Ao fechar a aba, acabou.",
        },
        {
          q: "Por que começa um pouco antes do que pedi?",
          a: "Porque um corte só pode cair em um quadro-chave. Quadros-chave são os que se desenham sozinhos; os que ficam entre eles só descrevem o que mudou em relação a um quadro anterior. Cortar no meio faz o primeiro segundo sair quebrado, então movemos o início para o quadro-chave mais próximo antes dele — e avisamos onde é antes de você clicar.",
        },
        {
          q: "Dá para pegar exatamente o segundo que pedi?",
          a: "Só recodificando o começo, o que custa qualidade e tempo. Preferimos mostrar o ponto de corte honesto a fazer essa troca por você em silêncio. Se você precisa de precisão de quadro, um editor completo é a ferramenta certa.",
        },
        {
          q: "A qualidade cai?",
          a: "Não. Nenhum quadro é recodificado — imagem e som são copiados exatamente como estavam. É também por isso que termina quase na hora, mesmo em arquivos grandes.",
        },
        {
          q: "Quais arquivos posso usar?",
          a: "MP4 e MOV. Lemos o contêiner por conta própria em vez de baixar um conjunto de ferramentas de 30 MB, então AVI e MKV não são oferecidos em vez de aceitos e depois falharem.",
        },
      ],
      ui: {
        dropLabel: "Solte um vídeo aqui",
        dropHint: "MP4 e MOV — um de cada vez",
        reading: "lendo…",
        seconds: "s",
        noAudio: "sem som",
        startLabel: "Início (segundos)",
        endLabel: "Fim (segundos)",
        grabHere: "Posição atual",
        snapped:
          "Corta em {actual}s, não em {asked}s — é o quadro-chave mais próximo antes.",
        onKeyframe: "Este início cai exatamente em um quadro-chave.",
        run: "Cortar",
        working: "Cortando…",
        outputName: "{stem}-corte.mp4",
        resultRange: "{from}s → {to}s · {length}s de duração",
        lossless: "Nada foi recodificado.",
        audioKept: "O som veio intacto.",
      },
    },

    "video-to-gif": {
      blurb:
        "Transforma um clipe em GIF em loop. Sem upload — quem trabalha é o seu aparelho.",
      metaTitle: "Vídeo para GIF — de MP4 a GIF no navegador",
      metaDescription:
        "Crie um GIF em loop a partir de um MP4 ou MOV sem enviar nada. Escolha os quadros e o tamanho e veja o resultado antes de salvar. Tudo no navegador.",
      h1: "Vídeo para GIF",
      lead: "Transforma um clipe em GIF em loop. Escolha quão fluido e quão grande ele deve ser — o resto acontece no seu aparelho.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. O vídeo é decodificado e o GIF é montado dentro desta aba do navegador. Nada é enviado, e fechar a aba é toda a limpeza necessária.",
        },
        {
          q: "Por que o GIF ficou maior que o vídeo?",
          a: "Porque GIF é um formato de 1987 que guarda cada quadro inteiro com uma paleta de no máximo 256 cores e não comprime movimento. Um codec de vídeo olha o que mudou entre os quadros; o GIF quase não faz isso. É normal que fique várias vezes maior que o MP4 de origem — é o formato, não a ferramenta.",
        },
        {
          q: "Por que a taxa de quadros sai um pouco diferente?",
          a: "O GIF guarda o intervalo de cada quadro em centésimos de segundo, então só algumas taxas podem ser escritas exatamente. 20, 10 e 5 fps caem certinho; 15 fps vira 7/100 s, que reproduz a 14,3. Mostramos o número real em vez do que você pediu.",
        },
        {
          q: "Que duração posso usar?",
          a: "Até 400 quadros — 20 segundos a 20 fps ou 40 a 10 fps. Acima disso o GIF chega a dezenas de megabytes e o navegador começa a sofrer, então preferimos parar a entregar algo inutilizável. Baixe a taxa de quadros para caber um clipe mais longo.",
        },
        {
          q: "Quais arquivos posso usar?",
          a: "MP4 e MOV. Lemos o contêiner por conta própria em vez de baixar um conjunto de ferramentas de 30 MB, então AVI e MKV não são oferecidos em vez de aceitos e depois falharem.",
        },
      ],
      ui: {
        unsupportedTitle:
          "Este navegador não consegue criar GIF a partir de vídeo.",
        unsupportedHint:
          "Ler o vídeo exige WebCodecs — tente um Chrome ou Edge atualizado, Safari 16.4+ ou Firefox 130+.",
        dropLabel: "Solte um vídeo aqui",
        dropHint: "MP4 e MOV — um de cada vez",
        reading: "lendo…",
        seconds: "s",
        fpsLabel: "Quadros por segundo",
        fpsOption: "{n} fps",
        fpsActual: "na prática {n} fps",
        sizeLabel: "Tamanho",
        sizeOriginal: "Manter o tamanho original",
        sizeMax: "Lado maior {px}px",
        framesEstimate: "cerca de {n} quadros",
        tooManyFrames:
          "Passa de {max} quadros. Escolha menos quadros por segundo — um GIF desse tamanho ficaria enorme.",
        run: "Criar GIF",
        working: "Criando…",
        outputName: "{stem}.gif",
        resultFrames: "{n} quadros · {fps} fps",
        truncated:
          "Só couberam os primeiros {n} quadros, então o final do clipe ficou de fora.",
        biggerNote:
          "O GIF ficou maior que o vídeo. Isso é normal — GIF não comprime movimento.",
        previewAlt: "O GIF recém-criado",
      },
    },

    "audio-extract": {
      blurb:
        "Tira o som de um vídeo. Nada é recodificado, então nada se perde.",
      metaTitle: "Extrair áudio de vídeo — de MP4 para M4A ou WAV",
      metaDescription:
        "Tire a trilha sonora de um MP4 ou MOV sem enviá-lo. Guarde sem perdas em M4A ou leve um WAV que abre em qualquer lugar. Roda inteiramente no navegador.",
      h1: "Extrair áudio de vídeo",
      lead: "Tira a trilha sonora de um vídeo. Nenhuma das opções recodifica o som, então nada se perde no caminho.",
      faq: [
        {
          q: "Para onde vão meus arquivos?",
          a: "Para lugar nenhum. A extração acontece dentro desta aba e o vídeo nunca é enviado. Ao fechar a aba, ele some.",
        },
        {
          q: "M4A ou WAV?",
          a: "M4A se você só quer o áudio: levanta a faixa original intacta, idêntica à que estava no vídeo e pequena. WAV se algo adiante precisar de PCM puro — editores e programas antigos costumam precisar. O WAV é bem maior porque não é comprimido.",
        },
        {
          q: "A qualidade do som cai?",
          a: "Não. O M4A copia o áudio original exatamente como estava, bit a bit. O WAV o devolve a amostras cruas, o que também é sem perdas em relação ao que o vídeo continha. Nenhum dos caminhos recomprime o som.",
        },
        {
          q: "Dá para gerar MP3?",
          a: "Hoje não. Navegadores decodificam MP3 mas não criam, e não vamos entregar um codificador de 30MB só por isso. O M4A cumpre o mesmo papel — comprimido, pequeno, aceito em todo lugar — e sai direto do seu arquivo sem custo de qualidade.",
        },
      ],
      ui: {
        unsupportedTitle: "Este navegador não consegue extrair áudio.",
        unsupportedHint:
          "Isso precisa de WebCodecs — tente um Chrome ou Edge recente, Safari 16.4+ ou Firefox 130+.",
        dropLabel: "Solte um vídeo aqui",
        dropHint: "MP4 e MOV — um de cada vez",
        reading: "lendo…",
        seconds: " s",
        channels: "{n} canais",
        formatM4a: "M4A — mantém o original",
        formatM4aHint:
          "Levanta a faixa intacta. Pequena e idêntica ao áudio do vídeo.",
        formatWav: "WAV — abre em qualquer lugar",
        formatWavHint:
          "PCM sem compressão para editores e programas antigos. Bem maior.",
        run: "Extrair áudio",
        working: "Extraindo…",
        outputNameM4a: "{stem}.m4a",
        outputNameWav: "{stem}.wav",
        losslessNote: "idêntico à faixa original",
      },
    },
    "remove-bg": {
      blurb: "Recorta o fundo de uma foto. O modelo roda no seu dispositivo.",
      metaTitle: "Remover fundo — no seu navegador",
      metaDescription:
        "Remova o fundo de uma foto sem enviá-la. Um modelo aberto Apache-2.0 roda no seu navegador e devolve um PNG transparente. Sem cadastro.",
      h1: "Remover o fundo de uma imagem",
      lead: "Separa o objeto de tudo o que está atrás e devolve um PNG transparente. O modelo é baixado para o seu dispositivo e roda ali — a foto não sai desta aba.",
      faq: [
        {
          q: "Para onde vai a minha foto?",
          a: "Para lugar nenhum. Ela é aberta dentro desta aba e nunca é enviada. O tráfego vai no sentido contrário: o modelo desce até você. É essa a troca — você baixa alguns megabytes uma vez em vez de entregar a sua foto toda vez.",
        },
        {
          q: "Por que ele baixa algo antes de começar?",
          a: "Porque quem faz a separação é uma rede neural, e para rodar no seu dispositivo ela precisa estar no seu dispositivo. O modelo compacto tem cerca de 4MB, o preciso cerca de 168MB, mais 5MB de motor. Nada é baixado antes de você apertar o botão, e depois o seu navegador guarda.",
        },
        {
          q: "Qual modelo devo escolher?",
          a: "Comece pelo compacto. Ele é 40 vezes menor e basta quando o objeto é nítido e o fundo é simples. O grande segura cabelo, pelo e alças finas que o compacto perde. Os dois são U²-Net, publicado pela Universidade de Alberta sob Apache-2.0. Não usamos o famoso RMBG-1.4 porque a licença dele proíbe uso comercial.",
        },
        {
          q: "Por que as bordas ficam moles?",
          a: "O modelo olha uma versão 320×320 da sua foto, então a máscara que ele devolve também é 320×320 e precisa ser esticada de volta ao tamanho original. Numa foto de 4000px esse esticamento aparece no contorno. Isto é um recorte, não uma máscara feita à mão — para impressão, vale retocar a borda.",
        },
        {
          q: "Precisa de um navegador específico?",
          a: "Não. Ele usa WebGPU quando o seu navegador tem, o que é bem mais rápido, e cai para a CPU quando não tem. Escrevemos embaixo do resultado qual dos dois realmente rodou, para você nunca ficar adivinhando por que demorou o que demorou.",
        },
      ],
      ui: {
        dropLabel: "Solte uma foto aqui",
        dropHint: "PNG · JPG · WebP — uma por vez",
        modelLabel: "Modelo",
        modelFast: "Compacto — {size}, contorno mais grosso",
        modelFine: "Preciso — {size}, mantém o cabelo",
        backgroundLabel: "Atrás do objeto",
        backgroundTransparent: "Transparente",
        backgroundWhite: "Branco",
        backgroundBlack: "Preto",
        downloadNote:
          "Apertar o botão baixa cerca de {size} de motor e modelo.",
        cachedNote:
          "É baixado uma vez e o seu navegador guarda — a próxima foto começa na hora.",
        run: "Remover o fundo",
        working: "Processando…",
        stageEngine: "carregando o motor…",
        stageModel: "baixando o modelo {percent}%",
        stageMatting: "separando o objeto…",
        resultAlt: "A foto com o fundo removido",
        runtimeWebgpu: "processado na GPU",
        runtimeWasm: "processado na CPU",
        unsureNote:
          "O modelo não teve certeza: boa parte do que ele manteve está apenas semitransparente, então o recorte vai parecer um fantasma. Experimente a ferramenta de recorte por clique, que deixa você apontar o objeto que quer.",
        nothingFound:
          "O modelo não encontrou um objeto claro aqui, então quase tudo foi recortado. Um fundo mais simples ajuda.",
        errEngine: "Não foi possível carregar o motor",
        errModel: "Não foi possível baixar o modelo",
        errUnsupportedInput: "Não foi possível ler esta imagem",
        errGeneric: "Não foi possível remover o fundo",
      },
    },
    upscale: {
      blurb:
        "Amplia uma imagem pequena sem ela ficar borrada. Roda no seu dispositivo.",
      metaTitle: "Ampliar imagem 4× — no navegador",
      metaDescription:
        "Amplie uma foto 2× ou 4× sem enviá-la. Um modelo Real-ESRGAN com licença BSD roda no seu navegador e mantém as bordas nítidas. Sem cadastro.",
      h1: "Ampliar uma imagem",
      lead: "Aumenta uma imagem pequena e reconstrói o detalhe em vez de só esticar. O modelo é baixado para o seu dispositivo e roda ali — a imagem não sai desta aba.",
      faq: [
        {
          q: "Para onde vai a minha imagem?",
          a: "Para lugar nenhum. Ela é aberta dentro desta aba e nunca é enviada. O tráfego vai no sentido contrário: o modelo desce até você uma vez e o seu navegador guarda.",
        },
        {
          q: "Qual a diferença para simplesmente redimensionar?",
          a: "Redimensionar espalha os pixels que já existem, então ampliar 4× fica quatro vezes mais borrado. Aqui roda uma rede treinada com milhões de pares antes-e-depois, que inventa bordas e textura plausíveis. É um bom palpite, não uma verdade recuperada — ela não lê uma placa que nunca esteve no arquivo.",
        },
        {
          q: "Por que existe um limite de tamanho?",
          a: "Porque 4× significa dezesseis vezes mais pixels. Uma foto de um megapixel sai com dezesseis, o que já são 64MB de imagem na memória, e o trabalho cresce junto. Preferimos parar em um megapixel de entrada a congelar a sua aba por vários minutos e não entregar nada.",
        },
        {
          q: "Por que está lento na minha máquina?",
          a: "Porque o seu navegador não tem WebGPU e cai para a CPU. Esse caminho roda até o fim — só que bem mais devagar, mais ou menos um minuto por megapixel. Dizemos qual será antes de você apertar, e escrevemos qual realmente rodou ao lado do resultado.",
        },
        {
          q: "Se o modelo é 4×, como funciona o 2×?",
          a: "Rodamos o modelo de 4× e depois reduzimos o resultado à metade. Sai melhor do que ampliar por dois direto: o detalhe que o modelo inventa se organiza ao encolher. Demora o mesmo que 4×, porque o trabalho anterior é o mesmo.",
        },
        {
          q: "Por que a foto ficou parecendo cera?",
          a: "Porque este modelo foi treinado para reparar imagens danificadas, então ele remove o que lê como ruído — e grão de filme e textura fina de tecido são lidos como ruído. Numa imagem web comprimida ou numa captura de tela isso é exatamente o que se quer: os blocos somem e as bordas voltam. Num escaneamento de filme com grão, a superfície pode achatar e virar plástico. Medimos os dois contra um redimensionamento comum: num JPEG salvo em qualidade 35 o modelo ganha com folga; num escaneamento de 1896 o redimensionamento comum guardou mais tecido.",
        },
        {
          q: "Que modelo é esse?",
          a: "realesr-general-x4v3, do Real-ESRGAN, sob a licença BSD 3-Clause. Escolhemos ele em vez dos modelos transformer mais nítidos por velocidade: é cerca de sessenta vezes mais rápido na CPU, e essa diferença separa uma ferramenta que funciona sem placa de vídeo de uma que não funciona.",
        },
      ],
      ui: {
        dropLabel: "Solte uma imagem aqui",
        dropHint: "PNG · JPG · WebP — até {max} megapixel",
        scaleLabel: "Ampliar em",
        scaleOption: "{n}×",
        formatLabel: "Salvar como",
        downloadNote:
          "Apertar o botão baixa cerca de {size} de motor e modelo.",
        cachedNote:
          "É baixado uma vez e o seu navegador guarda — a próxima imagem começa na hora.",
        gpuNotice:
          "Seu navegador tem WebGPU, então isto roda na placa de vídeo.",
        cpuNotice:
          "Seu navegador não tem WebGPU, então isto roda na CPU — bem mais devagar.",
        cpuNoticeWithEstimate:
          "Seu navegador não tem WebGPU, então isto roda na CPU — conte com uns {seconds} segundos.",
        preview: "{from} → {to}",
        tooLargeNotice:
          "{from} passa do limite de {max} megapixel. Reduza antes ou use uma imagem menor.",
        run: "Ampliar",
        working: "Processando…",
        stageEngine: "carregando o motor…",
        stageModel: "baixando o modelo {percent}%",
        stageUpscaling: "pedaço {tile} de {tiles}",
        resultAlt: "A imagem ampliada",
        runtimeWebgpu: "processado na GPU",
        runtimeWasm: "processado na CPU",
        tookSeconds: "{seconds}s",
        errEngine: "Não foi possível carregar o motor",
        errModel: "Não foi possível baixar o modelo",
        errUnsupportedInput: "Não foi possível ler esta imagem",
        errTooLarge: "Esta imagem passa do limite de {max} megapixel",
        errGeneric: "Não foi possível ampliar a imagem",
      },
    },
    cutout: {
      blurb:
        "Clique numa coisa da foto e recorte só ela. Roda no seu dispositivo.",
      metaTitle: "Recortar objeto com um clique — navegador",
      metaDescription:
        "Clique em qualquer objeto de uma foto e recorte como PNG transparente. Um modelo SAM Apache-2.0 roda no seu navegador, sem enviar nada. Sem cadastro.",
      h1: "Recortar um objeto com um clique",
      lead: "Aponte o que você quer e ele é separado de todo o resto. Adicione mais pontos para ajustar. O modelo roda no seu dispositivo — a foto não sai desta aba.",
      faq: [
        {
          q: "Qual a diferença para o removedor de fundo?",
          a: "O removedor de fundo decide por você: acha o que julga mais destacado e guarda aquilo. Aqui quem decide é você. Se a foto tem três objetos e você quer o segundo, ou quer a luminária e não a pessoa, esta é a ferramenta. Se há um objeto óbvio, o removedor de fundo é mais rápido porque não precisa de cliques.",
        },
        {
          q: "Para onde vai a minha foto?",
          a: "Para lugar nenhum. Ela é aberta dentro desta aba e nunca é enviada. O modelo desce até você uma vez e o seu navegador guarda.",
        },
        {
          q: "Por que o primeiro clique demora alguns segundos?",
          a: "Não é o clique que demora — a espera vem antes. O modelo lê a imagem inteira uma vez e monta um resumo, e essa é a parte lenta; depois cada clique só consulta esse resumo. Medimos 6 segundos de leitura e um décimo de segundo por clique na CPU. É por isso que o botão diz preparar, e por isso é preciso preparar de novo ao trocar de foto.",
        },
        {
          q: "A seleção pegou demais ou de menos.",
          a: "Adicione outro ponto. Mude para tirar e clique numa parte que não deveria entrar, ou continue em somar e clique em outra parte do mesmo objeto. O modelo devolve três formas candidatas a cada vez e ficamos com a que ele mesmo pontua mais alto — normalmente o segundo ponto resolve.",
        },
        {
          q: "Que modelo é esse?",
          a: "SlimSAM, uma versão comprimida do Segment Anything da Meta, ambos sob Apache-2.0. A comprimida é quinze vezes menor que a original — 9MB contra 359MB —, que é a diferença entre uma ferramenta que começa em segundos e outra que ninguém espera.",
        },
      ],
      ui: {
        dropLabel: "Solte uma foto aqui",
        dropHint: "PNG · JPG · WebP — uma por vez",
        downloadNote:
          "Preparar uma foto baixa cerca de {size} de motor e modelo.",
        cachedNote:
          "É baixado uma vez e o seu navegador guarda — a próxima foto só precisa da leitura.",
        prepare: "Preparar esta foto",
        preparing: "Preparando…",
        stageEngine: "carregando o motor…",
        stageModel: "baixando o modelo {percent}%",
        stageEncoding: "lendo a imagem…",
        clickHint: "Clique no que você quer manter.",
        pointCount: "{n} ponto(s)",
        modeInclude: "Somar",
        modeExclude: "Tirar",
        backgroundLabel: "Atrás",
        backgroundTransparent: "Transparente",
        backgroundWhite: "Branco",
        backgroundBlack: "Preto",
        cut: "Recortar",
        working: "Processando…",
        undo: "Desfazer o último ponto",
        resultAlt: "O objeto recortado da foto",
        runtimeWebgpu: "processado na GPU",
        runtimeWasm: "processado na CPU",
        nothingFound:
          "Quase nada foi mantido. Tente clicar mais perto do centro do objeto.",
        errEngine: "Não foi possível carregar o motor",
        errModel: "Não foi possível baixar o modelo",
        errUnsupportedInput: "Não foi possível ler esta imagem",
        errTooLarge: "Esta imagem passa do limite de {max} megapixel",
        errGeneric: "Não foi possível fazer o recorte",
      },
    },
    subtitles: {
      blurb:
        "Transforma a fala de um vídeo em legendas. O modelo roda no seu dispositivo.",
      metaTitle: "Gerar legendas — no seu navegador",
      metaDescription:
        "Gere legendas SRT e VTT de um vídeo sem enviá-lo. Um modelo Whisper Apache-2.0 roda no seu navegador em 99 idiomas. Sem cadastro.",
      h1: "Gerar legendas de um vídeo",
      lead: "Escuta a fala de um vídeo ou áudio e escreve legendas com tempos, para baixar em SRT ou VTT. O modelo é baixado para o seu dispositivo e roda ali — o arquivo não sai desta aba.",
      faq: [
        {
          q: "Para onde vai o meu vídeo?",
          a: "Para lugar nenhum. Ele é aberto dentro desta aba e nunca é enviado. Aqui isso pesa mais do que na maioria das ferramentas: a gravação de uma reunião ou de uma aula é exatamente o tipo de arquivo que não se deve entregar ao servidor de um desconhecido.",
        },
        {
          q: "Por que o download é tão grande?",
          a: "Porque só o modelo em precisão total funciona de verdade. Nós medimos: as versões de 8 bits nem abrem, e as de 16 bits são piores que inúteis — o modelo compacto embaralha as frases e o preciso trava repetindo as mesmas duas palavras. Um modelo que falha alto tudo bem; um que produz em silêncio um absurdo plausível, não. Por isso enviamos precisão total e dizemos o tamanho antes.",
        },
        {
          q: "Que arquivos posso usar?",
          a: "MP4, MOV, M4A, WAV e MP3. São os que o seu navegador abre sozinho, então nunca enviamos outro decodificador. O MP3 foi o último a entrar, não por ser pesado, mas porque **não tem contêiner**: é um fluxo cru de quadros, e alguém precisa marcar onde cada um começa antes de o decodificador do navegador aceitá-lo. Essa parte fomos nós que escrevemos; nada extra é baixado.",
        },
        {
          q: "O resultado fica repetindo as mesmas palavras.",
          a: "É o modelo falhando com áudio ruidoso, e é o limite honesto desta ferramenta. Medimos numa gravação de discurso de 1948: o modelo compacto só produziu uma sílaba repetida. Esse mesmo modelo foi preciso com áudio moderno e limpo — é a qualidade da gravação, não o idioma. Se a sua fonte tem som baixo, eco ou música por cima da voz, espere isso.",
        },
        {
          q: "Qual modelo devo escolher?",
          a: "Comece pelo compacto. Num trecho coreano limpo de 16 segundos ele errou duas vezes em cerca de quarenta palavras; o preciso errou uma. O modelo preciso vale o tamanho extra para uma gravação longa que você vá publicar, e não vale para uma transcrição rápida. Note também que o preciso leva uns vinte segundos aquecendo na placa de vídeo antes de começar.",
        },
        {
          q: "Qual a diferença entre SRT e VTT?",
          a: "SRT é o que a maioria dos editores e reprodutores espera. VTT é o padrão da web, usado pelo elemento video do HTML. Aqui os dois carregam a mesma coisa, então pegue o que o próximo passo pedir. O arquivo de texto puro não tem tempos — serve quando você só quer as palavras.",
        },
      ],
      ui: {
        dropLabel: "Solte um vídeo ou áudio aqui",
        dropHint: "MP4 · MOV · M4A · WAV · MP3 — até {minutes} minutos",
        modelLabel: "Modelo",
        modelFast: "Compacto — {size}, mais rápido",
        modelAccurate: "Preciso — {size}, menos erros",
        languageLabel: "Idioma falado",
        languageAuto: "Detectar automaticamente",
        languageNames: {
          en: "Inglês",
          ko: "Coreano",
          ja: "Japonês",
          es: "Espanhol",
          de: "Alemão",
          pt: "Português",
        },
        downloadNote:
          "Apertar o botão baixa cerca de {size} de motor e modelo.",
        cachedNote:
          "É baixado uma vez e o seu navegador guarda — o próximo arquivo começa na hora.",
        noiseNote:
          "Em gravações ruidosas ou muito antigas o modelo pode travar repetindo as mesmas palavras. Com áudio limpo funciona bem melhor.",
        run: "Escrever as legendas",
        working: "Processando…",
        stageDecoding: "lendo o áudio…",
        stageModel: "baixando o modelo {percent}%",
        stageTranscribing: "ouvindo…",
        resultSummary: "{cues} linhas · {length} de áudio · levou {seconds}s",
        runtimeWebgpu: "processado na GPU",
        runtimeWasm: "processado na CPU",
        downloadSrt: "Baixar .srt",
        downloadVtt: "Baixar .vtt",
        downloadTxt: "Baixar texto puro",
        errEngine: "Não foi possível carregar o motor",
        errModel: "Não foi possível baixar o modelo",
        errNoAudio: "Este arquivo não tem som",
        errUnsupportedInput:
          "Não foi possível ler este arquivo — MP4, MOV, M4A, WAV ou MP3",
        errTooLong: "Isto é mais longo que {minutes} minutos",
        stop: "Parar",
        stoppedNote:
          "Parado antes do fim — as legendas vão até onde você parou, então o resto do áudio não está nelas.",
        errGeneric: "Não foi possível escrever as legendas",
      },
    },
    "subtitle-translate": {
      blurb:
        "Traduz um arquivo de legendas para outro idioma, no seu próprio aparelho.",
      metaTitle: "Tradutor de legendas — no navegador",
      metaDescription:
        "Traduza legendas SRT e VTT entre 18 idiomas sem enviá-las. Um modelo com licença MIT roda dentro do seu navegador. Sem cadastro e sem chave de API.",
      h1: "Traduzir um arquivo de legendas",
      lead: "Recebe um arquivo SRT ou VTT e reescreve cada linha em outro idioma, mantendo os tempos exatamente como estavam. O modelo é baixado para o seu dispositivo e roda ali — o arquivo não sai desta aba.",
      faq: [
        {
          q: "Para onde vai o meu arquivo de legendas?",
          a: "Para lugar nenhum. Ele é lido dentro desta aba e nunca é enviado. Legendas costumam ser a transcrição completa do que foi dito numa reunião, numa aula ou numa entrevista, o que as torna um dos arquivos mais reveladores que você tem.",
        },
        {
          q: "Qual é a qualidade da tradução?",
          a: "Boa o bastante para acompanhar, insuficiente para publicar sem revisão. Frases comuns saem bem. Onde escorrega é nas expressões idiomáticas: «let's wrap this up» (vamos encerrar) voltou como algo mais próximo de «vamos começar», tanto em espanhol quanto em alemão. Também erra um artigo ou um plural de vez em quando. Encare como um primeiro rascunho sólido que ainda passa por uma pessoa.",
        },
        {
          q: "Por que este modelo e não um maior?",
          a: "Medimos cinco. O candidato óbvio, um modelo de tradução de quatro bilhões de parâmetros, está atrás de aprovação manual na origem e seus termos exigem repassar as restrições de uso a quem receber os pesos — algo que não temos como cumprir diante de um navegador anônimo. Outro forte candidato é licenciado apenas para uso não comercial. Os modelos pequenos de par único têm licença limpa, mas não existe versão inglês-coreano, e o multilíngue barato devolveu zulu quando pedimos coreano. O que sobra é um modelo com licença MIT que faz 100 idiomas em qualquer direção e que funciona de verdade.",
        },
        {
          q: "Por que demora tanto?",
          a: "Cerca de um segundo e meio por linha de legenda, e no processador. Este modelo não roda na placa de vídeo — tentamos, e ou ele nem inicia ou desanda repetindo uma palavra sem parar. Então o tempo é real, e a página informa a estimativa antes de começar, não depois. Você pode parar no meio: as linhas já prontas ficam e o resto permanece no idioma original.",
        },
        {
          q: "Os tempos mudam?",
          a: "Não. Cada linha mantém exatamente o início e o fim com que entrou, porque só o texto é tocado. É por isso que linhas traduzidas podem ficar mais tempo na tela do que as originais — há idiomas que simplesmente precisam de mais palavras, e não reajustamos os tempos para disfarçar isso.",
        },
        {
          q: "Posso traduzir as legendas que acabei de gerar?",
          a: "Pode, e esse é o caminho previsto. Gere as legendas do seu vídeo com a ferramenta de legendas, baixe o SRT e solte aqui. As duas etapas rodam neste navegador, então nem a gravação nem a transcrição encostam num servidor.",
        },
      ],
      ui: {
        dropLabel: "Solte um arquivo SRT ou VTT aqui",
        dropHint: "SRT · VTT — os tempos são mantidos como estão",
        fromLabel: "De",
        toLabel: "Para",
        languageNames: {
          en: "Inglês",
          ko: "Coreano",
          ja: "Japonês",
          zh: "Chinês",
          es: "Espanhol",
          de: "Alemão",
          fr: "Francês",
          pt: "Português",
          it: "Italiano",
          ru: "Russo",
          ar: "Árabe",
          hi: "Híndi",
          id: "Indonésio",
          vi: "Vietnamita",
          th: "Tailandês",
          tr: "Turco",
          pl: "Polonês",
          nl: "Holandês",
        },
        downloadNote:
          "Apertar o botão baixa cerca de {size} de motor e modelo.",
        cachedNote:
          "É baixado uma vez e o seu navegador guarda — o próximo arquivo começa na hora.",
        qualityNote:
          "Frases comuns saem bem; expressões idiomáticas, muitas vezes não. Leia antes de publicar.",
        encodingNote:
          "Este arquivo não é UTF-8, então foi lido como {encoding}. Confira o texto abaixo.",
        strippedNote:
          "Etiquetas de formatação foram removidas de {lines} linhas — elas não voltam.",
        loadedSummary: "{lines} linhas · cerca de {estimate}",
        unitMinutes: "{value} min",
        unitSeconds: "{value} s",
        run: "Traduzir",
        working: "Traduzindo…",
        stop: "Parar",
        sameLanguage: "Escolha dois idiomas diferentes.",
        stageModel: "baixando o modelo {percent}%",
        stageTranslating: "traduzindo {done} / {total}",
        resultSummary: "{lines} linhas · {calls} traduzidas · levou {seconds}s",
        stoppedNote: "parado antes do fim — o resto está inalterado",
        failedNote:
          "{lines} linhas voltaram quebradas, então o texto original foi mantido.",
        downloadSrt: "Baixar .srt",
        downloadVtt: "Baixar .vtt",
        errEngine: "Não foi possível carregar o motor",
        errModel: "Não foi possível baixar o modelo",
        errUnreadable: "Não foi possível ler legendas deste arquivo",
        errTooManyLines: "Este arquivo tem mais de {lines} linhas",
        errGeneric: "Não foi possível traduzir as legendas",
      },
    },
    stems: {
      blurb:
        "Separa uma música em bateria, baixo, voz e todo o resto, no seu próprio aparelho.",
      metaTitle: "Separador de faixas — voz e bateria",
      metaDescription:
        "Separe uma faixa em bateria, baixo, voz e outras trilhas sem enviá-la. Um modelo Demucs com licença MIT roda no seu navegador. Sem cadastro nem chave de API.",
      h1: "Separar uma música em faixas",
      lead: "Pega os primeiros trinta segundos de um arquivo de áudio ou vídeo e separa em quatro trilhas que você pode ouvir e baixar. O modelo é baixado para o seu dispositivo e roda ali — o arquivo não sai desta aba.",
      faq: [
        {
          q: "Para onde vai o meu áudio?",
          a: "Para lugar nenhum. Ele é aberto dentro desta aba e nunca é enviado. Aqui isso pesa ainda mais: uma mixagem inédita é exatamente o tipo de arquivo que não se deve entregar ao servidor de um desconhecido.",
        },
        {
          q: "Por que só 30 segundos?",
          a: "Porque a separação é lenta no processador. Nós medimos: 7,8 segundos de áudio levam cerca de 15 segundos para separar, então 30 segundos levam mais ou menos um minuto e uma música inteira de três minutos levaria seis. Esta ferramenta é uma prévia — o suficiente para ouvir quão limpa fica a separação antes de recorrer a um programa de computador para a faixa toda.",
        },
        {
          q: "Qual a qualidade da separação?",
          a: "É o Demucs v4, o mesmo modelo que a maioria dos programas de computador usa, em precisão total. Conferimos com números e não de ouvido: misturamos uma gravação de fala, uma senoide de 60 Hz e uma trilha de cliques, e medimos o quanto cada faixa de saída correspondia a cada ingrediente. A voz bateu com a fala em 0,999, o baixo com a senoide em 1,000, a bateria com os cliques em 0,985, e cada faixa ficou perto de zero em relação às outras.",
        },
        {
          q: "Que arquivos posso usar?",
          a: "MP4, MOV, M4A, WAV e MP3. São os que o seu navegador abre sozinho, então nunca enviamos outro decodificador. O MP3 foi o último a entrar, não por ser pesado, mas porque **não tem contêiner**: é um fluxo cru de quadros, e alguém precisa marcar onde cada um começa antes de o decodificador do navegador aceitá-lo. Essa parte fomos nós que escrevemos; nada extra é baixado.",
        },
        {
          q: "Por que o download é tão grande?",
          a: "O modelo tem cerca de 300 MB e ele é a ferramenta inteira. Não existe uma versão menor do Demucs v4 que pudéssemos verificar, e enviar uma quantizada que piora em silêncio seria pior do que ser honesto sobre o tamanho. É baixado uma vez e o seu navegador guarda.",
        },
        {
          q: "Por que não usa a minha placa de vídeo?",
          a: "Porque só medimos e verificamos o caminho do processador. Outras ferramentas daqui tentam a placa de vídeo primeiro, mas um caminho rápido não verificado que produzisse um áudio sutilmente errado seria mais difícil de notar do que um lento. Se medirmos um caminho pela placa de vídeo com os mesmos números, mudaremos.",
        },
      ],
      ui: {
        dropLabel: "Solte um arquivo de áudio ou vídeo aqui",
        dropHint:
          "MP4 · MOV · M4A · WAV · MP3 — usamos os primeiros {seconds} segundos",
        downloadNote:
          "Apertar o botão baixa cerca de {size} de motor e modelo.",
        cachedNote:
          "É baixado uma vez e o seu navegador guarda — o próximo arquivo começa na hora.",
        slowNote:
          "A separação roda no processador: cerca de {minutes} min para {seconds} segundos de áudio. É por isso que isto é uma prévia.",
        run: "Separar em faixas",
        working: "Separando…",
        stageDecoding: "lendo o áudio…",
        stageModel: "baixando o modelo {percent}%",
        stageSeparating: "separando {percent}%",
        resultSummary: "{length}s de áudio · levou {seconds}s",
        stemNames: {
          drums: "Bateria",
          bass: "Baixo",
          other: "Outros",
          vocals: "Voz",
        },
        errEngine: "Não foi possível carregar o motor",
        errModel: "Não foi possível baixar o modelo",
        errNoAudio: "Este arquivo não tem som",
        errUnsupportedInput:
          "Não foi possível ler este arquivo — MP4, MOV, M4A, WAV ou MP3",
        errGeneric: "Não foi possível separar as faixas",
      },
    },
    summarize: {
      blurb:
        "Reduz um documento longo a poucas frases, sem que ele saia da sua aba.",
      metaTitle: "Resumir documentos — sem enviar",
      metaDescription:
        "Resuma um PDF, um arquivo de texto ou um texto colado sem enviá-lo. Um modelo de IA pequeno roda dentro do seu navegador. Sem cadastro nem chave de API.",
      h1: "Resumir um documento",
      lead: "Cole um texto ou solte um arquivo e receba algumas frases de volta. O modelo é baixado para o seu dispositivo e roda ali — o documento nunca sai desta aba.",
      faq: [
        {
          q: "Para onde vai o meu documento?",
          a: "Para lugar nenhum. Ele é lido dentro desta aba e nunca é enviado. É justamente esse o ponto aqui: os documentos que mais se quer resumir — contratos, laudos médicos, rascunhos inéditos — são exatamente os que não se deve colar no servidor de um desconhecido.",
        },
        {
          q: "Por que esta ferramenta precisa de placa de vídeo?",
          a: "Porque sem ela não existe caminho que funcione. A versão ONNX do modelo usa uma operação para a qual o ambiente do processador não tem implementação, então a sessão nem chega a abrir. Medimos o modelo mais próximo que roda no processador: 0,9 token por segundo, quase quatro minutos para um documento curto. Preferimos dizer que não a entregar isso.",
        },
        {
          q: "Qual a qualidade do resumo?",
          a: "Bom no formato do documento, pouco confiável nos detalhes. É um modelo de 350 milhões de parâmetros: pequeno o bastante para baixar e rodar numa aba, e pequeno o bastante para errar fatos. Nas nossas medições ele chegou a expandir NADPH num nome químico que não existe. Trate o resumo como um mapa do documento, não como substituto da leitura.",
        },
        {
          q: "Que arquivos posso usar?",
          a: "Texto puro, Markdown, HTML e PDF. Um PDF só funciona se tiver uma camada real de texto — uma página digitalizada é uma foto de palavras e não há nada a extrair dela. Se aparecer que nenhum texto foi encontrado, passe o arquivo antes pela ferramenta de imagem para texto e cole o resultado aqui.",
        },
        {
          q: "Ele pode resumir em outro idioma?",
          a: "Não, e testamos isso antes de decidir. O resumo volta sempre no idioma em que o documento foi escrito. Ao ser mandado passar para o coreano ele desmorona inventando palavras, e no sentido inverso ignora a instrução. Oferecer um seletor de idioma que falha em dois dos nossos seis idiomas seria pior do que não oferecer.",
        },
        {
          q: "Por que existe um limite mínimo e máximo?",
          a: "Um token equivale mais ou menos a uma palavra curta em inglês e a uma sílaba em coreano ou japonês, por isso a mesma página é contada de formas bem diferentes conforme o idioma. Abaixo de cerca de 200 tokens o modelo para de resumir e começa a inventar: diante de um campo vazio, produziu com toda a confiança o resumo de uma campanha de saúde pública que não existia. Acima de 16.000 falta memória de vídeo. Os dois limites foram medidos, e preferimos recusar a resumir em silêncio apenas a primeira parte.",
        },
        {
          q: "Que modelo é este e qual a licença dele?",
          a: "LFM2.5-350M da Liquid AI, convertido para ONNX. Nós o escolhemos depois de medir quatro candidatos nos mesmos documentos reais, e foi o único que de fato resumiu em vez de devolver o texto original. A licença é a LFM Open License v1.0: não é copyleft, mas o uso comercial está condicionado a a organização ficar abaixo de 10 milhões de dólares de receita anual. Este site está muito longe dessa linha, e preferimos escrever isso aqui a escondê-lo. Os pesos são baixados pelo seu navegador diretamente do Hugging Face; nós nunca os hospedamos nem os redistribuímos.",
        },
      ],
      ui: {
        dropLabel: "Solte um documento aqui",
        dropHint: "TXT · MD · HTML · PDF — ou cole o texto abaixo",
        textLabel: "Documento",
        textPlaceholder: "Cole o texto que você quer resumir…",
        downloadNote:
          "Apertar o botão baixa cerca de {size} de motor e modelo.",
        cachedNote:
          "É baixado uma vez e o seu navegador guarda — o próximo documento começa na hora.",
        qualityNote:
          "O modelo é pequeno: acerta o essencial e pode errar detalhes. Confira no documento tudo o que for importante.",
        loadedSummary:
          "Cerca de {tokens} tokens · aproximadamente {seconds}s com o modelo pronto",
        tooShortNote:
          "Isto é menor que {minimum} tokens. Abaixo disso o modelo deixa de resumir e passa a inventar conteúdo.",
        run: "Resumir",
        working: "Resumindo…",
        stageModel: "baixando o modelo {percent}%",
        stageSummarizing: "resumindo…",
        resultSummary: "{tokens} tokens de entrada · levou {seconds}s",
        copy: "Copiar",
        copied: "Copiado",
        noWebgpuHint:
          "Esta ferramenta precisa de WebGPU, que o seu navegador não oferece. Chrome e Edge têm desde 2023 no computador; Safari desde a 26. Todas as outras ferramentas daqui funcionam sem ele.",
        errNoWebgpu: "Esta ferramenta precisa de WebGPU",
        errEngine: "Não foi possível carregar o motor",
        errModel: "Não foi possível baixar o modelo",
        errUnsupportedInput:
          "Não foi possível ler este arquivo — TXT, MD, HTML ou PDF",
        errNoText:
          "Nenhum texto foi encontrado neste arquivo — um PDF digitalizado precisa antes da ferramenta de imagem para texto",
        errTooShort:
          "Curto demais para resumir: {tokens} tokens, e são necessários pelo menos {minimum}",
        errTooLong: "Longo demais: {tokens} tokens, e o limite é {maximum}",
        errGeneric: "Não foi possível resumir o documento",
      },
    },
  },
} satisfies Dictionary;
