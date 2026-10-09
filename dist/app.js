'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const external = (url, text) => `<a href="${url}" target="_blank" rel="noopener">${text} ↗</a>`;
const sourceURLs = {
  official:'https://tgts.telangana.gov.in/home.aspx',
  directory:'https://www.telangana.gov.in/departments/information-technology-electronics-and-communications/',
  outlook:'https://des.telangana.gov.in/publications/Socio%20Economic%20Outlook-2024.pdf',
  functions:'https://tgoilfed.telangana.gov.in/rti.pdf',
  report:'https://invest.telangana.gov.in/wp-content/uploads/2020/05/Telangana-IT-EC-Department-Annual-Report-2018-19.pdf',
  gadwal:'https://gadwal.telangana.gov.in/information-technology/',
  tenders:'https://eprocurement.telangana.gov.in/',
  orders:'https://startup.telangana.gov.in/government-orders/',
  rti:'https://www.telangana.gov.in/rti/rti-act/'
};

const navigation = $('#navigation');
const menuToggle = $('.menu-toggle');
function closeMenu(){ navigation.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Open navigation'); }
menuToggle.addEventListener('click',()=>{ const open = menuToggle.getAttribute('aria-expanded') !== 'true'; navigation.classList.toggle('is-open', open); menuToggle.setAttribute('aria-expanded',String(open)); menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation'); });
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>closeMenu()));
document.addEventListener('click',e=>{if(!e.target.closest('header'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&navigation.classList.contains('is-open')){closeMenu();menuToggle.focus();}});
const desktopQuery=matchMedia('(min-width:1101px)');
desktopQuery.addEventListener('change',e=>{if(e.matches)closeMenu();});

const header = $('#header');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>24),{passive:true});
header.classList.toggle('scrolled',window.scrollY>24);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let settings={scale:1,contrast:false,motion:false};
try { Object.assign(settings,JSON.parse(localStorage.getItem('tgts-preferences')||'{}')); } catch {}
function applySettings(){
  settings.scale=Math.min(1.25,Math.max(1,Number(settings.scale)||1));
  document.documentElement.style.setProperty('--scale',settings.scale);
  document.body.classList.toggle('high-contrast',Boolean(settings.contrast));
  document.body.classList.toggle('reduced-motion',Boolean(settings.motion));
  try{localStorage.setItem('tgts-preferences',JSON.stringify(settings));}catch{}
}
applySettings();
if('IntersectionObserver' in window){
  if(!reducedMotion.matches&&!settings.motion)document.body.classList.add('motion-ready');
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.08});
  $$('.reveal').forEach(el=>revealObserver.observe(el));
  const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){$$('nav>a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${entry.target.id}`));}}),{rootMargin:'-15% 0px -65% 0px',threshold:0});
  $$('main section[id]').forEach(el=>sectionObserver.observe(el));
}
$$('.service').forEach(item=>item.addEventListener('toggle',()=>{
  if(item.open)$$('.service').forEach(other=>{if(other!==item)other.open=false;});
}));
$$('[data-service]').forEach(link=>link.addEventListener('click',()=>{
  $('#service-select').value=link.dataset.service;
}));

const resources={
  tenders:[
    ['Telangana eProcurement portal','Tender notices, bid documents and procurement resources.','Official portal',sourceURLs.tenders],
    ['TGTS tenders & announcements','Visit TGTS for its published notices and updates.','TGTS website',sourceURLs.official],
    ['eProcurement terms & conditions','Official information for users of the procurement platform.','Portal guidance','https://eprocurement.telangana.gov.in/terms-conditions.html']
  ],
  orders:[
    ['Technology & procurement government orders','Government orders published by Startup Telangana.','Government orders',sourceURLs.orders],
    ['IT, Electronics & Communications Department','Department profile, functions and official contacts.','Department',sourceURLs.directory],
    ['Telangana State Portal','Government information, departments and public services.','State portal','https://www.telangana.gov.in/']
  ],
  resources:[
    ['Right to Information','Access the RTI Act in English and Telugu.','Public information',sourceURLs.rti],
    ['Socio Economic Outlook 2024','TGTS’s institutional role is described on printed page 249.','Official report · PDF',sourceURLs.outlook],
    ['State web directory','Find official Telangana government websites.','Directory','https://www.telangana.gov.in/state-web-directory/']
  ]
};
function showResources(key){
  $$('.tabs [role="tab"]').forEach(button=>{const selected=button.dataset.tab===key;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
  const panel=$('#resource-panel');
  panel.setAttribute('aria-labelledby',`tab-${key}`);
  panel.innerHTML=resources[key].map((row,i)=>`<a class="resource-row" href="${row[3]}" target="_blank" rel="noopener"><span class="resource-num">0${i+1}</span><span class="resource-text"><strong>${row[0]}</strong><small>${row[1]}</small></span><span class="resource-category">${row[2]}</span><span class="circle-arrow" aria-hidden="true">↗</span><span class="sr-only"> Opens official source in a new tab</span></a>`).join('');
}
showResources('tenders');
$$('[data-tab]').forEach(button=>button.addEventListener('click',()=>showResources(button.dataset.tab)));
$('.tabs').addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const tabs=$$('[data-tab]');let idx=tabs.indexOf(document.activeElement);
  if(event.key==='Home')idx=0;else if(event.key==='End')idx=tabs.length-1;else idx=(idx+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  showResources(tabs[idx].dataset.tab);tabs[idx].focus();
});

const modal=$('#modal');
const modalContent=$('#modal-content');
const modalData={
  events:()=>`<h2 id="modal-title">Events & announcements</h2><p>Explore TGTS updates, institutional events and official announcements. Current notices are maintained by TGTS on its official website.</p><p>${external(sourceURLs.official,'TGTS events and announcements')}</p><p>${external('https://www.telangana.gov.in/news/news-and-press-releases/','Telangana government news and press releases')}</p>`,
  about:()=>`<h2 id="modal-title">Public purpose.<br>Specialist expertise.</h2><p>TGTS supports the technology requirements of Telangana’s government departments, public institutions and public sector undertakings. Its remit includes consultancy, procurement and implementation support.</p><p>Its work spans requirement specifications, technical and commercial analysis, procurement of computer and office automation equipment, and acceptance testing.</p><h3>Enabling digital government</h3><p>Official state publications describe TGTS’s role in Aadhaar authentication and KYC, application security assessments and digital certificates.</p><p>${external(sourceURLs.outlook,'Read the Socio Economic Outlook 2024')} · printed page 249.</p><a class="pill dark" href="#services" data-close>Explore the services <span class="arrow">↗</span></a>`,
  sdc:()=>`<h2 id="modal-title">State Data Centre</h2><p>The State Data Centre is part of Telangana’s shared IT infrastructure supporting digital public service delivery. Official descriptions of MeeSeva identify it alongside the State Wide Area Network, service delivery gateway and digital signatures.</p><p>This feature introduces the state’s digital ecosystem; it does not make claims about current capacity or operational performance.</p><h3>Explore the programme</h3><p>${external(sourceURLs.gadwal,'Official Telangana district information technology page')}</p><p class="image-note">The server photography on this website is illustrative, not a photograph of the Telangana State Data Centre.</p>`,
  swan:()=>`<h2 id="modal-title">State Wide Area Network</h2><p>The State Wide Area Network forms part of Telangana’s government connectivity infrastructure. TGTS’s published functions include implementation of communication infrastructure, and the 2018–19 IT department report describes TSTS support for SWAN operations and maintenance.</p><p>Project information here is contextual; no current network coverage or performance figures are implied.</p><h3>Official programme information</h3><p>${external(sourceURLs.report,'IT, E&C Department Annual Report 2018–19 · PDF')}</p><p>${external(sourceURLs.gadwal,'State infrastructure and MeeSeva overview')}</p>`,
  rti:()=>`<h2 id="modal-title">Right to Information</h2><p>Find the RTI Act and public information resources through the official Telangana State Portal.</p><p>For TGTS-specific disclosures, designated officers and submission procedures, consult the official TGTS website. This website does not accept RTI applications.</p><ul><li>${external(sourceURLs.rti,'RTI Act — English and Telugu')}</li><li>${external('https://www.telangana.gov.in/rti/information-commission/','Telangana Information Commission')}</li><li>${external(sourceURLs.official,'TGTS official website')}</li></ul>`,
  accessibility:()=>`<h2 id="modal-title">Make yourself comfortable.</h2><p>Adjust this experience to your reading preferences.</p><div class="setting"><span>Text size <strong id="text-size-value">${Math.round(settings.scale*100)}%</strong></span><div class="size-buttons"><button data-setting="smaller" aria-label="Decrease text size">A−</button><button data-setting="larger" aria-label="Increase text size">A+</button></div></div><div class="setting"><span>Higher contrast</span><button data-setting="contrast" aria-pressed="${settings.contrast}">${settings.contrast?'On':'Off'}</button></div><div class="setting"><span>Reduce motion</span><button data-setting="motion" aria-pressed="${settings.motion}">${settings.motion?'On':'Off'}</button></div><div class="setting"><span>Restore default appearance</span><button data-setting="reset">Reset</button></div><h3>Keyboard navigation</h3><p>Use Tab to navigate, Enter or Space to activate controls, arrow keys to switch resource tabs, and Escape to close dialogs. Your device’s reduced-motion preference is also respected.</p>`,
  privacy:()=>`<h2 id="modal-title">Privacy</h2><p>Search and contact-form drafting happen in your browser. This site does not submit or store your enquiry. Selecting “Open email app” passes the prepared message to your email application, where you choose whether to send it.</p><p>Accessibility preferences are saved locally on your device. No analytics or advertising scripts have been added to this website.</p><p>The embedded footer map loads Google Maps when it comes into view. Official portals, map providers and hosting services have their own privacy practices.</p><p>${external('https://www.telangana.gov.in/website-policies/','Official Telangana State Portal website policies')}</p>`,
  terms:()=>`<h2 id="modal-title">About this website</h2><p>This is an unofficial website about Telangana Technology Services (TGTS), made by Saksham. It is not an official government service or application channel.</p><p>Content is based on the official sources listed in the credits. Tender notices, vacancies, deadlines and application requirements must be checked on the relevant official portal.</p><p>Government identity artwork and leadership portraits are taken from the sources listed under Sources & image credits. Photographs of technology, infrastructure and workplaces are illustrative unless a location is identified.</p>`,
  sitemap:()=>`<h2 id="modal-title">Find your way.</h2><ul>${[['home','Home'],['about','About TGTS'],['services','Services'],['initiatives','Initiatives'],['clients','Major clients'],['technology-stories','Technology & careers'],['updates','Tenders & resources'],['careers','Careers'],['contact','Contact']].map(([id,label])=>`<li><a href="#${id}" data-close>${label}</a></li>`).join('')}</ul>`,
  map:()=>`<h2 id="modal-title">Visit HACA Bhavan</h2><p>2nd Floor, HACA Bhavan, Opp. Assembly, Nampally, Hyderabad – 500 004.</p><iframe title="Google Maps showing HACA Bhavan in Hyderabad" src="https://maps.google.com/maps?q=HACA%20Bhavan%20Hyderabad&t=&z=15&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><p>${external('https://www.google.com/maps/search/?api=1&query=HACA+Bhavan+Hyderabad','Open map and directions')}</p>`,
  sources:()=>`<h2 id="modal-title">Sources & image credits</h2><p>Official sources were reviewed on 6 October 2026. Live tender notices, vacancies and deadlines are not shown here; check the official portals for current information.</p><h3>Government information</h3><ul><li>${external(sourceURLs.outlook,'Socio Economic Outlook 2024')} — printed page 249: institutional role, Aadhaar, security assessments and certificates.</li><li>${external(sourceURLs.functions,'Published TGTS functions and duties · PDF')} — procurement, consultancy, communications and office address.</li><li>${external(sourceURLs.directory,'Telangana IT, E&C Department directory')} — office phone and Managing Director email.</li><li>${external(sourceURLs.gadwal,'Jogulamba Gadwal district: Information Technology')} — consultancy, implementation and shared state infrastructure.</li><li>${external(sourceURLs.report,'IT, E&C Annual Report 2018–19 · PDF')} — historic SWAN and procurement context.</li><li>${external(sourceURLs.tenders,'Telangana eProcurement')} and ${external(sourceURLs.orders,'Government orders')}.</li></ul><h3>Government identity, leadership & clients</h3><p>CM and IT minister portraits and the combined Telangana emblem / Telangana Rising artwork come from the ${external('https://www.telangana.gov.in/government/council-of-ministers/','official State Portal')}. The TGTS chairman portrait comes from the ${external('https://www.tmoa.in/','Telangana Meeseva Operators Association')}, with the role corroborated by the official IT, E&C directory.</p><p>IGRS and TGTRANSCO artwork comes from their government / institutional portals. GHMC artwork comes from its works monitoring portal. Telangana Police, Hyderabad Police and the historic TS GENCO mark use separately documented public reproductions. These are identifiable institution logos.</p><h3>Photography & typography</h3><p>Telangana Secretariat: Kavali Chandrakanth KCK, ${external('https://commons.wikimedia.org/wiki/File:Dr.B.R._Ambedkar_Telangana_State_Secretariat_Hyderabad.jpg','Wikimedia Commons')}, ${external('https://creativecommons.org/licenses/by-sa/4.0/','CC BY-SA 4.0')}. Displayed with layout cropping and a tonal overlay; the underlying photograph is unchanged.</p><p>Illustrative server, architecture and workplace photography: ${external('https://unsplash.com/','Unsplash')}. Local source URLs are recorded in the project credits. Manrope typeface, SIL Open Font License.</p><p>The phone number and email address are taken from the official state directory.</p>`
};
function openModal(key){
  if(!modalData[key])return;
  closeMenu();
  modalContent.innerHTML=modalData[key]();
  if(!modal.open)modal.showModal();
  modal.scrollTop=0;
}
document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-dialog]');
  if(trigger){if(trigger.dataset.dialog==='search'){closeMenu();$('#search-dialog').showModal();showSearch('');$('#site-search').value='';$('#site-search').focus();}else openModal(trigger.dataset.dialog);}
  const close=event.target.closest('.close-dialog,[data-close]');
  if(close){const parent=close.closest('dialog');if(parent)parent.close();}
  const setting=event.target.closest('[data-setting]');
  if(setting){const action=setting.dataset.setting;if(action==='smaller')settings.scale=Math.max(1,settings.scale-.1);if(action==='larger')settings.scale=Math.min(1.25,settings.scale+.1);if(action==='contrast')settings.contrast=!settings.contrast;if(action==='motion')settings.motion=!settings.motion;if(action==='reset')settings={scale:1,contrast:false,motion:false};applySettings();$('#text-size-value').textContent=`${Math.round(settings.scale*100)}%`;$$('[data-setting="contrast"],[data-setting="motion"]').forEach(button=>{const on=settings[button.dataset.setting];button.setAttribute('aria-pressed',String(on));button.textContent=on?'On':'Off';});}
});
$$('dialog').forEach(dialog=>{
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{const frame=$('iframe',dialog);if(frame)frame.remove();});
});

