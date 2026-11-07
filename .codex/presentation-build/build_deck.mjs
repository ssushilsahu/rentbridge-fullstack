import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const ROOT = 'C:/Users/user/Downloads/rentbridge-fullstack/rentbridge';
const SKILL = 'C:/Users/user/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/presentations';
const RUNTIME_MODULES = 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules';
const BUILD = path.join(ROOT, 'presentation-build');
const OUT = path.join(ROOT, 'deliverables');
const FINAL = path.join(OUT, 'RentBridge_Project_Overview_Final.pptx');
const { Presentation, PresentationFile } = await import(pathToFileURL(path.join(RUNTIME_MODULES,'@oai/artifact-tool/dist/artifact_tool.mjs')).href);
const { resolvePresentationFont, finalizePresentation } = await import(pathToFileURL(path.join(SKILL, 'container_tools/artifact_tool_utils.mjs')).href);
const FONT = resolvePresentationFont();
const W = 1280, H = 720;
const C = {
  ink: '#17353A', muted: '#536D6B', paper: '#F5F3EC', white: '#FFFFFF',
  teal: '#147C73', teal2: '#D8EAE4', coral: '#E77B55', coral2: '#F8E4DA',
  line: '#C8D4CE', deep: '#102C32', pale: '#E8EEE9', blue: '#4A7781'
};
const deck = Presentation.create({ slideSize: { width: W, height: H } });

function shape(slide, geometry, x, y, w, h, fill='none', stroke='none', sw=0, name='') {
  return slide.shapes.add({ geometry, name: name || undefined,
    position: { left:x, top:y, width:w, height:h }, fill,
    line: { style:'solid', fill:stroke, width:sw } });
}
function txt(slide, text, x, y, w, h, size=24, color=C.ink, bold=false, opts={}) {
  const s = shape(slide, 'textbox', x,y,w,h, 'none','none',0, opts.name || '');
  s.text = text;
  s.text.style = { fontSize:size, typeface:FONT, color, bold,
    verticalAlignment: opts.valign || 'middle', alignment:opts.align || 'left',
    wrap: opts.wrap === false ? 'none' : 'square' };
  s.text.insets = opts.insets ?? 0;
  return s;
}
function line(slide, x1,y1,x2,y2, color=C.line, width=2) {
  return shape(slide,'line',x1,y1,x2-x1,y2-y1,'none',color,width);
}
function base(title, section, n) {
  const s=deck.slides.add(); s.background.fill=C.paper;
  shape(s,'rect',64,68,8,48,C.teal);
  txt(s,section.toUpperCase(),92,68,440,25,15,C.teal,true);
  txt(s,title,92,99,1096,60,43,C.ink,true);
  line(s,64,659,1216,659,C.line,1);
  txt(s,'RENTBRIDGE  /  PROJECT OVERVIEW',64,675,720,21,13,C.muted,true);
  txt(s,String(n).padStart(2,'0'),1160,675,56,21,14,C.muted,true,{align:'right'});
  return s;
}
function notes(slide, sources, extra='') {
  slide.speakerNotes.text = `${extra ? extra+'\n\n' : ''}Sources: ${sources.join('; ')}`;
}
function bulletRow(slide, num, title, body, x,y,w, accent=C.teal) {
  txt(slide,num,x,y,44,34,16,accent,true);
  txt(slide,title,x+54,y-3,w-54,38,25,C.ink,true);
  txt(slide,body,x+54,y+39,w-72,56,20,C.muted,false,{valign:'top'});
}
function arrow(slide, from, to, color=C.teal, label='', lx=0,ly=0,lw=150) {
  slide.shapes.connect(from,to,{kind:'straight',fromSide:'right',toSide:'left',line:{style:'solid',fill:color,width:2},tail:{type:'arrow',width:'med',length:'med'}});
  if(label) txt(slide,label,lx,ly,lw,24,14,C.muted,true,{align:'center'});
}

// 1 — Cover
{
  const s=deck.slides.add(); s.background.fill=C.deep;
  shape(s,'rect',76,92,10,92,C.coral);
  txt(s,'RENTAL MARKETPLACE',112,94,520,32,16,'#9CCFC2',true);
  txt(s,'RentBridge',108,160,1000,92,70,C.white,true);
  txt(s,'Connecting people looking for a home\nwith people who have one to rent',112,274,790,112,31,'#D8E7E1',false,{valign:'top'});
  line(s,112,447,1168,447,'#456267',2);
  txt(s,'PROJECT OVERVIEW',112,478,360,28,15,'#9CCFC2',true);
  txt(s,'Product • Architecture • Data flow',112,514,600,34,22,C.white,false);
  txt(s,'Full-stack web application',112,620,580,24,16,'#AFC5BE',false);
  notes(s,['RentBridge repository README.md']);
}

