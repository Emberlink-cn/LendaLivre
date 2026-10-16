# 00 · Núcleo do Universo (Projeto Pai)

> Fonte única de verdade. Os outros projetos consomem este documento.
> Se algo mudar na história, no nome, no estilo ou numa regra do mundo, muda **aqui primeiro**.

---

## 1. Visão geral

**Estúdio:** Cof Cof Produções
**Produto de leitura:** LendaLivre (este repositório)
**Nome do universo:** [PREENCHER — registrar antes de divulgar]
**Logline (1 frase):** Fantasia adulta, política e sombria, baseada no folclore brasileiro. [REFINAR com a história real]
**Tom:** adulto, fantástico, político. A paisagem e o mito aparecem em escala grande; a política ainda precisa viver no texto, porque as capas quase não a mostram.
**Público-alvo:** leitores adultos de fantasia e folclore. [PREENCHER faixa e referências]
**O que este universo não é:** folclore infantil de livro escolar, fantasia medieval genérica, comédia de lenda.

**Pilares lidos nas capas (à confirmar pelo autor — ainda não são cânone fechado):**
1. A paisagem brasileira é personagem: sertão, mata, rio, morro.
2. As pessoas são pequenas diante de criaturas, cidades e travessias.
3. A luz conta a cena: noite, brasa, néon, pôr do sol.
4. O folclore é reimaginado, não copiado do desenho escolar.
5. O tom público é adulto. Capa de leitura infantil não entra na identidade principal sem uma decisão explícita.

## 2. Mapa dos projetos

| # | Projeto | Papel no ecossistema | Prioridade | Doc |
|---|---------|----------------------|-----------|-----|
| 1 | Livro | Fonte da narrativa e do lore | Contínuo | `01-livro.md` |
| 2 | LendaLivre | Portal de leitura: obras, capítulos, depois comunidade | **Fase 1** | `02-app-leitura.md` |
| 4 | Jogo vertical | Entrada de público, depois da leitura existir | **Fase 2** | `04-jogo-vertical.md` |
| 3 | RPG web | Aprofundamento para fãs | Fase 3, sem desenho agora | `03-rpg.md` |
| 3b | RPG de tabuleiro | Produto físico, se houver público | Fase 4 | `03-rpg.md` |

HQ e vídeo são formatos dentro do portal, não um quinto produto.

## 3. Roadmap macro

- **Fase 0 (agora):** preencher o cânone mínimo (seções 5 e 6). A direção visual das capas já está registrada na seção 10.
- **Fase 1:** sala de leitura no ar. Primeiro capítulos reais em Markdown; conta, cobrança e banco só quando houver texto que valha proteger.
- **Fase 2:** prova mínima do jogo vertical, pequena o bastante para responder “isso é divertido?”.
- **Fase 3:** RPG web, reaproveitando nomes e lore, com regras próprias.
- **Fase 4:** RPG de mesa, se houver colecionadores e parceria.

**Princípio:** cada fase gera público para a seguinte. O livro manda no cânone. Vácuo e pontos de imersão só entram na cosmologia se a história pedir.

## 4. Ligação entre projetos

| Elemento compartilhado | Onde nasce | Onde é usado |
|---|---|---|
| Identidade da pessoa (login), no futuro | LendaLivre | Jogo vertical, RPG web |
| Nome, origem e raridade narrativa do item | Núcleo (seção 8) | Cada produto acrescenta a regra mecânica dele |
| Nome e texto da habilidade | Núcleo (seção 9) | Jogo e RPG definem custo e número na hora em que forem construídos |
| Personagens e criaturas | Núcleo (seção 6) | Todos |
| Identidade visual | Núcleo (seção 10) | Todos |

**Convenção, ainda sem sistema compartilhado:** itens e habilidades ganham IDs estáveis (`item_0001`, `skill_0001`) quando forem nomeados. O mesmo ID é o mesmo ser ou objeto no lore. Ataque, defesa, preço e carta nascem no produto que for usar aquilo. Um objeto citado no capítulo não precisa já nascer equilibrado para partida.

Enquanto só existe o app, tudo fica neste repositório. Pastas separadas para jogo e RPG esperam o segundo produto.

## 5. Regras do mundo (Cânone)

- **Cosmologia / origem do mundo:** [PREENCHER]
- **Magia / poder: como funciona, custo, limites:** [PREENCHER]
- **Política: facções, conflitos centrais:** [PREENCHER]
- **Linha do tempo:** [PREENCHER]
- **O "Vácuo":** nome de campo de batalha do jogo. Só vira lugar do mundo se o livro precisar. [NÃO INVENTAR para justificar o modo]
- **"Pontos de imersão":** moeda do jogo. Sem significado obrigatório no lore. [PREENCHER só se a história já tiver um nome melhor]

## 6. Personagens e criaturas

Modelo de ficha (copiar para cada um):

```
### [Nome]
- ID: char_000
- Origem folclórica: (ex.: Curupira, Iara, Boitatá, Saci...)
- Papel na história: protagonista / antagonista / facção / criatura
- Aparência (para ilustradores):
- Personalidade e motivação:
- Poderes / habilidades (IDs):
- Facção:
- Aparece em: livro (caps.), jogo (sim/não), RPG (sim/não)
```

**Lista:** [PREENCHER — 3 a 5 nomes já destrava ilustração e item]

