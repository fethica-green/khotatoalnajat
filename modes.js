'use strict';
/* Mini-games: one per episode. Uses the globals of index.html (c, G, VW, VH, GY, fig, sfx...). */
const MG={};
function mgHurt(){const h=G.hero;if(h.inv>0)return false;h.hp--;h.inv=1.3;G.shake=.35;sfx.hurt();if(h.hp<=0){gameOver('bite');return true;}return false;}
function mgTick(dt){const h=G.hero;h.inv-=dt;G.shake-=dt;
  if(G.state==='dawn'){G.dawnT-=dt;if(G.dawnT<=0)endDay();return false;}
  G.t+=dt;return true;}
function mgDawn(){G.state='dawn';G.dawnT=2.2;toast(t('dawnG'),2000);sfx.dawn();if(G.day===1||G.day%5===0)vo(6);}
function mgP(){return{p:(G.day-1)/29,df:DIFF[G.diff]};}
function mgBonus(n,every){if(n%every===0&&G.hero.hp<G.hero.maxHp){G.hero.hp++;toast('❤️ +1',1200);}}
function mgCount(txt){c.font='900 22px Cairo,sans-serif';c.textAlign='left';c.textBaseline='middle';c.lineWidth=5;c.strokeStyle='#111';c.strokeText(txt,14,118);c.fillStyle='#fff';c.fillText(txt,14,118);}
function heroBack(x,y,s,ph,hide){if(hide)return;c.save();c.translate(x,y);c.scale(s,s);ink(5);const sw=Math.sin(ph)*10;
  ln(-6,-36,-8,-Math.max(0,sw));ln(6,-36,8,-Math.max(0,-sw));ln(-11,-62,-20,-40+sw*.6);ln(11,-62,20,-40-sw*.6);
  rr(-12,-67,24,34,6,'#2f6fd6');ln(-6,-67,-6,-50);ln(6,-67,6,-50);circ(0,-86,16,'#fff');
  c.lineWidth=4;c.beginPath();c.arc(0,-86,17,Math.PI*.95,Math.PI*2.05);c.closePath();c.fillStyle='#2e9e4f';c.fill();c.stroke();circ(0,-107,6,'#ff7a1a');
  c.lineWidth=8;c.strokeStyle='#111';ln(-10,-70,10,-70);c.lineWidth=5;c.strokeStyle='#ff7a1a';ln(-10,-70,10,-70);ln(8,-68,14,-54+sw*.3);c.restore();}

