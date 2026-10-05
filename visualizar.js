'use strict';

const $ = id => document.getElementById(id);
const editor = window.opener;
const targetOrigin = location.protocol === 'file:' ? '*' : location.origin;
let frame = $('preview-frame');
let token = '';
let errorCount = 0;
function replaceFrame(html) {
  const next = document.createElement('iframe');
  next.id = 'preview-frame'; next.title = 'Site criado pelo aluno';
  next.setAttribute('sandbox', 'allow-scripts'); next.referrerPolicy = 'no-referrer';
  next.srcdoc = html; frame.replaceWith(next); frame = next;
  errorCount = 0; $('errors').textContent = ''; $('errors').hidden = true;
}
function stop() {
  token = ''; replaceFrame('');
  $('viewer-status').hidden = false;
  $('viewer-status').textContent = 'Visualização parada. No editor, clique em Visualizar site para executar novamente.';
}
window.addEventListener('message', e => {
  if (editor && e.source === editor && (location.protocol === 'file:' || e.origin === location.origin)) {
    if (e.data?.type === 'lab-render' && typeof e.data.html === 'string' && typeof e.data.token === 'string') {
      token = e.data.token;
      $('viewer-status').hidden = true;
      replaceFrame(e.data.html);
      editor.postMessage({type: 'lab-rendered', token}, targetOrigin);
    } else if (e.data?.type === 'lab-stop') stop();
    return;
  }
  if (e.source !== frame.contentWindow || e.data?.type !== 'lab-error' || !token || e.data.token !== token || errorCount >= 10) return;
  errorCount++; $('errors').hidden = false;
  $('errors').textContent += `${errorCount}. ${String(e.data.message).slice(0,2000)}\n`;
});
$('stop').addEventListener('click', stop);
$('back').addEventListener('click', () => {
  if (editor && !editor.closed) editor.focus();
  else location.href = 'index.html';
});
function measure() {
  $('size').textContent = `${Math.round(frame.clientWidth)} × ${Math.round(frame.clientHeight)} px`;
}
new ResizeObserver(measure).observe($('frame-host'));
if (editor) editor.postMessage({type: 'lab-ready'}, targetOrigin);
