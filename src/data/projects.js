// Projetos do portfólio. Para acrescentar um case, copie um objeto, ajuste os campos e
// coloque as imagens em assets/images/<id>/ (rode tools/build-images.mjs para gerar miniaturas).
//
// Campos:
//   id          identificador e endereço do case (#/projeto/<id>)
//   title       título do projeto
//   kicker      etiqueta curta (organização ou tipo)
//   categories  filtros: design, comunicacao, digital, 3d, ensino
//   status      'publicado' | 'concluido' | 'prototipo' | 'colaborativo' | 'a-confirmar'
//   period      período confirmado (deixe '' quando não houver fonte)
//   summary     uma frase concreta sobre a entrega (aparece no card)
//   featured    true para os destaques da home
//   cover       id da imagem de capa (em media.js)
//   gallery     ids das imagens, na ordem do case, com legenda
//   sections    blocos do case: contexto, desafio, papel, processo, entregas, resultados
//   tools       ferramentas confirmadas pela fonte citada
//   credits     créditos de terceiros
//   links       [{label, href, kind: 'live' | 'code' | 'source'}]
//   sources     de onde vem cada informação (para conferência)
//   pending     pendências factuais visíveis no case (opcional)

export const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'design', label: 'Design gráfico' },
  { id: 'comunicacao', label: 'Comunicação' },
  { id: 'digital', label: 'Web e ferramentas' },
  { id: '3d', label: '3D e interativos' },
  { id: 'ensino', label: 'Ensino e eventos' },
];

export const statusLabel = {
  publicado: 'Publicado',
  concluido: 'Concluído',
  prototipo: 'Protótipo',
  colaborativo: 'Colaborativo',
  'a-confirmar': 'Projeto',
};