/* ===== Ep3 parking: run and jump ===== */
MG.runner={
  start(){G.R={dist:0,y:0,vy:0,j:0,obs:[],its:[],next:520,got:0,ph:0};},
  jump(){const R=G.R;if(R.j<2){R.vy=R.j?-700:-780;R.j++;sfx.throw_();}},
  update(dt){const R=G.R;if(!mgTick(dt)){R.dist+=140*dt;R.ph+=dt*10;return;}
    const {p,df}=mgP(),v=(250+170*p)*df.zs,hx=VW*.26;
    if(inp.shoveP){inp.shoveP=false;this.jump();}
    R.dist+=v*dt;R.ph+=dt*16;R.vy+=2100*dt;R.y+=R.vy*dt;if(R.y>=0){R.y=0;R.vy=0;R.j=0;}
    if(R.dist>R.next){const x=R.dist+VW+80,r=Math.random();
      if(r<.45)R.obs.push({x,w:30,h:96,k:'z',ph:rnd(0,6)});
      else if(r<.6+.1*p){R.obs.push({x,w:30,h:96,k:'z',ph:0});R.obs.push({x:x+50,w:30,h:96,k:'z',ph:2});}
      else if(r<.86||G.day<6)R.obs.push({x,w:54,h:44,k:'bar'});
      else R.obs.push({x,w:150,h:62,k:'car'});
      if(Math.random()<.75)R.its.push({x:x+rnd(130,230),h:Math.random()<.5?20:120});
      R.next=R.dist+(rnd(400,660)*(1-.28*p)+v*.3)*Math.sqrt(df.sp);}
    const hh=-R.y;
    for(const o of R.obs){if(o.k==='z')o.x-=45*dt;const sx=o.x-R.dist;
      if(!o.hit&&Math.abs(sx-hx)<o.w/2+13&&hh<o.h-12){o.hit=1;if(mgHurt())return;}}
    for(const it of R.its){const sx=it.x-R.dist;if(!it.got&&Math.abs(sx-hx)<30&&it.h+12>hh-12&&it.h+12<hh+118){it.got=1;R.got++;sfx.pick();mgBonus(R.got,12);}}
    R.obs=R.obs.filter(o=>o.x-R.dist>-220);R.its=R.its.filter(i=>!i.got&&i.x-R.dist>-60);
    G.prog=G.t/LEN;if(G.t>=LEN)mgDawn();},
  draw(tt,th){const R=G.R,hx=VW*.26,d=R.dist;
    c.fillStyle=th.wallc;c.fillRect(0,0,VW,GY);c.fillStyle='#0c0f18';c.fillRect(0,0,VW,GY-262);c.fillStyle=th.ceil;c.fillRect(0,GY-282,VW,20);
    c.fillStyle=th.ground;c.fillRect(0,GY,VW,VH-GY);
    c.fillStyle='rgba(255,210,60,.5)';for(let x=-(d%150);x<VW;x+=150)c.fillRect(x,GY+10,8,80);
    c.globalAlpha=.4;for(let x=-((d*.5)%560)-120;x<VW+200;x+=560)car(x+200,'#59636a');c.globalAlpha=1;
    for(let x=-(d%330);x<VW+120;x+=330){cone(x+60,GY-256,120,256,.16);ink(5);rr(x+20,GY-262,80,8,3,'#dff2ff');}
    for(let x=-(d%420)-20;x<VW+60;x+=420){ink(5);rr(x-17,GY-262,34,262,2,'#6a7479');for(let i=0;i<3;i++){c.fillStyle=i%2?'#111':'#ffd23a';c.fillRect(x-15,GY-60+i*20,30,20);}}
    c.save();if(G.shake>0)c.translate(rnd(-5,5),rnd(-4,4));
    for(const it of R.its){const sx=it.x-d,y=GY-it.h-30+Math.sin(tt*5+it.x)*3;ink(4);rr(sx-8,y,16,28,5,'#59d0ff');rr(sx-4,y-7,8,8,2,'#fff');}
    for(const o of R.obs){const sx=o.x-d;
      if(o.k==='z')fig(sx,GY,{dir:-1,ph:tt*6+o.ph,moving:true,pose:'z',head:'#c9d6b5',shirt:'#6b7a8f',lean:.14});
      else if(o.k==='bar'){ink(5);rr(sx-27,GY-44,54,18,4,'#ffd23a');c.fillStyle='#111';for(let i=0;i<3;i++)c.fillRect(sx-22+i*18,GY-44,8,18);ln(sx-20,GY-26,sx-20,GY);ln(sx+20,GY-26,sx+20,GY);}
      else car(sx,'#b3594d');}
    fig(14,GY,{dir:1,ph:tt*9,moving:true,pose:'z',head:'#c9d6b5',shirt:'#8a6f9e',lean:.2});fig(-12,GY,{dir:1,ph:tt*9+2,moving:true,pose:'z',head:'#c9d6b5',shirt:'#7d8a5a',lean:.2});
    if(G.hero.inv<=0||Math.sin(tt*30)>0)fig(hx,GY+R.y,{hero:true,dir:1,ph:R.ph,moving:R.y>=0,pose:R.y<0?'shove':'idle'});
    c.restore();c.fillStyle='rgba(8,10,30,.28)';c.fillRect(0,0,VW,VH);mgCount('💧 '+R.got);}
};

