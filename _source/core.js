(function(){
"use strict";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ============================================================
   LEFT RAIL
   ============================================================ */
(function rail(){
  const scale = $("#railscale"); if(!scale) return;
  const fill = $("#railfill"), pctEl = $("#railpct");
  const secs = $$("[data-sec]");
  let marks = [];

  function build(){
    scale.querySelectorAll(".tick,.mk").forEach(n=>n.remove());
    const h = scale.clientHeight, n = Math.floor(h/9);
    for(let i=0;i<=n;i++){
      const t=document.createElement("i");
      t.className="tick"+(i%5===0?" maj":"");
      t.style.top=(i/n*100)+"%"; scale.appendChild(t);
    }
    const doc = document.documentElement.scrollHeight - innerHeight;
    marks = secs.map(s=>{
      const p = doc>0 ? Math.min(1,Math.max(0,(s.offsetTop-80)/doc)) : 0;
      const a=document.createElement("a");
      a.className="mk"; a.href="#"+(s.id||"top"); a.style.top=(p*100)+"%";
      a.innerHTML='<i></i><b>'+(s.dataset.secname||"")+'</b>';
      scale.appendChild(a); return {el:a};
    });
  }
  function onScroll(){
    const doc = document.documentElement.scrollHeight - innerHeight;
    const p = doc>0 ? Math.min(1, scrollY/doc) : 0;
    fill.style.height=(p*100)+"%";
    pctEl.textContent=String(Math.round(p*100)).padStart(2,"0")+"%";
    let active=0;
    secs.forEach((s,i)=>{ if(s.getBoundingClientRect().top < innerHeight*0.4) active=i; });
    marks.forEach((m,i)=>{
      m.el.classList.toggle("on", i===active);
      m.el.classList.toggle("past", i<active);
    });
  }
  function clock(){
    const el=$("#railtime"); if(!el) return;
    el.textContent = new Date().toLocaleTimeString("en-CA",
      {timeZone:"America/Edmonton",hour:"2-digit",minute:"2-digit",hour12:false});
  }
  if(matchMedia("(min-width:1100px)").matches){
    build(); onScroll(); clock(); setInterval(clock,20000);
    addEventListener("scroll",onScroll,{passive:true});
    addEventListener("resize",()=>{build();onScroll();});
  }
})();

/* ============================================================
   SCROLL ANIMATIONS
   ============================================================ */
(function anims(){
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  },{threshold:.18, rootMargin:"0px 0px -8% 0px"});
  $$("[data-anim]").forEach(el=>io.observe(el));

  const cio = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target, to=+el.dataset.to; cio.unobserve(el);
      if(reduce){ el.textContent=to; return; }
      const t0=performance.now();
      (function step(t){
        const k=Math.min(1,(t-t0)/780);
        el.textContent=Math.round(to*(1-Math.pow(1-k,3)));
        if(k<1) requestAnimationFrame(step);
      })(t0);
    });
  },{threshold:.6});
  $$(".count").forEach(el=>cio.observe(el));

  const bio = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("lit"); bio.unobserve(e.target); } });
  },{threshold:.5});
  $$(".bar").forEach(el=>bio.observe(el));
})();

/* ============================================================
   LANE FILTER
   ============================================================ */
$$(".lanes button").forEach(b=>{
  b.addEventListener("click",()=>{
    $$(".lanes button").forEach(o=>o.setAttribute("aria-pressed",o===b));
    document.body.dataset.filter=b.dataset.lane;
  });
});

/* ============================================================
   SKILLS EXPLORER  (only runs if #skwell exists)
   ============================================================ */
