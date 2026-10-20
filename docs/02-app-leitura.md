# 02 · LendaLivre — App de Leitura (Fase 1)

> Depende de: `00-nucleo-universo.md` e `01-livro.md`
> Este repositório é o app. A versão anterior (home da Cof Cof, catálogo mock, leitura em modal, loja com iframe e premium vazio) foi aposentada: serviu de ensaio e não tinha a identidade visual desejada.

## 1. O que o app é

Portal escuro para ler obras do universo. A capa carrega a cor. A interface é sala: fundo preto, texto claro, painéis com transparência e desfoque.

Unidade do catálogo: **obra → capítulos**. HQ e vídeo podem entrar depois como outros tipos de obra. A história principal é a primeira obra de verdade, quando o texto existir.

Leitura pública. Conta, assinatura, inventário e ranking esperam capítulos publicados.

## 2. Stack desta fase

| Camada | Tecnologia |
|---|---|
| Front | React + Vite, responsivo (celular e desktop) |
| Site | Cloudflare Pages, a partir do build do Vite |
| Banco, conta e API | Supabase (Postgres). Plano gratuito para o teste com amigos |
| Arquivos | Capas locais agora; Cloudflare R2 quando as imagens pesadas forem publicadas |
| Texto | Capítulos em dados locais agora; Markdown no repositório no passo seguinte |
| Conta hoje | Ainda só no navegador. O Supabase entra no lugar disso, e não protege conteúdo antes disso |
| Pagamentos | Fora desta fase |

O projeto gratuito do Supabase pausa depois de uma semana sem uso e volta ao abrir de novo no painel. O limite gratuito é de dois projetos ativos, com 500 MB de banco.

Mobile é o layout responsivo. O manifesto PWA já permite instalar o site na tela inicial. Loja de aplicativo fica para depois. Capítulos gratuitos, no futuro, precisam de HTML indexável (pré-render). Trocar o Vite por outro framework fica para quando existir texto que valha ser achado na busca.

## 3. Identidade da interface

Registrada no núcleo, seção 10. Resumo:

- Fundo `#07080b`, texto `#f3efe4`, ouro `#e2b15a`
- Painéis de vidro (transparência + blur), bordas finas claras
- Título em serif (Newsreader), interface em sans (Outfit)
- Capas de `public/midias/catalog-page/livros/`
- Hero com a imagem do viajante no rio (`cardbook.jpg`)
- Fora do catálogo: timeline “EPIC STORY”, guerreira sem título, esboço `10.png`
- Sem telefone, Pix ou loja na interface

## 4. Telas atuais

1. **Início** — sala com a capa de entrada, faixa de obras, três notas (leitura, tom, o que vem depois)
2. **Catálogo** — busca, filtro por clima (Noite, Sertão, Mata, Mito, Cidade), grade de capas
3. **Obra** — capa, apresentação, lista de capítulos ou aviso de texto em preparação
4. **Leitura** — página inteira, coluna estreita, tamanho de letra, marcas de música (♪, ♫) e o aviso do próprio capítulo quando ele existe
5. **Entrar / criar conta** — ensaio visual. O acesso ainda não é uma conta de verdade

Seis obras abrem o texto escrito: Lázaro, Os Portões da Areia, Bamboo, Couro e Escamas, Vagalumes e A última de sua geração. Cogaua é o nome do rei; a capa continua no arquivo antigo `cardbook-Saci.jpg`. Damato e Batalha dos Espólios aparecem pelo nome, ainda sem capa e sem capítulo.

## 5. Escopo que ainda falta

### Agora, antes de plataforma

- [x] Ligar os capítulos já escritos em `docs/capítulos/`
- [ ] Completar os arquivos que ainda só têm o título
- [ ] Aviso de tom adulto no capítulo público
- [ ] Buffer de 5 a 10 capítulos antes de chamar isso de lançamento

### Quando o texto existir

- [ ] Cadastro real (e-mail e senha; Google só depois)
- [ ] Progresso de leitura no servidor
- [ ] Painel simples para publicar capítulo
- [ ] Capítulos gratuitos e, só então, capítulos para assinantes
- [ ] Privacidade e consentimento no primeiro cadastro real
- [ ] Publicar o site no Cloudflare Pages
- [ ] Ligar conta, capítulos e inventário ao Supabase
- [ ] Domínio

### Coleta (fase seguinte do app)

- [ ] Itens pelo ID do núcleo, ligados ao capítulo
- [ ] Coleta validada no servidor, ao concluir a leitura — o navegador pede, o servidor decide
- [ ] Inventário
- [ ] Ranking por completude ou por temporada, não por “primeiros a coletar no lançamento”

### Social (por último)

- [ ] Perfil público
- [ ] Amigos
- [ ] Conquistas

Conta única com o jogo é uma convenção de identidade para o futuro: o mesmo usuário, domínios separados. Não construir agora a loja do jogo nem o inventário compartilhado.

## 6. Modelo de dados, para quando houver banco

```
users(id, email, password_hash, display_name, avatar_url, role, created_at)
works(id, type, title, synopsis, cover_url, status)
chapters(id, work_id, number, title, content_md, is_premium, status, published_at)
reading_progress(user_id, chapter_id, position, finished_at)
items(id, code, name, type, rarity, image_url, description, lore_ref)
chapter_items(chapter_id, item_id)
user_items(user_id, item_id, collected_at, chapter_id)
```

Amigos, conquistas e assinatura entram nas tabelas só na fase em que a tela existir.

## 7. Cuidados

- Coleta e “posição no ranking” só com regra no servidor.
- Imagens pesadas (há capas com mais de 2 MB) precisam de versão leve antes do lançamento. WebP no Cloudflare R2 quando houver hospedagem de arquivo.
- Backup do Postgres no Supabase no dia em que o banco estiver em uso.
- A interface não publica contato pessoal nem chave Pix.
