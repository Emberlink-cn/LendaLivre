# 02 · LendaLivre — Plano do portal

> Depende de: `00-nucleo-universo.md` e `01-livro.md`
> Os jogos ficam para depois. `03-rpg.md` e `04-jogo-vertical.md` guardam ideias antigas; a direção atual dos jogos está na seção 6 deste arquivo.

## 1. O que o app é

Portal para quem escreve publicar histórias. A interface é uma sala escura: fundo preto, texto claro, painéis com transparência.

Há dois tipos de publicação:

- **Obra do livro.** A história principal pode ter texto, trilha sonora, itens coletáveis e cartas. O inventário guarda essas cartas. No futuro, as mesmas cartas entram em dois jogos.
- **Obra de outro autor.** Só texto e música. Itens, cartas, inventário e jogo não aparecem para esse autor nem na obra dele.

A conta é a mesma para todo mundo. O que muda é o que a obra permite publicar e o que o leitor encontra nela.

## 2. Onde estamos

Etapa atual: **publicar e ler a obra do livro**, com coleta e trilha. O site está no ar. Os jogos não começaram.

Endereço: https://lendalivre.pages.dev  
Banco e conta: Supabase. Imagens no Storage, no bucket `publicacao`.  
Front: React + Vite. Hospedagem: Cloudflare Pages.

### Já feito

- Início, catálogo, obra, leitura, entrar e criar conta
- Conta real no Supabase. O papel de criador da casa (`super`) só muda pelo painel do banco
- Catálogo publicado: obra, capítulos, itens e trilhas lidos do banco
- Sala do criador publica texto, capa, item e trilha
- Coleta na leitura e inventário na conta, no celular e no desktop
- Carta com moldura, atributos, raridade e passiva. Sem passiva, a faixa de texto não aparece
- Imagem da carta com zoom e posição. Item com mais de uma atmosfera
- Tipos de item incluem Local, Personagem e Montaria
- Obra não tem atmosfera. Atmosfera fica no capítulo e no item
- Trilha sonora no capítulo
- Último capítulo lido acompanha a conta
- Excluir obra: capítulos e músicas saem; item que não restar em outro capítulo é retirado do catálogo; a coleta na conta permanece, mas some da grade
- Coleta só na obra marcada. Terras Invisíveis é a única. Nas outras, a sala e a leitura não mostram itens
- Papel `autor`: publica e exclui as próprias obras, capítulos, capas e músicas. Itens continuam só do criador da casa, e só na obra com coleta. Virar autor continua pelo painel do banco
- Carta coletada grava nível 1. A ficha mostra o número. Evoluir fica para o jogo

### Falta nesta etapa

- Enviar a migration nova (`obra_autor_nivel`) para o banco passar a gravar coleta, autor e nível
- Completar os capítulos do livro que ainda estão sem texto
- Domínio próprio

Fora desta etapa, de propósito: jogos, amigos, conquistas, assinatura, ranking e loja.

## 3. Próximo passo do portal

Ainda sem jogo.

O código de exclusão de obra, da coleta só no livro, do papel de autor e do nível 1 já está no app. O banco só passa a aceitar isso depois do envio da migration `20261022210000_obra_autor_nivel.sql`.

Depois disso, nesta etapa: completar os capítulos sem texto e o domínio próprio.

## 4. O que cada pessoa faz

| Pessoa | Pode |
|---|---|
| Leitor | Ler, ouvir a trilha e, na obra do livro, coletar cartas |
| Autor | Publicar e excluir as próprias obras, capítulos, capas e músicas |
| Criador da casa | O que o autor faz, mais itens e cartas na obra do livro |

Inventário, carta e jogo só existem para o conteúdo do livro. Outro autor não vê essas ferramentas na sala dele.

## 5. Cartas

O item coletado é uma carta. Ela entra no inventário no **nível 1**.

A carta guarda nome, tipo, atmosferas, raridade, moldura, atributos, passiva, imagem e o enquadramento dessa imagem. O nível é da cópia de quem coletou, não do item no catálogo: duas pessoas podem ter a mesma carta em níveis diferentes quando o jogo existir.

Sem passiva, a carta não mostra a faixa de texto.

## 6. Jogos, depois

Não desenhar regra nem tela agora.

- **Jogo mobile.** Serve só para evoluir o nível das cartas. Não é um modo à parte com outras peças.
- **Jogo de tabuleiro online, no desktop.** Usa as mesmas cartas do inventário.
- A carta é uma só. O mobile muda o nível. O tabuleiro joga com o que a pessoa já tem.

O duelo vertical e o RPG de mesa físico, descritos nos docs 03 e 04, não são o próximo passo.

## 7. Stack

| Camada | Tecnologia |
|---|---|
| Front | React + Vite, celular e desktop |
| Site | Cloudflare Pages |
| Banco, conta e arquivos | Supabase (Postgres, Auth e Storage) |
| Pagamentos | Fora |

O projeto gratuito do Supabase pausa depois de uma semana sem uso. Mobile, por enquanto, é o site responsivo. Loja de aplicativo fica para o jogo.
