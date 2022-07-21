const c=document.getElementById.bind(document),e=document.createElement.bind(document),aa=window.localStorage,g=c("canvas"),h=g.getContext("2d"),k=e("canvas"),l=k.getContext("2d"),m=e("canvas"),n=m.getContext("2d"),p=c("tiles");p.a=p.appendChild.bind(p);const q=["#dddddd","#aaaaaa","#333333","#fedf78"],ba=["Path","Safezone","Wall","Teleport"];let r=0,t=[];function ca(){for(let a=0;a<t.length;++a)t[a].style["text-decoration"]=a==r?"underline":"none"}let da=0,u=0,v=new Uint8Array(0),w=9,x=9;function z(){let a=new Uint8Array(w*x);for(var b=0;b<da;++b)if(!(b>=w))for(let d=0;d<u;++d)d>=x||(a[b*x+d]=v[b*u+d]);for(b=0;b<A.length;++b)if(A[b][0]>=w||A[b][1]>=x)delete C[`${A[b][0]},${A[b][1]}`],A.splice(b--,1);da=w;u=x;v=a;ea()}let fa=0,ha=0,D=0,E=.2,F=1;const G=20*x;let H=0,I=G,ia=[0,0],J=0,ja=0;var L=0,M=0,N=0,O=0;let P=[0,0],Q;var R=[],S=[];let T=0,C={},U=!0,A=[],ka=[],la=0;function na(){}function oa(){}function V(){if(T){var a=Q/x|0,b=Q%x,d=`${a},${b}`;J&&void 0==C[d]?(C[d]=[a,b],W("S",20+40*C[d][0],20+40*C[d][1],0,!1,!1),A[A.length]=C[d]):ja&&void 0!=C[d]&&(delete C[d],a=r,r=v[Q],X(),r=a,A=Object.values(C))}}function pa(){if(window.innerWidth!=fa||window.innerHeight!=ha||D!=window.devicePixelRatio)U=!0,D=window.devicePixelRatio,fa=window.innerWidth,g.width=fa*D,ha=window.innerHeight,g.height=ha*D}pa();window.onresize=pa;function Y(a,b,d){return a+(b-a)*d}g.onwheel=function(a){a=.05*-Math.sign(a.deltaY);F=1<F?F+3*a:F+a;F=Math.min(Math.max(F,.2),2)};window.onmousemove=function(a){ia=[a.clientX*D,a.clientY*D];Q=qa();-1!=Q&&(J&&!T&&v[Q]!=r&&(v[Q]=r,X()),V())};g.onmousedown=function(a){0==a.button?(J=1,-1!=Q&&(T||v[Q]==r||(v[Q]=r,X()),V())):2==a.button&&(ja=1,V())};g.onmouseup=function(a){0==a.button?J=0:2==a.button&&(ja=0)};window.onkeydown=function(a){if(!a.repeat)switch(a.keyCode){case 81:T=1;-1!=Q&&V();break;case 69:U=la=1;break;case 38:case 87:N=1;break;case 40:case 83:O=1;break;case 37:case 65:L=1;break;case 39:case 68:M=1}};window.onkeyup=function(a){if(!a.repeat)switch(a.keyCode){case 81:T=0;break;case 38:case 87:N=0;break;case 40:case 83:O=0;break;case 37:case 65:L=0;break;case 39:case 68:M=0}};window.onbeforeunload=function(){aa.setItem("cache",ra())};g.oncontextmenu=function(a){a.preventDefault();return!1};function ra(){let a=`#include "../consts.h"\n\nstatic const struct tile_info t;\n\nconst struct area_info area_000 = {\n  &t,\n  (struct ball_info[]) {\n    {0}\n  },\n  (struct pos[]){ ${A.map(f=>`{ ${f.join(", ")} }`).join(", ")} },\n  (struct teleport[]){ ${ka.map(f=>`{ { ${f.j.join(", ")} }, { ${f.g} } }`).join(", ")} },\n  (struct teleport_min[]){ ${ka.map(f=>`{ ${f.j.join(", ")}, ${f.g} }`).join(", ")} },\n  ${A.length}, ${ka.length}\n};\n\nstatic const struct tile_info t = { ${w}, ${x}, 40, (uint8_t[]){\n`,b="/*       ";for(var d=0;d<x;++d)b+=d.toString().padStart(3," ")+" ";b+="*/\n";a+=b+"\n";for(d=0;d<w;++d){a+=`/*${d.toString().padStart(4," ")}*/  `;for(let f=0;f<x;++f)a+=` ${v[d*x+f]}, `;a=a.substring(0,a.length-1-(d==w-1));a+="\n\n"}return btoa(a+`${b}  }\n};\n`)}function sa(a){try{a=atob(a);let b=a.match(/\(struct pos\[\]\){ (.*?) },\n/);if(null==b)return 0;b=b[1];let d=b.match(/{ (\d+), (\d+) }/g);null==d&&(d=[]);d=d.map(va=>va.match(/\d+/g).map(wa=>+wa));let f=a.match(/(\d+), (\d+),?\n/);if(null==f)return 0;f=[+f[1],+f[2]];if(d.length!=f[0])return 0;const y=a.match(/{ (\d+), (\d+), 40, \(uint8_t\[\]\){/);if(null==y)return 0;const B=+y[1],K=+y[2];if(1>B||200<B||1>K||200<K)return 0;const ma=eval(`[${a.substring(y.index+y[0].length,a.length-10)}*/]`);if(ma.length!=B*K)return 0;for(a=0;a<d.length;++a)if(d[a][0]>=B||d[a][1]>=K)return 0;w=B;x=K;da=w;u=x;na();oa();C={};for(a=0;a<d.length;++a)C[`${d[a][0]},${d[a][1]}`]=[d[a][0],d[a][1]];A=Object.values(C);v=new Uint8Array(B*K);if(!(ma instanceof Array))return 0;v.set(ma);ea();return 1}catch(b){return 0}}function ea(){R=Array(q.length);S=Array(q.length);var a=0;for(let b=0;b<w;++b)for(let d=0;d<x;++d)null==R[v[a]]&&(R[v[a]]=new Path2D,S[v[a]]=new Path2D),R[v[a]].rect(2*(1.5+40*b),2*(1.5+40*d),74,74),S[v[a]].rect(80*b,80*d,80,80),++a;k.width=80*w;k.height=80*x;m.width=k.width;m.height=k.height;for(a=0;256>a;++a)R[a]&&2!=a&&(l.fillStyle=q[a]+"b0",l.fill(S[a]),l.fillStyle=q[a],l.fill(R[a]),n.fillStyle=q[a],n.fill(S[a]));U=1}function X(){var a=Q;const b=a%x;a=(a-b)/x;l.clearRect(80*a,80*b,80,80);n.clearRect(80*a,80*b,80,80);2!=r&&(l.fillStyle=q[r]+"b0",l.fillRect(80*a,80*b,80,80),l.fillStyle=q[r],l.fillRect(2*(1.5+40*a),2*(1.5+40*b),74,74),n.fillStyle=q[r],n.fillRect(80*a,80*b,80,80));U=1}function qa(){const {h:a,i:b}={h:(ia[0]-.5*g.width)/E+H,i:(ia[1]-.5*g.height)/E+I},d=Math.floor(a/40);if(0>d||d>=w)return-1;const f=Math.floor(b/40);return 0>f||f>=x?-1:d*x+f}z();let Z=e("button");Z.innerHTML="Export & copy";Z.timeout=-1;Z.onclick=function(){const a=ra();window.navigator.clipboard.writeText(a);-1!=this.timeout&&clearTimeout(this.timeout);this.innerHTML="Exported & copied";this.timeout=setTimeout(function(){this.innerHTML="Export & copy";this.timeout=-1}.bind(this),500)}.bind(Z);p.a(Z);Z=e("button");Z.innerHTML="Import";Z.onclick=function(){let a=prompt("Please paste the config below:");a&&(a=a.trim(),0!=a.length&&(sa(a)||alert("The config is invalid, it won't be loaded.")))};p.a(Z);Z=e("button");Z.innerHTML="Rotate";Z.onclick=function(){let a=new Uint8Array(w*x);for(var b=0;b<w;++b)for(var d=0;d<x;++d)a[d*w+b]=v[(w-b-1)*x+d];C={};for(b=0;b<A.length;++b)d=A[b][0],A[b][0]=A[b][1],A[b][1]=w-d-1,C[`${A[b][0]},${A[b][1]}`]=[A[b][0],A[b][1]];b=w;w=x;x=b;b=c("w");b.value=w;b.oninput();b=c("h");b.value=x;b.oninput();v=a;ea()};p.a(Z);Z=e("h4");Z.innerHTML="Width";Z.style["margin-bottom"]="2px";p.a(Z);Z=e("input");Z.type="range";Z.min=1;Z.max=200;Z.value=10;Z.step=1;na=function(){this.value=w;this.nextElementSibling.innerHTML=w+" tiles";this.nextElementSibling.nextElementSibling.value=w}.bind(Z);Z.oninput=function(){w=this.valueAsNumber||1;na();z()}.bind(Z);p.a(Z);Z=e("h4");Z.innerHTML=w+" tiles";Z.style["margin-top"]="2px";Z.style["margin-bottom"]="2px";p.a(Z);Z=e("input");Z.type="number";Z.style["margin-top"]="2px";Z.value=w;Z.min=1;Z.max=200;Z.id="w";Z.oninput=function(){this.valueAsNumber=w=this.valueAsNumber?Math.max(Math.min(this.valueAsNumber,this.max),this.min):1;this.previousElementSibling.innerHTML=w+" tiles";this.previousElementSibling.previousElementSibling.value=w;z()}.bind(Z);p.a(Z);Z=e("h4");Z.innerHTML="Height";Z.style["margin-bottom"]="2px";p.a(Z);Z=e("input");Z.type="range";Z.min=1;Z.max=200;Z.value=10;Z.step=1;oa=function(){this.value=x;this.nextElementSibling.innerHTML=x+" tiles";this.nextElementSibling.nextElementSibling.value=x}.bind(Z);Z.oninput=function(){x=this.valueAsNumber||1;oa();z()}.bind(Z);p.a(Z);Z=e("h4");Z.innerHTML=x+" tiles";Z.style["margin-top"]="2px";Z.style["margin-bottom"]="2px";p.a(Z);Z=e("input");Z.type="number";Z.style["margin-top"]="2px";Z.value=x;Z.min=1;Z.max=200;Z.id="h";Z.oninput=function(){this.valueAsNumber=x=this.valueAsNumber?Math.max(Math.min(this.valueAsNumber,this.max),this.min):1;this.previousElementSibling.innerHTML=x+" tiles";this.previousElementSibling.previousElementSibling.value=x;z()}.bind(Z);p.a(Z);for(let a=0;a<q.length;++a){const b=e("div");Z=e("h4");Z.innerHTML=ba[a];b.appendChild(Z);t[t.length]=Z;Z=e("div");Z.className="tile";Z.style["background-color"]=q[a];Z.onclick=function(){r=a;ca()};b.appendChild(Z);p.a(b)}ca();function W(a,b,d,f,y,B){f*=E;b=.5*g.width+(b-H)*E;d=.5*g.height+(d-I)*E;y=((y&&(b<f||b>g.width-f)?Math.max(Math.min(b,g.width-f),f):b)-.5*g.width)/E+H;f=((B&&(d<f||d>g.height-f)?Math.max(Math.min(d,g.height-f),f):d)-.5*g.height)/E+I;h.font="700 20px Ubuntu";h.textAlign="center";h.textBaseline="middle";h.fillStyle="#fff";h.strokeStyle="#333";h.lineWidth=1;h.fillText(a,y,f);h.strokeText(a,y,f)}const ta=aa.getItem("cache");ta&&sa(ta);setInterval(function(){aa.setItem("cache",ra())},1E4);function ua(){var a=E;E=Y(E,F,.075);let b=H,d=I;if(0==O-N&&0==M-L)P=[Y(P[0],0,.1),Y(P[1],0,.1)];else{const f=Math.atan2(O-N,M-L);P=[Y(P[0],10*Math.cos(f)/E,.1),Y(P[1],10*Math.sin(f)/E,.1)]}H+=P[0];I+=P[1];Q=qa();-1!=Q&&(J&&!T&&v[Q]!=r&&(v[Q]=r,X()),V());if(U||a!=E||b!=H||d!=I){U=!1;h.resetTransform();h.clearRect(0,0,g.width,g.height);h.translate(.5*g.width,.5*g.height);h.scale(E,E);h.translate(-H,-I);h.drawImage(k,0,0,k.width/2,k.height/2);1>E&&(h.globalAlpha=1-E*E,h.drawImage(m,0,0,k.width/2,k.height/2),h.globalAlpha=1);la||(W("WASD or arrow keys to move around, scroll to zoom",-500,G-80,0,!1,!1),W("Click on the left to pick what type of tile you want to place",-500,G-40,0,!1,!1),W("Set spawnpoints by clicking LMB and pressing Q at the same time",-500,G,0,!1,!1),W("Unset spawnpoints by clicking RMB and pressing Q at the same time",-500,G+40,0,!1,!1),W("Press E to hide this message",-500,G+80,0,!1,!1));for(const f of A)W("S",20+40*f[0],20+40*f[1],0,!1,!1);for(a=0;a<w;++a)W(a.toString(),20+40*a,-40,20,!1,!0);w&1?W("M",20+40*(w-1>>1),-20,40,!1,!0):(W("M",20+40*(w>>1),-20,40,!1,!0),W("M",20+40*((w>>1)-1),-20,40,!1,!0));for(a=0;a<x;++a)W(a.toString(),40*w+40,20+40*a,20,!0,!1);x&1?W("M",40*w+20,20+40*(x-1>>1),40,!0,!1):(W("M",40*w+20,20+40*(x>>1),40,!0,!1),W("M",40*w+20,20+40*((x>>1)-1),40,!0,!1))}requestAnimationFrame(ua)}ua();