/* ===== Ep6 metro: three lanes ===== */
MG.lanes={
  start(){G.Ln={lane:1,lx:1,obs:[],sp:1,got:0,ph:0,off:0};},
  update(dt){const L=G.Ln;if(!mgTick(dt)){L.ph+=dt*10;return;}const {p,df}=mgP(),zs=(.6+.55*p)*df.zs;
    for(const [k,d] of [['lP',-1],['rP',1]])if(inp[k]){inp[k]=false;const n=clamp(L.lane+d,0,2);if(n!==L.lane){L.lane=n;sfx.throw_();}}
    L.lx+=(L.lane-L.lx)*Math.min(1,dt*14);L.ph+=dt*16;L.off=(L.off+zs*dt)%1;
    L.sp-=dt;if(L.sp<=0){const a=Math.random()*3|0,ks=['z','bar','z','crate'],b=(a+1+(Math.random()*2|0))%3;
      L.obs.push({lane:a,z:1,k:ks[Math.random()*4|0]});
      if(Math.random()<.16+.26*p)L.obs.push({lane:b,z:1,k:ks[Math.random()*4|0]});else if(Math.random()<.6)L.obs.push({lane:b,z:1,k:'it'});
      L.sp=(rnd(.7,1.05)/(1+.7*p))*Math.sqrt(df.sp)+.15;}
    for(const o of L.obs){o.z-=zs*dt;if(!o.done&&o.z<.06&&o.z>-.05&&o.lane===L.lane){o.done=1;
      if(o.k==='it'){L.got++;sfx.pick();mgBonus(L.got,10);}else if(mgHurt())return;}}
    L.obs=L.obs.filter(o=>o.z>-.14&&!(o.k==='it'&&o.done));
    G.prog=G.t/LEN;if(G.t>=LEN)mgDawn();},
  draw(tt,th){const L=G.Ln,hy=Math.max(170,VH*.3),by=VH-(VW<VH*.8?215:120),cx=VW/2,lw=Math.min(150,VW*.3);
    const pr=(lane,z)=>{const e=Math.pow(1-clamp(z,-.2,1),2.2),s=.16+.94*e;return{x:cx+(lane-1)*lw*s,y:hy+(by-hy)*e,s};};
    c.fillStyle='#141b2a';c.fillRect(0,0,VW,VH);
    const gl=c.createRadialGradient(cx,hy,10,cx,hy,VW*.9);gl.addColorStop(0,'#3d4f73');gl.addColorStop(1,'#141b2a');c.fillStyle=gl;c.fillRect(0,0,VW,VH);
    c.save();if(G.shake>0)c.translate(rnd(-5,5),rnd(-4,4));
    c.fillStyle=th.ground;c.beginPath();c.moveTo(cx-lw*.32,hy);c.lineTo(cx+lw*.32,hy);c.lineTo(cx+lw*2.1,VH);c.lineTo(cx-lw*2.1,VH);c.fill();
    for(let i=0;i<12;i++){const z=1-((i/12+L.off)%1),a=pr(-.7,z),b=pr(2.7,z);c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=2+7*a.s;ln(a.x,a.y,b.x,a.y);}
    for(let i=-.5;i<=2.5;i+=1){const a=pr(i,1),b=pr(i,-.2);c.strokeStyle=i===-.5||i===2.5?'#f2b632':'#8f9aa8';c.lineWidth=4;ln(a.x,a.y,b.x,b.y);}
    for(let i=0;i<6;i++){const z=1-((i/6+L.off*.5)%1);for(const sd of[-1.7,3.7]){const q=pr(sd,z);c.lineWidth=2;c.strokeStyle='#111';circ(q.x,q.y-190*q.s,8*q.s,'#ffe9a8');}}
    for(const o of L.obs.slice().sort((a,b)=>b.z-a.z)){const q=pr(o.lane,o.z);c.save();c.translate(q.x,q.y);c.scale(q.s*1.15,q.s*1.15);
      if(o.k==='z')fig(0,0,{dir:o.lane%2?1:-1,pose:'z',moving:true,ph:tt*7+o.lane,head:'#c9d6b5',shirt:'#8a6f9e',lean:.1});
      else if(o.k==='bar'){ink(5);rr(-44,-48,88,20,4,'#ffd23a');c.fillStyle='#111';for(let i=0;i<4;i++)c.fillRect(-38+i*22,-48,10,20);ln(-36,-28,-36,0);ln(36,-28,36,0);}
      else if(o.k==='crate'){ink(5);rr(-36,-66,72,66,5,'#c9a36a');ln(-36,-66,36,0);ln(36,-66,-36,0);}
      else{ink(4);rr(-11,-52,22,36,4,'#ffd23a');rr(-5,-59,10,8,2,'#999');c.fillStyle='#111';c.fillRect(-3,-42,6,16);}
      c.restore();}
    const hq=pr(L.lx,0);heroBack(hq.x,hq.y,1.15,L.ph,G.hero.inv>0&&Math.sin(tt*30)<0);
    for(const dx of[-70,0,70]){c.save();c.translate(cx+dx,VH+70+Math.sin(tt*7+dx)*5);c.scale(1.5,1.5);fig(0,0,{dir:dx<0?1:-1,pose:'z',head:'#c9d6b5',shirt:'#6b7a8f',ph:tt*6});c.restore();}
    c.restore();mgCount('🔋 '+L.got);}
};

