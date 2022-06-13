let c=document.getElementById("loading");c.innerHTML="Fetching servers...";let aa=document.getElementById("sub"),e=document.getElementById("name"),h=document.getElementById("canvas"),q=h.getContext("2d"),r=document.createElement("canvas"),ba=r.getContext("2d"),fa=document.createElement("canvas"),ha=fa.getContext("2d"),ia=0,ja=["#dddddd","#aaaaaa","#333333","#fedf78"],ka=["#808080","#fc46aa","#008080","#ff8e06","#d2b48c"],la=0,ma=0,t=0,na=new ArrayBuffer(1048576),u=new Uint8Array(na),v=new DataView(u.buffer),w=0,oa=0,x=[],z=[];var pa=0,ra=0,sa=0,ta=0,ua=0,va=0;let A=[0,0],B=null,wa=0,C=[0,0],xa=0,ya=0,za=0,Aa=document.getElementById("settings"),D=document.getElementById("ss"),E=!1,Ba=window.localStorage.getItem("keybinds"),F={settings:"Escape",up:"KeyW",left:"KeyA",right:"KeyD",down:"KeyS",slowwalk:"ShiftLeft"},G=null!=Ba?JSON.parse(Ba):F;for(let b in F)void 0==G[b]&&(G[b]=F[b]);for(let b in G)void 0==F[b]&&delete G[b];var H=0,I=0,J=0,K=0,L=1,M=0,Ca=0,N=0,Da=0,Ea=0,O=0,P=[],Q=[];let Fa=window.localStorage.getItem("settings"),Ga={fov:{min:.25,max:4,value:1,step:.05},chat_on:!0,max_chat_messages:{min:1,max:1E3,value:100,step:1},draw_ball_fill:!0,draw_ball_stroke:!0,draw_ball_stroke_bright:!1,ball_stroke:{min:0,max:100,value:20,step:1},draw_player_fill:!0,draw_player_stroke:!0,draw_player_stroke_bright:!1,player_stroke:{min:0,max:100,value:10,step:1},draw_player_name:!0},R=null!=Fa?JSON.parse(Fa):JSON.parse(JSON.stringify(Ga));for(let b in Ga)void 0==R[b]&&(R[b]=Ga[b]);for(let b in R)void 0==Ga[b]&&delete R[b];window.localStorage.setItem("settings",JSON.stringify(R));let Ia=!1,Ja="",Ka,S=R.fov.value,T=S,La=document.getElementById("chat"),Ma=document.getElementById("messages"),U=document.getElementById("sendmsg"),Na=R.chat_on,Oa=0;window.s.then(b=>b.json()).then(b=>Pa(b));function Qa(){setTimeout(location.reload.bind(location),1E3)}function Ra(){window.localStorage.setItem("settings",JSON.stringify(R))}function Sa(){window.localStorage.setItem("keybinds",JSON.stringify(G))}function Ta(b){let f=document.createElement("h1");f.innerHTML=b;return f}function W(b){let f=document.createElement("h3");f.innerHTML=b;return f}function X(b,f,k){let l=document.createElement("tr"),p=document.createElement("td");p.appendChild(f);l.appendChild(p);p=document.createElement("td");p.appendChild(k);l.appendChild(p);b.appendChild(l)}function Y(b){let f=document.createElement("button");R[b]=!R[b];f.onclick=function(){R[b]=!R[b];1==R[b]?(f.innerHTML="ON",f.style["background-color"]="#23c552"):(f.innerHTML="OFF",f.style["background-color"]="#f84f31");Ra()};f.onclick();return f}function Z(b){let f=document.createElement("button");f.innerHTML=G[b];f.onclick=async function(){f.innerHTML="...";Ia=1;await new Promise(function(k){Ka=k});Ia=0;f.innerHTML=Ja;G[b]=Ja;Sa()};return f}function Ua(b,f=""){let k=document.createElement("div");k.className="input";let l=document.createElement("input");l.type="range";l.min=R[b].min;l.max=R[b].max;l.step=R[b].step;l.value=R[b].value;l.oninput=function(){l.nextElementSibling.innerHTML=l.value+f;R[b].value=l.valueAsNumber};l.onchange=Ra;k.appendChild(l);k.appendChild(W(l.value+f));return k}function Va(b){let f=document.createElement("button");f.innerHTML="RESET";f.onclick=b;return f}function Wa(){D.innerHTML="";D.appendChild(Ta("GENERAL"));let b=document.createElement("table");X(b,W("Show chat"),Y("chat_on"));X(b,W("Max number of messages"),Ua("max_chat_messages"));X(b,W("Default FOV"),Ua("fov"));X(b,W("Draw balls' fill"),Y("draw_ball_fill"));X(b,W("Draw balls' stroke"),Y("draw_ball_stroke"));X(b,W("Draw stroke-only balls with brighter color"),Y("draw_ball_stroke_bright"));X(b,W("Balls' stroke radius percentage"),Ua("ball_stroke"," %"));X(b,W("Draw players' fill"),Y("draw_player_fill"));X(b,W("Draw players' stroke"),Y("draw_player_stroke"));X(b,W("Draw stroke-only players with brighter color"),Y("draw_player_stroke_bright"));X(b,W("Players' stroke radius percentage"),Ua("player_stroke"," %"));X(b,W("Draw players' name"),Y("draw_player_name"));D.appendChild(b);D.appendChild(Ta("KEYBINDS"));b=document.createElement("table");X(b,W("Settings"),Z("settings"));X(b,W("Move up"),Z("up"));X(b,W("Move left"),Z("left"));X(b,W("Move down"),Z("down"));X(b,W("Move right"),Z("right"));X(b,W("Move slowly"),Z("slowwalk"));D.appendChild(b);D.appendChild(Ta("RESET"));b=document.createElement("table");X(b,W("Reset settings"),Va(function(){R=Ga;Ra();Wa()}));X(b,W("Reset keybinds"),Va(function(){G=F;Sa();Wa()}));D.appendChild(b)}Wa();function Za(b,f){let k=document.createElement("p");k.appendChild(document.createTextNode(b+": "+f));Ma.insertBefore(k,Ma.firstChild);++Oa>R.max_chat_messages.value&&Ma.removeChild(Ma.lastChild)}function Pa(b){if(0==b.length)c.innerHTML="No servers found",Qa();else{c.innerHTML="Connecting...";var f=b.map(function(k){k=new WebSocket(k[1]);k.binaryType="arraybuffer";k.i=[];k.onopen=function(){this.send(new Uint8Array(0));this.time=performance.now()};k.onmessage=function(){this.i[this.i.length]=performance.now()-this.time;5>this.i.length&&this.send(new Uint8Array(0))};return k});setTimeout(function(){let k=999999,l=null;for(let p of f){p.h=0;for(let y of p.i)p.h+=y;0<p.i.length?p.h/=p.i.length:p.h=999999;p.h<k&&(k=p.h,l=p)}for(let p of f)p.onopen=function(){},p.onmessage=function(){},delete p.i,delete p.time,delete p.h,p!=l&&p.close();null==l||1!=l.readyState?(c.innerHTML="Failed connecting",Qa()):$a(l)},1E3)}}function ab(){sa=ta;ua=va;for(let b of x)b&&(b.g.x1=b.g.x2,b.g.y1=b.g.y2,b.g.r1=b.g.r2);for(let b of z)b&&(b.g.x1=b.g.x2,b.g.y1=b.g.y2,b.g.r1=b.g.r2)}function bb(b){return function(f){void 0==f.target.l&&(f.target.l=f.target.value);let k=f.target.value+f.key;(new TextEncoder).encode(k).byteLength>b?f.target.value=f.target.l||"":(f.target.value=k,f.target.l=k);f.preventDefault();return!1}}function $a(b){c.innerHTML="Enter your name<br>";aa.innerHTML="You are limited to 4 characters<br>Special characters might not fit<br>Press enter when you are done";e.style.display="block";e.focus();let f=window.localStorage.getItem("name");f&&(e.value=f);e.onkeypress=e.onpaste=bb(4);b.onclose=function(){window.onbeforeunload=function(){};h.parentElement.removeChild(h);Aa.parentElement.removeChild(Aa);La.parentElement.removeChild(La);c.innerHTML="Disconnected";aa.innerHTML="";e.style.display="none";Qa()};window.onkeydown=function(k){if(13==(k.keyCode||k.which)){window.localStorage.setItem("name",e.value);c.innerHTML="Spawning...";aa.innerHTML="";e.style.display="none";k=(k=window.localStorage.getItem("token"))?k.split(",").map(p=>+p):[];let l=(new TextEncoder).encode(e.value);b.send(new Uint8Array([...l,...k]));cb(b)}}}function cb(b){function f({data:a}){u.set(new Uint8Array(a));w=a.byteLength;a=u[0]|u[1]<<8|u[2]<<16|u[3]<<24;if(0!=qa&&4!=a-qa)throw b.onmessage=function(){},Error(`tick - last_tick = ${a-qa}`);qa=a;a=4;C[0]=C[1];C[1]=performance.now();ab();if(a!=w){if(0==u[a]){++a;xa=1;z=[];oa=u[a++];a+=2;Da=u[a]|u[a+1]<<8;a+=2;Ea=u[a]|u[a+1]<<8;a+=2;O=u[a++];P=Array(256);Q=Array(256);for(var n=0;n<Da;++n)for(var m=0;m<Ea;++m)null==P[u[a]]&&(P[u[a]]=new Path2D,Q[u[a]]=new Path2D),P[u[a]].rect((1.5+n*O)*R.fov.max,(1.5+m*O)*R.fov.max,(O-3)*R.fov.max,(O-3)*R.fov.max),Q[u[a]].rect(n*O*R.fov.max,m*O*R.fov.max,O*R.fov.max,O*R.fov.max),++a;r.width=O*Da*R.fov.max;r.height=O*Ea*R.fov.max;fa.width=O*Da*R.fov.max;fa.height=O*Ea*R.fov.max;for(n=0;256>n;++n)P[n]&&(ba.fillStyle=ja[n]+"b0",ba.fill(Q[n]),ba.fillStyle=ja[n],ba.fill(P[n]),ha.fillStyle=ja[n],ha.fill(Q[n]));ia||(requestAnimationFrame(Xa),ia=1)}if(a!=w){if(1==u[a])for(++a,n=u[a++],m=0;m<n;++m){var d=u[a++];if(x[d]){var g=u[a++];if(g)for(;g;){switch(g){case 1:x[d].g.x2=v.getFloat32(a,!0);a+=4;oa==d&&(ta=x[d].g.x2);break;case 2:x[d].g.y2=v.getFloat32(a,!0);a+=4;oa==d&&(va=x[d].g.y2);break;case 3:x[d].g.r2=v.getFloat32(a,!0);a+=4;break;case 4:x[d].j=u[a++];x[d].j&&(x[d].m=u[a++]);break;case 5:g=u[a++],Za(x[d].name,(new TextDecoder).decode(u.subarray(a,a+g))),a+=g}g=u[a++]}else x[d]=void 0}else{g=v.getFloat32(a,!0);a+=4;var V=v.getFloat32(a,!0);a+=4;var ca=v.getFloat32(a,!0);a+=4;var da=u[a++],ea=(new TextDecoder).decode(u.subarray(a,a+da));a+=da;da=u[a++];let Ya=0;da&&(Ya=u[a++]);let Ha=u[a++];0<Ha&&(Za(ea,(new TextDecoder).decode(u.subarray(a,a+Ha))),a+=Ha);x[d]={x:0,y:0,r:0,g:{x1:g,x2:g,y1:V,y2:V,r1:ca,r2:ca},name:ea,j:da,m:Ya};oa==d&&(ta=g,va=V)}}if(a!=w){if(2==u[a])for(++a,n=u[a]|u[a+1]<<8,a+=2,m=0;m<n;++m)if(d=u[a]|u[a+1]<<8,a+=2,z[d])if(g=u[a++])for(;g;){switch(g){case 1:z[d].g.x2=v.getFloat32(a,!0);a+=4;break;case 2:z[d].g.y2=v.getFloat32(a,!0);a+=4;break;case 3:z[d].g.r2=v.getFloat32(a,!0);if(1>z[d].g.r2||60<z[d].g.r2)throw console.log(`update ball id ${d} r ${z[d].g.r2}`),b.onmessage=function(){},Error();a+=4}g=u[a++]}else z[d]=void 0;else if(g=u[a++],0!=g&&(--g,V=v.getFloat32(a,!0),a+=4,ca=v.getFloat32(a,!0),a+=4,ea=v.getFloat32(a,!0),a+=4,z[d]={type:g,x:0,y:0,r:0,g:{x1:V,x2:V,y1:ca,y2:ca,r1:ea,r2:ea}},1>z[d].g.r2||60<z[d].g.r2))throw console.log(`create ball id ${d} r ${z[d].g.r2}`),b.onmessage=function(){},Error();if(a!=w&&3==u[a])for(++a,n=u[a++],m=0;m<n;++m)g=u[a++],d=(new TextDecoder).decode(u.subarray(a,a+g)),a+=g,g=u[a++],Za(d,(new TextDecoder).decode(u.subarray(a,a+g))),a+=g}}}}function k(){if(window.innerWidth!=la||window.innerHeight!=ma||t!=window.devicePixelRatio)t=window.devicePixelRatio,la=window.innerWidth,h.width=la*t,ma=window.innerHeight,h.height=ma*t}function l(a,n,m){return a+(n-a)*m}function p(a){return"#"+(.8*parseInt(a.substring(1,3),16)>>0).toString(16).padStart(2,"0")+(.8*parseInt(a.substring(3,5),16)>>0).toString(16).padStart(2,"0")+(.8*parseInt(a.substring(5,7),16)>>0).toString(16).padStart(2,"0")+a.substring(7)}function y(){Ca||(0==K-H&&0==J-I?N=M=0:(M=Math.atan2(K-H,J-I),N=160*t));E?b.send(new Uint8Array([0,0,0,0,0,0])):(u[0]=0,v.setFloat32(1,M,!0),N>=160*t?v.setUint8(5,255*L>>>0):v.setUint8(5,1.59375*N/t*L>>>0),b.send(u.subarray(0,6)))}function Xa(a){if(0!=C[0]){R.chat_on==!Na&&(Na=R.chat_on,La.style.display=Na?"block":"none");B?B<C[0]?B=C[0]:B>C[1]&&(B=C[1]):B=C[0];var n=S;S=l(S,T,.1);S!=n&&(N=Math.hypot(A[0]-h.width/2,A[1]-h.height/2)/S,y());n=C[0]==C[1]?0:(B-C[0])/(C[1]-C[0]);B+=a-wa;wa=a;pa=l(sa,ta,n);ra=l(ua,va,n);q.resetTransform();q.fillStyle="#333";q.fillRect(0,0,h.width,h.height);q.translate(h.width/2,h.height/2);q.scale(S,S);q.translate(-pa,-ra);q.drawImage(r,0,0,r.width/R.fov.max,r.height/R.fov.max);1>S&&(q.globalAlpha=1-S*S,q.drawImage(fa,0,0,r.width/R.fov.max,r.height/R.fov.max),q.globalAlpha=1);a=[];if(R.draw_player_fill||R.draw_player_stroke)for(var m of x)m&&(m.x=l(m.g.x1,m.g.x2,n),m.y=l(m.g.y1,m.g.y2,n),m.r=l(m.g.r1,m.g.r2,n),a[a.length]={u:m});if(R.draw_ball_fill||R.draw_ball_stroke)for(let d of z)d&&(d.x=l(d.g.x1,d.g.x2,n),d.y=l(d.g.y1,d.g.y2,n),d.r=l(d.g.r1,d.g.r2,n),a[a.length]={o:d});a.sort((d,g)=>d.r-g.r);for(let {o:d,u:g}of a)q.beginPath(),g?(m=R.player_stroke.value/200*g.r,q.moveTo(g.x+g.r-m,g.y),q.arc(g.x,g.y,g.r-m,0,2*Math.PI),R.draw_player_fill&&(q.fillStyle="#ebecf0",q.fill()),R.draw_player_stroke&&(!R.draw_player_fill&&R.draw_player_stroke_bright?q.strokeStyle="#ebecf0":q.strokeStyle=p("#ebecf0"),q.lineWidth=2*m,q.stroke()),R.draw_player_name&&0!=g.name.length&&(q.font=`700 ${g.r/S}px Ubuntu`,q.textAlign="center",q.textBaseline="middle",q.fillStyle="#00000080",za=1<S?.5*g.r:.5*g.r+2/(S*S),ya=l(ya,za,.1),q.fillText(g.name,g.x,g.y-g.r-ya)),g.j&&(q.font=`700 ${g.r/Math.min(S,1)}px Ubuntu`,q.textAlign="center",q.textBaseline="middle",q.fillStyle="#f00",q.fillText(g.m,g.x,g.y))):(m=R.ball_stroke.value/200*d.r,q.moveTo(d.x+d.r-m,d.y),q.arc(d.x,d.y,d.r-m,0,2*Math.PI),R.draw_ball_fill&&(q.fillStyle=ka[d.type],q.fill()),R.draw_ball_stroke&&(q.strokeStyle=!R.draw_ball_fill&&R.draw_ball_stroke_bright?ka[d.type]:p(ka[d.type]),q.lineWidth=2*m,q.stroke()))}requestAnimationFrame(Xa)}Na=!R.chat_on;let qa=0;b.onmessage=function(a){xa=0;f(a);xa&&(c.innerHTML="",ab())};U.onmousedown=function(a){a.stopPropagation()};U.onmouseup=function(a){a.stopPropagation()};U.onkeydown=function(a){a.stopPropagation();"Enter"==a.code&&(a=(new TextEncoder).encode(U.value),u[0]=1,u[1]=a.length,u.set(a,2),b.send(u.subarray(0,u[1]+2)),U.value="",U.blur(),h.focus())};U.onkeyup=function(a){a.stopPropagation()};U.onkeypress=U.onpaste=bb(64);Ma.onwheel=function(a){a.stopPropagation()};k();window.onresize=k;window.onwheel=function(a){E||(a=.05*-Math.sign(a.deltaY),T=1<T?T+3*a:T+a,T=Math.min(Math.max(T,R.fov.min),R.fov.max))};window.onmousemove=function(a){A=[a.clientX*t,a.clientY*t];M=Math.atan2(A[1]-h.height/2,A[0]-h.width/2);N=Math.hypot(A[0]-h.width/2,A[1]-h.height/2)/S;y()};window.onmousedown=function(){E||(Ca=!Ca);M=Math.atan2(A[1]-h.height/2,A[0]-h.width/2);N=Math.hypot(A[0]-h.width/2,A[1]-h.height/2)/S;y()};window.onkeydown=function(a){if(!a.repeat)if(E)Ia?(a.preventDefault(),Ja=a.code,Ka()):a.code==G.settings&&(E=!1,Aa.style.display="none");else switch(a.code){case "Enter":U.focus();a.preventDefault();break;case G.slowwalk:1==L&&(L=.5,y());break;case G.up:H||(H=1,y());break;case G.left:I||(I=1,y());break;case G.right:J||(J=1,y());break;case G.down:K||(K=1,y());break;case G.settings:E=!E,Aa.style.display=E?"block":"none"}};window.onkeyup=function(a){if(!a.repeat&&!E)switch(a.code){case G.slowwalk:.5==L&&(L=1,y());break;case G.up:H&&(H=0,y());break;case G.left:I&&(I=0,y());break;case G.right:J&&(J=0,y());break;case G.down:K&&(K=0,y())}};window.onbeforeunload=function(a){a.preventDefault();a.returnValue="Are you sure you want to quit?";window.localStorage.setItem("settings",JSON.stringify(R));return"Are you sure you want to quit?"};h.oncontextmenu=function(a){a.preventDefault();return!1}};