const SKILLS=[
 {n:"Python",g:"sw",lvl:11,yrs:"3 yrs",where:"Aperis · Reflct · Cadence · coursework",note:"Primary language. Backends, data work, and every ML experiment I've run."},
 {n:"FastAPI",g:"sw",lvl:10,yrs:"2 yrs",where:"Aperis · Reflct · Cadence",note:"Every backend I've shipped. Auth, background workers, and the Cadence scheduler."},
 {n:"React",g:"sw",lvl:9,yrs:"2 yrs",where:"Aperis · Cadence · Reflct",note:"All three product frontends. Hooks, state, and a lot of form handling."},
 {n:"TypeScript",g:"sw",lvl:8,yrs:"2 yrs",where:"Aperis · Cadence",note:"Typed the Aperis frontend after the untyped version got painful to change."},
 {n:"Firestore",g:"sw",lvl:8,yrs:"2 yrs",where:"Aperis · Reflct",note:"Data modelling, security rules, and the nested-query problems that come with them."},
 {n:"Git",g:"sw",lvl:9,yrs:"3 yrs",where:"everything",note:"Branching, rebasing, and cleaning up after myself."},
 {n:"SQL",g:"sw",lvl:5,yrs:"1 yr",where:"coursework",note:"Joins and schema design. Actively getting better — it's the highest-signal thing I'd skipped."},
 {n:"Docker",g:"sw",lvl:5,yrs:"1 yr",where:"Cadence",note:"Containerised the Cadence backend for deployment."},
 {n:"C",g:"sw",lvl:6,yrs:"2 yrs",where:"coursework",note:"Embedded and systems coursework. Where I learned what memory actually is."},
 {n:"PyTorch",g:"ai",lvl:7,yrs:"2 yrs",where:"experiments · coursework",note:"Training loops, custom losses, and reading other people's model code."},
 {n:"NumPy / Pandas",g:"ai",lvl:9,yrs:"3 yrs",where:"experiments · coursework",note:"The default tools for any data question I have."},
 {n:"Anthropic API",g:"ai",lvl:9,yrs:"1 yr",where:"Reflct",note:"Built Reflct's contextual memory layer — prompt design, context windows, streaming."},
 {n:"scikit-learn",g:"ai",lvl:7,yrs:"2 yrs",where:"coursework · Aperis scoring",note:"Where the Aperis compatibility model started before it got custom."},
 {n:"Embeddings",g:"ai",lvl:6,yrs:"1 yr",where:"reading · Reflct",note:"Vector search, similarity, and why contrastive models leave a gap between modalities."},
 {n:"RL (SB3)",g:"ai",lvl:5,yrs:"1 yr",where:"side experiments",note:"MaskablePPO and Gymnasium. Enough to build an environment and train an agent."},
 {n:"Short-form video",g:"co",lvl:9,yrs:"2 yrs",where:"Aperis Instagram",note:"Wrote, shot, and edited the Aperis reels. Learned more about hooks than I expected to."},
 {n:"Copywriting",g:"co",lvl:8,yrs:"2 yrs",where:"Aperis · Velarox",note:"Product copy, landing pages, and the content that actually gets watched."},
 {n:"Content strategy",g:"co",lvl:7,yrs:"1 yr",where:"Aperis",note:"Three post types, four times a week, tracked against what converts."},
 {n:"Figma",g:"de",lvl:7,yrs:"2 yrs",where:"Aperis · Cadence",note:"Designed both product UIs before building them."},
 {n:"UI systems",g:"de",lvl:7,yrs:"2 yrs",where:"Aperis · Cadence",note:"Tokens, components, and keeping three products visually coherent."},
 {n:"Typography",g:"de",lvl:5,yrs:"1 yr",where:"Velarox brand",note:"Enough to make deliberate choices instead of defaults."}
];
(function skills(){
  const well=$("#skwell"); if(!well) return;
  const count=$("#skcount"), search=$("#sksearch");
  let group="all", query="";
  const word=l=>l>=9?"strong":l>=6?"working":"learning";

  function render(relight){
    const q=query.trim().toLowerCase();
    const list=SKILLS.filter(s=>group==="all"||s.g===group)
      .filter(s=>!q||s.n.toLowerCase().includes(q)||s.where.toLowerCase().includes(q))
      .sort((a,b)=>b.lvl-a.lvl);
    if(!list.length){
      well.innerHTML='<div class="empty">No skill matches <b>'+(query||"that")+'</b>.<br>Try: python, react, figma</div>';
      count.textContent="0 skills"; return;
    }
    well.innerHTML=list.map((s,ri)=>{
      const segs=Array.from({length:12},(_,i)=>
        '<i class="seg'+(i<s.lvl?" on":"")+'" style="--s:'+(ri*1.4+i)+'"></i>').join("");
      return '<div class="srow" data-g="'+s.g+'" tabindex="0" role="button" aria-expanded="false">'+
        '<div class="srow-h"><span class="sname">'+s.n+'</span><span class="meter">'+segs+'</span>'+
        '<span class="slevel">'+word(s.lvl)+'</span><span class="syrs">'+s.yrs+'</span></div>'+
        '<div class="swhere">'+s.where+'</div>'+
        '<div class="sdetail"><div class="sdetail-in">'+s.note+'</div></div></div>';
    }).join("");
    count.textContent=list.length+(list.length===1?" skill":" skills")+" · sorted by depth";
    if(relight!==false && well.classList.contains("lit")){
      well.classList.remove("lit");
      requestAnimationFrame(()=>requestAnimationFrame(()=>well.classList.add("lit")));
    }
    well.querySelectorAll(".srow").forEach(r=>{
      const t=()=>{const o=r.classList.contains("open");
        well.querySelectorAll(".srow.open").forEach(x=>{x.classList.remove("open");x.setAttribute("aria-expanded","false")});
        if(!o){r.classList.add("open");r.setAttribute("aria-expanded","true")}};
      r.addEventListener("click",t);
      r.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();t()}});
    });
  }
  function syncPills(){
    const q=query.trim().toLowerCase();
    $$("#skpills button").forEach(b=>{
      const g=b.dataset.g;
      b.disabled=!(g==="all"||SKILLS.some(s=>s.g===g&&(!q||s.n.toLowerCase().includes(q)||s.where.toLowerCase().includes(q))));
    });
  }
  $$("#skpills button").forEach(b=>{
    b.addEventListener("click",()=>{
      $$("#skpills button").forEach(o=>o.setAttribute("aria-pressed",o===b));
      group=b.dataset.g; render();
    });
  });
  search.addEventListener("input",e=>{query=e.target.value;syncPills();render()});
  render(false);
  const lite=new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ well.classList.add("lit"); lite.disconnect(); } });
  },{threshold:.25});
  lite.observe(well);
})();

