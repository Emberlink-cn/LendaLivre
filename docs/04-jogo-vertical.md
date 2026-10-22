# 04 · Jogo Mobile Vertical — ideia antiga

> A direção atual está em `02-app-leitura.md`, seção 6. O jogo mobile previsto agora serve só para evoluir o nível das cartas coletadas no livro. Este arquivo guarda o duelo em feed vertical. Não é o próximo passo.

## 1. Conceito em uma frase

Duelos de cartas por turnos. A pessoa rola a tela como num feed para achar alguém e desafiar.

## 2. Loop principal

```
Criar personagem (1 por conta)
        ↓
Saguão (sala pessoal)
        ↓
Entrar no Vácuo (campo de batalha online)
        ↓
Feed vertical: um adversário por tela
        ↓
 ┌── Desafiar → a outra pessoa aceita ou recusa
 └── Rolar para o próximo
        ↓
Batalha (3 turnos)
   · cada turno: escolher cartas e montar combo
   · os dois prontos, ou o tempo acabou → animação
        ↓
Quem vence ganha XP + Pontos de Imersão → volta ao feed
```

O Vácuo e os pontos de imersão são nomes de jogo. Lore só se o livro pedir (ver núcleo).

## 3. Personagem

- 1 personagem por conta
- A arte é em camadas: corpo, cabeça, cabelo, roupa, arma. Combinação não se desenha uma a uma.
- Prova visual mínima: 2 corpos, 3 roupas, 3 cores de pele. Altura e estrutura corporal ficam para depois.
- Cosmético não dá poder.

## 4. Câmera e visual

- A pessoa vê o próprio personagem de costas, em diagonal, e o adversário ao fundo, de frente.
- 2D com profundidade: escala, paralaxe, sombra, efeito de ataque grande.
- Retrato, uma mão.
- Paleta e clima: núcleo, seção 10. As capas do LendaLivre são o mood board. Não copiar asset de jogo comercial nem publicar imagem com marca d’água de gerador.

## 5. Batalha (rascunho para testar em papel antes de engine)

| Item | Proposta |
|---|---|
| Turnos | 3 por batalha |
| Tempo de preparação | 15 a 20 s [TESTAR no papel] |
| Cartas por turno | 2 a 3 |
| Tipos | Ataque, Defesa, Suporte |
| Resolução | simultânea; no digital, o servidor calcula |
| Vitória | mais vida ao fim dos 3 turnos, ou nocaute |
| Recompensa | XP + Pontos de Imersão |
| Abandono | [DECIDIR na prova jogável] |

Com 8 a 12 cartas, testar os combos antes de criar mais. Se o papel não for divertido, engine não resolve.

## 6. Feed

- Cada tela: adversário, nome, nível, equipamento visível, botão Desafiar.
- Quem é desafiado aceita ou recusa.
- Feed vazio é o maior risco.

**Prova:** adversários escritos à mão, com baralho conhecido, para a luta ensinar as cartas. Imitar o último humano fica para quando a regra já for divertida. Jogador offline (“fantasma”) entra nessa mesma ideia, com baralho definido, não com um comportamento improvisado.

## 7. Tecnologia, só depois do papel

| Necessidade | Caminho sugerido |
|---|---|
| Render 2D | PixiJS ou Phaser. Godot se a meta for app nativo desde o começo |
| Interface | React, se o jogo continuar na mesma stack do LendaLivre |
| Animação | Poucas animações reutilizadas. Spine só quando o personagem em camadas já existir |
| Tempo real | WebSocket em Node. O servidor decide a batalha; o cliente só envia as cartas |
| Presença | Redis, quando houver gente online de verdade |
| Dados | PostgreSQL, mesma pessoa do app, tabelas do jogo separadas |
| Arquivos | Versões leves das artes; R2 quando houver acervo |

A prova de diversão não precisa de Pixi, Spine, Redis e loja.

## 8. Escopo da prova

- [ ] Duelo de 3 turnos no papel, com 8 a 12 cartas
- [ ] Um cenário e dois bonecos em camadas, mesmo que estáticos
- [ ] Câmera: costas / frente, no celular
- [ ] Adversário com baralho escrito
- [ ] Sem loja, ranking, amigos, altura, estrutura corporal e conta própria

## 9. Depois que a prova for divertida

1. Conta do LendaLivre
2. Feed com gente online e com fantasmas de baralho conhecido
3. XP e pontos de imersão — definir o que desbloqueiam, e se perder pune
4. Ranking e temporadas
5. Loja de cosméticos, sem vantagem de poder
6. Mais arenas, ligadas a lugares que já existam no livro
7. Itens do app como visual no personagem, não como poder automático

## 10. Riscos

| Risco | Caminho |
|---|---|
| Feed vazio | Baralhos escritos e fantasmas; tempo real só com gente bastante |
| Arte demais | Camadas, poucas animações, prova estática primeiro |
| Escopo | Papel antes de engine |
| Trapaça | Servidor decide, quando houver servidor |
| Nomes e perfis | Filtro e denúncia antes de perfil público |
| Custo | Começar sem servidor de partida |
