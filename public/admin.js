const loginBox=document.getElementById("loginBox"),dashboard=document.getElementById("dashboard"),loginMsg=document.getElementById("loginMsg"),uploadMsg=document.getElementById("uploadMsg"),adminProjects=document.getElementById("adminProjects"),categorySelect=document.querySelector('select[name="category"]'),thumbnailField=document.getElementById("thumbnailField"),thumbnailInput=document.querySelector('input[name="thumbnail"]'),mayaFields=document.getElementById("mayaFields"),workFileField=document.getElementById("workFileField"),workFileInput=document.querySelector('input[name="file"]');
function updateFields(){
  const is3d=categorySelect.value==="3d";
  const thumbEnabled=["video","aiugc"].includes(categorySelect.value);
  mayaFields.classList.toggle("hidden",!is3d);
  workFileField.classList.toggle("hidden",is3d);
  thumbnailField.classList.toggle("hidden",!thumbEnabled);
  thumbnailInput.required=thumbEnabled;
  workFileInput.required=!is3d;
  ["image1","image2","image3","glb"].forEach(name=>{const el=document.querySelector(`[name="${name}"]`);if(el)el.required=is3d;});
  if(!thumbEnabled)thumbnailInput.value="";
  if(is3d)workFileInput.value="";
}
categorySelect.addEventListener("change",updateFields); updateFields();
async function check(){const r=await fetch("/api/me");const m=await r.json();if(m.admin)showDash()}
function showDash(){loginBox.classList.add("hidden");dashboard.classList.remove("hidden");loadAdmin()}
document.getElementById("loginForm").onsubmit=async e=>{e.preventDefault();loginMsg.textContent="";const password=document.getElementById("password").value;const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});const d=await r.json();if(r.ok)showDash();else{loginMsg.textContent=d.error;loginMsg.className="msg error"}};
document.getElementById("logout").onclick=async()=>{await fetch("/api/logout",{method:"POST"});location.reload()};
document.getElementById("uploadForm").onsubmit=async e=>{e.preventDefault();uploadMsg.textContent="Uploading...";uploadMsg.className="msg";const fd=new FormData(e.target);const r=await fetch("/api/projects",{method:"POST",body:fd});const d=await r.json();if(r.ok){uploadMsg.textContent="Published successfully.";uploadMsg.className="msg ok";e.target.reset();updateFields();loadAdmin()}else{uploadMsg.textContent=d.error||"Upload failed.";uploadMsg.className="msg error"}};
async function loadAdmin(){const items=await fetch("/api/projects").then(r=>r.json());if(!items.length){adminProjects.innerHTML='<p class="muted">No projects yet.</p>';return}adminProjects.innerHTML=items.map(p=>`<div class="admin-project"><img src="${p.thumbnail||p.file}" alt="${esc(p.title)} thumbnail"><div class="meta"><strong>${esc(p.title)}</strong><small>${p.category} · ${p.type}${p.type==="3d"?` · 3 images + GLB`:``} · ${new Date(p.createdAt).toLocaleDateString()}</small></div><button class="delete" onclick="removeProject('${p.id}')">Delete</button></div>`).join("")}
async function removeProject(id){if(!confirm("Delete this project?"))return;const r=await fetch("/api/projects/"+id,{method:"DELETE"});if(r.ok)loadAdmin()}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
check();
