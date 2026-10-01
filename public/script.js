const categories=[
  {key:"3d",title:"3D / Maya",desc:"3D models, renders and Maya projects.",icon:"01"},
  {key:"video",title:"Video Editing",desc:"Reels, motion graphics and cinematic edits.",icon:"02"},
  {key:"graphic",title:"Graphic Design",desc:"Posters, social media designs and branding.",icon:"03"},
  {key:"aiugc",title:"AI UGC Ads",desc:"AI-powered UGC ads, product promos and social media ad creatives.",icon:"04"},
  {key:"logo",title:"Logo Design",desc:"Custom logos, brand marks and visual identity concepts.",icon:"05"},
  {key:"art",title:"Art",desc:"Digital art, illustrations and creative artwork.",icon:"06"},
  {key:"uiux",title:"UI/UX & Website",desc:"Website designs, UI/UX concepts and interface projects.",icon:"07"}
];
const categoryGrid=document.getElementById("categoryGrid"), projectView=document.getElementById("projectView"), projectGrid=document.getElementById("projectGrid"), projectTitle=document.getElementById("projectTitle");
let projects=[];

async function load(){
  try{
    const r=await fetch("/api/projects");
    projects=await r.json();
    if(!Array.isArray(projects)) projects=[];
    renderCategories();
  }catch(e){console.error(e); categoryGrid.innerHTML='<p class="muted">Projects could not be loaded. Please refresh the page.</p>';}
}
function projectCover(p){return p.thumbnail || (p.gallery&&p.gallery[0]) || p.file || "";}
function renderCategories(){
  categoryGrid.innerHTML=categories.map(c=>{
    const firstWork=projects.find(p=>p.category===c.key);
    const image=firstWork ? projectCover(firstWork) : "";
    return `<article class="category ${image ? "has-category-image" : ""}" data-category="${c.key}" tabindex="0" role="button" style="${image ? `--category-image:url("${image}")` : ""}">
      ${image ? `<img class="category-image" src="${image}" alt="${esc(firstWork.title)}">` : ""}
      <div class="category-overlay"></div>
      <div class="category-content"><div class="category-number">${c.icon}</div><h3>${c.title}</h3><p>${c.desc}</p></div>
    </article>`;
  }).join("");
  categoryGrid.querySelectorAll(".category").forEach(card=>{
    card.addEventListener("click",()=>openCategory(card.dataset.category));
    card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openCategory(card.dataset.category)}});
  });
}
function openCategory(key){
  const c=categories.find(x=>x.key===key); if(!c)return;
  categoryGrid.classList.add("hidden");
  projectView.classList.remove("hidden");
  projectTitle.textContent=c.title;
  const items=projects.filter(p=>p.category===key);
  projectGrid.innerHTML=items.length?items.map(p=>`<article class="project" data-id="${p.id}" tabindex="0" role="button"><div class="project-thumb-wrap"><img class="project-media" src="${projectCover(p)}" alt="${esc(p.title)} thumbnail">${p.type==="video"?`<span class="play-badge">▶</span>`:p.type==="3d"?`<span class="model-badge">360° 3D</span>`:""}</div><div class="project-info"><h4>${esc(p.title)}</h4><p>${esc(p.description||"")}</p></div></article>`).join(""):`<div style="grid-column:1/-1;padding:50px 0;color:#777">No projects uploaded in this category yet.</div>`;
  projectGrid.querySelectorAll(".project").forEach(card=>{
    card.addEventListener("click",()=>previewProject(card.dataset.id));
    card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();previewProject(card.dataset.id)}});
  });
  projectView.scrollIntoView({behavior:"smooth",block:"start"});
}
function previewProject(id){
  const p=projects.find(x=>x.id===id); if(!p)return;
  const lb=document.getElementById("lightbox"),img=document.getElementById("lightboxImg"),vid=document.getElementById("lightboxVideo"),gallery=document.getElementById("projectGallery"),viewer=document.getElementById("modelViewer"),viewerWrap=document.getElementById("modelViewerWrap"),counter=document.getElementById("galleryCounter");
  img.src="";vid.src="";gallery.innerHTML="";viewer.removeAttribute("src");viewerWrap.classList.add("hidden");
  document.getElementById("lightboxTitle").textContent=p.title;
  document.getElementById("lightboxDescription").textContent=p.description||"";
  if(p.type==="3d"){
    const images=p.gallery||[];
    images.forEach((src,i)=>{const image=document.createElement("img");image.src=src;image.alt=`${p.title} view ${i+1}`;image.loading="lazy";gallery.appendChild(image);});
    counter.textContent=`${images.length} images · Interactive 360° GLB model`;
    if(p.model){viewer.setAttribute("src",p.model);viewerWrap.classList.remove("hidden");}
    lb.classList.remove("hidden","show-img","show-video");lb.classList.add("show-3d");
  }else if(p.type==="video"){
    counter.textContent="";vid.src=p.file;lb.classList.remove("hidden","show-img","show-3d");lb.classList.add("show-video");vid.load();
  }else{
    counter.textContent="";img.src=p.file;lb.classList.remove("hidden","show-video","show-3d");lb.classList.add("show-img");
  }
}
document.getElementById("backBtn").onclick=()=>{projectView.classList.add("hidden");categoryGrid.classList.remove("hidden");document.getElementById("portfolio").scrollIntoView({behavior:"smooth",block:"start"});};
document.getElementById("closeLightbox").onclick=()=>document.getElementById("lightbox").classList.add("hidden");
document.getElementById("lightbox").onclick=e=>{if(e.target.id==="lightbox")e.currentTarget.classList.add("hidden")};
document.getElementById("year").textContent=new Date().getFullYear();
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
document.querySelector(".menu").onclick=()=>{const n=document.querySelector("nav");n.style.display=n.style.display==="flex"?"none":"flex";if(n.style.display==="flex"){n.style.position="absolute";n.style.top="76px";n.style.left="0";n.style.right="0";n.style.background="#090909";n.style.padding="20px 7%";n.style.flexDirection="column"}};
load();


// Premium scroll-reveal animations
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("reveal");
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:.12});

function observeAnimations(){
  document.querySelectorAll(".section,.category,.project,.tool-card").forEach(el=>{
    if(!el.classList.contains("reveal")) revealObserver.observe(el);
  });
}

observeAnimations();

const portfolioMutationObserver = new MutationObserver(()=>observeAnimations());
portfolioMutationObserver.observe(document.getElementById("categoryGrid"),{childList:true,subtree:true});
portfolioMutationObserver.observe(document.getElementById("projectGrid"),{childList:true,subtree:true});

const cursorGlow=document.getElementById("cursorGlow");
window.addEventListener("pointermove",(e)=>{
  cursorGlow.style.left=e.clientX+"px";
  cursorGlow.style.top=e.clientY+"px";
});
