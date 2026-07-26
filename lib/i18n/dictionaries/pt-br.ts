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
    relatedHeading: "Outras ferramentas",
    chooseFile: "Escolher arquivos",
    download: "Baixar",
    clear: "Limpar",
    downloadAll: "Baixar tudo",
    workerUnsupportedTitle: "Este navegador não consegue executar esta ferramenta.",
    workerUnsupportedHint:
      "Abra em uma versão recente do Chrome, Edge, Firefox ou Safari com suporte a Web Workers.",
  },

  mediaErrors: {
    unsupportedContainer: "Este arquivo não é um MP4 ou MOV que consigamos abrir",
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
  },

  tools: {
    "image-convert": {
      blurb: "HEIC, PNG, JPG, WebP e AVIF em qualquer direção. Comprima e redimensione de uma vez.",
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
      blurb: "Veja todas as páginas, endireite as que saíram deitadas e tire as que sobram.",
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
        dropHint: "Um de cada vez — todas as páginas aparecem para você escolher",
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
      blurb: "Recomprime as fotos de dentro do PDF. O texto continua texto — nada é achatado.",
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
        noImages: "Este PDF não tem fotos para recomprimir.",
        alreadySmall: "As fotos já estavam bem comprimidas — não deu para diminuir mais.",
      },
    },

    "data-query": {
      blurb: "Roda SQL sobre um CSV ou Parquet. O arquivo não sai do seu aparelho.",
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
        errFormat: "Não dá para abrir este tipo de arquivo — CSV, TSV, Parquet ou JSON",
        errRead: "Não foi possível ler o arquivo",
      },
    },

    ocr: {
      blurb: "Tira o texto de uma foto, captura de tela ou PDF digitalizado. Nada é enviado.",
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
        downloadNote: "Ao apertar o botão são baixados cerca de {size} de motor e dados de idioma.",
        cachedNote: "Isso acontece uma vez e o navegador guarda — o próximo documento começa direto.",
        run: "Ler o texto",
        working: "Lendo…",
        stageEngine: "preparando o motor {percent}%",
        stageRendering: "desenhando página {done}/{total}",
        stageReading: "lendo página {page}/{pages}",
        resultSummary: "{pages} página(s) · confiança {confidence}%",
        copy: "Copiar",
        copied: "Copiado",
        resultLabel: "Texto reconhecido",
        truncated: "Este documento tem {total} páginas; apenas as {max} primeiras foram lidas.",
        nothingFound: "Nenhum texto foi encontrado nesta imagem.",
        lowConfidence: "A confiança está baixa — confira com o original antes de confiar.",
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

    "video-convert": {
      blurb: "De MOV para MP4 sem recodificar, ou de MP4 para WebM. Nada é enviado.",
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
        mp4Note: "Os codecs não são tocados: só o contêiner é reescrito. Nada se perde e leva segundos.",
        webmNote: "H.264 não cabe em um WebM, então a imagem é recodificada em VP9 e o som em Opus. Demora um pouco e custa alguma qualidade.",
        alreadyMp4: "Este arquivo já é um MP4 — converter apenas reescreveria o contêiner.",
        mp4Unavailable: "O codec deste vídeo não pode ser copiado como está para um MP4.",
        webmUnavailable: "Este navegador não consegue codificar WebM. MP4 continua funcionando.",
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
      blurb: "Diminui um MP4 no navegador. Sem baixar 30MB de ferramentas — seu aparelho faz o trabalho.",
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
        quality: { high: "Alta", balanced: "Equilibrada", small: "O menor possível" },
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
      blurb: "Corte um trecho do vídeo sem recodificar. Nada se perde e leva segundos.",
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
        snapped: "Corta em {actual}s, não em {asked}s — é o quadro-chave mais próximo antes.",
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
      blurb: "Transforma um clipe em GIF em loop. Sem upload — quem trabalha é o seu aparelho.",
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
        unsupportedTitle: "Este navegador não consegue criar GIF a partir de vídeo.",
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
        truncated: "Só couberam os primeiros {n} quadros, então o final do clipe ficou de fora.",
        biggerNote:
          "O GIF ficou maior que o vídeo. Isso é normal — GIF não comprime movimento.",
        previewAlt: "O GIF recém-criado",
      },
    },

    "audio-extract": {
      blurb: "Tira o som de um vídeo. Nada é recodificado, então nada se perde.",
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
        formatM4aHint: "Levanta a faixa intacta. Pequena e idêntica ao áudio do vídeo.",
        formatWav: "WAV — abre em qualquer lugar",
        formatWavHint: "PCM sem compressão para editores e programas antigos. Bem maior.",
        run: "Extrair áudio",
        working: "Extraindo…",
        outputNameM4a: "{stem}.m4a",
        outputNameWav: "{stem}.wav",
        losslessNote: "idêntico à faixa original",
      },
    },
  },
} satisfies Dictionary;