As capas sugerem figuras, e o texto já nomeia algumas: Lázaro, Cogaua (rei de Xipaia; a capa ainda está no arquivo `cardbook-Saci.jpg`), Anahí, Sávio, Joca, Caramuru, Babu, Durigan, Metuk. Ficha completa: [PREENCHER].

## 7. Lugares e cenários

Modelo:

```
### [Nome do lugar]
- ID: loc_000
- Descrição / atmosfera:
- Clima e paleta de cores:
- Facção que domina:
- Usado como: capítulo / arena do jogo / região do mapa do RPG
```

**Lista:** [PREENCHER]

Paisagens já vistas nas capas, à nomear: deserto noturno, mata com rio e pedras em brasa, morro de paredão (arquivo “Morro do Diabo”), bambuzal com letreiro noturno, cidade entre arranha-céus e mercado, salão de pedra e areia.

## 8. Catálogo de itens

O núcleo guarda nome, tipo narrativo, raridade e de qual trecho a coisa veio. Número de jogo fica no documento do produto.

| ID | Nome | Tipo (ilustração/card/objeto/arma/vestimenta) | Raridade narrativa | Origem na história | Usado em |
|----|------|-----|-----|-----|-----|
| item_0001 | [PREENCHER] | | | | |

**Raridade narrativa:** [PREENCHER: Comum / Incomum / Raro / Épico / Lendário]

Na coleta do app, o ranking premia temporada ou completude de leitura. “Os primeiros a pegar tudo no lançamento” fica de fora: quem chega depois nunca alcança essa posição.

## 9. Habilidades e cartas

| ID | Nome | Tipo narrativo | Elemento/origem | Efeito em texto | Custo de jogo |
|----|------|------|------|------|------|
| skill_0001 | [PREENCHER] | | | | definir no jogo, não aqui |

## 10. Identidade visual e sonora

**Leitura das capas em** `public/midias/catalog-page/livros/`**:**

O conjunto é uma travessia adulta. Há sertão de noite, mata, rio, morro, cidade e criaturas grandes demais para a pessoa no quadro. A luz é o drama: estrelas, vagalumes, néon verde, pôr do sol, brasa na pedra. O rei sentado no salão é Cogaua. O arquivo da imagem ainda se chama `cardbook-Saci.jpg`.

Isso ainda não é um estilo único de ilustração. Mistura cinema fotoreal, pintura de paisagem, cartoon e desenho de cidade. Serve como mood board. A interface fica quieta e escura para as capas carregarem a cor.

**Fora da identidade principal, até decisão contrária:**
- `cardbook-A-última-da-geração.jpeg` abre o capítulo “A última de sua geração”. A ilustração parece infantil; o texto é da mesma história, com Anahí ainda criança.
- `cardbook-timeline.jpg` e `timeline-banner.jpg` são um diagrama genérico de “EPIC STORY”, com cavaleiro e dragão, sem lastro brasileiro visível.
- `cardbook-.jpg` é uma guerreira genérica de fantasia, com marca d’água do gerador. Sem título.
- `10.png` é um esboço quase invisível. Não é capa.
- Várias imagens têm cara de gerador automático. Usar como referência de clima, não como arte final de lançamento. `cardbook-Morro-do-Diabo.jpg` e `cardbook-.jpg` mostram marca do Adobe Firefly.

**Interface do LendaLivre (sala escura):**
- Fundo `#07080b`
- Texto `#f3efe4`
- Texto secundário `#a89f92`
- Vidro `rgba(12, 14, 18, 0.62)` com desfoque
- Linha `rgba(243, 239, 228, 0.14)`
- Ouro de areia e brasa `#e2b15a`
- Brasa rara `#d4652f`
- Verde de mata, raro `#1e3d34`
- Títulos: Newsreader (ou Georgia)
- Interface: Outfit (ou system-ui)
- Capas em moldura; painéis com transparência e blur; leitura em coluna estreita

**Áudio:** [PREENCHER instrumentos e sons. Ainda não há trilha.]

## 11. Glossário

| Termo | Significado |
|---|---|
| LendaLivre | Portal de leitura deste repositório |
| Obra | Unidade do catálogo (livro, e no futuro HQ ou vídeo), com capítulos dentro |
| Vácuo | Campo de batalha do jogo vertical. Lore só se o livro pedir |
| Saguão | Sala pessoal do jogador no jogo vertical |
| Pontos de imersão | Pontos de vitória do jogo vertical. Lore opcional |
| [PREENCHER] | |

## 12. Aviso legal e lançamento

- Folclore brasileiro é de domínio comum. Versões próprias (design, nomes criados, histórias, redesenhos) são do autor. Registrar o nome do universo e os personagens originais antes de divulgar.
- [PREENCHER] Marca (INPI) e registro de texto.
- O primeiro capítulo público leva aviso de tom adulto.
- Cadastro de verdade leva política de privacidade e consentimento. O app visual atual ainda não coleta conta num servidor.
- Imagens de gerador e referências de jogos comerciais não são arte final nem assets para copiar.

## 13. Onde o material mora

```
/docs                 ← núcleo, livro, app, jogo, RPG
/public/midias        ← capas e imagens já produzidas
/src                  ← LendaLivre (React + Vite)
```

Jogo e RPG continuam só no planejamento até a leitura ter capítulos publicados.