// 2 — Introduction
{
  const s=base('A shared place to find and offer rentals','Introduction',2);
  txt(s,'RentBridge is a full-stack rental marketplace for customers and property owners.',92,190,1040,58,29,C.ink,true);
  line(s,92,284,1188,284,C.line,2);
  txt(s,'CUSTOMERS',92,320,220,24,15,C.teal,true);
  txt(s,'Browse and filter rooms, apartments, houses and PG listings.',92,356,450,92,25,C.ink,false,{valign:'top'});
  txt(s,'OWNERS',676,320,220,24,15,C.coral,true);
  txt(s,'Publish listings, add photos, and manage their own properties.',676,356,480,92,25,C.ink,false,{valign:'top'});
  line(s,92,486,1188,486,C.line,2);
  txt(s,'Both sides can move from discovery to a structured contact request, with notifications when the owner responds.',92,520,1015,78,22,C.muted,false,{valign:'top'});
  notes(s,['README.md','frontend/src/main.jsx','backend/src/routes/properties.js','backend/src/routes/contactRequests.js','backend/src/routes/notifications.js']);
}

// 3 — Problem statement
{
  const s=base('Rental discovery and first contact can be fragmented','Problem statement',3);
  txt(s,'The project addresses common friction in the rental search journey:',92,185,1000,40,23,C.muted,false);
  bulletRow(s,'01','Listings are scattered','Renters may need to move between sources to compare available places.',92,250,520,C.teal);
  bulletRow(s,'02','Details are hard to compare','Rent, type, location and photos can be presented inconsistently.',660,250,520,C.coral);
  bulletRow(s,'03','Contact is a separate hurdle','Finding a listing does not always provide a clear next step to reach its owner.',92,420,520,C.coral);
  bulletRow(s,'04','Privacy matters before a match','Sharing an exact address or personal contact details too early can be undesirable.',660,420,520,C.teal);
  txt(s,'These points frame the product problem; they are not findings from a user study.',92,596,1050,27,15,C.muted,false);
  notes(s,['Problem framing inferred from the RentBridge product flows in README.md, frontend/src/main.jsx, and backend/src/routes/properties.js']);
}

// 4 — Objectives
{
  const s=base('Product objectives','Objectives',4);
  const items=[
    ['01','Make discovery easier','Search listings by city or area, property type and maximum rent.'],
    ['02','Give owners control','Let owners create, edit and remove their own property listings.'],
    ['03','Support a clear next step','Send a contact request tied to a specific property.'],
    ['04','Protect sensitive details','Keep exact address and poster email out of public listing results.']
  ];
  const ys=[202,310,418,526];
  items.forEach((it,i)=>{
    txt(s,it[0],96,ys[i],50,34,18,i%2?C.coral:C.teal,true);
    txt(s,it[1],166,ys[i]-3,370,36,25,C.ink,true);
    txt(s,it[2],560,ys[i]-1,610,60,20,C.muted,false,{valign:'top'});
    if(i<3) line(s,96,ys[i]+78,1182,ys[i]+78,C.line,1);
  });
  notes(s,['frontend/src/main.jsx','backend/src/routes/properties.js','backend/src/routes/contactRequests.js']);
}

// 5 — Proposed solution
{
  const s=base('A three-step rental journey','Proposed solution',5);
  const steps=[
    {n:'01',title:'Discover',body:'Customers browse current listings and narrow results by location, type and budget.',x:96,color:C.teal},
    {n:'02',title:'Publish',body:'Owners add property details and up to five supported photos, then manage their listings.',x:478,color:C.coral},
    {n:'03',title:'Connect',body:'A customer requests contact. The owner accepts or declines; acceptance shares contact details.',x:860,color:C.blue}
  ];
  steps.forEach((a,i)=>{
    txt(s,a.n,a.x,220,80,52,34,a.color,true);
    line(s,a.x,289,a.x+300,289,a.color,4);
    txt(s,a.title,a.x,314,300,46,29,C.ink,true);
    txt(s,a.body,a.x,374,300,124,21,C.muted,false,{valign:'top'});
    if(i<2) txt(s,'→',a.x+318,302,42,50,34,C.muted,true,{align:'center'});
  });
  txt(s,'A notification is created for the owner when a request arrives and for the customer after a decision.',96,548,1060,58,19,C.ink,false);
  notes(s,['frontend/src/main.jsx','backend/src/routes/properties.js','backend/src/routes/contactRequests.js','backend/src/routes/notifications.js','backend/src/models/Notification.js']);
}

