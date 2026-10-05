'use strict';

const fields = Object.fromEntries(['html', 'css', 'js'].map(id => [id, document.getElementById(id)]));
const $ = id => document.getElementById(id);
const storageKey = 'laboratorio-web:rascunho:v1';
let previewWindow = null;
let pendingPreview = null;
const previewWindowName = 'laboratorio-' + Math.random().toString(36).slice(2);
const targetOrigin = location.protocol === 'file:' ? '*' : location.origin;
let saveTimer;
const example = {
  html: '<main class="cartao">\n  <span class="etiqueta">MEU PRIMEIRO SITE</span>\n  <h1>Olá, mundo!</h1>\n  <p>Uma ideia começa com algumas linhas de código.</p>\n  <button id="botao">Clique para testar</button>\n  <p id="mensagem" aria-live="polite"></p>\n</main>',
  css: '* { box-sizing: border-box; }\nimg, video { max-width: 100%; height: auto; }\nbody {\n  margin: 0; padding: 40px 20px;\n  font-family: Arial, sans-serif;\n  background: #eef5ff; color: #193653;\n}\n.cartao {\n  max-width: 520px; margin: auto;\n  padding: 32px; border-radius: 16px;\n  background: white;\n}\n.etiqueta { font-size: 12px; color: #3264aa; }\nh1 { font-size: 36px; margin-bottom: 12px; }\np { line-height: 1.6; }\nbutton {\n  background: #1859d9; color: white;\n  border: 0; border-radius: 8px;\n  padding: 14px 20px; cursor: pointer;\n}',
  js: 'let cliques = 0;\nconst botao = document.querySelector("#botao");\nconst mensagem = document.querySelector("#mensagem");\n\nbotao.addEventListener("click", () => {\n  cliques++;\n  mensagem.textContent = `Funcionou! Cliques: ${cliques}`;\n});'
};

function values() { return Object.fromEntries(Object.entries(fields).map(([id, el]) => [id, el.value])); }
function setValues(data) { for (const id in fields) fields[id].value = data[id] || ''; }
function save() {
  clearTimeout(saveTimer);
  try { localStorage.setItem(storageKey, JSON.stringify(values())); $('save-status').textContent = 'Rascunho salvo neste navegador'; }
  catch { $('save-status').textContent = 'Não foi possível salvar. Baixe seu trabalho.'; }
}
function dataURL(text, type) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:${type};charset=utf-8;base64,${btoa(binary)}`;
}

// O DOMParser lê o HTML sem executar os scripts no documento do editor.
// CSS e JS em URLs de dados preservam textos como </script> dentro do código.
function buildDocument(data, token = '') {
  const doc = new DOMParser().parseFromString(data.html, 'text/html');
  if (!doc.documentElement.lang) doc.documentElement.lang = 'pt-BR';
  if (!doc.querySelector('meta[charset]')) {
    const meta = doc.createElement('meta'); meta.setAttribute('charset', 'UTF-8'); doc.head.prepend(meta);
  }
  doc.querySelectorAll('meta[name="viewport"]').forEach(el => el.remove());
  const viewport = doc.createElement('meta'); viewport.name = 'viewport';
  viewport.content = 'width=device-width, initial-scale=1'; doc.head.append(viewport);
  const baseStyle = doc.createElement('style');
  baseStyle.textContent = 'html{overflow-wrap:break-word}img,video,canvas,svg{max-width:100%;height:auto}';
  doc.head.prepend(baseStyle);
  // Os campos CSS/JS substituem estas referências convencionais de arquivos locais.
  doc.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
    if (/^(\.\/)?(style|styles)\.css$/i.test(el.getAttribute('href') || '')) el.remove();
  });
  doc.querySelectorAll('script[src]').forEach(el => {
    if (/^(\.\/)?(script|app)\.js$/i.test(el.getAttribute('src') || '')) el.remove();
  });
  const style = doc.createElement('link'); style.rel = 'stylesheet'; style.href = dataURL(data.css, 'text/css'); doc.head.append(style);
  if (token) {
    const monitor = doc.createElement('script');
    monitor.src = dataURL(`(() => { const report = message => parent.postMessage({type:'lab-error', token:${JSON.stringify(token)}, message:String(message).slice(0,2000)}, '*'); addEventListener('error', e => report(e.message || 'Falha ao executar um recurso.')); addEventListener('unhandledrejection', e => report(e.reason?.message || e.reason)); })();`, 'text/javascript');
    doc.head.prepend(monitor);
  }
  const script = doc.createElement('script'); script.src = dataURL(data.js, 'text/javascript'); doc.body.append(script);
  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}

function run() {
  // Abrir durante o clique evita bloqueios causados por tarefas assíncronas.
  const opened = window.open('visualizar.html', previewWindowName, 'popup,width=1200,height=800,resizable=yes,scrollbars=yes');
  if (!opened) {
    $('preview-status').textContent = 'O navegador bloqueou a janela. Permita pop-ups para este site e clique novamente.';
    return;
  }
  previewWindow = opened;
  save();
  const token = `${Date.now()}-${Math.random()}`;
  pendingPreview = {type: 'lab-render', token, html: buildDocument(values(), token)};
  $('preview-status').textContent = 'Abrindo a visualização em outra janela…';
  opened.focus();
}
function stop() {
  pendingPreview = null;
  if (previewWindow && !previewWindow.closed) previewWindow.postMessage({type: 'lab-stop'}, targetOrigin);
  $('preview-status').textContent = 'Clique em Visualizar site para abrir seu projeto.';
}
function confirmReplace() { return !Object.values(values()).some(v => v.trim()) || confirm('Substituir os códigos atuais? Baixe seu trabalho antes se quiser guardá-lo.'); }
$('run').addEventListener('click', run);
$('example').addEventListener('click', () => { if (confirmReplace()) { setValues(example); save(); $('preview-status').textContent = 'Exemplo carregado. Clique em Visualizar site.'; } });
$('clear').addEventListener('click', () => { if (confirmReplace()) { setValues({}); save(); stop(); fields.html.focus(); } });
$('download').addEventListener('click', () => {
  const blob = new Blob([buildDocument(values())], {type: 'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = 'meu-site.html'; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
});
for (const field of Object.values(fields)) field.addEventListener('input', () => {
  $('preview-status').textContent = 'Alterações ainda não visualizadas';
  $('save-status').textContent = 'Salvando rascunho…';
  clearTimeout(saveTimer); saveTimer = setTimeout(save, 400);
});
window.addEventListener('pagehide', save);
window.addEventListener('message', e => {
  if (!previewWindow || e.source !== previewWindow) return;
  if (location.protocol !== 'file:' && e.origin !== location.origin) return;
  if (e.data?.type === 'lab-ready' && pendingPreview) {
    previewWindow.postMessage(pendingPreview, targetOrigin);
  }
  if (e.data?.type === 'lab-rendered' && e.data.token === pendingPreview?.token) {
    $('preview-status').textContent = 'Projeto aberto em outra janela. Edite e visualize novamente para atualizar.';
  }
});

try {
  const stored = localStorage.getItem(storageKey);
  const draft = stored ? JSON.parse(stored) : null;
  if (draft && ['html','css','js'].every(key => typeof draft[key] === 'string')) setValues(draft);
  else setValues(example);
} catch { setValues(example); $('save-status').textContent = 'Armazenamento local indisponível'; }
// Rascunhos recuperados só são executados quando o usuário solicita.
stop();