/* ===== Ep4 ferry: catch the rain ===== */
MG.catch={
  start(){G.C={its:[],zs:[],sp:.6,zsp:6,water:0,quota:Math.round((12+G.day*.9)*[.85,1,1.15][G.diff])};G.hero.x=DOOR+120;G.hero.shCd=0;G.hero.shT=0;camX=DOOR-VW/2;},
  update(dt){const C=G.C,h=G.hero;camX=DOOR-VW/2;if(!mgTick(dt))return;const {p,df}=mgP(),Lf=camX+30,Rt=camX+VW-30;
    const mv=(inp.r?1:0)-(inp.l?1:0);h.moving=mv!==0;if(mv){h.dir=mv;h.x=clamp(h.x+mv*320*dt,Lf,Rt);h.ph+=dt*13;}
    h.shCd-=dt;h.shT-=dt;
    if(inp.shoveP){inp.shoveP=false;if(h.shCd<=0){h.shCd=.45;h.shT=.25;sfx.shove();for(const z of C.zs){const d=(z.x-h.x)*h.dir;if(!z.out&&d>-18&&d<84){z.out=1;z.dir=h.dir;z.v=430;}}}}
    C.sp-=dt;if(C.sp<=0){const r=Math.random();C.its.push({x:rnd(Lf,Rt),y:-20,vy:rnd(190,250)*(1+.7*p)*df.zs,k:r<.16+.2*p?'barrel':r<.3+.2*p?'can':'drop'});C.sp=rnd(.4,.75)/(1+.5*p);}
    const wind=Math.sin(G.time*.7)*50;
    for(const it of C.its){it.y+=it.vy*dt;it.x+=wind*dt;
      if(!it.done&&it.y>GY-150&&it.y<GY-40&&Math.abs(it.x-h.x)<(it.k==='barrel'?26:38)){it.done=1;
        if(it.k==='barrel'){if(mgHurt())return;}else{C.water+=it.k==='can'?2:1;sfx.pick();}}
      if(it.y>GY)it.done=1;}
    C.its=C.its.filter(i=>!i.done);
    if(G.day>=3){C.zsp-=dt;if(C.zsp<=0){const sd=Math.random()<.5?-1:1;C.zs.push({x:sd<0?camX-40:camX+VW+40,dir:-sd,ph:0,grab:0});C.zsp=rnd(5,9)/(1+.8*p);}}
    for(const z of C.zs){z.ph+=dt*7;if(z.out){z.x+=z.dir*z.v*dt;continue;}z.dir=Math.sign(h.x-z.x)||1;z.x+=z.dir*(55+50*p)*df.zs*dt;
      if(Math.abs(z.x-h.x)<26){z.grab+=dt;if(z.grab>df.bw){z.grab=0;z.out=1;z.v=300;z.dir=-z.dir;if(mgHurt())return;}}else z.grab=0;}
    C.zs=C.zs.filter(z=>z.x>camX-140&&z.x<camX+VW+140);
    G.prog=C.water/C.quota;if(C.water>=C.quota)mgDawn();else if(G.t>=LEN)gameOver('quota');},
  draw(tt,th){const C=G.C,h=G.hero;drawScene(th,tt,0,null);
    c.save();if(G.shake>0)c.translate(rnd(-5,5),rnd(-4,4));c.translate(-camX,0);
    c.strokeStyle='rgba(170,215,255,.35)';c.lineWidth=2;for(let i=0;i<30;i++){const x=camX+((i*61+tt*90)%VW),y=(i*97+tt*700)%GY;ln(x,y,x-6,y+22);}
    for(const it of C.its){ink(4);
      if(it.k==='drop'){c.beginPath();c.moveTo(it.x,it.y-18);c.quadraticCurveTo(it.x+15,it.y+5,it.x,it.y+11);c.quadraticCurveTo(it.x-15,it.y+5,it.x,it.y-18);c.fillStyle='#59d0ff';c.fill();c.stroke();}
      else if(it.k==='can'){rr(it.x-11,it.y-15,22,30,4,'#7fd36b');c.fillStyle='#fff';c.fillRect(it.x-9,it.y-5,18,9);}
      else{circ(it.x,it.y,21,'#8a5a2b');ln(it.x-19,it.y-8,it.x+19,it.y-8);ln(it.x-19,it.y+8,it.x+19,it.y+8);}}
    for(const z of C.zs){fig(z.x,GY,{dir:z.dir,ph:z.ph,moving:true,pose:z.out?'stun':'z',head:'#c9d6b5',shirt:'#5f8f8a',lean:z.out?-.35:.14});
      if(z.grab>0){c.fillStyle='#ff5a4a';c.font='900 30px Cairo,sans-serif';c.textAlign='center';c.fillText('!',z.x,GY-114);}}
    if(h.inv<=0||Math.sin(tt*30)>0){fig(h.x,GY,{hero:true,dir:h.dir,ph:h.ph,moving:h.moving,pose:h.shT>0?'shove':'stun'});
      ink(5);c.beginPath();c.moveTo(h.x-30,GY-150);c.lineTo(h.x+30,GY-150);c.lineTo(h.x+22,GY-122);c.lineTo(h.x-22,GY-122);c.closePath();c.fillStyle='#8fa3b3';c.fill();c.stroke();}
    c.restore();mgCount('💧 '+C.water+'/'+C.quota);}
};

