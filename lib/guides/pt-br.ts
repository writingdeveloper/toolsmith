import type { GuideCopy } from "./registry";

export const ptBr = {
  hub: {
    metaTitle: "Guias — formatos de arquivo sem rodeios",
    metaDescription:
      "Por que HEIC não abre, qual formato de imagem escolher, por que seu PDF é tão pesado, o que a IA não consegue fazer. Respostas de arquivos que medimos.",
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

    "how-background-removal-works": {
      metaTitle: "Como remover o fundo funciona de verdade",
      metaDescription:
        "Um modelo estima quanto de cada pixel é o objeto — nada é recortado. Isso explica o cabelo esfumaçado e as fotos com que ele simplesmente não dá conta.",
      h1: "Como remover o fundo funciona de verdade — e quando falha",
      lead: "Nada está sendo recortado. Um modelo estima, pixel a pixel, quanto de cada um pertence ao objeto. Sabendo disso, todo resultado estranho que você já viu passa a fazer sentido.",
      sections: [
        {
          h2: "O que sai é uma máscara, não um recorte",
          body: [
            "O modelo olha sua foto e devolve uma imagem em tons de cinza com o mesmo formato: branca onde tem certeza de que aquele pixel é o objeto, preta onde tem certeza de que é fundo, e cinza em todos os pontos em que está em dúvida. Essa imagem vira diretamente o canal de transparência do resultado.",
            "Então não há contorno, não há traçado e nada foi decalcado. O que volta é **confiança**, desenhada como transparência. Cabelo, pelo, borrão de movimento, vidro e sombra caem no meio dessa faixa — e a suavidade que você vê nessas bordas é o modelo sendo honesto, não sendo ruim.",
          ],
        },
        {
          h2: "O modelo procura uma única coisa evidente",
          body: [
            "A U²-Net, que é o que roda aqui, é uma rede de detecção de objeto saliente. Ela foi treinada para responder a uma pergunta só: nesta imagem, o que se destaca? Um objeto sobre um fundo razoavelmente simples é exatamente o terreno dela.",
            "Dê a ela uma imagem sem resposta única e ela não recusa — espalha uma máscara fraca e incerta por tudo. Passamos vinte e quatro fotografias e lemos os valores de alfa. As dez sem objeto único voltaram como manchas translúcidas ou como nada: uma foto aérea de floresta produziu **0,0%** de pixels confiantes e ainda assim «funcionou» formalmente.",
            "Essa falha é silenciosa, e por isso agora a ferramenta mede a máscara e avisa em vez de te entregar um PNG vazio.",
          ],
          list: [
            "Funciona: uma pessoa, um produto sobre a mesa, um bicho de estimação, um sapato, uma bicicleta, uma montanha contra o céu.",
            "Não funciona: multidões, trânsito, um campo de tulipas, uma estante, um recife de corais, floresta vista de cima.",
            "No meio: um grupo de objetos parecidos — talvez saiam alguns, e meio transparentes.",
          ],
        },
        {
          h2: "Por que as bordas amolecem e por que fotos grandes ficam piores",
          body: [
            "O modelo vê sua imagem em 320×320 pixels, qualquer que seja o tamanho real, e a máscara volta também em 320×320. Para aplicá-la é preciso esticá-la de volta às dimensões originais. Numa foto de 4000 pixels, um pixel de máscara cobre mais de uma dezena de pixels reais, e isso aparece no contorno.",
            "Escolher uma foto melhor não resolve — é o formato do método. Se você vai usar o resultado pequeno, não fará diferença; se vai usar grande, fará.",
            "Há também uma troca direta entre download e qualidade. O modelo rápido tem 4,4 MB e o preciso 168 MB: quarenta vezes maior, e visivelmente diferente na mesma foto. O pequeno tende a deixar um fantasma tênue do fundo; o grande separa cabelo e objetos pequenos com limpeza.",
          ],
        },
        {
          h2: "Quando o modelo não deveria ser quem escolhe",
          body: [
            "Se a foto tem vários objetos, ou o que você quer não é o protagonista do enquadramento, aumentar a qualidade do modelo não ajuda: nunca lhe perguntaram a qual você se referia.",
            "Para isso existe outra ferramenta. O recorte por clique passa um codificador pesado sobre a imagem uma única vez e depois responde a cada clique quase de imediato. Medimos 6,0 segundos de codificador e 0,10 segundo por clique na CPU, e é só por isso que dá para ser uma interface de clicar e ver em vez de esperar e ver. Um ponto costuma pegar parte de um objeto; o segundo ponto diz o que mais faz parte dele.",
          ],
        },
        {
          h2: "Salve em PNG, ou a transparência some",
          body: [
            "JPG não tem canal de transparência nenhum. Salve um recorte como JPG e a região transparente não continua transparente — volta em branco ou preto, e muita gente se surpreende com isso depois do fato. PNG e WebP carregam alfa; use um dos dois.",
            "Mais uma coisa que vale dizer em voz alta: as fotos que as pessoas passam por um removedor de fundo costumam ser de pessoas. Isso roda dentro da aba do navegador, então a imagem não é enviada a lugar nenhum — mas o modelo precisa ser baixado antes de começar, e informamos o tamanho antes de você se comprometer.",
          ],
        },
      ],
      faq: [
        {
          q: "Por que apareceu que não encontrou nenhum objeto?",
          a: "Porque a máscara saiu fraca em toda parte, em vez de forte em algum lugar. Contamos separadamente os pixels claramente de primeiro plano e os incertos; se quase não há confiantes, ou se os incertos os superam de longe, a resposta honesta é que aquela foto não tem um objeto único a encontrar.",
        },
        {
          q: "Dá para conseguir uma borda limpa no cabelo?",
          a: "Em parte. O modelo preciso é bem melhor com cabelo. Mas a máscara é calculada em 320×320 e ampliada, então numa foto de alta resolução há um limite para o quão fina essa borda pode ser: ela nunca vai igualar uma máscara feita à mão.",
        },
        {
          q: "Removeu o objeto errado. Dá para escolher?",
          a: "Com a remoção de fundo não — o modelo escolhe o que se destaca e não tem como saber o que você queria. Use a ferramenta de recorte por clique: você aponta o objeto desejado e acrescenta pontos para incluir ou excluir partes.",
        },
      ],
    },

    "does-upscaling-add-detail": {
      metaTitle: "A IA cria detalhe real ao ampliar?",
      metaDescription:
        "Não — ela inventa detalhe plausível. Por isso ganha em imagens comprimidas e piora uma fotografia limpa. Medimos os dois casos.",
      h1: "A IA cria detalhe real ao ampliar uma imagem?",
      lead: "A resposta curta é não. A longa é mais útil: ela inventa detalhe que parece certo, e se isso ajuda depende inteiramente do que havia de errado com a sua imagem.",
      sections: [
        {
          h2: "O que o modelo realmente faz",
          body: [
            "A ampliação comum tira a média dos pixels vizinhos. Não consegue inventar nada, então o resultado é uma versão maior e mais mole do que você tinha — nunca mais nítida.",
            "Um modelo de ampliação faz outra coisa. Ele foi treinado com milhões de pares de imagens, cada um com uma grande e sua gêmea encolhida, até aprender como um cílio, uma parede de tijolos ou uma trama de tecido costumam ficar depois de reduzidos. Dada uma imagem pequena, ele escreve de volta uma grande **plausível**.",
            "A palavra que trabalha ali é «plausível». O detalhe acrescentado não foi recuperado — a informação foi jogada fora quando a imagem foi reduzida, e sumiu. O que volta é um palpite confiante que se parece com o que provavelmente havia lá.",
          ],
        },
        {
          h2: "Medimos ele perdendo para o redimensionamento comum",
          body: [
            "Pegamos uma fotografia de domínio público de 1896, reduzimos para 240 pixels e ampliamos quatro vezes, com o modelo e com reamostragem comum de boa qualidade.",
            "O modelo perdeu. Um tecido xadrez da imagem teve a trama apagada por completo — o modelo leu aquele padrão fino e regular como ruído e o alisou — e o rosto ficou parecendo cera. A ampliação comum ficou mais borrada e mais fiel.",
          ],
        },
        {
          h2: "E depois medimos ele ganhando com folga",
          body: [
            "Salvamos a mesma fotografia como JPEG de qualidade 35 — mais ou menos o estado de uma enorme quantidade de imagens que circulam pela internet — e refizemos a comparação. Desta vez o modelo ganhou de longe: os blocos da compressão sumiram e as bordas voltaram.",
            "A razão é que esse tipo de modelo foi construído para **reparar dano**, não para ampliar. Ele remove o que lê como ruído. Blocagem de compressão é ruído, então some e a imagem melhora. Grão de filme e tecidos finos também são lidos como ruído, então também somem e a imagem piora.",
            "Daí sai uma regra utilizável. Se o problema da sua imagem é que ela foi comprimida, capturada ou salva de novo até morrer, o modelo ajuda. Se o problema é só que ela é pequena mas está limpa, a ampliação comum pode ser o resultado mais honesto.",
          ],
        },
        {
          h2: "O teto de tamanho não é arbitrário",
          body: [
            "Quatro vezes a largura são dezesseis vezes os pixels. Um megapixel de entrada vira dezesseis de saída, e cada um deles é produzido por uma rede neural em vez de copiado.",
            "Por isso existe um limite de entrada, e por isso desativamos o botão e explicamos o motivo em vez de deixar você tentar. Congelar a aba por vários minutos e não entregar nada é o pior resultado possível, e é o que acontece se o limite não for aplicado.",
            "A opção 2× é feita produzindo o 4× e reduzindo pela metade, não pedindo 2× diretamente. O detalhe inventado se organiza ao encolher, então o resultado fica melhor. Leva o mesmo tempo, porque a parte cara aconteceu de qualquer jeito.",
          ],
        },
        {
          h2: "O modelo mais nítido não é o modelo certo",
          body: [
            "Comparamos dois candidatos com licença aceitável. O baseado em transformadores é visivelmente mais nítido e levou 9,7 segundos numa imagem de 128×128. O convolucional compacto levou 16,5 segundos numa de 512×512 — dezesseis vezes mais pixels. Por pixel, isso dá cerca de **sessenta vezes** de diferença.",
            "E uma placa de vídeo não salva o lento. Aqui medimos a WebGPU cerca de **3,4 vezes** mais rápida que a CPU, não as vinte ou cinquenta que as pessoas esperam, porque compilar sombreadores e mover dados até a placa custa tempo real. Três vezes vale a pena, mas um modelo inviável na CPU costuma continuar inviável na GPU.",
            "Ou seja: o modelo mais nítido é aquele que ninguém esperaria, e o que vai no ar é o que termina. É o mesmo critério usado para escolher todo modelo deste site.",
          ],
        },
      ],
      faq: [
        {
          q: "Ele consegue ler uma placa de carro, como na TV?",
          a: "Não — e essa é a coisa mais importante a entender. Se os caracteres já se foram, o modelo vai produzir algo nítido, confiante e errado. Ele gera o que encaixa de forma plausível, exatamente a ferramenta errada para qualquer coisa que precise ser verdadeira.",
        },
        {
          q: "Por que o resultado ficou com cara de cera ou de plástico?",
          a: "Porque o seu original estava limpo. O modelo tira o que lê como ruído, e grão de filme, textura de pele e tecidos finos são todos lidos assim. Se a origem não tem dano de compressão a reparar, o redimensionamento comum costuma ser a escolha melhor.",
        },
        {
          q: "Qual o tamanho máximo que posso ampliar?",
          a: "Cerca de um megapixel na entrada, porque o 4× transforma isso em dezesseis megapixels na saída. Entradas maiores levariam minutos e poderiam esgotar a memória da aba, então a ferramenta recusa antes em vez de falhar no meio.",
        },
      ],
    },

    "srt-vs-vtt": {
      metaTitle: "SRT ou VTT: qual arquivo de legenda?",
      metaDescription:
        "Os dois se separam por uma linha de cabeçalho e um sinal de pontuação. Veja qual cada player quer — e onde a legenda automática erra.",
      h1: "SRT ou VTT — de qual arquivo de legenda você precisa?",
      lead: "Abra os dois num editor de texto e você vai ter dificuldade para distingui-los. As diferenças são mínimas, mas uma delas decide se uma página web vai sequer exibir a sua legenda.",
      sections: [
        {
          h2: "Os dois são texto puro com marcas de tempo",
          body: [
            "Um arquivo SRT é uma lista numerada de blocos. Cada bloco tem um índice, um horário de início e fim como `00:00:01,000 --> 00:00:04,000` e as linhas a exibir. O formato é isso inteiro. A simplicidade explica por que ele aparece em toda parte — players, TVs, programas de edição, plataformas de vídeo.",
            "VTT é a mesma ideia reescrita para a web. Foi padronizado para que navegadores pudessem exibir legendas direto num elemento de vídeo HTML, e abre espaço para coisas que o SRT nunca teve onde guardar.",
          ],
        },
        {
          h2: "As diferenças, todas elas",
          body: ["Não são muitas, e todas são mecânicas:"],
          list: [
            "Um arquivo VTT precisa começar com a linha `WEBVTT`. Se ela faltar, o navegador rejeita o arquivo inteiro — é de longe o motivo mais comum de a legenda simplesmente não aparecer.",
            "As frações de segundo são separadas por vírgula no SRT e por ponto no VTT.",
            "O SRT exige os números de bloco. O VTT os trata como rótulos opcionais.",
            "O VTT pode carregar posição, alinhamento, estilo e identificação de quem fala. O SRT não tem noção de nada disso.",
            "O elemento `<track>` do vídeo HTML5 aceita apenas VTT. Ele não carrega um SRT.",
          ],
        },
        {
          h2: "Então qual você quer",
          body: [
            "Se o vídeo roda numa página web que você controla, VTT — não há escolha. Para todo o resto, SRT é o arquivo mais seguro: players de desktop, celulares, TVs, programas de edição e todas as plataformas grandes aceitam, e vários deles não aceitam VTT.",
            "Como a conversão é mecânica, não vale sofrer com isso. Nossa ferramenta de legendas escreve os dois arquivos a partir da mesma transcrição, então leve o que o destino pedir.",
          ],
        },
        {
          h2: "Como a legenda automática é feita — e como ela falha",
          body: [
            "Legendas geradas saem de um modelo de reconhecimento de fala. O áudio é decodificado, reamostrado para 16 kHz e entregue ao modelo, que devolve o texto junto com o instante em que cada trecho começou e terminou. Aqui isso acontece dentro da aba, o que significa que o modelo precisa ser baixado antes — 151 MB ou 291 MB conforme sua escolha — então a ferramenta diz o número **antes** de começar, não depois.",
            "O modo de falha que vale conhecer é que áudio ruim não produz texto um pouco pior: produz um laço. Demos a ele uma gravação de discurso de 1948 e ele devolveu a mesma sílaba repetidamente. Uma gravação moderna limpa no mesmo idioma deu cerca de quarenta palavras com dois erros. Era qualidade de gravação, não dificuldade do idioma — e por ser a falha que mais gente vai encontrar, ela é um aviso permanente na página, não uma nota escondida no FAQ.",
            "Mas o erro mais caro é o **seletor de idioma**. Aponte um modelo de reconhecimento para o idioma errado e ele não para; produz um disparate fluente e confiante — medimos uma gravação em inglês transcrita como cento e vinte linhas de bobagem em coreano. Se a transcrição parece um texto plausível que não tem nada a ver com o áudio, comece por aí.",
          ],
        },
        {
          h2: "Traduzir é outro trabalho",
          body: [
            "A tradução roda mais um modelo diferente: um multilíngue de 418 milhões de parâmetros que cobre cem idiomas em qualquer direção. É pequeno o bastante para rodar numa aba, e esse tamanho define a qualidade.",
            "A descrição honesta: de vinte linhas, cerca de quinze saem bem e cinco ficam desajeitadas mas compreensíveis. Frases comuns vão bem. Onde ele escorrega é nas expressões idiomáticas — «let's wrap this up» («vamos encerrar») saiu com sentido de «vamos começar» tanto em espanhol quanto em alemão, e isso não é um erro pequeno.",
            "Exclamações muito curtas são o único caso em que ele não apenas escorrega, mas desmorona em repetição. Em vez de entregar isso, a ferramenta detecta o desmoronamento e **deixa a linha original sem tradução**, para você ver quais linhas precisam de uma pessoa.",
          ],
        },
      ],
      faq: [
        {
          q: "Posso só renomear um .srt para .vtt?",
          a: "Não. Vai faltar a linha de cabeçalho `WEBVTT`, e as marcas de tempo usam vírgula onde o VTT espera ponto. O navegador rejeita de cara. A conversão é simples, mas não é uma renomeação.",
        },
        {
          q: "As legendas ficam gravadas no vídeo?",
          a: "Não — o arquivo de legenda fica ao lado do vídeo, e o player o desenha. É o arranjo melhor: quem assiste pode desligar, você corrige um erro de digitação sem recodificar, e o mesmo vídeo pode levar vários idiomas.",
        },
        {
          q: "O texto está fluente mas não tem nada a ver com o áudio.",
          a: "O idioma está configurado errado. Um modelo de fala a quem se pede o idioma errado não falha — ele produz, com toda a confiança, um texto bem formado naquele idioma. Ajuste o idioma falado e rode de novo.",
        },
      ],
    },

    "what-are-stems": {
      metaTitle: "O que são stems e dá para separar?",
      metaDescription:
        "Stems são as partes separadas de uma mixagem. Tirá-las de uma música pronta é estimativa, não recuperação — medimos o quanto essa estimativa acerta.",
      h1: "O que são stems — e dá mesmo para separar uma música pronta?",
      lead: "Num estúdio, os stems existem antes da mixagem. Tirá-los de um arquivo que já foi mixado é uma operação completamente diferente, e vale saber o que você está de fato recebendo.",
      sections: [
        {
          h2: "Stems, no sentido próprio",
          body: [
            "Um stem é uma submixagem agrupada mantida à parte do resto: toda a bateria em um, todo o vocal em outro, e assim por diante. Existem para que um engenheiro de masterização, um remixer ou um técnico de som ao vivo possa trabalhar numa parte sem tocar nas outras.",
            "Stems de verdade são simplesmente arquivos que alguém guardou. Se você os tem, não há nada a estimar — eles nunca chegaram a ser combinados.",
          ],
        },
        {
          h2: "Separação não é a mesma coisa",
          body: [
            "Depois que a faixa é mixada, todas as partes foram somadas em dois canais de áudio. Essa soma não é reversível; as partes individuais não existem mais em lugar nenhum do arquivo.",
            "Então um modelo de separação não as recupera. Ele estima: dada esta mistura, como cada parte provavelmente soava sozinha? Ele ouviu música suficiente para acertar muito, mas é um palpite.",
            "Daí o caráter tão particular dos resultados. As partes costumam convencer sozinhas, com um traço tênue das outras ainda audível, e trechos densos ganham uma qualidade meio aquosa, borrada. Não são defeitos a corrigir — é assim que soa uma estimativa.",
          ],
        },
        {
          h2: "O que volta para você",
          body: [
            "Quatro faixas: vocal, bateria, baixo e todo o resto. Essa última não é um descuido do modelo — é a categoria de guitarras, teclados, cordas, sintetizadores e tudo que não seja uma das outras três. Se a sua música se apoia num piano, o piano está em «outros».",
            "Todo stem tem a duração inteira do original e se alinha com ele exatamente, então dá para carregá-los em qualquer editor e eles ficam sincronizados.",
          ],
        },
        {
          h2: "Funciona bem? Nós medimos",
          body: [
            "«Rodou e saíram quatro arquivos» não prova absolutamente nada — quatro arquivos de papa plausível pareceriam idênticos. Então montamos uma mistura cujos ingredientes conhecíamos exatamente: uma gravação de fala, uma senoide de 60 Hz fazendo as vezes de baixo e rajadas curtas de ruído fazendo as vezes de bateria. Depois correlacionamos cada stem de saída com cada ingrediente conhecido.",
            "Cada stem bateu com o próprio ingrediente em quase exatamente 1,0 e com os demais em quase exatamente 0. O stem de bateria continha as rajadas de ruído e essencialmente nada mais; o de baixo continha a senoide e essencialmente nada mais.",
            "Esse teste prova que a separação é real e está corretamente ligada. **Não prova que qualquer música vá se separar com limpeza** — música real é bem mais difícil que uma mistura sintética, e uma masterização muito densa ou muito comprimida é mais difícil ainda.",
          ],
        },
        {
          h2: "É lento, e isso é um fato sobre o método",
          body: [
            "A separação passa a forma de onda inteira por uma rede neural. Medimos 7,8 segundos de áudio levando 15,1 segundos para processar — aproximadamente o dobro do tempo real. Uma música inteira, portanto, passa de seis minutos.",
            "Por isso a ferramenta trabalha numa prévia de 30 segundos e **diz o número antes de você apertar qualquer coisa**, em vez de iniciar um trabalho de seis minutos numa aba e torcer para você ficar.",
          ],
        },
        {
          h2: "Separar não cria direito de usar",
          body: [
            "Tirar o vocal de um disco comercial não muda de quem é aquela gravação. Praticar sobre um instrumental, estudar um arranjo ou fazer algo para você mesmo é uma situação; publicar ou distribuir o resultado é outra, e a separação não afeta isso em nada.",
            "Nada do que você carrega aqui sai da sua máquina — mas isso é uma afirmação **sobre privacidade, não sobre licenciamento**.",
          ],
        },
      ],
      faq: [
        {
          q: "Dá para fazer um playback de karaokê de uma música?",
          a: "Dá — pegue todos os stems menos o vocal e misture de novo. Espere um resíduo tênue de voz nos trechos densos; o modelo estima, e onde a voz se sobrepõe a instrumentos altos ele não consegue separar os dois por completo.",
        },
        {
          q: "Os stems soam tão bem quanto o original?",
          a: "Somados de volta, ficam bem próximos. Ouvidos separadamente em fones, dá para notar artefatos — principalmente uma qualidade meio aquosa e traços das outras partes. Cada stem é uma reconstrução, não uma extração.",
        },
        {
          q: "Por que só 30 segundos?",
          a: "Porque o processamento roda a cerca do dobro do tempo real num navegador, então uma música inteira passaria de seis minutos com a aba aberta. A prévia deixa você ouvir se a separação é boa o bastante para a sua faixa antes de se comprometer.",
        },
      ],
    },

    "why-pdf-wont-open": {
      metaTitle: "Por que meu PDF não abre?",
      metaDescription: "Um PDF que falha costuma falhar por uma de cinco razões, e cada uma pede uma solução diferente. Veja como descobrir qual é a sua.",
      h1: "Por que meu PDF não abre?",
      lead: "«Não é possível abrir este arquivo» cobre pelo menos cinco problemas completamente distintos. Distingui-los leva uns dez segundos e evita que você tente a solução errada.",
      sections: [
        {
          h2: "Primeiro: falha em todo lugar ou só num?",
          body: [
            "Arraste o arquivo para uma aba do navegador. Navegadores têm o próprio motor de PDF, então isso já diz se o arquivo está quebrado ou se é o seu leitor.",
            "Se abre no navegador mas não no leitor de desktop, o arquivo está bem. Atualize o leitor ou simplesmente use o navegador. Se falha nos dois, continue lendo.",
          ],
        },
        {
          h2: "Ele pede senha — e existem duas",
          body: [
            "Um PDF pode carregar duas senhas distintas, e poucas pessoas sabem disso. A **senha de usuário** impede abrir o documento. A **senha de proprietário** deixa legível mas restringe imprimir, copiar ou editar.",
            "Isso importa porque as ferramentas se comportam de forma diferente. Um arquivo só com senha de proprietário abre normalmente em quase qualquer leitor e parece desprotegido — mas muitas ferramentas se recusam a modificá-lo, o que parece arquivo quebrado quando na verdade é permissão.",
            "Não há forma honesta de contornar uma senha de usuário: o conteúdo está realmente cifrado. Nossas ferramentas de PDF recusam arquivos cifrados e dizem isso, em vez de devolver algo vazio. Testamos com arquivos cifrados em AES reais e com outros escritos pelo LibreOffice; as quatro recusaram corretamente.",
          ],
        },
        {
          h2: "O texto está lá mas aparece como quadradinhos vazios",
          body: [
            "É problema de fonte, muito comum em documentos em chinês, japonês e coreano. Os caracteres existem no arquivo, mas a fonte que os desenha não foi incorporada — o leitor substitui por outra que não tem aqueles glifos e saem fileiras de retângulos ocos.",
            "Vale saber que é uma falha de *desenho*, não de dados. Copie o texto e ele estará intacto. Se precisa que apareça certo, o conserto está na máquina que gerou o PDF: incorpore as fontes ao exportar.",
          ],
        },
        {
          h2: "Páginas em branco, ou um escaneamento que não mostra nada",
          body: [
            "Alguns PDFs guardam imagens em formatos que nem todo motor implementa — JBIG2 e JPEG 2000 são os usuais, e ambos são comuns em digitalizações de equipamentos de escritório. Um motor sem esses decodificadores desenha uma página em branco em vez de dar erro.",
            "O sinal é a página vazia com arquivo pesado. Páginas realmente em branco são minúsculas.",
          ],
        },
        {
          h2: "Está truncado ou corrompido",
          body: [
            "Um PDF mantém o índice de objetos **no fim** do arquivo. Por isso um PDF baixado pela metade falha por completo em vez de mostrar as primeiras páginas: o leitor procura o índice, não acha e desiste.",
            "Se veio por e-mail ou download, compare o tamanho com o original. Um arquivo que para no meio não tem conserto significativo; baixe de novo.",
          ],
        },
        {
          h2: "O que fazer depois de saber qual é",
          body: [
            "Casar a solução com a causa economiza muito tempo:",
          ],
          list: [
            "Abre no navegador mas não no leitor → é o leitor. Use o navegador ou atualize-o.",
            "Pede senha → você precisa da senha. Nenhuma ferramenta a contorna honestamente.",
            "Quadradinhos em vez de caracteres → as fontes não foram incorporadas. O texto está bem; exporte de novo da origem.",
            "Páginas em branco e arquivo grande → um formato de imagem que seu leitor não decodifica. Tente outro leitor.",
            "Falha na hora e o arquivo parece pequeno → está truncado. Baixe outra vez.",
          ],
        },
      ],
      faq: [
        {
          q: "Uma ferramenta consegue remover a senha de um PDF?",
          a: "A que cifra o conteúdo, não. Se um documento exige senha para abrir, os bytes estão cifrados e não há com o que trabalhar. Ferramentas que dizem o contrário estão adivinhando senhas ou tratando o caso só de permissões.",
        },
        {
          q: "Por que o mesmo PDF fica diferente em dois programas?",
          a: "Porque cada leitor tem o próprio motor, e eles diferem em quais fontes substituem e quais formatos de imagem decodificam. Um PDF descreve uma página; não garante que dois motores a desenhem igual.",
        },
        {
          q: "Meu PDF abre mas não consigo selecionar o texto.",
          a: "Então não há camada de texto: as páginas são imagens. Acontece com digitalizações e também com arquivos que alguns compressores produzem achatando cada página. O reconhecimento de texto pode devolver essa camada.",
        },
      ],
    },

    "csv-vs-excel": {
      metaTitle: "CSV contra Excel: o que muda de verdade",
      metaDescription: "Um CSV não tem tipos, nem formatação, nem abas — é só texto. Esse único fato explica tudo de estranho que o Excel faz ao abrir um.",
      h1: "CSV contra Excel — o que muda de verdade",
      lead: "Quase tudo de confuso que acontece com um CSV vem de um fato: o arquivo não faz ideia do que seus valores significam. O Excel adivinha, e é no adivinhar que os dados se estragam.",
      sections: [
        {
          h2: "Um CSV é texto. O formato é isso inteiro.",
          body: [
            "Um CSV são linhas de caracteres separadas por vírgulas. Não há mais nada — nem tipos de célula, nem fórmulas, nem formatação, nem várias abas, nem larguras de coluna. `007` num CSV são três caracteres, nem número nem texto; o arquivo não diz qual.",
            "Um .xlsx é o oposto: um pacote compactado que registra, para cada célula, que tipo de valor ela guarda e como deve aparecer. Por isso é maior e por isso sobrevive intacto a uma ida e volta.",
          ],
        },
        {
          h2: "O que o Excel faz com seus dados ao abrir um CSV",
          body: [
            "Como o arquivo não declara tipos, o Excel os infere. Os palpites são razoáveis no caso médio e destrutivos em casos específicos:",
          ],
          list: [
            "Zeros à esquerda somem. `007` vira `7`. CEPs, números de conta e códigos de peça são as vítimas de sempre.",
            "O que parece data vira data. `1-2` vira 2 de janeiro. Isso obrigou geneticistas a renomear genes porque o Excel insistia em transformar SEPT2 numa data.",
            "Números longos passam a notação científica e perdem o fim. Um identificador de 16 dígitos volta como `1,23457E+15`, e os dígitos perdidos não voltam mudando o formato depois.",
            "E o estrago é salvo quando você salva. O arquivo original estava certo; o que o Excel grava de volta, não.",
          ],
        },
        {
          h2: "Por que seu CSV sai com caracteres estranhos ou tudo numa coluna",
          body: [
            "Dois problemas distintos, ambos sobre suposições que o arquivo não consegue declarar.",
            "**A codificação.** Um CSV não registra sua codificação de caracteres. O Excel no Windows historicamente assumiu a página de código local em vez de UTF-8, e por isso acentos, coreano e japonês chegam destruídos. Uma marca UTF-8 no início costuma resolver.",
            "**O separador.** Em países onde a vírgula é o separador decimal, as planilhas escrevem e esperam ponto e vírgula. Abra um arquivo desses em outro lugar e cada linha cai numa única coluna. O arquivo não está quebrado; os dois programas discordam sobre o que uma vírgula significa.",
          ],
        },
        {
          h2: "Quando o arquivo é simplesmente grande demais",
          body: [
            "Uma planilha tem um teto rígido de pouco mais de 1.048.576 linhas, e fica lenta muito antes disso porque carrega tudo na memória para deixar tudo editável.",
            "Passado certo tamanho, o certo é parar de abrir o arquivo e começar a fazer perguntas a ele. Selecione algumas colunas, filtre, agrupe, conte: a resposta sai em segundos sem a máquina tentar desenhar milhões de células que você nunca ia olhar.",
          ],
        },
        {
          h2: "Parquet, em resumo",
          body: [
            "Se o CSV vive te decepcionando, Parquet é para onde o mundo da análise migrou. Guarda os tipos dentro do arquivo, então nada é adivinhado. Guarda por coluna em vez de por linha, então ler três colunas de cinquenta lê mais ou menos três colunas de bytes. E comprime bem — costuma ficar cinco a dez vezes menor que o mesmo CSV.",
            "O preço é não poder abri-lo num editor de texto. É um formato para consultar, não para olhar.",
          ],
        },
      ],
      faq: [
        {
          q: "Como impedir que o Excel destrua meu CSV?",
          a: "Não abra com duplo clique. Use Dados → De Texto/CSV, que permite definir a codificação e marcar colunas como texto antes de qualquer conversão. Ou consulte o arquivo diretamente e não deixe planilha nenhuma tocá-lo.",
        },
        {
          q: "Um CSV é menor que um arquivo do Excel?",
          a: "Geralmente não, o que surpreende. Um .xlsx é um pacote compactado, e o zip comprime bem texto repetitivo. Um CSV são caracteres sem compressão. O Parquet ganha dos dois com folga.",
        },
        {
          q: "Dá para consultar um CSV sem banco de dados?",
          a: "Dá. Nossa ferramenta de dados roda um motor SQL dentro da aba e lê o arquivo direto do seu disco — nada é enviado, e não há servidor nem banco para montar.",
        },
      ],
    },

    "can-ai-summarize": {
      metaTitle: "Dá para confiar num resumo feito por IA?",
      metaDescription: "Modelos pequenos de resumo falham de formas específicas e repetíveis — copiam, inventam e erram fatos. Isto é o que medimos.",
      h1: "Dá para confiar num resumo feito por IA?",
      lead: "Às vezes, e as falhas são específicas o bastante para valer a pena conhecer. Testamos quatro modelos com os mesmos documentos; dois deles não resumiam nada.",
      sections: [
        {
          h2: "O que um modelo de resumo realmente faz",
          body: [
            "Um modelo de resumo não extrai frases e as costura. Ele lê o documento e então escreve frases novas, palavra por palavra, escolhendo cada uma pelo que costuma vir depois.",
            "Por isso o resultado se lê com naturalidade, e também por isso ele pode errar de um jeito que copiar e colar nunca poderia: nada ancora o texto gerado à fonte além do que o modelo aprendeu.",
          ],
        },
        {
          h2: "Falha um: ele copia em vez de resumir",
          body: [
            "Foi a maior surpresa dos testes. Dois modelos com licenças limpas e permissivas — um de 600 milhões de parâmetros, outro de 350 — não resumiam prosa narrativa. Reproduziam a abertura do documento literalmente.",
            "Os dois lidavam bem com verbetes de enciclopédia. O comportamento só apareceu quando acrescentamos um texto narrativo. Se tivéssemos testado só com material de referência, teríamos publicado um modelo que copia.",
            "Forçá-lo a não copiar piorou em vez de melhorar: envolto em delimitadores, o mesmo modelo produziu uma frase fluente que dizia algo que o documento nunca disse.",
          ],
        },
        {
          h2: "Falha dois: ele inventa quando não há com o que trabalhar",
          body: [
            "Com entrada vazia, um modelo produziu o resumo de uma campanha de saúde pública. Com a única palavra «olá», escreveu três linhas de diário.",
            "Um modelo sempre produz alguma coisa — não existe estado em que ele devolva nada. Se a entrada é curta demais para resumir, o que sai não é um resumo ruim, é ficção. Por isso nossa ferramenta tem um comprimento mínimo e recusa abaixo dele em vez de agradar.",
          ],
        },
        {
          h2: "Falha três: ele erra fatos, com fluência",
          body: [
            "Numa execução o modelo expandiu a sigla NADPH num nome químico que não é o que NADPH significa. A frase estava bem formada e soava segura.",
            "Fluência e exatidão são coisas separadas e falham separadamente. Essa é a falha que você não detecta lendo só o resumo — e é exatamente por isso que um resumo serve para decidir se vale ler algo, não para substituir a leitura.",
          ],
        },
        {
          h2: "No que ele é realmente bom",
          body: [
            "Em descobrir se um documento longo interessa a você. Em pegar a ideia de um relatório num idioma que você lê devagar. Em produzir um primeiro rascunho de resumo que você depois corrige.",
            "Mais um limite que vale conhecer: pedir o resumo num idioma diferente do original é onde os modelos pequenos se desfazem — inventam palavras que não existem ou ignoram a instrução e respondem no idioma de origem. Resumir e traduzir são dois trabalhos; peça um de cada vez.",
          ],
        },
        {
          h2: "Se o documento é digitalizado, nada disso vale ainda",
          body: [
            "Um PDF digitalizado não tem texto, só imagens de texto. Um resumidor que recebe esse arquivo não recebe nada — e, pela segunda falha, um modelo sem nada ainda assim escreve algo.",
            "Passe primeiro o reconhecimento de texto, confira o resultado e só então resuma. O reconhecimento sobre uma digitalização ruim produz os próprios erros, e resumi-los os agrava em silêncio.",
          ],
        },
      ],
      faq: [
        {
          q: "Posso confiar num resumo de IA para algo importante?",
          a: "Use-o para decidir o que ler, não como substituto da leitura. Os erros que ele comete são fluentes e confiantes, ou seja, não parecem erros — é justamente essa propriedade que os torna perigosos para decisões.",
        },
        {
          q: "Por que a ferramenta recusa documentos muito longos em vez de cortá-los?",
          a: "Porque resumir a primeira parte e apresentar como resumo do todo é uma mentira que o leitor não consegue detectar. Recusar é honesto; cortar em silêncio, não.",
        },
        {
          q: "Meu documento é enviado para algum servidor?",
          a: "Não. O modelo é baixado para o seu navegador e o documento é lido ali. É o arranjo inverso ao de um serviço hospedado: quem viaja é o modelo, não o seu arquivo.",
        },
      ],
    },
  },
} satisfies GuideCopy;
