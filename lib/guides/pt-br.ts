import type { GuideCopy } from "./registry";

export const ptBr = {
  hub: {
    metaTitle: "Guias — formatos de arquivo sem rodeios",
    metaDescription:
      "Por que HEIC não abre, qual formato de imagem escolher, por que seu PDF é tão pesado, MOV contra MP4. Respostas curtas tiradas de arquivos que medimos.",
    h1: "Guias",
    lead: "As perguntas que vêm antes da ferramenta. Cada resposta aqui saiu de arquivos que abrimos e medimos, não de uma folha de especificações.",
    breadcrumb: "Guias",
    toolsHeading: "Faça agora, sem enviar nada",
    relatedHeading: "Vale a leitura",
    updatedLabel: "Atualizado",
  },

  articles: {
    "what-is-heic": {
      metaTitle: "O que é um arquivo HEIC e por que não abre",
      metaDescription:
        "HEIC é o que seu iPhone salva no lugar de JPEG. Por que ele pesa metade, por que o Windows e quase todo site recusam e o que você perde ao converter.",
      h1: "O que é um arquivo HEIC e por que ele não abre",
      lead: "Seu iPhone parou de salvar JPEG anos atrás. Aqui está o que ele salva no lugar, por que quase todo formulário de envio recusa e o que uma conversão custa de verdade.",
      sections: [
        {
          h2: "É uma foto espremida com tecnologia de vídeo",
          body: [
            "Um arquivo HEIC é uma imagem parada dentro do contêiner HEIF, comprimida com HEVC — o mesmo codec usado em vídeo 4K. Codecs de vídeo preveem muito melhor como uma imagem continua do que a matemática de 1992 dentro do JPEG, então a mesma foto cabe em cerca da metade sem diferença visível.",
            "A Apple mudou a câmera do iPhone para HEIC no iOS 11, em 2017. Se suas fotos terminam em .HEIC, é só isso: uma foto comum em uma embalagem mais nova.",
          ],
        },
        {
          h2: "Por que abre no seu celular e em mais lugar nenhum",
          body: [
            "A Apple entrega o decodificador junto, então HEIC abre em qualquer canto do iOS e do macOS. Fora dessa ilha fica irregular:",
          ],
          list: [
            "Windows 10 e 11 precisam das Extensões de Imagem HEIF da Microsoft Store, e esse pacote se apoia no codec HEVC, que em algumas máquinas é pago.",
            "Chrome e Firefox não decodificam HEIC. O Safari decodifica.",
            "A maioria dos formulários de envio — candidaturas de emprego, sinistros de seguro, gráficas — olha a extensão e recusa .heic de saída, podendo ou não lê-lo.",
          ],
        },
        {
          h2: "Duas saídas, e elas resolvem problemas diferentes",
          body: [
            "Você pode impedir que o iPhone os crie: Ajustes → Câmera → Formatos → Mais Compatível. A partir daí a câmera salva JPEG. Isso resolve o futuro e não faz nada pelas milhares de fotos que já estão no aparelho.",
            "Ou você converte. É a única opção para o que já existe, e é a certa quando você precisa tirar uma foto do telefone agora.",
          ],
        },
        {
          h2: "O que se perde na conversão",
          body: [
            "Converter HEIC em JPEG recodifica a imagem, ou seja, há perda: ir e voltar várias vezes amolece a foto de forma visível. Converta sempre a partir do original, nunca de uma conversão anterior.",
            "Algumas coisas não sobrevivem à viagem. Uma Live Photo vira uma única imagem parada, porque o movimento vive em uma faixa de vídeo separada e o JPEG não tem onde guardá-la. Mapas de profundidade do modo Retrato e mapas de ganho HDR caem pelo mesmo motivo. Rotação, data e localização no EXIF passam normalmente.",
            "Se o que você persegue é tamanho e não compatibilidade, saiba disto: um JPEG na qualidade padrão costuma ficar maior que o HEIC de onde veio. Essa é a troca — HEIC é menor, JPEG abre em todo lugar.",
          ],
        },
        {
          h2: "Converter sem entregar a foto a ninguém",
          body: [
            "Arquivos HEIC são pessoais de um jeito que uma planilha não é: carregam rostos, e o EXIF carrega onde você estava. Enviá-los a um conversor gratuito para receber um JPEG é uma troca ruim.",
            "Nosso conversor de imagens decodifica HEIC dentro da aba do navegador. O decodificador tem cerca de 1,5 MB e é baixado só no momento em que um arquivo HEIC realmente chega — se você nunca usar HEIC, nada é baixado. A foto em si não é enviada a lugar nenhum.",
          ],
        },
      ],
      faq: [
        {
          q: "HEIC é a mesma coisa que HEIF?",
          a: "HEIF é o contêiner; HEIC é o nome de um arquivo HEIF cujas imagens estão comprimidas com HEVC. A Apple usa a extensão .heic. Na prática as duas palavras se misturam.",
        },
        {
          q: "Converter perde qualidade?",
          a: "Um pouco — JPEG e WebP têm perda, então a imagem é recodificada. Uma conversão a partir do original costuma ser invisível. O estrago vem de converter repetidamente um arquivo já convertido.",
        },
        {
          q: "Dá para converter HEIC no celular?",
          a: "Dá. A conversão roda no navegador, então um celular serve desde que o navegador esteja atualizado. Lotes grandes ficam mais lentos simplesmente porque há menos processador.",
        },
      ],
    },

    "image-formats": {
      metaTitle: "PNG, JPG, WebP ou AVIF: qual usar",
      metaDescription:
        "Uma pergunta decide o formato: é foto ou é cor chapada com texto? O que cada um faz bem de verdade, com as armadilhas.",
      h1: "PNG, JPG, WebP ou AVIF — qual você deveria usar?",
      lead: "Quatro formatos e uma pergunta que resolve quase tudo: a imagem é uma fotografia ou é cor chapada, texto e linhas?",
      sections: [
        {
          h2: "A pergunta que decide",
          body: [
            "Fotografias são feitas de variação gradual e ruidosa. Os formatos com perda — JPG, WebP, AVIF — foram construídos exatamente para isso e ficam pequenos jogando fora detalhe que seu olho não acompanha.",
            "Capturas de tela, logotipos, diagramas e qualquer coisa com texto são o oposto: grandes áreas chapadas e bordas duras. A compressão com perda deixa sujeira visível em volta das letras e, como há pouco ruído a descartar, nem economiza muito. É para isso que existe o PNG.",
          ],
        },
        {
          h2: "JPG — o que abre em todo lugar",
          body: [
            "Tem trinta anos, é entendido por tudo que já foi construído e continua perfeitamente bom para fotografias. Não guarda transparência e mostra blocos se você derrubar muito a qualidade.",
            "Escolha quando o arquivo tiver de ser aberto por um software que você não controla — uma gráfica, um formulário do governo, o notebook antigo de um colega.",
          ],
        },
        {
          h2: "PNG — sem perda, com transparência e errado para fotos",
          body: [
            "O PNG não descarta um pixel sequer e aceita transparência completa. Isso o torna certo para logotipos, capturas, ícones e qualquer coisa que você vá editar de novo.",
            "É um recipiente ruim para fotografia, e é aqui que as pessoas travam: passar um PNG fotográfico por um compressor quase não ajuda. À compressão sem perda não sobra quase nada para tirar do ruído fotográfico. Se seu PNG de foto tem 8 MB, nenhum otimizador de PNG vai deixá-lo pequeno — converter para JPG ou WebP vai.",
          ],
        },
        {
          h2: "WebP — o padrão sensato para a web",
          body: [
            "O WebP faz os dois trabalhos: com perda para fotos, sem perda e com transparência para gráficos, além de animação. Em qualidade comparável costuma ficar de 25% a 35% abaixo do JPEG.",
            "Todo navegador atual exibe. O motivo que resta para evitá-lo está fora do navegador — alguns programas de desktop antigos e certos fluxos de gráfica ainda não abrem um .webp.",
          ],
        },
        {
          h2: "AVIF — o menor, o mais lento e ainda não está em todo lugar",
          body: [
            "O AVIF usa o codec de vídeo AV1 e costuma ser o menor dos quatro em uma dada qualidade, sobretudo em fotografias e em taxas baixas. Codificar é lento — perceptivelmente, em um lote grande.",
            "Há uma armadilha que vale conhecer: um navegador conseguir **exibir** AVIF não significa que ele consiga **criar** um. O suporte a codificação é mais estreito que o de decodificação, e um navegador a quem se pede um formato sem suporte devolve um PNG em silêncio. Por isso nosso conversor monta a lista de formatos codificando uma imagem de teste e conferindo o que realmente voltou, em vez de confiar em uma tabela de compatibilidade.",
          ],
        },
        {
          h2: "Versão curta",
          body: ["Se você quer uma regra de bolso em vez de uma árvore de decisão:"],
          list: [
            "Foto que vai para um site → WebP, ou AVIF se o tamanho importa mais que o tempo de codificação.",
            "Foto que precisa abrir em qualquer lugar → JPG.",
            "Captura de tela, logotipo, diagrama, qualquer coisa com texto → PNG.",
            "Precisa de transparência → PNG ou WebP. Nunca JPG.",
            "Já é JPG e ainda está grande → reduza primeiro as dimensões em pixels. Cortar a largura pela metade deixa a contagem de pixels em um quarto, e isso vence qualquer controle de qualidade.",
          ],
        },
      ],
      faq: [
        {
          q: "Converter PNG para JPG deixa menor?",
          a: "Em uma fotografia, muito — frequentemente 80% ou mais. Em uma captura de tela ou logotipo pode deixar maior e ainda borra as bordas do texto. Veja o que a imagem é antes de converter.",
        },
        {
          q: "Já dá para usar WebP tranquilamente?",
          a: "No navegador, sim — todos os atuais exibem. Fora do navegador é mais irregular, então se o arquivo vai para uma gráfica ou para um programa de desktop, JPG ou PNG é a entrega mais segura.",
        },
        {
          q: "Por que meu PNG comprimido ficou do mesmo tamanho?",
          a: "Porque a compressão PNG é sem perda e o detalhe fotográfico é praticamente incompressível. Não sobra nada seguro para remover. Mude o formato ou reduza as dimensões.",
        },
      ],
    },

    "why-pdf-is-large": {
      metaTitle: "Por que seu PDF é tão pesado e o que reduz",
      metaDescription:
        "Quase todo PDF grande é grande por um motivo só: as imagens dentro dele. Como saber qual dos dois você tem e o que reduz de verdade.",
      h1: "Por que seu PDF é tão pesado — e o que realmente reduz",
      lead: "Um PDF de 40 MB e outro de 400 KB podem parecer idênticos na tela. A diferença quase nunca é o texto.",
      sections: [
        {
          h2: "Um PDF é uma caixa, e o peso são as imagens",
          body: [
            "PDF é um contêiner. Texto é guardado como caracteres mais uma fonte embutida — algumas centenas de kilobytes para um livro inteiro. Desenhos vetoriais são guardados como coordenadas e são igualmente minúsculos.",
            "Imagens são guardadas como imagens. Uma única foto de celular jogada em um documento pode pesar mais que duzentas páginas de texto. Quando um PDF está enorme, ele está carregando fotos.",
          ],
        },
        {
          h2: "Primeiro descubra que tipo de PDF você tem",
          body: [
            "Tente selecionar uma frase com o cursor. Se o texto realça palavra por palavra, é um PDF de texto — os caracteres são reais. Se nada realça, ou a página inteira realça como um bloco, cada página é uma fotografia de uma página.",
            "Esse único teste diz o que vai funcionar:",
          ],
          list: [
            "PDF de texto que está grande → algo volumoso foi inserido: fotos, um gráfico colado como imagem, uma capa digitalizada. Comprimir as imagens é a solução.",
            "PDF digitalizado → as próprias páginas são as imagens. Recodificá-las é a única alavanca, e há um piso abaixo do qual a digitalização deixa de ser legível.",
          ],
        },
        {
          h2: "O que realmente reduz o tamanho",
          body: [
            "Recodificar os JPEGs embutidos com qualidade menor. É a alavanca principal e costuma bastar: texto, links, marcadores e a busca saem intactos, porque nenhum deles era o problema.",
            "Remover páginas que você não precisa. Óbvio e, rotineiramente, o maior ganho isolado — o anexo de digitalizações costuma ser a maior parte do arquivo.",
            "Dividir o documento. Se só é preciso enviar o capítulo 3, envie o capítulo 3.",
            "Reduzir a resolução das imagens. Uma digitalização a 600 dpi tem quatro vezes os pixels da mesma a 300 dpi, e 300 dpi já ultrapassa o que qualquer tela mostra.",
          ],
        },
        {
          h2: "O que não funciona",
          body: [
            "Colocar em um ZIP economiza quase nada. Os fluxos dentro de um PDF já estão comprimidos, e comprimir dado comprimido é uma operação nula.",
            "A outra armadilha é a versão agressiva de “comprimir”: uma ferramenta que desenha cada página como bitmap e reconstrói o PDF em volta dessas fotos. O número diminui e o documento fica arruinado — o texto vira uma fotografia de texto, então não dá para buscar, não dá para copiar, um leitor de tela não lê e a impressão sai mole. Se você comprimiu um PDF e não consegue mais selecionar o texto, foi isso que aconteceu.",
          ],
        },
        {
          h2: "O que nosso compressor faz — e quando ele recusa",
          body: [
            "Ele recodifica imagens JPEG e não toca em mais nada. Texto continua texto. Fontes, links e estrutura passam sem alteração.",
            "A consequência é que às vezes não há o que fazer. Rodamos contra a digitalização real de um recibo de 1929 cujas páginas não estavam guardadas como JPEG, e ele não produziu download nenhum, em vez de devolver um arquivo do mesmo tamanho com um rótulo que soasse menor. Se sua digitalização está em outro formato, essa é a resposta honesta: o que resta é reduzir a quantidade de páginas ou a resolução.",
          ],
        },
      ],
      faq: [
        {
          q: "Quanto meu PDF vai diminuir?",
          a: "Depende inteiramente do que há dentro. Documentos cheios de fotos costumam cair para metade ou menos. Um PDF só de texto já está perto do piso e mal vai se mexer — não havia nada pesado nele para começar.",
        },
        {
          q: "Comprimir quebra o texto ou os links?",
          a: "Não com uma abordagem que só mexe em imagens. Apenas as fotos embutidas são reescritas; caracteres, fontes, links e marcadores são copiados. Ferramentas que achatam cada página em imagem destroem tudo isso.",
        },
        {
          q: "Meu PDF digitalizado mal diminuiu. Por quê?",
          a: "Nem todo scanner guarda as páginas como JPEG. Se estiverem em outro formato de imagem, um recodificador de JPEG não tem onde se apoiar. De todo modo, extrair só as páginas necessárias costuma render mais.",
        },
      ],
    },

    "mov-vs-mp4": {
      metaTitle: "MOV ou MP4: o que muda de verdade",
      metaDescription:
        "MOV e MP4 são parentes próximos, e converter entre eles normalmente não exige recodificar nada. Quando sai de graça e quando custa qualidade.",
      h1: "MOV contra MP4 — o que muda de verdade",
      lead: "Eles são bem mais próximos do que as extensões diferentes sugerem. Saber o quanto revela quando uma conversão sai de graça e quando ela custa qualidade de imagem.",
      sections: [
        {
          h2: "Mesma família, sobrenome diferente",
          body: [
            "MOV é o formato de arquivo QuickTime da Apple. MP4 é o formato-base de mídia da ISO — padronizado tomando o QuickTime como ponto de partida. São pai e filho, não rivais.",
            "Os dois são contêineres: caixas que guardam uma faixa de vídeo, uma de áudio, informação de tempo e metadados. O vídeo lá dentro costuma ser o mesmo codec dos dois lados — H.264 ou HEVC. Um .mov de um iPhone e um .mp4 do mesmo iPhone podem carregar vídeo equivalente byte a byte.",
          ],
        },
        {
          h2: "Então por que algo recusa MOV?",
          body: [
            "Na maioria das vezes pela extensão, não por incapacidade. Formulários de envio, plataformas de vídeo, editores e programas de apresentação olham o nome do arquivo e recusam .mov antes mesmo de abri-lo.",
            "O MOV também permite algumas coisas que o MP4 não permite — certas faixas próprias da Apple e codecs como o ProRes. Então um software que toca MP4 sem problema não pode prometer que tocará qualquer MOV. É mais fácil recusar a extensão inteira.",
          ],
        },
        {
          h2: "Converter sem recodificar é o ponto principal",
          body: [
            "Como a faixa de vídeo já está em uma forma que o MP4 aceita, converter MOV para MP4 não precisa decodificar nem recomprimir nada. As faixas são retiradas da caixa QuickTime e escritas em uma caixa MP4. Isso se chama remultiplexar.",
            "É sem perda — a imagem é idêntica bit a bit ao original — e leva segundos em vez de minutos, porque nenhum codificador chega a rodar. Qualquer ferramenta que leve dez minutos e devolva algo mais mole que o original fez a coisa errada.",
            "Cortar funciona igual: tirar um trecho de um MP4 também dispensa codificador. O detalhe é que os cortes caem em quadros-chave, então o início de um corte pode deslocar uma fração de segundo. É uma limitação real e vale saber antes de cortar, não depois.",
          ],
        },
        {
          h2: "Quando recodificar é inevitável",
          body: ["Trocar o codec, e não a caixa, é o que custa tempo e qualidade:"],
          list: [
            "MP4 para WebM — família de codecs completamente diferente, então cada quadro é decodificado e recomprimido.",
            "Deixar o arquivo menor — comprimir é recodificar por definição; não existe versão gratuita disso.",
            "Vídeo para GIF — GIF é outra coisa por completo, limitado a 256 cores, e o resultado vai pesar várias vezes o vídeo de origem.",
          ],
        },
        {
          h2: "A armadilha da rotação sobre a qual ninguém avisa",
          body: [
            "Filme algo na vertical com o celular e o arquivo normalmente não contém pixels verticais. O sensor escreve um quadro deitado e o contêiner registra uma matriz de rotação dizendo “gire isto 90 graus ao reproduzir”. Os reprodutores leem. Conversores ingênuos não.",
            "É assim que um clipe vertical sai de um conversor deitado de lado. Medimos exatamente isso em quatro das nossas próprias ferramentas em julho de 2026 — converter, cortar, comprimir e GIF entregavam vídeo virado — e a correção depende da saída: em MP4 se reescreve a matriz; em WebM e GIF não há matriz, então os pixels precisam ser girados de verdade antes de codificar.",
            "Sobreviveu muito tempo porque todos os nossos arquivos de teste de vídeo eram deitados. Não era um defeito que se escondia: era um buraco nas amostras.",
          ],
        },
      ],
      faq: [
        {
          q: "Converter MOV para MP4 perde qualidade?",
          a: "Não precisa perder. Se o vídeo já é H.264 ou HEVC, as faixas podem ser copiadas intactas para um contêiner MP4, e isso é idêntico bit a bit. Só uma troca de codec obriga a recodificar.",
        },
        {
          q: "Por que meu arquivo convertido ficou do mesmo tamanho?",
          a: "Porque trocar de contêiner não comprime nada — move o mesmo vídeo para outra caixa. Se você quer um arquivo menor precisa de compressão, que é uma recodificação e uma operação à parte.",
        },
        {
          q: "Qual devo guardar, MOV ou MP4?",
          a: "MP4, a menos que você vá ficar dentro das ferramentas de edição da Apple. Tudo aceita MP4; MOV é recusado pela extensão com frequência suficiente para incomodar.",
        },
      ],
    },
  },
} satisfies GuideCopy;