// 6 — Technical approach
{
  const s=base('A browser client backed by an API and document database','Technical approach',6);
  const rows=[
    ['CLIENT','React 19 + Vite','Search, listing forms, account flow, owner dashboard and notifications.'],
    ['API','Node.js + Express 5','REST endpoints for auth, properties, contact requests and notifications.'],
    ['DATA','MongoDB + Mongoose','User, Property, ContactRequest and Notification models.'],
    ['ACCESS','JWT + bcrypt','Bearer-token authentication; passwords are hashed before storage.'],
    ['MEDIA','Multer + local uploads','Up to five JPG, PNG or WebP photos per listing; signature checks validate file content.']
  ];
  rows.forEach((r,i)=>{
    const y=194+i*88;
    txt(s,r[0],94,y,144,28,15,i===1||i===3?C.coral:C.teal,true);
    txt(s,r[1],254,y-4,344,36,23,C.ink,true);
    txt(s,r[2],614,y-1,560,58,18,C.muted,false,{valign:'top'});
    if(i<rows.length-1) line(s,94,y+66,1186,y+66,C.line,1);
  });
  notes(s,['frontend/package.json','backend/package.json','backend/src/server.js','backend/src/routes/auth.js','backend/src/routes/properties.js','backend/src/models/User.js','backend/src/models/Property.js']);
}

// 7 — Data flow diagram
{
  const s=base('Data flow: search, listing, and contact','Data flow diagram',7);
  const actor=(label,x,y,fill)=>{
    const a=shape(s,'ellipse',x,y,142,74,fill,'none',0,label);
    txt(s,label,x+4,y+8,134,58,19,C.ink,true,{align:'center'}); return a;
  };
  const process=(title,sub,x,y,w=190,h=90,fill=C.white,stroke=C.teal)=>{
    const p=shape(s,'roundRect',x,y,w,h,fill,stroke,2,title);
    txt(s,title,x+12,y+12,w-24,29,20,C.ink,true,{align:'center'});
    txt(s,sub,x+12,y+43,w-24,h-48,15,C.muted,false,{align:'center',valign:'top'}); return p;
  };
  const store=(title,sub,x,y,w=188,h=86)=>process(title,sub,x,y,w,h,C.teal2,C.blue);
  txt(s,'ACTORS',76,176,130,22,13,C.muted,true);
  txt(s,'APPLICATION',300,176,340,22,13,C.muted,true);
  txt(s,'DATA & EVENTS',922,176,280,22,13,C.muted,true);
  const cust=actor('Customer',78,232,C.teal2);
  const own=actor('Owner',78,438,C.coral2);
  const client=process('React + Vite','Browser UI',310,312,190,110,C.white,C.teal);
  const api=process('Express API','Auth • validation • routes',612,312,224,110,C.white,C.coral);
  const db=store('MongoDB','Users • properties\nrequests • notifications',948,220,220,100);
  const files=store('Upload storage','Listing photo files',948,372,220,88);
  const events=store('Contact workflow','Request → decision → alert',948,500,220,88);
  arrow(s,cust,client,C.teal,'search / request',214,257,92);
  arrow(s,own,client,C.coral,'listing / response',214,462,92);
  arrow(s,client,api,C.teal,'HTTPS JSON + JWT',500,342,112);
  arrow(s,api,db,C.blue,'read / write',836,248,102);
  // Photo path: dashed path is represented with a direct, labeled flow line.
  arrow(s,api,files,C.coral);
  txt(s,'validated photos',840,366,105,21,13,C.coral,true,{align:'center'});
  // Contact request/event branch, with response notification returning through API.
  arrow(s,api,events,C.coral);
  txt(s,'request + decision',838,503,108,21,13,C.coral,true,{align:'center'});
  txt(s,'Public listing responses hide exact addresses. On acceptance, the requester receives the poster’s email and address.',92,601,1088,35,17,C.muted,false,{align:'center'});
  notes(s,['backend/src/server.js','backend/src/routes/properties.js','backend/src/routes/contactRequests.js','backend/src/routes/notifications.js','backend/src/models/Property.js','backend/src/models/ContactRequest.js','backend/src/models/Notification.js']);
}