const searchItems=[
  {name:'About Telangana Technology Services',group:'Organisation',href:'#about',keywords:'tgts government enterprise'},
  ...$$('.service').map((item,index)=>({name:$('h3',item).textContent,group:'Service',href:'#services',index,keywords:$('p',item).textContent})),
  {name:'Major clients and logos',group:'Institutions',href:'#clients',keywords:'police GHMC IGRS GENCO TRANSCO'},
  {name:'Careers, cybersecurity and technology stories',group:'Explore',href:'#technology-stories',keywords:'welcome images gallery audit IT'},
  {name:'State Data Centre',group:'Initiative',href:'#initiatives',keywords:'sdc digital infrastructure'},
  {name:'State Wide Area Network',group:'Initiative',href:'#initiatives',keywords:'swan connectivity'},
  {name:'Tenders & government orders',group:'Resources',href:'#updates',keywords:'procurement notices announcements downloads'},
  {name:'Careers at TGTS',group:'Careers',href:'#careers',keywords:'jobs recruitment vacancies'},
  {name:'Contact TGTS',group:'Contact',href:'#contact',keywords:'address office phone email HACA Bhavan map'},
  {name:'Right to Information',group:'Information',modal:'rti',keywords:'rti disclosures'}
];
function showSearch(query){
  const tokens=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches=searchItems.filter(item=>tokens.every(term=>`${item.name} ${item.keywords}`.toLowerCase().includes(term)));
  $('#search-results').innerHTML=matches.length?matches.map(item=>`<a href="${item.href||'#'}" data-result="${searchItems.indexOf(item)}">${escapeHTML(item.name)}<span>${item.group} ↗</span></a>`).join(''):'<p>No results found. Try “Aadhaar”, “tenders” or “contact”.</p>';
}
$('#site-search').addEventListener('input',e=>showSearch(e.target.value));
$('#search-results').addEventListener('click',event=>{
  const result=event.target.closest('[data-result]');if(!result)return;
  const item=searchItems[Number(result.dataset.result)];$('#search-dialog').close();
  if(item.modal){event.preventDefault();openModal(item.modal);}
  else {if(item.index!==undefined)$$('.service').forEach((service,i)=>service.open=i===item.index);const destination=$(item.href);if(destination){destination.setAttribute('tabindex','-1');destination.focus({preventScroll:true});}}
});

