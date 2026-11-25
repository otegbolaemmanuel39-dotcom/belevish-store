const $=i=>document.getElementById(i);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>"$"+Number(n).toFixed(0);
const WA="2348124958936";
const wa=t=>"https://wa.me/"+WA+"?text="+encodeURIComponent(t);
const ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg>';
const SAMPLE=[
 {id:1,name:"Silk Straight",style:"Straight",hair_length:"24 in",price:129,color:"Jet Black",hair_type:"Human hair blend",density:"180%",cap:"Lace front",lifespan:"9–12 months"},
 {id:2,name:"Golden Hour",style:"Wavy",hair_length:"20 in",price:119,color:"Honey Blonde",hair_type:"Human hair blend",density:"180%",cap:"Lace front",lifespan:"9–12 months"},
 {id:3,name:"Coil Crown",style:"Curly",hair_length:"16 in",price:99,color:"Chestnut",hair_type:"Heat-friendly synthetic",density:"150%",cap:"Adjustable",lifespan:"6–9 months"},
 {id:4,name:"The Parisian",style:"Bob",hair_length:"10 in",price:79,color:"Auburn",hair_type:"Heat-friendly synthetic",density:"150%",cap:"Adjustable",lifespan:"6–9 months"}
];
let PRODUCTS=[],filter="All",cart={};
try{cart=JSON.parse(localStorage.getItem("bha-cart")||"{}")||{};}catch(e){cart={};}
const save=()=>{try{localStorage.setItem("bha-cart",JSON.stringify(cart));}catch(e){}};
const find=i=>PRODUCTS.find(p=>p.id==i);
const pic=p=>p.image_url?`<img class="pimg" src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy">`:`<div class="ph">${ICON}<span>Photo</span></div>`;

/* Data: live from Supabase when configured, sample data otherwise */
async function load(){
  if(sb){
    const {data,error}=await sb.from("products").select("*").eq("active",true).order("created_at",{ascending:false});
    if(!error&&data){PRODUCTS=data;return;}
  }
  PRODUCTS=SAMPLE;
}

/* Theme and menu */
const root=document.documentElement;
function setTheme(t){root.dataset.theme=t;try{localStorage.setItem("theme",t);}catch(e){}$("themeBtn").textContent=t==="dark"?"☀":"◐";}
$("themeBtn").onclick=()=>setTheme(root.dataset.theme==="dark"?"light":"dark");
setTheme(root.dataset.theme||"light");
const nav=document.querySelector("nav");
$("menuBtn").onclick=()=>nav.classList.toggle("open");
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));

/* Shop */
function renderFilters(){
  const styles=["All",...new Set(PRODUCTS.map(p=>p.style))];
  $("filters").innerHTML="";
  styles.forEach(s=>{const b=document.createElement("button");b.className="chip";b.textContent=s;b.setAttribute("aria-pressed",s===filter);b.onclick=()=>{filter=s;renderFilters();view();};$("filters").appendChild(b);});
}
function view(){
  const q=$("q").value.trim().toLowerCase(),s=$("sort").value;
  const r=PRODUCTS.filter(p=>(filter==="All"||p.style===filter)&&(p.name+" "+p.style+" "+(p.color||"")).toLowerCase().includes(q));
  if(s==="lo")r.sort((a,b)=>a.price-b.price);if(s==="hi")r.sort((a,b)=>b.price-a.price);
  $("grid").innerHTML=r.length?"":'<p class="empty">No wigs found.</p>';
  r.forEach(p=>{
    const out=p.in_stock===false,el=document.createElement("article");el.className="card";
    el.innerHTML=`<div class="pic">${pic(p)}${out?'<span class="badge">Sold out</span>':""}</div><div class="info"><h3>${esc(p.name)}</h3><div class="meta">${esc([p.style,p.hair_length,p.color].filter(Boolean).join(" · "))}</div><div class="row"><span class="price">${money(p.price)}</span><button class="add"${out?" disabled":""}>Add to cart</button></div></div>`;
    el.querySelector(".pic").onclick=el.querySelector("h3").onclick=()=>openP(p.id);
    const b=el.querySelector(".add");
    b.onclick=()=>{add(p.id);b.textContent="Added";b.classList.add("done");setTimeout(()=>{b.textContent="Add to cart";b.classList.remove("done");},1200);};
    $("grid").appendChild(el);
  });
}
$("q").oninput=view;$("sort").onchange=view;