// 8 — User impact
{
  const s=base('What the implemented flows are designed to improve','Impact on user',8);
  txt(s,'CUSTOMERS',94,194,240,25,15,C.teal,true);
  bulletRow(s,'→','Less fragmented discovery','Search and filters bring multiple listing types into one browsing flow.',94,244,510,C.teal);
  bulletRow(s,'→','A clearer contact path','A request on a listing gives the owner a way to respond before details are shared.',94,408,510,C.teal);
  txt(s,'PROPERTY OWNERS',676,194,300,25,15,C.coral,true);
  bulletRow(s,'→','More control over listings','Owners can publish, edit and remove properties they own.',676,244,510,C.coral);
  bulletRow(s,'→','Manage incoming interest','Notifications connect a request to an accept or decline decision.',676,408,510,C.coral);
  txt(s,'Expected product benefits; this project includes no measured user outcomes.',94,592,1090,26,15,C.muted,false);
  notes(s,['Impact statements are expected outcomes inferred from frontend/src/main.jsx and backend/src/routes/properties.js, contactRequests.js, and notifications.js']);
}

// 9 — Future scope
{
  const s=base('Possible next steps for RentBridge','Future scope',9);
  txt(s,'CURRENT LIMITS',94,194,250,25,15,C.coral,true);
  txt(s,'Local photo storage • newest 100 listings • process-local rate limiting • no ratings or identity verification',94,230,1090,54,21,C.ink,false,{valign:'top'});
  line(s,94,308,1184,308,C.line,2);
  txt(s,'POSSIBLE EXTENSIONS',94,338,350,25,15,C.teal,true);
  bulletRow(s,'01','Reliable media hosting','Move listing photos to persistent or managed object storage.',94,388,520,C.teal);
  bulletRow(s,'02','Scale discovery','Add pagination, richer filters and location-based search.',660,388,520,C.teal);
  bulletRow(s,'03','Trust and safety','Explore verified profiles, reviews and stronger abuse controls.',94,516,520,C.coral);
  bulletRow(s,'04','Complete the rental journey','Consider viewing schedules, applications and payment integrations.',660,516,520,C.coral);
  notes(s,['README.md','backend/src/routes/properties.js','backend/src/middleware/rateLimit.js']);
}

// 10 — References
{
  const s=base('References','References',10);
  const refs=[
    ['PROJECT SOURCE','RentBridge README and source: frontend/src/main.jsx; backend/src/server.js; routes, models and middleware.'],
    ['REACT','React Quick Start — react.dev/learn'],
    ['EXPRESS','Express middleware guide — expressjs.com/en/guide/using-middleware/'],
    ['MONGODB','MongoDB data modeling — mongodb.com/docs/manual/data-modeling/'],
    ['MONGOOSE','Mongoose 8 models — mongoosejs.com/docs/8.x/models.html'],
    ['VITE','Vite guide — vite.dev/guide/']
  ];
  refs.forEach((r,i)=>{
    const y=190+i*69;
    txt(s,r[0],94,y,190,25,14,i===0?C.coral:C.teal,true);
    txt(s,r[1],286,y-3,850,38,19,C.ink,false);
    if(i<refs.length-1) line(s,94,y+49,1186,y+49,C.line,1);
  });
  notes(s,[
    'RentBridge repository README.md and source files',
    'https://react.dev/learn',
    'https://expressjs.com/en/guide/using-middleware/',
    'https://www.mongodb.com/docs/manual/data-modeling/',
    'https://mongoosejs.com/docs/8.x/models.html',
    'https://vite.dev/guide/'
  ],'Technical summaries describe the implementation in the repository as inspected for this presentation.');
}

await fs.mkdir(BUILD,{recursive:true});
await fs.mkdir(OUT,{recursive:true});
const staging=path.join(BUILD,'finalizer');
await fs.mkdir(staging,{recursive:true});
const candidate=path.join(staging,'candidate.pptx');
const blob=await PresentationFile.exportPptx(deck);
await blob.save(candidate);
// Render every authored slide for visual review and save a montage for the final pass.
for (const [i,slide] of deck.slides.items.entries()) {
  const png=await deck.export({slide,format:'png',scale:1});
  await fs.writeFile(path.join(BUILD,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
const montage=await deck.export({format:'png',montage:true});
await fs.writeFile(path.join(BUILD,'montage.png'),new Uint8Array(await montage.arrayBuffer()));
const result=await finalizePresentation({
  workspaceDir:ROOT,candidatePath:candidate,finalPath:FINAL,
  pythonExecutable:'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe',
  integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
  requiredNativeTableOwnerSlides:[],
  fontPolicy:{basis:'design',families:[FONT]},
  verifyArtifactToolImport:true,
  receiptPath:path.join(staging,'validation-final.json')
});
console.log(JSON.stringify({font:FONT,slides:deck.slides.items.length,final:FINAL,validation:result},null,2));