/* ===== Ep5 hospital: shut the doors ===== */
MG.doors={
  start(){G.D={ds:Array.from({length:6},()=>({p:0,on:false,kid:false,T:2,slam:0})),sp:1.4,saved:0,shut:0};},
  lay(){const cols=VW>VH?3:2,rows=6/cols,top=150,cw=VW/cols,ch=(VH-30-top)/rows;return{cols,rows,top,cw,ch};},
  box(i,l){const cx=(i%l.cols+.5)*l.cw,fy=l.top+(Math.floor(i/l.cols)+1)*l.ch-l.ch*.1,w=Math.min(l.cw*.56,150),h=Math.min(l.ch*.68,w*1.7);return{cx,fy,w,h,x:cx-w/2,y:fy-h};},
  tap(x,y){const D=G.D,l=this.lay(),cx=Math.floor(x/l.cw),cy=Math.floor((y-l.top)/l.ch);if(cy<0||cy>=l.rows||cx<0||cx>=l.cols)return;
    const d=D.ds[cy*l.cols+cx];if(!d.on)return;
    if(d.kid){d.on=false;d.p=0;toast(t('kidHit'),1600);mgHurt();return;}
    d.on=false;d.p=0;d.slam=.25;D.shut++;sfx.door();},
  update(dt){const D=G.D;if(!mgTick(dt))return;const {p,df}=mgP();
    D.sp-=dt;if(D.sp<=0){const free=D.ds.filter(d=>!d.on&&d.slam<=0);
      if(free.length){const d=free[Math.random()*free.length|0];d.on=true;d.p=0;d.kid=G.day>=4&&Math.random()<.13;d.T=(2.7-1.5*p)/df.zs*(d.kid?1.2:1);}
      D.sp=rnd(.75,1.3)/(1+1.3*p)*df.sp;}
    for(const d of D.ds){d.slam-=dt;if(d.on){d.p+=dt/d.T;if(d.p>=1){d.on=false;d.p=0;
      if(d.kid){D.saved++;sfx.pick();mgBonus(D.saved,3);}else if(mgHurt())return;}}}
    G.prog=G.t/LEN;if(G.t>=LEN)mgDawn();},
  lamp(d,b,tt){const lit=d.on&&Math.sin(tt*(6+d.p*24))>0;ink(4);circ(b.cx,b.y-22,10,d.on?(d.kid?(lit?'#5dff8a':'#2e9e6f'):(lit?'#ff3b30':'#a32')):'#39424d');},
  draw(tt,th){const D=G.D,l=this.lay();c.fillStyle=th.wallc;c.fillRect(0,0,VW,VH);
    c.save();if(G.shake>0)c.translate(rnd(-5,5),rnd(-4,4));
    for(let r=0;r<l.rows;r++){const fy=l.top+(r+1)*l.ch;c.fillStyle='#7fbfb0';c.fillRect(0,fy-l.ch*.24,VW,l.ch*.14);c.fillStyle=th.ground;c.fillRect(0,fy-l.ch*.1,VW,l.ch*.1);}
    D.ds.forEach((d,i)=>{const b=this.box(i,l);ink(5);rr(b.x-7,b.y-7,b.w+14,b.h+7,4,'#5d7f93');c.fillStyle='#0b0f1a';c.fillRect(b.x,b.y,b.w,b.h);
      if(d.on){c.save();c.beginPath();c.rect(b.x,b.y,b.w,b.h);c.clip();const s=b.w/72;
        if(d.kid)fig(b.x+b.w*.66,b.fy+8,{s:s*.8,head:'#fff',shirt:'#e85d9a',kid:true,dir:-1});
        else fig(b.x+b.w*.62+(1-d.p)*b.w*.3,b.fy+6,{s,head:'#c9d6b5',shirt:'#8a6f9e',pose:'z',dir:-1,ph:tt*8,moving:true});
        c.restore();}
      const lw=b.w*(1-(d.on?d.p*.8:0));ink(5);rr(b.x,b.y,lw,b.h,2,'#9db8cf');rr(b.x+lw*.2,b.y+b.h*.12,lw*.6,b.h*.2,3,'#dff2ff');circ(b.x+lw-10,b.y+b.h*.55,3.5,'#333',false);
      this.lamp(d,b,tt);
      if(d.slam>0){c.fillStyle='rgba(255,255,255,'+Math.min(1,d.slam*3)+')';c.fillRect(b.x,b.y,b.w,b.h);}});
    if(G.haz){c.fillStyle='rgba(5,8,20,'+(.55+.3*Math.sin(tt*2.3))+')';c.fillRect(0,0,VW,VH);D.ds.forEach((d,i)=>{if(d.on)this.lamp(d,this.box(i,l),tt);});}
    c.restore();mgCount('🚪 '+D.shut);}
};