/* Product pop-up */
const pm=$("pm");
function openP(id){
  const p=find(id);if(!p)return;
  $("pmPic").innerHTML=pic(p);$("pmName").textContent=p.name;
  $("pmMeta").textContent=[p.style,p.color].filter(Boolean).join(" · ");$("pmPrice").textContent=money(p.price);
  const rows=[["Hair type",p.hair_type],["Length",p.hair_length],["Density",p.density],["Cap",p.cap],["Lasts",p.lifespan]].filter(r=>r[1]);
  $("pmSpecs").innerHTML=rows.map(r=>`<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join("");
  $("pmAdd").disabled=p.in_stock===false;
  $("pmAdd").onclick=()=>{add(p.id);pm.hidden=true;toggle(true);};
  $("pmWa").href=wa(`Hi Belevish Hair Atelier, I’d like to order the ${p.name} (${p.style}) at ${money(p.price)}.`);
  pm.hidden=false;
}
$("pmx").onclick=()=>{pm.hidden=true;};
pm.onclick=e=>{if(e.target===pm)pm.hidden=true;};

/* Cart */
const add=id=>{cart[id]=(cart[id]||0)+1;save();renderCart();};
const chg=(id,d)=>{cart[id]=(cart[id]||0)+d;if(cart[id]<=0)delete cart[id];save();renderCart();};
function renderCart(){
  const ids=Object.keys(cart).filter(find);let total=0,count=0;
  $("items").innerHTML=ids.length?"":'<div class="empty">Your cart is empty. Add a wig to get started.</div>';
  ids.forEach(i=>{
    const p=find(i);total+=p.price*cart[i];count+=cart[i];
    const r=document.createElement("div");r.className="it";
    r.innerHTML=`${pic(p)}<div class="n">${esc(p.name)}<div class="meta">${money(p.price)}</div></div><div class="qty"><button aria-label="Remove one">−</button><span>${cart[i]}</span><button aria-label="Add one">+</button></div>`;
    const [m,a]=r.querySelectorAll("button");m.onclick=()=>chg(i,-1);a.onclick=()=>chg(i,1);
    $("items").appendChild(r);
  });
  $("total").textContent=money(total);$("count").textContent=count;
  const lines=ids.map(i=>cart[i]+" x "+find(i).name).join(", ");
  $("waCart").href=wa(count?`Hi Belevish Hair Atelier, I’d like to order: ${lines}. Total ${money(total)}`:"Hi Belevish Hair Atelier, I’d like to place an order.");
}
function toggle(open){document.body.classList.toggle("open",open);$("drawer").setAttribute("aria-hidden",!open);$("msg").textContent="";}
$("openCart").onclick=()=>toggle(true);$("closeCart").onclick=()=>toggle(false);$("scrim").onclick=()=>toggle(false);

/* Checkout: saves the order for the seller */
const co=$("co"),coForm=$("coForm"),coDone=$("coDone");
$("checkout").onclick=()=>{
  if(!Object.keys(cart).filter(find).length){$("msg").textContent="Add a wig before checking out.";return;}
  $("coTotal").textContent=$("total").textContent;$("coErr").textContent="";
  coForm.hidden=false;coDone.hidden=true;co.hidden=false;
};
$("coBack").onclick=()=>{co.hidden=true;};
$("coClose").onclick=()=>{co.hidden=true;toggle(false);};
coForm.onsubmit=async e=>{
  e.preventDefault();
  const f=Object.fromEntries(new FormData(coForm));
  const items=Object.keys(cart).filter(find).map(i=>({id:find(i).id,name:find(i).name,qty:cart[i],price:find(i).price}));
  const total=items.reduce((s,i)=>s+i.qty*i.price,0);
  if(sb){
    const {error}=await sb.from("orders").insert({customer_name:f.name,email:f.email,address:f.addr,city:f.city,postcode:f.zip,items,total});
    if(error){$("coErr").textContent="Could not place the order. Please try again or use WhatsApp.";return;}
  }
  $("coMsg").textContent="Thanks, "+f.name.split(" ")[0]+". We received your order and will confirm it with you shortly.";
  cart={};save();renderCart();coForm.reset();coForm.hidden=true;coDone.hidden=false;
};

/* Quiz */
const looks={natural:"Straight",flowy:"Wavy",bold:"Curly",short:"Bob"};
$("qgo").onclick=()=>{
  const r=PRODUCTS.filter(p=>p.style===looks[$("qlook").value]&&p.price<=+$("qbud").value);
  $("qres").innerHTML=r.length?r.map(p=>`<button class="chip" data-id="${p.id}">${esc(p.name)} · ${money(p.price)}</button>`).join(""):"No match in that budget yet. Try a higher budget.";
  $("qres").querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>openP(b.dataset.id));
};

/* Booking: saves the request for the seller, then offers WhatsApp */
const bkm=$("bkm"),bkForm=$("bkForm"),bkDone=$("bkDone");
function openBk(e){if(e)e.preventDefault();bkForm.hidden=false;bkDone.hidden=true;$("bkDate").min=new Date().toISOString().slice(0,10);bkm.hidden=false;}
["navBook","heroBook","svcBook"].forEach(i=>$(i).onclick=openBk);
$("bkx").onclick=()=>{bkm.hidden=true;};
bkm.onclick=e=>{if(e.target===bkm)bkm.hidden=true;};
bkForm.onsubmit=async e=>{
  e.preventDefault();
  const f=Object.fromEntries(new FormData(bkForm));
  if(sb)await sb.from("bookings").insert({name:f.name,phone:f.phone,service:f.service,booking_date:f.date,booking_time:f.time,notes:f.notes||null});
  $("bkWa").href=wa(`Hi Belevish Hair Atelier, I’d like to book: ${f.service} on ${f.date} at ${f.time}. Name: ${f.name}. Phone: ${f.phone}.`+(f.notes?" Notes: "+f.notes:""));
  $("bkMsg").textContent="Thanks, "+f.name.split(" ")[0]+". Tap the button to send your request on WhatsApp. Your slot is confirmed once we reply.";
  bkForm.reset();bkForm.hidden=true;bkDone.hidden=false;
};

/* Newsletter, WhatsApp, keys */
$("nl").onsubmit=async e=>{e.preventDefault();const em=e.target.querySelector("input").value;if(sb)await sb.from("subscribers").insert({email:em});$("nlMsg").textContent="Thanks for signing up.";e.target.reset();};
$("waFab").href=wa("Hi Belevish Hair Atelier, I have a question about your wigs.");$("waContact").href=$("waFab").href;
document.addEventListener("keydown",e=>{if(e.key==="Escape"){pm.hidden=true;bkm.hidden=true;toggle(false);}});

(async()=>{await load();renderFilters();view();renderCart();})();
