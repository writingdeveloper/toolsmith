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

  mediaErrors: {
    unsupportedContainer: "Este arquivo não é um MP4 ou MOV que consigamos abrir",
    noAudioTrack: "Este arquivo não tem som para extrair",
    noVideoTrack: "Este arquivo não tem faixa de vídeo",
    unsupportedCodec: "Este navegador não consegue decodificar este vídeo",
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

    "pdf-organize": {
      blurb: "Veja todas as páginas, endireite as que saíram deitadas e tire as que sobram.",
      metaTitle: "Girar PDF e apagar páginas — ajeite um digitalizado no navegador",
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
      metaTitle: "Comprimir PDF — diminua o tamanho e mantenha o texto",
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

    "video-compress": {
      blurb: "Diminui um MP4 no navegador. Sem baixar 30MB de ferramentas — seu aparelho faz o trabalho.",
      metaTitle: "Comprimir vídeo — diminua um MP4 no navegador",
      metaDescription:
        "Deixe um MP4 menor sem enviá-lo. Roda no seu aparelho usando o codificador de vídeo do próprio navegador, então não há nada para instalar e nenhum arquivo sai da sua máquina.",
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

    "video-to-gif": {
      blurb: "Transforma um clipe em GIF em loop. Sem upload — quem trabalha é o seu aparelho.",
      metaTitle: "Vídeo para GIF — converta MP4 em GIF no navegador",
      metaDescription:
        "Crie um GIF em loop a partir de um MP4 ou MOV sem enviá-lo para lugar nenhum. Escolha a taxa de quadros e o tamanho e veja o resultado antes de salvar. Tudo acontece no seu navegador.",
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
