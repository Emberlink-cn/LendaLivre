export const MOCK_WORKS = [
  {
    id: 'work-00',
    type: 'Livro',
    title: 'A Lenda de Lázaro',
    author: '@CJ',
    year: 2024,
    readingTime: '10 min',
    synopsis: 'Uma jornada por mitos e memoria, entre ruinas e sinais de um passado oculto.',
    coverUrl: null,
  },
  {
    id: 'work-01',
    type: 'Livro',
    title: 'Os Portões da Areia',
    author: '@CJ',
    year: 2024,
    readingTime: '12 min',
    synopsis: 'Portais esquecidos e segredos antigos colocam os personagens diante de escolhas dificeis.',
    coverUrl: null,
  },
  {
    id: 'work-02',
    type: 'Livro',
    title: 'Bambu',
    author: '@CJ',
    year: 2024,
    readingTime: '8 min',
    synopsis: 'Um conto de resistencia e adaptacao onde o silencio revela mais que as palavras.',
    coverUrl: null,
  },
  {
    id: 'work-03',
    type: 'HQ',
    title: 'Vagalumes',
    author: '@CJ',
    year: 2024,
    readingTime: '7 min',
    synopsis: 'Luzes no escuro conduzem uma aventura visual por caminhos imprevisiveis.',
    coverUrl: null,
  },
  {
    id: 'work-04',
    type: 'HQ',
    title: 'Couro e Escamas',
    author: '@CJ',
    year: 2024,
    readingTime: '9 min',
    synopsis: 'Conflitos ancestrais e criaturas lendarias em um enredo de tensao crescente.',
    coverUrl: null,
  },
  {
    id: 'work-05',
    type: 'Video',
    title: 'Making Of da Lenda',
    author: '@Equipe CofCof',
    year: 2025,
    readingTime: '6 min',
    synopsis: 'Bastidores da criacao do universo narrativo e processo de producao do projeto.',
    coverUrl: null,
  },
]

export const MOCK_CHAPTERS_BY_WORK_ID = {
  'work-00': [
    {
      id: 'ch-00-01',
      title: 'Capitulo 1',
      sections: [
        {
          heading: 'Introducao',
          paragraphs: [
            'Este e um conteudo mock para simular o layout da leitura.',
            'Quando o backend estiver pronto, voce vai substituir esses dados por fetch do servidor.',
          ],
        },
      ],
    },
    {
      id: 'ch-00-02',
      title: 'Capitulo 2',
      sections: [
        {
          heading: 'Desenvolvimento',
          paragraphs: [
            'Aqui entram as proximas partes do capitulo.',
            'No React, isso e renderizado a partir de estado (openChapterId).',
          ],
        },
      ],
    },
  ],
  'work-01': [
    {
      id: 'ch-01-01',
      title: 'Capitulo 1',
      sections: [
        {
          heading: 'Abertura',
          paragraphs: [
            'Texto mock do trabalho "Os Portões da Areia".',
          ],
        },
      ],
    },
  ],
  'work-02': [
    {
      id: 'ch-02-01',
      title: 'Capitulo 1',
      sections: [
        {
          heading: 'Primeiros passos',
          paragraphs: [
            'Texto mock do trabalho "Bambu".',
          ],
        },
      ],
    },
  ],
  'work-03': [
    {
      id: 'ch-03-01',
      title: 'Capitulo 1',
      sections: [
        {
          heading: 'Vagalumes',
          paragraphs: [
            'Texto mock do trabalho "Vagalumes".',
          ],
        },
      ],
    },
  ],
  'work-04': [
    {
      id: 'ch-04-01',
      title: 'Capitulo 1',
      sections: [
        {
          heading: 'A Pele da Lenda',
          paragraphs: [
            'Confrontos antigos revelam o peso das escolhas herdadas.',
            'A narrativa explora medo, coragem e identidade em uma atmosfera sombria.',
          ],
        },
      ],
    },
    {
      id: 'ch-04-02',
      title: 'Capitulo 2',
      sections: [
        {
          heading: 'Escamas ao Vento',
          paragraphs: [
            'A travessia avanca e os personagens enfrentam dilemas morais cada vez maiores.',
          ],
        },
      ],
    },
  ],
  'work-05': [
    {
      id: 'ch-05-01',
      title: 'Episodio 1',
      sections: [
        {
          heading: 'Bastidores',
          paragraphs: [
            'Visao geral do processo criativo do universo CofCof e organizacao da producao.',
          ],
        },
      ],
    },
  ],
}

