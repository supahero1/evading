let d=document.getElementById("loading");d.innerHTML="Fetching servers...";let ba=document.getElementById("sub"),f=document.getElementById("name"),k=document.getElementById("canvas"),n=k.getContext("2d"),q=document.createElement("canvas"),r=q.getContext("2d"),u=document.createElement("canvas"),ca=u.getContext("2d"),da=0,ea=["#dddddd","#aaaaaa","#333333","#fedf78"],fa=["#808080","#fc46aa","#008080","#ff8e06","#d2b48c"],v=Array(fa.length),ha=0,ia=0,w=0,ja=new ArrayBuffer(524288),x=new Uint8Array(ja),y=new DataView(x.buffer),z=0,A=0,B=Array(256),C=[];var ka=0,la=0,ma=0,D=0,na=0,E=0;let F=[0,0],G=null,oa=0,pa=0,qa=0;var H=0,I=0,J=0,K=0,L=1,N=0,ra=0,O=0,R=0,S=0,T=0,U=[],V=[];let W=1,X=W,Y=[0,0];window.s.then(h=>h.json()).then(h=>sa(h));function ua(){setTimeout(location.reload.bind(location),1E3)}function sa(h){if(0==h.length)d.innerHTML="No servers found",ua();else{d.innerHTML="Connecting...";var m=h.map(function(l){l=new WebSocket(l[1]);l.binaryType="arraybuffer";l.i=[];l.onopen=function(){this.send(new Uint8Array(0));this.time=performance.now()};l.onmessage=function(){this.i[this.i.length]=performance.now()-this.time;5>this.i.length&&this.send(new Uint8Array(0))};return l});setTimeout(function(){let l=999999,p=null;for(let e of m){e.h=0;for(let Z of e.i)e.h+=Z;0<e.i.length?e.h/=e.i.length:e.h=999999;e.h<l&&(l=e.h,p=e)}for(let e of m)e.onopen=function(){},e.onmessage=function(){},delete e.i,delete e.time,delete e.h,e!=p&&e.close();null==p||1!=p.readyState?(d.innerHTML="Failed connecting",ua()):va(p)},1E3)}}function wa(){ma=D;na=E;for(let h of B)h&&(h.g.x1=h.g.x2,h.g.y1=h.g.y2,h.g.r1=h.g.r2);for(let h of C)h&&(h.g.x1=h.g.x2,h.g.y1=h.g.y2,h.g.r1=h.g.r2)}function va(h){d.innerHTML="Enter your name<br>";ba.innerHTML="You are limited to 4 characters<br>Special characters might not fit<br>Press enter when you are done";f.style.display="block";f.onkeypress=f.onblur=f.onpaste=function(m){let l=m.target.value+m.key;4<(new TextEncoder).encode(l).byteLength?m.target.value=m.target.m||"":(m.target.value=l,m.target.m=l);m.preventDefault();return!1};h.onclose=function(){window.onbeforeunload=function(){};k.parentElement.removeChild(k);d.innerHTML="Disconnected";ba.innerHTML="";f.style.display="none";ua()};window.onkeydown=function(m){13==(m.keyCode||m.which)&&(d.innerHTML="Spawning...",ba.innerHTML="",f.style.display="none",m=(m=window.localStorage.getItem("token"))?m.split(",").map(l=>+l):[],h.send(new Uint8Array([0,...(new TextEncoder).encode(f.value),0,...m,0])),xa(h))}}function xa(h){function m({data:a}){x.set(new Uint8Array(a));z=a.byteLength;a=1;Y[0]=Y[1];Y[1]+=40;wa();if(a!=z){if(0==x[a]){++a;oa=1;C=[];A=x[a++];a+=2;R=x[a]|x[a+1]<<8;a+=2;S=x[a]|x[a+1]<<8;a+=2;T=x[a++];U=Array(256);V=Array(256);for(var g=0;g<R;++g)for(var c=0;c<S;++c)null==U[x[a]]&&(U[x[a]]=new Path2D,V[x[a]]=new Path2D),U[x[a]].rect(4*(1.5+g*T),4*(1.5+c*T),4*(T-3),4*(T-3)),V[x[a]].rect(g*T*4,c*T*4,4*T,4*T),++a;q.width=T*R*4;q.height=T*S*4;u.width=T*R*4;u.height=T*S*4;for(g=0;256>g;++g)U[g]&&(r.fillStyle=ea[g]+"b0",r.fill(V[g]),r.fillStyle=ea[g],r.fill(U[g]),ca.fillStyle=ea[g],ca.fill(V[g]));da||(requestAnimationFrame(Z),da=1)}if(a!=z){if(1==x[a])for(++a,g=x[a++],c=0;c<g;++c){var b=x[a++];if(B[b]){var t=x[a++];if(t)for(;t;){switch(t){case 1:B[b].g.x2=y.getFloat32(a,!0);a+=4;A==b&&(D=B[b].g.x2);break;case 2:B[b].g.y2=y.getFloat32(a,!0);a+=4;A==b&&(E=B[b].g.y2);break;case 3:B[b].g.r2=y.getFloat32(a,!0);a+=4;break;case 4:B[b].j=x[a++],B[b].j&&(B[b].l=x[a++])}t=x[a++]}else B[b]=void 0}else{t=y.getFloat32(a,!0);a+=4;var M=y.getFloat32(a,!0);a+=4;var P=y.getFloat32(a,!0);a+=4;var Q=x[a++],aa=(new TextDecoder).decode(x.subarray(a,a+Q));a+=Q;Q=x[a++];let ta=0;Q&&(ta=x[a++]);B[b]={x:0,y:0,r:0,g:{x1:t,x2:t,y1:M,y2:M,r1:P,r2:P},name:aa,j:Q,l:ta};A==b&&(D=t,E=M)}}if(a!=z&&2==x[a])for(++a,g=x[a]|x[a+1]<<8,a+=2,c=0;c<g;++c)if(b=x[a]|x[a+1]<<8,a+=2,C[b])if(t=x[a++])for(;t;){switch(t){case 1:C[b].g.x2=y.getFloat32(a,!0);a+=4;break;case 2:C[b].g.y2=y.getFloat32(a,!0);a+=4;break;case 3:C[b].g.r2=y.getFloat32(a,!0),a+=4}t=x[a++]}else C[b]=void 0;else t=x[a++],M=y.getFloat32(a,!0),a+=4,P=y.getFloat32(a,!0),a+=4,aa=y.getFloat32(a,!0),a+=4,C[b]={type:t,x:0,y:0,r:0,g:{x1:M,x2:M,y1:P,y2:P,r1:aa,r2:aa}}}}}function l(){if(window.innerWidth!=ha||window.innerHeight!=ia||w!=window.devicePixelRatio)w=window.devicePixelRatio,ha=window.innerWidth,k.width=ha*w,ia=window.innerHeight,k.height=ia*w}function p(a,g,c){return a+(g-a)*c}function e(){ra||(H||I||J||K?(N=Math.atan2(K-H,J-I),O=160*w):O=N=0);y.setFloat32(0,N,!0);O>=160*w?y.setUint8(4,255*L>>>0):y.setUint8(4,1.59375*O/w*L>>>0);h.send(x.subarray(0,5))}function Z(){if(0!=Y[0]){G?G<Y[0]?G=Y[0]:G>Y[1]&&(G=Y[1]):G=Y[0];var a=W;W=p(W,X,.1);W!=a&&(O=Math.hypot(F[0]-k.width/2,F[1]-k.height/2)/W,e());a=Y[0]==Y[1]?0:(G-Y[0])/(Y[1]-Y[0]);G+=16.66666;ka=p(ma,D,a);la=p(na,E,a);n.resetTransform();n.fillStyle="#333";n.fillRect(0,0,k.width,k.height);n.translate(k.width/2,k.height/2);n.scale(W,W);n.translate(-ka,-la);n.drawImage(q,0,0,q.width/4,q.height/4);1>W&&(n.globalAlpha=1-W*W,n.drawImage(u,0,0,q.width/4,q.height/4),n.globalAlpha=1);for(var g=0;g<v.length;++g)v[g]=new Path2D;for(var c of C)c&&(c.x=p(c.g.x1,c.g.x2,a),c.y=p(c.g.y1,c.g.y2,a),c.r=p(c.g.r1,c.g.r2,a),v[c.type].moveTo(c.x+c.r-2,c.y),v[c.type].arc(c.x,c.y,c.r-2,0,2*Math.PI));n.lineWidth=4;n.beginPath();for(c=0;c<v.length;++c)g=fa[c],g="#"+(.8*parseInt(g.substring(1,3),16)>>0).toString(16).padStart(2,"0")+(.8*parseInt(g.substring(3,5),16)>>0).toString(16).padStart(2,"0")+(.8*parseInt(g.substring(5,7),16)>>0).toString(16).padStart(2,"0"),n.strokeStyle=g,n.stroke(v[c]),n.fillStyle=fa[c],n.fill(v[c]);for(let b of B)b&&(b.x=p(b.g.x1,b.g.x2,a),b.y=p(b.g.y1,b.g.y2,a),b.r=p(b.g.r1,b.g.r2,a),n.beginPath(),n.fillStyle="#4f4faf",n.arc(b.x,b.y,b.r,0,2*Math.PI),n.fill(),0!=b.name.length&&(n.font=`700 ${b.r/W}px Ubuntu`,n.textAlign="center",n.textBaseline="middle",n.fillStyle="#00000080",qa=1<W?.5*b.r:.5*b.r+2/(W*W),pa=p(pa,qa,.1),n.fillText(b.name,b.x,b.y-b.r-pa)),b.j&&(n.font=`700 ${b.r/Math.min(W,1)}px Ubuntu`,n.textAlign="center",n.textBaseline="middle",n.fillStyle="#f00",n.fillText(b.l,b.x,b.y)))}requestAnimationFrame(Z)}h.onmessage=function(a){oa=0;m(a);oa&&(d.innerHTML="",wa())};l();window.onresize=l;window.onwheel=function(a){a=.05*-Math.sign(a.deltaY);X=1<X?X+3*a:X+a;X=Math.min(Math.max(X,.25),4)};window.onmousemove=function(a){F=[a.clientX*w,a.clientY*w];N=Math.atan2(F[1]-k.height/2,F[0]-k.width/2);O=Math.hypot(F[0]-k.width/2,F[1]-k.height/2)/W;e()};window.onmousedown=function(){ra=!ra;N=Math.atan2(F[1]-k.height/2,F[0]-k.width/2);O=Math.hypot(F[0]-k.width/2,F[1]-k.height/2)/W;e()};window.onkeydown=function(a){switch(a.keyCode||a.which){case 16:1==L&&(L=.5,e());break;case 87:case 38:H||(H=1,e());break;case 65:case 37:I||(I=1,e());break;case 68:case 39:J||(J=1,e());break;case 83:case 40:K||(K=1,e())}};window.onkeyup=function(a){switch(a.keyCode||a.which){case 16:.5==L&&(L=1,e());break;case 87:case 38:H&&(H=0,e());break;case 65:case 37:I&&(I=0,e());break;case 68:case 39:J&&(J=0,e());break;case 83:case 40:K&&(K=0,e())}};window.onbeforeunload=function(a){a.preventDefault();return a.returnValue="Are you sure you want to quit?"}};