$('#contact-form').addEventListener('submit',event=>{
  event.preventDefault();
  const form=event.currentTarget;if(!form.reportValidity())return;
  const data=new FormData(form);
  const subject=`TGTS enquiry: ${data.get('service')}`;
  const body=`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nOrganisation: ${data.get('organisation')}\nService: ${data.get('service')}\n\n${data.get('message')}`;
  const mailto=`mailto:mngdirector-tsts@telangana.gov.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  modalContent.innerHTML=`<h2 id="modal-title">Your enquiry is ready.</h2><p>Review your message, then open it in your email app. Nothing has been sent.</p><h3>${escapeHTML(subject)}</h3><p style="white-space:pre-wrap;overflow-wrap:anywhere">${escapeHTML(body)}</p><a class="pill dark" href="${escapeHTML(mailto)}">Open email app <span class="arrow">↗</span></a><p style="margin-top:20px;font-size:.7rem">To: mngdirector-tsts@telangana.gov.in<br>You can also copy the message above into your preferred email service.</p>`;
  modal.showModal();modal.scrollTop=0;
  $('#form-status').textContent='Email draft prepared. Send it from your email app when ready.';
});


// Seamless right-to-left logo marquees (clients and related links). The duplicate is excluded from navigation and accessibility.
$$('.logo-track').forEach(logoTrack => {
  const originalGroup = $('.logo-group', logoTrack);
  const duplicateGroup = originalGroup.cloneNode(true);
  duplicateGroup.setAttribute('aria-hidden', 'true');
  duplicateGroup.setAttribute('inert', '');
  $$('a', duplicateGroup).forEach(link => link.tabIndex = -1);
  $$('img', duplicateGroup).forEach(img => img.alt = '');
  logoTrack.appendChild(duplicateGroup);
  const marquee = logoTrack.closest('section');
  const toggle = $('.marquee-control', marquee);
  toggle.addEventListener('click', () => {
    const paused = marquee.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.innerHTML = paused ? '<span aria-hidden="true">▶</span> Resume scrolling' : '<span aria-hidden="true">Ⅱ</span> Pause scrolling';
  });
  const syncMotionControl = () => {
    const staticMode = reducedMotion.matches || document.body.classList.contains('reduced-motion');
    toggle.hidden = staticMode;
  };
  new MutationObserver(syncMotionControl).observe(document.body, {attributes: true, attributeFilter:['class']});
  reducedMotion.addEventListener('change', syncMotionControl);
  syncMotionControl();
});
$$('[data-open-service]').forEach(link => link.addEventListener('click', () => {
  $$('.service').forEach((service, index) => service.open = index === Number(link.dataset.openService));
}));
$$('[data-resource]').forEach(link => link.addEventListener('click', () => showResources(link.dataset.resource)));
