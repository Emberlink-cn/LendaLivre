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

### Falta nesta etapa

- Excluir uma obra. Hoje dá para criar, editar e excluir capítulo, item e trilha, mas a obra em si não sai
- Marcar quais obras podem ter itens e cartas. Hoje a sala do criador oferece isso para qualquer obra
- Autor comum, separado do criador da casa: publica texto e música, sem itens, cartas, inventário e jogo
- Carta coletada começa no nível 1. O número ainda não existe na coleta
- Enviar ao banco as colunas novas de atmosfera múltipla e de enquadramento da imagem
- Completar os capítulos do livro que ainda estão sem texto
- Domínio próprio

Fora desta etapa, de propósito: jogos, amigos, conquistas, assinatura, ranking e loja.

## 3. Próximo passo do portal

Ainda sem jogo.

1. Excluir obra, com os capítulos, as trilhas e os vínculos. Item já coletado não pode sumir da conta de quem o tem sem uma decisão explícita.
2. A obra do livro é a única com coleta. Nas outras, a sala do criador mostra texto, capa e música.
3. Papel de autor para quem publica a própria história. O criador da casa continua podendo publicar itens e cartas na obra do livro.
4. Guardar `nível 1` em cada carta coletada. A tela pode mostrar o nível. Evoluir fica para o jogo mobile.

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