/* ============================================================
   PHOTO LIGHTBOX
   ============================================================ */
(function lightbox(){
  const lb=$("#lb"); if(!lb) return;
  const cap=$("#lbcap"), meta=$("#lbmeta");
  const open=(t,m)=>{ cap.textContent=t; meta.textContent=m; lb.classList.add("show"); };
  const close=()=>lb.classList.remove("show");
  $$(".ph").forEach(p=>p.addEventListener("click",()=>open(p.dataset.cap||"",p.dataset.meta||"")));
  lb.addEventListener("click",e=>{ if(e.target===lb||e.target.classList.contains("lb-x")) close(); });
  addEventListener("keydown",e=>{ if(e.key==="Escape") close(); });
})();

/* ============================================================
   COPY EMAIL
   ============================================================ */
(function copy(){
  const cb=$("#copybtn"); if(!cb) return;
  cb.addEventListener("click",async()=>{
    const a=$("#mail").getAttribute("href").replace("mailto:","");
    try{await navigator.clipboard.writeText(a)}catch(e){}
    cb.textContent="Copied"; setTimeout(()=>cb.textContent="Copy",1200);
  });
})();

/* ============================================================
   COMMAND PALETTE
   ============================================================ */
(function palette(){
  const pal=$("#pal"); if(!pal) return;
  const pi=$("#palinput"), pl=$("#pallist");
  const CMDS=[
   {t:"Home",k:"page",url:"index.html"},
   {t:"Work",k:"page",url:"work.html"},
   {t:"About",k:"page",url:"about.html"},
   {t:"Library",k:"page",url:"library.html"},
   {t:"Résumé",k:"page",url:"cv.html"},
   {t:"Aperis",k:"project",url:"work-aperis.html"},
   {t:"Reflct",k:"project",url:"work.html"},
   {t:"Cadence",k:"project",url:"work.html"},
   {t:"Books",k:"library",url:"library-books.html"},
   {t:"Course summaries",k:"library",url:"library-courses.html"},
   {t:"Templates",k:"library",url:"library-templates.html"},
   {t:"GitHub",k:"link",ext:"https://github.com/NitroSkyliner"},
   {t:"LinkedIn",k:"link",ext:"https://www.linkedin.com/in/thevindu-nagasinghe-9ba2a4342"}
  ];
  let sel=0,res=CMDS;
  function draw(){
    pl.innerHTML=res.map((c,i)=>'<button data-i="'+i+'" class="'+(i===sel?"sel":"")+'">'+c.t+
      '<span class="k">'+c.k+'</span></button>').join("")||'<div class="empty">Nothing found</div>';
    pl.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>run(res[+b.dataset.i])));
  }
  function run(c){ if(!c) return; close();
    if(c.ext) window.open(c.ext,"_blank","noopener"); else location.href=c.url; }
  function open(){ pal.classList.add("show"); pi.value=""; res=CMDS; sel=0; draw(); pi.focus(); }
  function close(){ pal.classList.remove("show"); }
  $("#palbtn")?.addEventListener("click",open);
  pal.addEventListener("click",e=>{ if(e.target===pal) close(); });
  pi.addEventListener("input",()=>{
    const q=pi.value.toLowerCase();
    res=CMDS.filter(c=>c.t.toLowerCase().includes(q)); sel=0; draw();
  });
  addEventListener("keydown",e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();open();return}
    if(!pal.classList.contains("show"))return;
    if(e.key==="Escape")close();
    if(e.key==="ArrowDown"){e.preventDefault();sel=Math.min(sel+1,res.length-1);draw()}
    if(e.key==="ArrowUp"){e.preventDefault();sel=Math.max(sel-1,0);draw()}
    if(e.key==="Enter"){e.preventDefault();run(res[sel])}
  });
})();


