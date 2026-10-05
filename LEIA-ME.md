# Laboratório Web

Editor educativo em HTML, CSS e JavaScript, sem dependências ou etapa de compilação.

## Testar no computador

Extraia o ZIP, mantenha os arquivos juntos e abra `index.html` no navegador. O exemplo aparece nos campos; clique em **Visualizar site** para executá-lo em uma janela separada. O navegador pode escolher uma nova aba, especialmente no celular. Se houver bloqueio, permita pop-ups para o laboratório.

## Publicar no GitHub Pages

1. Entre no GitHub e crie um repositório público, por exemplo, `laboratorio-web`.
2. Use **Add file → Upload files** e envie `index.html`, `style.css`, `script.js`, `visualizar.html` e `visualizar.js` para a raiz do repositório. Não envie apenas o ZIP nem deixe esses arquivos dentro de outra pasta.
3. Confirme o envio em **Commit changes**.
4. Abra **Settings → Pages**.
5. Em **Build and deployment → Source**, selecione **Deploy from a branch**.
6. Em **Branch**, selecione `main` e `/(root)`; clique em **Save**.
7. Aguarde a publicação. A área Pages mostrará o endereço para compartilhar com os alunos.

Documentação oficial consultada em 05/10/2026: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Usar em aula

- HTML: cole um trecho ou uma página completa.
- CSS: cole somente as regras, sem `<style>`.
- JavaScript: cole somente o código, sem `<script>`. Ele é executado no fim do corpo da página.
- Clique em **Visualizar site** ou use Ctrl/Cmd + Enter. O projeto abre em outra janela ou aba, com largura e altura acompanhando o espaço disponível. Clique novamente para atualizar a mesma janela. Alterações não são executadas automaticamente.
- **Carregar exemplo** substitui os campos, após confirmação quando há conteúdo. Em seguida, clique em Visualizar site.
- **Baixar site (.html)** exporta o conteúdo atual dos campos para um único arquivo HTML com CSS e JavaScript incorporados. O arquivo pode ser entregue ao professor.
- Na janela do projeto, **Voltar ao editor** tenta trazer a janela do laboratório para frente. Se o navegador não permitir a mudança de foco, selecione a aba do laboratório. As dimensões da área de visualização aparecem no topo.
- **Parar visualização** remove a página executada. **Limpar campos** também apaga o conteúdo do rascunho salvo, após confirmação.

O rascunho é salvo no navegador, sem envio a um servidor. Não há contas, sincronização entre dispositivos nem painel para receber trabalhos. Ao voltar à página, o aluno precisa clicar em Visualizar para executar o rascunho recuperado. Em dispositivos compartilhados, limpe os campos ao terminar. Se o navegador impedir o armazenamento, a interface informa a falha; use o download.

## Arquivos e implementação

- `index.html`: interface e campos de entrada.
- `style.css`: aparência e adaptação a telas pequenas.
- `script.js`: montagem da página, abertura da janela, rascunho e download.
- `visualizar.html`: janela independente de visualização.
- `visualizar.js`: recebimento do projeto, isolamento e exibição de erros.

A prévia usa `iframe` com `sandbox="allow-scripts"`, sem `allow-same-origin`, impedindo que o código acesse o DOM e o armazenamento do editor. A janela recebe o projeto por postMessage, conferindo a janela remetente e a origem quando hospedado. O HTML é interpretado com DOMParser; CSS e JS são incorporados por URLs de dados com UTF-8. Referências locais exatas a `style.css`, `styles.css`, `script.js` e `app.js` (com ou sem `./`) são substituídas pelos respectivos campos. Outras referências são preservadas; evite duplicar scripts no HTML e no campo JavaScript.

Use URLs completas HTTPS para imagens e recursos externos. Arquivos locais citados pelo aluno não são enviados automaticamente; caminhos relativos dependem da localização do editor. Recursos externos exigem internet. Códigos com módulos/importações, políticas CSP próprias ou APIs que exigem origem/permissões podem precisar de adaptações. A prévia bloqueia pop-ups, acesso à página principal e envio de formulários; o HTML baixado roda como uma página comum, sem esse sandbox.

Erros JavaScript capturáveis aparecem abaixo da prévia (até dez por execução). Isso não é um validador de HTML/CSS. O isolamento não impõe limite de CPU: um laço infinito pode travar a aba e impedir o botão Parar visualização; nesse caso, feche e reabra a aba. A rede não é bloqueada pelo sandbox. Execute códigos cuja origem você conhece, especialmente no HTML baixado.

## Personalizar

Altere o título em `index.html`, as cores em `style.css` e o objeto `example` em `script.js` para adaptar a atividade à turma.

## Responsividade

O laboratório usa três colunas em telas largas, duas em telas intermediárias e uma em telas menores. Os controles se reorganizam, e a janela de visualização usa toda a área restante abaixo da barra de ações, com altura dinâmica para celulares. Não exige orientação específica.

A página gerada recebe `meta viewport` com `width=device-width, initial-scale=1` e regras básicas para limitar imagens, vídeos, canvas e SVG à largura disponível. O exemplo também usa dimensionamento fluido. Essas medidas não reescrevem todo o CSS do aluno: larguras fixas, tabelas largas ou elementos posicionados podem continuar causando rolagem horizontal. Para um site responsivo, o aluno deve usar larguras flexíveis, `max-width` e media queries conforme necessário. O download incorpora as mesmas regras básicas.
