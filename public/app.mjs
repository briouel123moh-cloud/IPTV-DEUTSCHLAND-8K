import { monthText, streamText, quote, widget, monthlyCost } from './offer.mjs';
for (const section of document.querySelectorAll('[data-plans]')) {
  const rows = [...section.querySelectorAll('[data-term]')];
  section.addEventListener('change', event => {
    if (!event.target.matches('input[name="streams"]')) return;
    const screens = Number(event.target.value);
    section.querySelector('[data-selection]').textContent = `${streamText(screens)} gleichzeitig ausgewählt`;
    for (const row of rows) {
      const months = Number(row.dataset.term);
      row.querySelector('[data-count]').textContent = streamText(screens);
      const link = row.querySelector('[data-quote]');
      link.href = quote(months, screens);
      link.setAttribute('aria-label', `${monthText(months)} für ${streamText(screens)} per WhatsApp anfragen`);
    }
  });
}
const modal = document.querySelector('#trial-dialog');
const frame = modal.querySelector('iframe');
const loading = modal.querySelector('[data-loading]');
const direct = modal.querySelector('[data-direct]');
let opener, timeout;
document.addEventListener('click', event => {
  const button = event.target.closest('[data-trial]');
  if (!button || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof modal.showModal !== 'function' || modal.open) return;
  const url = new URL(widget);
  url.hash = new URLSearchParams({page:location.origin + location.pathname}).toString();
  event.preventDefault();
  opener = button;
  frame.src = direct.href = url.href;
  loading.hidden = false;
  loading.textContent = 'Testformular wird geladen …';
  modal.showModal();
  document.documentElement.classList.add('dialog-open');
  timeout = setTimeout(()=>{ loading.textContent = 'Falls das Formular nicht lädt, öffne es über den direkten Link.'; },12000);
});
modal.querySelector('[data-close]').addEventListener('click',()=>modal.close());
modal.addEventListener('close',()=>{
  clearTimeout(timeout);
  frame.removeAttribute('src');
  document.documentElement.classList.remove('dialog-open');
  opener?.focus();
});
window.addEventListener('message', event => {
  if (!modal.open || event.origin !== new URL(widget).origin || event.source !== frame.contentWindow) return;
  if (event.data?.type === 'emerald-trial-ready') { clearTimeout(timeout); loading.hidden = true; }
  if (event.data?.type === 'emerald-trial-close') modal.close();
  if (event.data?.type === 'emerald-trial-size' && Number.isFinite(event.data.height) && event.data.height >= 200 && event.data.height <= 1800) frame.style.height = `min(${Math.ceil(event.data.height)}px, calc(100dvh - 156px))`;
});
const calculator=document.querySelector('[data-calculator]');
if(calculator) {
  calculator.querySelector('[data-calculate]').disabled = false;
  const result=calculator.querySelector('output');
  const euros=new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'});
  calculator.addEventListener('submit',event=>{
    event.preventDefault();
    const value=name=>Number(calculator.elements[name].value);
    const amounts=monthlyCost(value('total'),value('extra'),value('months'),value('screens'));
    result.textContent=amounts?`${euros.format(amounts.monthly)} pro Monat · ${euros.format(amounts.perStream)} pro Monat und gleichzeitigem Stream.`:'Prüfe die eingegebenen Werte.';
  });
}