/* ============================================================
   V2 MOTION LAYER
   ============================================================ */
(function v2(){
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = s => [...document.querySelectorAll(s)];

  /* ---- text reveal (.rv) ---- */
  const rvio = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); rvio.unobserve(e.target); } });
  },{threshold:.25, rootMargin:"0px 0px -6% 0px"});
  $$(".rv").forEach(el=>rvio.observe(el));

  /* ---- architecture diagram: draw paths on entry ---- */
  $$(".arch svg .ln").forEach(p=>{
    try{ const L=Math.ceil(p.getTotalLength()); p.style.setProperty("--len", L); }catch(e){}
  });
  const aio = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("drawn"); aio.unobserve(e.target); } });
  },{threshold:.3});
  $$(".arch").forEach(el=>aio.observe(el));

  /* ---- timeline spine ---- */
  const tio = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("drawn"); tio.unobserve(e.target); } });
  },{threshold:.15});
  $$(".tl").forEach(el=>tio.observe(el));

  /* ---- drift: light parallax on transform only ---- */
  const drifts = $$("[data-drift]");
  if(drifts.length && !reduce){
    let ticking=false;
    const run = ()=>{
      const vh=innerHeight;
      drifts.forEach(el=>{
        const r=el.getBoundingClientRect();
        if(r.bottom<-200||r.top>vh+200) return;
        const k=(r.top+r.height/2-vh/2)/vh;          // -1 .. 1
        const amt=parseFloat(el.dataset.drift)||14;
        el.style.transform="translate3d(0,"+(-k*amt).toFixed(2)+"px,0)";
      });
      ticking=false;
    };
    addEventListener("scroll",()=>{ if(!ticking){ ticking=true; requestAnimationFrame(run); } },{passive:true});
    run();
  }

  /* ---- case-study side nav ---- */
  const side=document.querySelector(".sidenav");
  if(side){
    const links=[...side.querySelectorAll("a")];
    const targets=links.map(a=>document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const sync=()=>{
      let act=0;
      targets.forEach((t,i)=>{ if(t.getBoundingClientRect().top < innerHeight*0.35) act=i; });
      links.forEach((a,i)=>a.classList.toggle("on", i===act));
    };
    addEventListener("scroll",sync,{passive:true}); sync();
  }

  /* ---- hover scramble on mono labels ---- */
  if(!reduce){
    const CH="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    $$(".scr").forEach(el=>{
      const orig=el.textContent; let raf=null, f=0;
      el.addEventListener("mouseenter",()=>{
        cancelAnimationFrame(raf); f=0;
        const step=()=>{
          f++;
          el.textContent=orig.split("").map((c,i)=>{
            if(c===" ") return " ";
            if(i < f/1.6) return orig[i];
            return CH[Math.floor(Math.random()*CH.length)];
          }).join("");
          if(f/1.6 < orig.length) raf=requestAnimationFrame(step);
          else el.textContent=orig;
        };
        raf=requestAnimationFrame(step);
      });
      el.addEventListener("mouseleave",()=>{ cancelAnimationFrame(raf); el.textContent=orig; });
    });
  }

  /* ---- marquee: duplicate content so the loop is seamless ---- */
  $$(".marq-in").forEach(m=>{ m.innerHTML += m.innerHTML; });
})();


/* ============================================================
   V3 SIGNATURE LAYER
   ============================================================ */