export const projects = [
  {
    id: 'helena-3d',
    title: 'Helena Antipoff em 3D',
    kicker: 'Fundação Helena Antipoff · Fab Lab FHA',
    categories: ['3d'],
    status: 'colaborativo',
    period: '',
    featured: true,
    
    summary: 'Reconstrução digital da estátua de Helena Antipoff, em projeto colaborativo com a FHA e o Fab Lab FHA. Explore a escultura digital interativa nesta página.',
    cover: 'render',
    gallery: [['render', 'Reconstrução tridimensional da estátua de Helena Antipoff.']],
    sections: { contexto: 'Projeto colaborativo de preservação da memória de Helena Antipoff, desenvolvido ao longo de aproximadamente um ano com a Fundação Helena Antipoff e o Fab Lab FHA.', papel: 'Participação no processo de reconstrução digital da escultura, utilizando recursos de inteligência artificial e Blender em colaboração com a equipe.', processo: 'A escultura física serviu de referência para a reconstrução digital. O trabalho envolveu estudo da forma, refinamento do modelo tridimensional e preparação de uma experiência interativa para explorar a estátua de diferentes ângulos.', entregas: ['Reconstrução digital da estátua', 'Modelo 3D interativo para exploração no navegador'] },
    tools: ['Blender', 'Inteligência artificial aplicada ao processo de modelagem'],
    links: [],
    sources: ['OBJ fornecido pelo autor', 'Participação da FHA e do Fab Lab FHA conforme briefing do autor (perfil do LinkedIn)'],
  },
  {
    id: 'reurb',
    title: 'REURB: o futuro tem endereço certo',
    kicker: 'Cohab Minas · ASCOM',
    categories: ['design', 'comunicacao'],
    status: 'concluido',
    period: '2026',
    featured: true,
    summary: 'Livreto A5 de 16 páginas, apresentação 16:9 editável e versão web para levar a Regularização Fundiária Urbana às prefeituras mineiras.',
    cover: 'capa',
    gallery: [
      ['capa', 'Capa do livreto "O futuro tem endereço certo".'],
      ['livreto-apresentacao', 'O mesmo conteúdo em livreto A5 e em apresentação 16:9.'],
      ['sobre', 'Projeto, desafio e conceito resumidos na abertura do case.'],
      ['cores-tipografia', 'Paleta de cores da terra com contraponto em índigo; Fraunces e Montserrat.'],
      ['grafismos', 'Família vetorial autoral: horizontes de casas, mapas de lotes, plantas e telhados.'],
      ['capa-contracapa', 'Capa e contracapa contínuas.'],
      ['miolo', 'Páginas internas com números, fotos e serviços.'],
      ['pagina-prefeituras', 'Página sobre as vantagens para as prefeituras.'],
      ['recomposicao-16-9', 'Cada página recomposta para o formato horizontal.'],
      ['apresentacao-slides', 'Visão geral da apresentação em 16:9.'],
      ['resultados', 'Página de resultados da REURB.'],
      ['entradas-em-camadas', 'Estudo das entradas em camadas usadas nas transições.'],
      ['ficha-tecnica', 'Ficha técnica do projeto.'],
      ['versao-web', 'Versão web da apresentação, publicada no GitHub Pages da Cohab Minas.'],
    ],
    sections: {
      contexto: 'Material institucional da Cohab Minas para apresentar a Regularização Fundiária Urbana (REURB) e a Consultoria Habitacional às prefeituras de Minas Gerais.',
      desafio: 'Traduzir um conteúdo técnico (prazos, etapas, garantias e serviços) para gestores públicos, sem perder a dimensão humana do tema.',
      papel: 'Direção de arte, diagramação e criação dos grafismos, segundo a ficha técnica publicada no Behance. Cliente: Cohab Minas, ASCOM.',
      processo: 'O conceito "O futuro tem endereço certo" coloca a casa e as famílias no centro. O livreto nasceu em grampo canoa; depois, cada página foi recomposta para o formato horizontal, e não apenas encaixada nele, mantendo paginação, hierarquia e edição completa no PowerPoint, com transições suaves e entradas em camadas.',
      entregas: ['Livreto A5, 16 páginas, PDF CMYK para gráfica', 'Apresentação 16:9 editável', 'Versão web da apresentação'],
    },
    tools: ['Photoshop', 'Illustrator', 'InDesign', 'PowerPoint'],
    credits: 'Fotografias: acervo institucional da Cohab Minas e Prefeitura de Uberlândia (conforme ficha técnica). Trabalho realizado na ASCOM da Cohab Minas.',
    links: [
      { label: 'Ver apresentação web', href: 'https://cohabminas.github.io/O-futuro-tem-endere-o-certo/', kind: 'live' },
      { label: 'Case no Behance', href: 'https://www.behance.net/gallery/258836771/REURB-Cohab-Minas-Livreto-editorial-e-apresentacao', kind: 'source' },
    ],
    sources: ['Behance, publicado em 21/11/2026', 'Versão web aberta em 22/11/2026'],
  },
  {
    id: 'qr-studio',
    title: 'QR Studio',
    kicker: 'Projeto autoral · Ferramenta web',
    categories: ['digital'],
    status: 'publicado',
    period: '2026',
    featured: true,
    summary: 'Gerador de QR Codes no navegador, com logotipo, cores, molduras e legendas, exportação em SVG, PNG ou JPEG e instalação como aplicativo.',
    cover: 'capa',
    gallery: [
      ['capa', 'Apresentação do QR Studio: ferramenta web instalável, sem anúncios.'],
      ['editor', 'Editor com conteúdo, aparência, logotipo, moldura e exportação.'],
    ],
    sections: {
      contexto: 'Ferramenta gratuita para criar QR Codes personalizados sem cadastro, pensada para quem precisa de um código com cara de marca.',
      desafio: 'Reunir em uma interface simples os ajustes que normalmente ficam espalhados: tipo de conteúdo, cores, estilo, logotipo, moldura, legenda e formato de saída.',
      papel: 'Projeto autoral: interface, desenvolvimento e publicação.',
      processo: 'Interface com pré-visualização em tempo real, opções de personalização e instalação pelo navegador no computador ou celular.',
      entregas: ['Editor com pré-visualização ao vivo', 'Conteúdos: link, WhatsApp, Wi-Fi, contato e texto', 'Exportação em SVG, PNG e JPEG', 'Instalação pelo navegador (PWA)'],
    },
    tools: ['HTML', 'CSS', 'JavaScript', 'PWA'],
    links: [
      { label: 'Ver projeto', href: 'https://odavicaetano.github.io/QR-Studio---Gerador-de-QR-Code/', kind: 'live' },
      { label: 'Código', href: 'https://github.com/odavicaetano/QR-Studio---Gerador-de-QR-Code', kind: 'code' },
    ],
    sources: ['Repositório público (descrição, manifest.json, sw.js)', 'Aplicação aberta em 22/11/2026'],
  },
  {
    id: 'titanic',
    title: 'RMS Titanic 1912: museu virtual 3D',
    kicker: 'Projeto autoral · Experiência 3D',
    categories: ['3d', 'digital'],
    status: 'publicado',
    period: '2026',
    featured: true,
    summary: 'Museu navegável no navegador: o navio completo por fora, dez conveses, cinco cenários internos visitáveis e simuladores.',
    cover: 'capa',
    gallery: [
      ['capa', 'Identidade do museu virtual.'],
      ['museu', 'Tela inicial do museu publicado, com o navio em 3D e os painéis laterais.'],
    ],
    sections: {
      contexto: 'Projeto pessoal de divulgação histórica: uma visita interativa ao RMS Titanic que roda direto no navegador, também no celular.',
      desafio: 'Equilibrar um modelo 3D detalhado com desempenho na web e manter cuidado histórico, deixando claro o que é reconstrução.',
      papel: 'Projeto autoral: concepção, desenvolvimento, curadoria de imagens históricas e publicação.',
      processo: 'Uma experiência imersiva que permite conhecer o navio, explorar ambientes internos, consultar informações históricas e criar ingressos personalizados. Disponível no computador e no celular.',
      entregas: ['Navio completo e dez conveses', 'Cinco cenários internos visitáveis', 'Simuladores e gerador de ingressos', 'PWA instalável e offline'],
    },
    tools: ['three.js', 'JavaScript', 'Node.js (build)', 'PWA'],
    credits: 'Autoria, licenças e fontes das imagens históricas e do modelo estão no arquivo CREDITOS.md do repositório.',
    links: [
      { label: 'Ver projeto', href: 'https://odavicaetano.github.io/RMS-Titanic-1912---Museu-virtual/', kind: 'live' },
      { label: 'Código', href: 'https://github.com/odavicaetano/RMS-Titanic-1912---Museu-virtual', kind: 'code' },
    ],
    sources: ['README e descrição do repositório', 'GitHub Pages aberto e testado em 22/11/2026'],
  },
  {
    id: 'marca-cohab',
    title: 'Estudo da marca de gestão Cohab Minas',
    kicker: 'Cohab Minas · Estudo de marca',
    categories: ['design'],
    status: 'concluido',
    period: '2026',
    featured: false,
    summary: 'Estudo visual e conceitual que parte da identidade histórica da companhia para propor linguagem, paleta, tipografia e aplicações.',
    cover: 'capa',
    gallery: [
      ['capa', 'Assinatura Cohab Minas sobre textura de módulos.'],
      ['assinatura', 'Versão principal da assinatura.'],
      ['estudo', 'Abertura do estudo visual e conceitual.'],
      ['referencias', 'Referências históricas: conjuntos habitacionais e obras.'],
      ['tipografia', 'Montserrat e atributos da marca.'],
      ['paleta', 'Paleta com códigos de cor.'],
      ['aplicacoes', 'Aplicações sobre fundos da paleta.'],
      ['versao-negativa', 'Versão negativa sobre o vermelho institucional.'],
    ],
    sections: {
      contexto: 'A Cohab Minas foi criada em 1965 para atuar em habitação popular e desenvolvimento urbano em Minas Gerais.',
      desafio: 'Sem registros oficiais sobre as referências do símbolo original, o estudo partiu da análise visual e do contexto histórico.',
      papel: 'Pesquisa, análise e criação do estudo visual.',
      processo: 'A análise associa o símbolo ao modernismo brasileiro das décadas de 1960 e 1970: linguagem racionalista, modulação e repetição (casas, blocos, quadras), geometria seca, linhas retas e paletas sóbrias. A partir disso, o estudo propõe tipografia, paleta e aplicações para a marca da gestão.',
      entregas: ['Estudo conceitual', 'Paleta e tipografia', 'Aplicações da assinatura'],
    },
    tools: ['Illustrator', 'InDesign'],
    links: [
      { label: 'Case no Behance', href: 'https://www.behance.net/gallery/256199345/Estudo-e-criacao-da-Marca-de-Gestao-Cohab-Minas', kind: 'source' },
    ],
    sources: ['Behance, publicado em 24/09/2026'],
  },
  {
    id: 'campanhas',
    title: 'Descansos de tela: Setembro Amarelo e Setembro Azul',
    kicker: 'Comunicação interna',
    categories: ['design', 'comunicacao'],
    status: 'concluido',
    period: '2026',
    featured: false,
    summary: 'Peças de campanha que usam os computadores da instituição como ponto de contato com o público interno.',
    cover: 'setembro-amarelo',
    gallery: [
      ['setembro-amarelo', 'Setembro Amarelo: valorização da vida, com o amarelo como elemento central.'],
      ['setembro-azul', 'Setembro Azul: inclusão e acessibilidade.'],
    ],
    sections: {
      contexto: 'Campanhas de setembro levadas para além dos canais tradicionais, ocupando o descanso de tela dos computadores.',
      desafio: 'Fazer uma peça que permaneça clara durante longos períodos de exibição e funcione em telas diferentes, sem pesar no ambiente de trabalho.',
      papel: 'Criação das peças.',
      processo: 'Composição limpa, linguagem acolhedora e mensagem integrada ao cotidiano. No Setembro Azul, os elementos gráficos da campanha apoiam a mensagem de inclusão.',
      entregas: ['Descanso de tela Setembro Amarelo', 'Descanso de tela Setembro Azul'],
    },
    tools: ['Photoshop', 'Illustrator', 'InDesign'],
    links: [
      { label: 'Setembro Amarelo no Behance', href: 'https://www.behance.net/gallery/256189983/Descanso-de-tela-Setembro-Amarelo', kind: 'source' },
      { label: 'Setembro Azul no Behance', href: 'https://www.behance.net/gallery/256189099/Descanso-de-tela-Setembro-Azul', kind: 'source' },
    ],
    sources: ['Behance, publicados em 24/09/2026'],
  },
  {
    id: 'assinatura',
    title: 'Gerador de assinatura de e-mail',
    kicker: 'Ferramenta web · Versão de exemplo',
    categories: ['digital', 'comunicacao'],
    status: 'publicado',
    period: '2026',
    featured: false,
    summary: 'Formulário com prévia ao vivo que padroniza assinaturas institucionais de e-mail e exporta a imagem em JPG.',
    cover: 'capa',
    gallery: [
      ['capa', 'Apresentação do gerador.'],
      ['formulario', 'Formulário com formatação automática de telefone e prévia.'],
    ],
    sections: {
      contexto: 'Ferramenta criada para facilitar a criação de assinaturas institucionais de e-mail. A versão pública usa dados de exemplo.',
      desafio: 'Garantir que todas as assinaturas sigam a mesma identidade, mesmo preenchidas por pessoas diferentes.',
      papel: 'Interface e desenvolvimento.',
      processo: 'Campos guiados, formatação automática e prévia ao vivo para facilitar a criação de assinaturas padronizadas.',
      entregas: ['Formulário guiado', 'Prévia ao vivo', 'Exportação em JPG'],
    },
    tools: ['HTML', 'CSS', 'JavaScript', 'PWA'],
    links: [
      { label: 'Ver projeto', href: 'https://odavicaetano.github.io/Gerador-de-assinatura-de-E-mail-Exemplo/', kind: 'live' },
      { label: 'Código', href: 'https://github.com/odavicaetano/Gerador-de-assinatura-de-E-mail-Exemplo', kind: 'code' },
    ],
    sources: ['Descrição e arquivos do repositório público', 'Aplicação aberta em 22/11/2026'],
  },
  {
    id: 'guia-de-helena',
    title: 'Guia de Visitação da FHA',
    kicker: 'Projeto Museu da Criança · Fundação Helena Antipoff',
    categories: ['comunicacao', 'digital'],
    status: 'publicado',
    period: '2026',
    featured: false,
    summary: 'Uma experiência de visitação em formato de caça ao tesouro, com mapa interativo, pistas e descobertas sobre a Fundação Helena Antipoff.',
    cover: 'capa',
    gallery: [['capa', 'Guia de visitação interativo da Fundação Helena Antipoff.']],
    sections: {
      contexto: 'O Guia de Visitação da FHA convida o público a explorar o mapa, coletar pistas em sequência e encontrar um tesouro.',
      papel: 'Participação no projeto de comunicação e experiência digital do guia.',
      entregas: ['Experiência interativa de visitação', 'Mapa e percurso com pistas'],
    },
    tools: [],
    credits: 'Ilustrações: Felipe Fivo.',
    links: [{ label: 'Explorar o guia', href: 'https://projetomuseudacrianca.com.br/games/guia_de_visitacao/', kind: 'live' }],
    sources: [],
  },
  {
    id: 'fha-eventos',
    title: 'Eventos e telões na Fundação Helena Antipoff',
    kicker: 'Fundação Helena Antipoff',
    categories: ['comunicacao', 'ensino'],
    status: 'colaborativo',
    period: 'Até 2025',
    featured: false,
    summary: 'Criação e apoio à programação dos telões de eventos institucionais, como a Vozes de Helena, além de captação e cobertura.',
    cover: 'teloes-1',
    gallery: [
      ['teloes-1', 'Telão da Vozes de Helena com a apresentação no palco.'],
      ['teloes-2', 'Telões laterais durante o evento.'],
      ['teloes-3', 'Programação visual no palco principal.'],
      ['teloes-4', 'Telão no acesso ao espaço do evento.'],
      ['captacao', 'Captação de imagens em evento.'],
      ['trilha-formativa-2025', 'Trilha Formativa, segunda edição de 2025.'],
      ['crachas', 'Credenciais de eventos acumuladas ao longo da passagem pela FHA.'],
    ],
    sections: {
      contexto: 'Na Fundação Helena Antipoff, o trabalho passou por comunicação, informática e eventos.',
      papel: 'Criar e auxiliar na programação dos telões, além de apoio técnico e audiovisual nos eventos. Trabalho em equipe.',
      entregas: ['Peças para telões', 'Apoio à programação de telas', 'Captação e cobertura'],
    },
    tools: [],
    links: [],
    sources: ['Fotos e legendas de publicações fornecidas pelo autor'],

  },
  {
    id: 'docencia',
    title: 'Aulas e palestras: tecnologia, criatividade e IA',
    kicker: 'PRONATEC e outras turmas',
    categories: ['ensino'],
    status: 'concluido',
    period: '2026',
    featured: false,
    summary: 'Professor da turma do Técnico em Multimídia e palestras sobre criatividade e inteligência artificial para estudantes.',
    cover: 'palestra-ia-1',
    gallery: [
      ['palestra-ia-1', 'Palestra "Criatividade na Era da Inteligência Artificial: ferramenta ou muleta?".'],
      ['palestra-ia-2', 'Auditório preparado para a palestra.'],
      ['turma-multimidia', 'Turma do Técnico em Multimídia.'],
      ['aula-eventos', 'Aula sobre tecnologia e criatividade na área de eventos.'],
      ['ia-criatividade-palco', 'Palestra "Inteligência Artificial: expanda sua criatividade!".'],
      ['ia-criatividade-publico', 'Público da palestra.'],
      ['ia-criatividade-grupo', 'Foto com participantes.'],
      ['ia-criatividade-conversa', 'Conversa com o público.'],
    ],
    sections: {
      contexto: 'Experiência como professor da turma do Técnico em Multimídia (PRONATEC) e em palestras sobre tecnologia e criatividade.',
      papel: 'Planejamento e condução de aulas e palestras.',
      processo: 'Aulas práticas de imagem, vídeo e áudio, e palestras que discutem a IA generativa como apoio ao processo criativo, sem substituir repertório e autoria.',
      entregas: ['Aulas práticas', 'Palestra "Criatividade na Era da IA: ferramenta ou muleta?"', 'Palestra "IA: expanda sua criatividade!"'],
    },
    tools: [],
    credits: 'Fotos com estudantes e participantes: uso sujeito à autorização de imagem.',
    links: [],
    sources: ['Fotos e legendas de publicações fornecidas pelo autor', 'Período do PRONATEC conforme portfólio anterior'],

  },
];