(function v3(){
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = s => [...document.querySelectorAll(s)];
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;

  /* ---------- [A] word-by-word scroll reveal ---------- */
  $$(".words").forEach(el=>{
    const html = el.innerHTML;
    // wrap words, preserving <em> as an accent marker
    const tmp = document.createElement("div"); tmp.innerHTML = html;
    const build = node => {
      const out=[];
      node.childNodes.forEach(n=>{
        if(n.nodeType===3){
          n.textContent.split(/(\s+)/).forEach(t=>{
            if(!t.trim()){ out.push(document.createTextNode(t)); return; }
            const w=document.createElement("w"); w.textContent=t; out.push(w);
          });
        } else {
          const acc = n.tagName==="EM";
          n.childNodes.forEach(c=>{
            (c.textContent||"").split(/(\s+)/).forEach(t=>{
              if(!t.trim()){ out.push(document.createTextNode(t)); return; }
              const w=document.createElement("w");
              w.textContent=t; if(acc) w.className="acc"; out.push(w);
            });
          });
        }
      });
      return out;
    };
    const nodes = build(tmp);
    el.innerHTML=""; nodes.forEach(n=>el.appendChild(n));
    if(reduce){ el.querySelectorAll("w").forEach(w=>w.classList.add("lit")); }
  });

  const wordEls = $$(".words");
  if(wordEls.length && !reduce){
    let t=false;
    const run=()=>{
      const vh=innerHeight;
      wordEls.forEach(el=>{
        const r=el.getBoundingClientRect();
        if(r.bottom<0||r.top>vh) return;
        // progress: 0 when element top hits 82% of viewport, 1 at 38%
        const p=(vh*0.82 - r.top)/(vh*0.44);
        const ws=el.querySelectorAll("w");
        const n=Math.round(Math.max(0,Math.min(1,p))*ws.length*1.12);
        ws.forEach((w,i)=>w.classList.toggle("lit", i<n));
      });
      t=false;
    };
    addEventListener("scroll",()=>{ if(!t){t=true;requestAnimationFrame(run);} },{passive:true});
    addEventListener("resize",run); run();
  }

  /* ---------- [B] cursor preview ---------- */
  const peekables = $$("[data-peek]");
  if(peekables.length && fine && !reduce){
    const p=document.createElement("div");
    p.id="peek"; p.innerHTML='<div class="pk"><b></b></div>';
    document.body.appendChild(p);
    const lbl=p.querySelector("b");
    let tx=0,ty=0,cx=0,cy=0,raf=null;
    const loop=()=>{ cx+=(tx-cx)*.14; cy+=(ty-cy)*.14;
      p.style.transform=`translate3d(${cx}px,${cy}px,0)`;
      raf=requestAnimationFrame(loop); };
    peekables.forEach(el=>{
      el.addEventListener("mouseenter",()=>{
        lbl.textContent=el.dataset.peek;
        p.classList.add("on"); if(!raf) loop();
      });
      el.addEventListener("mouseleave",()=>{
        p.classList.remove("on");
        setTimeout(()=>{ if(!p.classList.contains("on")){cancelAnimationFrame(raf);raf=null;} },360);
      });
    });
    addEventListener("mousemove",e=>{ tx=e.clientX+130; ty=e.clientY; },{passive:true});
  }

  /* ---------- [C] ambient cursor glow ---------- */
  if(fine && !reduce){
    const g=document.createElement("div"); g.id="glow"; document.body.appendChild(g);
    let t=false,x=0,y=0;
    addEventListener("mousemove",e=>{
      x=e.clientX; y=e.clientY;
      if(!document.body.classList.contains("glowon")) document.body.classList.add("glowon");
      if(!t){ t=true; requestAnimationFrame(()=>{
        g.style.setProperty("--mx",x+"px"); g.style.setProperty("--my",y+"px"); t=false;
      }); }
    },{passive:true});
  }

  /* ---------- [D] magnetic links ---------- */
  if(fine && !reduce){
    $$(".mag").forEach(el=>{
      el.addEventListener("mousemove",e=>{
        const r=el.getBoundingClientRect();
        const dx=(e.clientX-(r.left+r.width/2))*.24;
        const dy=(e.clientY-(r.top+r.height/2))*.34;
        el.style.transform=`translate(${dx}px,${dy}px)`;
      });
      el.addEventListener("mouseleave",()=>{ el.style.transform=""; });
    });
  }
})();

console.log("%cBuilt by hand.","color:#D91A72;font:600 15px system-ui");
})();
