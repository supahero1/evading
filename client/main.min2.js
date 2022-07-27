const h=window.localStorage,l=h.getItem.bind(h),aa=h.setItem.bind(h),ba=h.removeItem.bind(h),m=Math.sin,n=Math.cos,p=Math.max,q=Math.min,ca=l("keybinds"),da={settings:"Escape",up:"KeyW",left:"KeyA",right:"KeyD",down:"KeyS",slowwalk:"ShiftLeft",spec_prev:"KeyA",spec_next:"KeyD"};let t=null!=ca?JSON.parse(ca):da;for(const a in da)a in t||(t[a]=da[a]);for(const a in t)a in da||delete t[a];function ea(){aa("keybinds",JSON.stringify(t))}const ha=l("settings"),u={fov:{min:.25,max:4,value:1.75,step:.05},chat_on:!0,max_chat_messages:{min:1,max:1E3,value:100,step:1},chat_text_scale:{min:1,max:2,value:1,step:.05},draw_ball_fill:!0,draw_ball_stroke:!0,draw_ball_stroke_bright:!0,ball_stroke:{min:0,max:100,value:20,step:1},draw_player_fill:!0,draw_player_stroke:!0,draw_player_stroke_bright:!0,player_stroke:{min:0,max:100,value:10,step:1},draw_player_name:!0,draw_death_arrow:!0,death_arrow_size:{min:10,max:100,value:40,step:1},show_tutorial:!0,show_ping:!1};let v=null!=ha?JSON.parse(ha):JSON.parse(JSON.stringify(u));for(const a in u)a in v||(v[a]=u[a]);for(const a in v)a in u?(v[a].min&&v[a].min!=u[a].min&&(v[a].min=u[a].min),v[a].max&&v[a].max!=u[a].max&&(v[a].max=u[a].max),v[a].step&&v[a].step!=u[a].step&&(v[a].step=u[a].step),v[a].value=p(q(v[a].value,v[a].max),v[a].min)):delete v[a];function ia(){aa("settings",JSON.stringify(v))}const x=document.getElementById.bind(document),y=document.createElement.bind(document),z=x("ID_status"),ja=l("token");let ka=[];"string"==typeof ja&&(ka=ja.split(",").map(a=>+a));function la(){setTimeout(location.reload.bind(location),1E3)}function ma(a){const b=a.match(/\/\/(.*?)\.shadam\.xyz/),c=a.match(/\/\/(.*?)[\/:]/);return b?b[1]:c?c[1]:a}WebSocket.prototype.send=new Proxy(WebSocket.prototype.send,{apply:function(a,b,c){if(b.readyState==WebSocket.OPEN)return a.apply(b,c)},configurable:!0,enumerable:!0});WebSocket.prototype.close=new Proxy(WebSocket.prototype.close,{apply:function(a,b,c){if(b.readyState==WebSocket.CONNECTING||b.readyState==WebSocket.OPEN)return a.apply(b,c)},configurable:!0,enumerable:!0});function na(a){return function(b){const c=b instanceof ClipboardEvent;if(!c||"paste"==b.type){var d=b.target.value+(c?b.clipboardData.getData("text"):b.key);if((new TextEncoder).encode(d).byteLength-b.target.selectionEnd+b.target.selectionStart>a){if(""==b.target.value&&c){const e=b.target.placeholder;b.target.placeholder="Text too long to paste!";setTimeout(function(){b.target.placeholder=e},1E3)}b.preventDefault()}}}}function C(a,b,c){return a+(b-a)*c}if(0==window.s.length)throw z.innerHTML="No servers found",la(),Error(z.innerHTML);z.innerHTML="Connecting";const oa=new Uint32Array([14540253,11184810,3355443,16703352]),pa=Array.from(oa).map(a=>"#"+a.toString(16)),va=new Uint32Array([2155905279,4232489727,8421631,4287497983,1021313023,1715110655]);Array.from(va).map(a=>"#"+a.toString(16));const wa=new ArrayBuffer(1048560),D=new DataView(wa);function xa(a,b){const c=a[0],d=a[1],e=a[2],g=a[3],k=a[4],f=a[5],w=a[6],r=a[7],A=a[8],B=b[0],P=b[1],fa=b[2],qa=b[3],ra=b[4],sa=b[5],ta=b[6],ua=b[7];b=b[8];a[0]=B*c+P*g+fa*w;a[1]=B*d+P*k+fa*r;a[2]=B*e+P*f+fa*A;a[3]=qa*c+ra*g+sa*w;a[4]=qa*d+ra*k+sa*r;a[5]=qa*e+ra*f+sa*A;a[6]=ta*c+ua*g+b*w;a[7]=ta*d+ua*k+b*r;a[8]=ta*e+ua*f+b*A;return a}class ya extends Float32Array{constructor(){super([2/E.width,0,0,0,-2/E.height,0,-1,1,1])}translate(a,b){return xa(this,new Float32Array([1,0,0,0,1,0,a,b,1]))}rotate(a){const b=n(a);a=m(a);return xa(this,new Float32Array([b,-a,0,a,b,0,0,0,1]))}}const F=WebGL2RenderingContext.prototype;function za(a){a=(a?x(a):y("canvas")).getContext("webgl2",{premultipliedAlpha:!1,failIfMajorPerformanceCaveat:!1});if(!a)throw z.innerHTML="Your browser/device does not support WebGL2.",Error("Your browser/device does not support WebGL2.");return a}function Aa(a,b,c){b=a.g.createShader(b);a.g.shaderSource(b,c);a.g.compileShader(b);if(a.g.getShaderParameter(b,F.COMPILE_STATUS))return b;throw Error(a.g.getShaderInfoLog(b));}function Ba(a){a.g.useProgram(a.l);a.g.bindVertexArray(a.u);a.g.uniformMatrix3fv(a.B,!1,a.matrix)}class Ca{constructor(a,b,c){a instanceof WebGL2RenderingContext?this.g=a:this.g=za(a);a="#version 300 es\nprecision mediump float;\nout vec4 fragColor;\n"+c;c=this.g.createProgram();this.g.attachShader(c,Aa(this,F.VERTEX_SHADER,"#version 300 es\n"+b));this.g.attachShader(c,Aa(this,F.FRAGMENT_SHADER,a));this.g.linkProgram(c);if(this.g.getProgramParameter(c,F.LINK_STATUS))b=c;else throw Error(this.g.getProgramInfoLog(c));this.l=b;this.u=this.g.createVertexArray();this.g.bindVertexArray(this.u);this.i=null;this.B=this.g.getUniformLocation(this.l,"u_matrix");this.matrix=null;this.j=0}set(a,b){this.g.bindBuffer(F.ARRAY_BUFFER,this.i);this.g.bufferData(F.ARRAY_BUFFER,a,F.DYNAMIC_DRAW);this.j=b}}class Da extends Ca{constructor(){super(G.B,"\n      layout(location = 0) in vec2 a_position;\n      layout(location = 1) in vec2 a_offset;\n      layout(location = 2) in float a_scale;\n      layout(location = 3) in vec3 a_color;\n\n      uniform mat3 u_matrix;\n\n      out vec3 v_color;\n\n      void main() {\n        gl_Position = vec4((u_matrix * vec3(a_position * a_scale + a_offset, 1)).xy, 0.5, 1.0);\n        v_color = a_color;\n      }\n      ","\n      uniform float u_light;\n\n      in vec3 v_color;\n\n      void main() {\n        fragColor = vec4(v_color.xyz * u_light, 1.0);\n      }\n    ");this.v=new Float32Array([0,1,.0375,.9625,1,1,.9625,.9625,1,0,.9625,.0375,0,0,.0375,.0375,0,1,.0375,.9625]);this.model=new Float32Array([.0375,.0375,.9625,.0375,.0375,.9625,.9625,.9625]);this.m=this.g.getUniformLocation(this.l,"u_light");this.h=this.g.createBuffer();this.g.bindBuffer(F.ARRAY_BUFFER,this.h);this.g.vertexAttribPointer(0,2,F.FLOAT,!1,0,0);this.g.enableVertexAttribArray(0);this.i=this.g.createBuffer();this.g.bindBuffer(F.ARRAY_BUFFER,this.i);this.g.vertexAttribPointer(1,2,F.SHORT,!1,8,0);this.g.vertexAttribPointer(2,1,F.UNSIGNED_BYTE,!1,8,4);this.g.vertexAttribPointer(3,3,F.UNSIGNED_BYTE,!0,8,5);this.g.vertexAttribDivisor(1,1);this.g.vertexAttribDivisor(2,1);this.g.vertexAttribDivisor(3,1);this.g.enableVertexAttribArray(1);this.g.enableVertexAttribArray(2);this.g.enableVertexAttribArray(3)}}function Ea(a,b,c,d,e){if(b||c){Ba(a);c||(d=0);var g=new Float32Array(252*b+4+512*c),k=Math.PI/64,f=0;if(b){var w=m(k),r=n(k),A=1-d,B=0;g[0]=A;g[1]=B;f=2;for(let P=1;64>P;++P){let fa=A*r-B*w;B=A*w+B*r;A=fa;g[f++]=A;g[f++]=B;g[f++]=A;g[f++]=-B}g[f++]=-1+d;g[f++]=0}if(c){b||(c=m(-k),w=n(-k),r=-1+d,A=0,B=r*w-A*c,g[f++]=B,g[f++]=-(r*c+A*w),g[f++]=-1+d,g[f++]=0);c=Math.PI;for(w=0;127>w;++w)g[f++]=n(c),g[f++]=m(c),c-=k,g[f++]=n(c)*(1-d),g[f++]=m(c)*(1-d);g[f++]=n(c);g[f++]=m(c);c-=k;g[f++]=n(c);g[f++]=m(c)}a.g.bindBuffer(F.ARRAY_BUFFER,a.h);a.g.bufferData(F.ARRAY_BUFFER,g,F.DYNAMIC_DRAW);a.g.uniform1i(a.m,b?128:e?258:0);a.g.drawArraysInstanced(F.TRIANGLE_STRIP,0,g.length>>1,a.j)}}class Fa extends Ca{constructor(a){super(a,"\n      layout(location = 0) in vec2 a_position;\n      layout(location = 1) in vec2 a_offset;\n      layout(location = 2) in float a_scale;\n      layout(location = 3) in vec4 a_color;\n\n      uniform mat3 u_matrix;\n      uniform int u_precision;\n\n      flat out vec4 v_color;\n\n      void main() {\n        gl_Position = vec4((u_matrix * vec3(a_position * a_scale + a_offset, 1)).xy, -1.0 / a_scale, 1.0);\n        if(gl_VertexID < u_precision) {\n          v_color = a_color;\n        } else {\n          v_color = vec4(a_color.xyz * 0.8, a_color.w);\n        }\n      }\n      ","\n      flat in vec4 v_color;\n\n      void main() {\n        fragColor = v_color;\n      }\n    ");this.m=this.g.getUniformLocation(this.l,"u_precision");this.h=this.g.createBuffer();this.g.bindBuffer(F.ARRAY_BUFFER,this.h);this.g.vertexAttribPointer(0,2,F.FLOAT,!1,0,0);this.g.enableVertexAttribArray(0);this.i=this.g.createBuffer();this.g.bindBuffer(F.ARRAY_BUFFER,this.i);this.g.vertexAttribPointer(1,2,F.FLOAT,!1,16,0);this.g.vertexAttribPointer(2,1,F.FLOAT,!1,16,8);this.g.vertexAttribPointer(3,4,F.UNSIGNED_BYTE,!0,16,12);this.g.vertexAttribDivisor(1,1);this.g.vertexAttribDivisor(2,1);this.g.vertexAttribDivisor(3,1);this.g.enableVertexAttribArray(1);this.g.enableVertexAttribArray(2);this.g.enableVertexAttribArray(3)}}function Ga(a){Ba(a);a.g.blendFunc(F.ONE,F.ONE_MINUS_SRC_ALPHA);a.g.depthFunc(F.LEQUAL)}function Ha(a,b,c,d,e,g,k,f,w){g/=k;k*=f;a.h.font=`700 ${g}px Ubuntu`;a.h.fillStyle=w;var r=a.h.measureText(b);f=.75*(r.actualBoundingBoxLeft+r.actualBoundingBoxRight);r=.75*(r.actualBoundingBoxAscent+r.actualBoundingBoxDescent);a.canvas.width=Math.ceil(2*f*k);a.canvas.height=Math.ceil(2*r*k);a.h.font=`700 ${g*k}px Ubuntu`;a.h.fillStyle=w;a.h.textAlign="center";a.h.textBaseline="middle";a.h.fillText(b,f*k,r*k);a.g.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0);b=a.g.createTexture();a.g.bindTexture(F.TEXTURE_2D,b);a.g.texImage2D(F.TEXTURE_2D,0,F.RGBA,a.canvas.width,a.canvas.height,0,F.RGBA,F.UNSIGNED_BYTE,a.canvas);a.g.generateMipmap(F.TEXTURE_2D);a.g.texParameteri(F.TEXTURE_2D,F.TEXTURE_MAG_FILTER,F.LINEAR);a.g.texParameteri(F.TEXTURE_2D,F.TEXTURE_MIN_FILTER,F.LINEAR_MIPMAP_LINEAR);a.g.texParameteri(F.TEXTURE_2D,F.TEXTURE_WRAP_S,F.CLAMP_TO_EDGE);a.g.texParameteri(F.TEXTURE_2D,F.TEXTURE_WRAP_T,F.CLAMP_TO_EDGE);a.g.bindBuffer(F.ARRAY_BUFFER,a.m);a.g.bufferData(F.ARRAY_BUFFER,new Float32Array([c-f,d-r,e,0,0,c+f,d-r,e,1,0,c-f,d+r,e,0,1,c+f,d+r,e,1,1]),F.DYNAMIC_DRAW);a.g.drawArrays(F.TRIANGLE_STRIP,0,4);a.g.deleteTexture(b)}class Ia extends Ca{constructor(a){super(a,"\n      layout(location = 0) in vec3 a_position;\n      layout(location = 1) in vec2 a_texcoord;\n\n      out vec2 v_texcoord;\n      \n      uniform mat3 u_matrix;\n\n      void main() {\n        gl_Position = vec4((u_matrix * vec3(a_position.xy, 1.0)).xy, a_position.z, 1.0);\n        v_texcoord = a_texcoord;\n      }\n      ","\n      in vec2 v_texcoord;\n\n      uniform sampler2D u_texture;\n\n      void main() {\n        fragColor = texture(u_texture, v_texcoord);\n      }\n    ");this.m=this.g.createBuffer();this.g.bindBuffer(F.ARRAY_BUFFER,this.m);this.g.vertexAttribPointer(0,3,F.FLOAT,!1,20,0);this.g.vertexAttribPointer(1,2,F.FLOAT,!1,20,12);this.g.enableVertexAttribArray(0);this.g.enableVertexAttribArray(1);this.canvas=y("canvas");this.h=this.canvas.getContext("2d")}}function Ja(a){a.h.innerHTML="";for(const b of a.m){const c=y("option");c.value=b[2];b[2]==H.A.url&&(c.selected=!0,c.disabled=!0,a.g=c);b[0]>=b[1]&&(c.disabled=1);const d=ma(b[2]);c.innerHTML=d[0].toUpperCase()+d.substring(1)+` (${b[0]}/${b[1]})`;a.h.appendChild(c)}a.h.onfocus=function(){aa("psfy_tooltip","");this.J.style.display="none"}.bind(a);a.h.onchange=async function(){this.g.disabled=!1;const b=this.g;this.g=this.h.selectedOptions[0];this.g.disabled=!0;Ka();let c;const d=new Promise(function(g){c=g}),e=new La(this.g.value,c,1);setTimeout(c,2E3);await d;0==e.K||e.A.readyState!=WebSocket.OPEN?(e.stop(),z.innerHTML="Couldn't connect, returning to previous server",this.g.disabled=!1,this.g=b,this.g.disabled=!0,setTimeout(I.l.bind(I),1E3)):Ma(e)}.bind(a);Na(a)}function Oa(){var a=J;Ja(a);a.H=setInterval(function(){fetch("servers.json").then(b=>b.json()).then(function(b){J.m=b;Ja(J)})},5E3)}function Pa(){J.j.style.display="block"}function Qa(){var a=J;const b=y("h5");b.id="ID_spec_help";b.innerHTML=a.R;setTimeout(function(){b.style.opacity=0},3E3);b.addEventListener("transitionend",a.G.bind(a));document.body.insertBefore(b,J.j);a.i=b}function Na(a){void 0==l("psfy_tooltip")&&(a.S.innerHTML="We picked a server<br>for you automatically.<br><br>You can change it here.",a.J.style.display="table")}class Ra{constructor(){this.j=x("ID_menu");this.name=x("ID_name");this.h=x("ID_select_serv");this.g=null;this.m=window.s;this.J=x("ID_picked_server_for_you");this.S=x("ID_picked_server_for_you_tooltip");this.v=x("ID_ping");this.P();this.B=x("ID_play");this.u=x("ID_spec");this.i=null;this.R="";this.l();this.F=x("ID_spectating");this.C=x("ID_refresh");var a=x("ID_spec_help");a.parentElement.removeChild(a);this.C.onclick=location.reload.bind(location);this.name.onkeypress=this.name.onpaste=na(16);this.name.onchange=function(){I.i=!1;aa("name",this.value)};this.H=-1;a=l("name");"string"==typeof a&&16>=(new TextEncoder).encode(a).length&&(this.name.value=a);this.B.onclick=function(){var b=K;Sa(b);b.g[0]=0;b.h=1;L(H)};this.u.onclick=function(){Ta(0);L(H)}}l(){this.R=`Press ${t.spec_prev} or ${t.spec_next} to switch between players<br><br>Type "/menu" in chat to return to the main menu`}G(){null!=this.i&&(this.i.parentElement.removeChild(this.i),this.i=null)}P(){this.v.style.display=v.show_ping?"block":"none"}}function L(a){a.A.send(K.g.subarray(0,K.h))}function Ma(a){var b=H;null!=b.A&&(b.stop(),b.once=!1,b.i=!1,b.g=[0,0]);b.I=a.I;b.L=a.L;b.D=a.D;b.o=a.o;b.A=a.A;b.A.onmessage=function({data:c}){try{this.message({data:c})}catch(d){console.log(d),console.log(Array.from(new Uint8Array(c)).map(e=>e.toString(16).padStart(2,"0")).join(" "))}}.bind(b);b.A.onclose=b.close.bind(b);Ua();L(b);b.h()}function Va(a){a.I[a.o]=(new Date).getTime()-a.L;a.D=0;let b=a.o,c=0;for(let d=0;10>d;++d)0!=a.I[b]&&(a.D+=(10-c)/11*a.I[b],++c),b=(b+1)%10;0!=c&&(a.D/=.5*c);a.o=(a.o+1)%10;setTimeout(a.j.bind(a),10)}class Wa{constructor(){this.A=null;this.i=this.once=!1;this.I=Array(10).fill(0);this.o=this.D=this.L=0;this.g=[0,0]}h(){this.once=!0;M.clear();N.g=!1;O.clear();Q.clear();G.clear();R.clear();S.clear();I.clear()}message({data:a}){K.set(new Uint8Array(a));if(0==K.h)Va(this);else{var b=T()-1;a=!1;b!=I.id&&(I.id=b,a=!0);b=T();var c=b&1;c&&!I.h?(I.h=!0,J.j.style.display="none",Qa(),J.F.style.display="block"):!c&&I.h&&(I.h=!1,Pa(),J.G(),J.F.style.display="none",S.m=!1);(c=b&2)&&!I.g?(I.g=!0,J.j.style.display="none"):!c&&I.g&&(I.g=!1,Pa(),S.m=!1);J.u.disabled=b&4;this.g[0]=this.g[1];this.g[1]=performance.now();b=O;c=b.h;for(var d=0;c;++d)void 0!=b.g[d]&&(b.g[d].x1=b.g[d].x2,b.g[d].y1=b.g[d].y2,b.g[d].r1=b.g[d].r2,--c);b=Q;c=b.h;for(d=0;c;++d)void 0!=b.g[d]&&(b.g[d].x1=b.g[d].x2,b.g[d].y1=b.g[d].y2,b.g[d].r1=b.g[d].r2,--c);Xa(N);for(b=!1;K.o<K.h;)switch(T()){case 0:b=!0;Q.clear();c=R;c.j=T();d=T();var e=T(),g=T();c.i=Array(T());for(var k=0;k<c.i.length;++k)c.i[k]=[(T()+.5)*g,(T()+.5)*g,T()];var f=k=0;for(var w=0;w<d;++w){var r=0;for(var A=0;A<e;++A){var B=K.g[K.o];2!=B&&(D.setInt16(k,f,!0),k+=2,D.setInt16(k,r,!0),k+=2,D.setUint8(k++,g),D.setUint8(k++,oa[B]>>16),D.setUint8(k++,oa[B]>>8),D.setUint8(k++,oa[B]));++K.o;r+=g}f+=g}c.h.set(wa.slice(0,k),k>>3);c.width=d*g;c.height=e*g;c.g=g;break;case 1:c=O;d=T();for(e=0;e<d;++e)if(g=T(),void 0==c.g[g]){k=U();f=U();w=U();r=T();r=Ya(r);A=T();B=0;A&&(B=T());const P=T();0<P&&V(M,r,Ya(P));c.g[g]={x:0,y:0,r:0,x1:k,x2:k,y1:f,y2:f,r1:w,r2:w,name:r,M:A,N:B,O:0,T:!0};I.id==g&&(g=N,g.g||(g.x2=k,g.y2=f));++c.h}else if(k=T(),0==k)delete c.g[g]&&--c.h;else{do{switch(k){case 1:c.g[g].x2=U();I.id==g&&(k=N,k.g||(k.x2=c.g[g].x2));break;case 2:c.g[g].y2=U();I.id==g&&(k=N,k.g||(k.y2=c.g[g].y2));break;case 3:c.g[g].r2=U();break;case 4:c.g[g].M=T();c.g[g].M&&(c.g[g].N=T());break;case 5:k=T();V(M,c.g[g].name,Ya(k));break;default:throw Error();}k=T()}while(k)}break;case 2:c=Q;d=Za();for(e=0;e<d;++e)if(g=Za(),void 0==c.g[g])k=T()-1,f=U(),w=U(),r=U(),c.g[g]={type:k,x:0,y:0,r:0,x1:f,x2:f,y1:w,y2:w,r1:r,r2:r,T:!1},++c.h;else if(k=T(),0==k)delete c.g[g]&&--c.h;else{do{switch(k){case 1:c.g[g].x2=U();break;case 2:c.g[g].y2=U();break;case 3:c.g[g].r2=U();break;default:throw Error();}k=T()}while(k)}break;case 3:c=M;d=T();for(e=0;e<d;++e)k=T(),g=(new TextDecoder).decode(K.g.subarray(K.o,K.o+k)),K.o+=k,k=T(),V(c,g,(new TextDecoder).decode(K.g.subarray(K.o,K.o+k))),K.o+=k;break;default:throw Error();}if(K.o>K.h)throw Error();if(-1==I.id)a=N,b=.5*R.height,a.g||(a.x2=.5*R.width,a.y2=b),Xa(a);else if(a||b)a=N,c=O.g[I.id].y2,a.g||(a.x2=O.g[I.id].x2,a.y2=c),b&&Xa(N);0==this.g[0]||this.i||(this.i=!0,a=G,a.v=window.requestAnimationFrame(a.F.bind(a)),I.l())}}close(a){4E3==a?($a(),z.innerHTML="Server is full"):$a()}j(){this.L=(new Date).getTime();this.A.send(new Uint8Array(0))}stop(){this.A.onopen=this.A.onmessage=this.A.onclose=null;this.A.close()}}function ab(a){a.A=new WebSocket(a.l);a.A.binaryType="arraybuffer";a.A.onopen=a.h.bind(a);a.A.onmessage=a.message.bind(a);a.A.onclose=a.close.bind(a)}class La extends Wa{constructor(a,b,c=8){super();this.K=0;this.m=c;this.u=b;this.l=a;ab(this)}h(){this.j()}message(){Va(this);++this.K==this.m&&this.u(this.A.url)}close(){ab(this)}}function Ta(a){var b=K;b.g[0]=4;b.g[1]=a;b.h=2}function Ua(){var a=K;0==ka.length?a.h=1:(a.g.set(ka),a.h=ka.length)}function T(){var a=K;return a.g[a.o++]}function Za(){var a=K;const b=a.g[a.o]|a.g[a.o+1]<<8;a.o+=2;return b}function U(){var a=K;const b=a.view.getFloat32(a.o,!0);a.o+=4;return b}function Ya(a){var b=K;const c=(new TextDecoder).decode(b.g.subarray(b.o,b.o+a));b.o+=a;return c}function Sa(a){if(!I.i){I.i=!0;a.g[0]=3;var b=J;b=(new TextEncoder).encode(b.name.value);a.g.set(b,1);a.h=b.length+1;L(H)}}class bb{constructor(){this.i=new ArrayBuffer(1048576);this.g=new Uint8Array(this.i);this.view=new DataView(this.i);this.o=this.h=0}set(a){this.g.set(a);this.h=a.length;this.o=0}clear(){this.o=this.h=0}}class cb{constructor(){this.canvas=y("canvas");this.g=this.canvas.getContext("2d");this.size=0;this.h()}h(){this.size=v.death_arrow_size.value;this.canvas.width=this.canvas.height=this.size;const a=.5*this.canvas.width,b=this.canvas.width;this.g.beginPath();this.g.moveTo(a+.45*b,a);this.g.lineTo(a-.225*b,a-.675*b/Math.sqrt(3));this.g.lineTo(a-.225*b,a+.675*b/Math.sqrt(3));this.g.closePath();this.g.fillStyle="#bbbbbbb0";this.g.fill();this.g.lineWidth=.1*a;this.g.strokeStyle="#f00";this.g.stroke()}}function db(a){void 0==l("tth_tooltip")&&(a.J.innerHTML='Try "/help"',a.C.style.display="inline-block")}function V(a,b,c,d=!1){const e=y("p");e.appendChild(document.createTextNode((d?"":b+": ")+c));a.h.insertBefore(e,a.h.firstChild);++a.i>v.max_chat_messages.value&&a.h.removeChild(a.h.lastChild)}function eb(a){a.g.value="";a.g.blur();G.j.focus()}function fb(a,b){a.v=a.g.placeholder;a.g.placeholder=b;a.g.disabled=!0;a.g.value="";G.j.focus()}function gb(){var a=M;!a.u&&v.chat_on&&(a.B.style.display="block")}class hb{constructor(){this.m=Array(5).fill(0);this.j=0;this.B=x("ID_chat");this.h=x("ID_messages");this.g=x("ID_sendmsg");this.C=x("ID_try_typing_help");this.J=x("ID_try_typing_help_tooltip");db(this);this.H=na(128);this.i=0;this.u=!1;this.v="";this.l=-1;this.g.onkeydown=function(a){a.stopPropagation();if("Enter"==a.code){a=this.g.value.trim();switch(a){case "/help":V(this,null,">",!0);V(this,null,"Available commands:",!0);V(this,null,"/clear /c => clear the chat",!0);V(this,null,"/respawn /r => tp to the first area",!0);V(this,null,"/die /d => become downed",!0);V(this,null,"/menu /m => quit the game and open the menu",!0);V(this,null,"/spectate /s => start/stop spectating",!0);V(this,null,">",!0);eb(this);aa("tth_tooltip","");this.C.style.display="none";return;case "/c":case "/clear":this.h.innerHTML="";this.i=0;eb(this);return}a=(new TextEncoder).encode(a);if(0<a.length){var b=K;Sa(b);b.g[0]=2;b.g.set(a,1);b.h=a.length+1;L(H);this.m[this.j]=(new Date).getTime();a=(this.j+1)%5;b=5E3-this.m[this.j]+this.m[a];this.j=a;0<b?(fb(this,"You are on cooldown for sending too many messages too quickly"),this.l=setTimeout(this.enable.bind(this),b)):eb(this)}}}.bind(this);this.g.onkeyup=function(a){a.stopPropagation()};this.g.onkeypress=this.g.onpaste=this.H}clear(){this.m=Array(5).fill(0);this.j=0;this.h.innerHTML="";this.i=0;this.u=!1;this.v="Press enter to chat";this.enable()}enable(){-1!=this.l&&(clearTimeout(this.l),this.l=-1);this.g.disabled=!1;this.g.placeholder=this.v}focus(){this.g.focus()}F(){for(;this.i>v.max_chat_messages.value;)this.h.removeChild(this.h.lastChild),--this.i}G(){this.h.style["font-size"]=v.chat_text_scale.value+"em"}}function Xa(a){a.x1=a.x2;a.y1=a.y2}function W(a,b,c){var d=N;d.x2=C(d.x2,a,c);d.y2=C(d.y2,b,c)}class ib{constructor(){this.y2=this.x2=this.y1=this.x1=this.y=this.x=0;this.g=!1}block(){this.g=!0}}class jb{constructor(){this.g=Array(100);this.h=0}clear(){this.g=Array(100);this.h=0}}class kb{constructor(){this.g=Array(65535);this.h=0}clear(){this.g=Array(65535);this.h=0}}function lb(){var a=mb;a.g=!0;return new Promise(function(b){a.h=function(c){a.g=!1;b(c)}})}class nb{constructor(){this.h=null;this.g=!1}}class ob{constructor(){this.i=this.g=0;this.h=null}progress(){0==this.g?v.show_tutorial&&I.g&&(this.g=1,this.i=G.i,G.i=1.75,N.block(),pb(),S.stop(),S.block()):7==++this.g&&(this.h.click(),this.g=0,G.i=this.i,N.g=!1,qb.g=!1,S.g=!1,S.start())}}function pb(){var a=qb;a.i&&(a.g=!1,rb(a));a.g=!0}function sb(a){a.l.innerHTML="";tb(a,"CHAT");a.add(a.text("Show chat"),X("chat_on",function(b){b?gb():(b=M,b.u||(b.B.style.display="none"))}));a.add(a.text("Max number of chat messages"),ub(a,"max_chat_messages","",M.F.bind(M)));a.add(a.text("Chat text scale"),ub(a,"chat_text_scale","",M.G.bind(M)));tb(a,"MENU");a.add(a.text("Show latency"),X("show_ping",J.P.bind(J)));tb(a,"GAME");vb.h=X("show_tutorial");a.add(a.text("Enable tutorial"),vb.h);tb(a,"VISUALS");a.add(a.text("Default FOV"),ub(a,"fov"));a.add(a.text("Draw balls' fill"),X("draw_ball_fill"));a.add(a.text("Draw balls' stroke"),X("draw_ball_stroke"));a.add(a.text("Draw stroke-only balls with brighter color"),X("draw_ball_stroke_bright"));a.add(a.text("Balls' stroke radius percentage"),ub(a,"ball_stroke","%"));a.add(a.text("Draw players' fill"),X("draw_player_fill"));a.add(a.text("Draw players' stroke"),X("draw_player_stroke"));a.add(a.text("Draw stroke-only players with brighter color"),X("draw_player_stroke_bright"));a.add(a.text("Players' stroke radius percentage"),ub(a,"player_stroke","%"));a.add(a.text("Draw players' name"),X("draw_player_name"));a.add(a.text("Draw an arrow towards dead players"),X("draw_death_arrow"));a.add(a.text("Death arrow size"),ub(a,"death_arrow_size","px",wb.h.bind(wb)));tb(a,"KEYBINDS");xb(a,yb("h5","To change, click a button on the right side and then press the key you want to assign to it."));a.add(a.text("Settings"),Y("settings"));a.add(a.text("Move up"),Y("up"));a.add(a.text("Move left"),Y("left"));a.add(a.text("Move down"),Y("down"));a.add(a.text("Move right"),Y("right"));a.add(a.text("Move slowly"),Y("slowwalk"));a.add(a.text("Spectate the previous player"),Y("spec_prev",J.l.bind(J)));a.add(a.text("Spectate the next player"),Y("spec_next",J.l.bind(J)));tb(a,"RESET");a.add(a.text("Reset settings"),a.button("RESET",function(){v=JSON.parse(JSON.stringify(u));ia();sb(this)}.bind(a)));a.add(a.text("Reset keybinds"),a.button("RESET",function(){t=JSON.parse(JSON.stringify(da));ea();sb(this)}.bind(a)));a.add(a.text("Reset all tooltips"),a.button("RESET",function(){ba("psfy_tooltip");Na(J);ba("tth_tooltip");db(M)}));a.end()}function rb(a){a.g||(a.i=!1,a.j.style.display="none",S.g=!1,S.start())}function xb(a,b){a.l.appendChild(b)}function tb(a,b){a.end();xb(a,yb("h1",b));a.h=y("table")}function yb(a,b){a=y(a);a.innerHTML=b;return a}function X(a,b=function(){}){const c=y("button");v[a]=!v[a];let d=!0;c.onclick=function(){v[a]=!v[a];1==v[a]?(c.innerHTML="ON",c.style["background-color"]="#23c552"):(c.innerHTML="OFF",c.style["background-color"]="#f84f31");ia();d?d=!1:b(v[a])};c.onclick();return c}function Y(a,b=function(){}){const c=y("button");c.innerHTML=t[a];c.onclick=async function(){c.innerHTML="...";const d=await lb();c.innerHTML=d;t[a]=d;ea();b()};c.style.color="#000";return c}function ub(a,b,c="",d=function(){}){const e=y("div");e.className="input";const g=y("input");g.type="range";g.min=v[b].min;g.max=v[b].max;g.step=v[b].step;g.value=v[b].value;g.oninput=function(){g.nextElementSibling.innerHTML=g.value+c;v[b].value=g.valueAsNumber;d()};g.onchange=ia;e.appendChild(g);e.appendChild(a.text(g.value+c));return e}class zb{constructor(){this.j=x("ID_settings_container");this.l=x("ID_settings");this.g=this.i=!1;this.h=null;sb(this)}add(a,b){const c=y("tr");let d=y("td");d.appendChild(a);c.appendChild(d);d=y("td");d.appendChild(b);b.onchange=ia;c.appendChild(d);this.h.appendChild(c)}end(){null!=this.h&&(xb(this,this.h),this.h=null)}text(a){return yb("h3",a)}button(a,b){const c=y("button");c.innerHTML=a;c.onclick=b;return c}}class Ab{constructor(){this.B=za("ID_canvas");this.j=x("ID_text");this.h=this.j.getContext("2d");this.u=new Fa(this.B);this.l=new Ia(this.B);this.i=this.g=v.fov.value;this.v=-1;this.C=this.m=0;this.j.onwheel=this.H.bind(this);this.j.onmousedown=this.G.bind(this)}clear(){this.i=this.g=v.fov.value;cancelAnimationFrame(this.v);this.v=-1;this.C=this.m=0}H(a){a=.05*-Math.sign(a.deltaY);this.i=1<this.i?this.i+3*a:this.i+a;this.i=q(p(this.i,v.fov.min),v.fov.max)}G(){S.m=!S.m;Z(S)}text(a,b,c){this.h.font="700 20px Ubuntu";this.h.textAlign="center";this.h.textBaseline="middle";this.h.fillStyle="#fff";this.h.strokeStyle="#333";this.h.lineWidth=1;this.h.fillText(a,b,c);this.h.strokeText(a,b,c)}F(a){this.m=q(p(this.m,H.g[0]),H.g[1]);var b=this.g;this.g=C(this.g,this.i,.1);this.g!=b&&Z(S);b=H.g[0]==H.g[1]?1:(this.m-H.g[0])/(H.g[1]-H.g[0]);this.m+=a-this.C;this.C=a;v.show_ping&&(J.v.innerHTML=H.D.toFixed(1)+"ms");N.x=C(N.x1,N.x2,b);N.y=C(N.y1,N.y2,b);a=new DOMMatrix;this.h.setTransform(a);this.h.clearRect(0,0,this.j.width,this.j.height);a=a.translate(.5*E.width,.5*E.height).scale(this.g,this.g).translate(-N.x,-N.y);this.h.setTransform(a);a=this.B;a.canvas.width!=E.width&&(a.canvas.width=E.width);a.canvas.height!=E.height&&(a.canvas.height=E.height);a.viewport(0,0,a.canvas.width,a.canvas.height);a.clearColor(.2,.2,.2,1);a.clear(F.COLOR_BUFFER_BIT|F.DEPTH_BUFFER_BIT);a.enable(F.DEPTH_TEST);a.enable(F.BLEND);a.blendFunc(F.SRC_ALPHA,F.ONE_MINUS_SRC_ALPHA);a=R;a.h.matrix=new ya;var c=a.h.matrix.translate(.5*E.width,.5*E.height),d=G.g;xa(c,new Float32Array([d,0,0,0,d,0,0,0,1])).translate(-N.x,-N.y);c=a.h;Ba(c);c.g.uniform1f(c.m,.8);c.g.bindBuffer(F.ARRAY_BUFFER,c.h);c.g.bufferData(F.ARRAY_BUFFER,c.v,F.DYNAMIC_DRAW);c.g.drawArraysInstanced(F.TRIANGLE_STRIP,0,10,c.j);c.g.uniform1f(c.m,1);c.g.bindBuffer(F.ARRAY_BUFFER,c.h);c.g.bufferData(F.ARRAY_BUFFER,c.model,F.DYNAMIC_DRAW);c.g.drawArraysInstanced(F.TRIANGLE_STRIP,0,4,c.j);G.l.matrix=a.h.matrix;Ga(G.l);c=a.g/1.75|0;d=pa[3];d="#"+(.8*parseInt(d.substring(1,3),16)>>0).toString(16).padStart(2,"0")+(.8*parseInt(d.substring(3,5),16)>>0).toString(16).padStart(2,"0")+(.8*parseInt(d.substring(5,7),16)>>0).toString(16).padStart(2,"0")+d.substring(7);for(var e of a.i)Ha(G.l,e[2],e[0],e[1],.5,c,1,4,d);this.u.matrix=R.h.matrix;a=0;e=Q.h;for(c=0;e;++c)d=Q.g[c],void 0!=d&&(--e,d.x=C(d.x1,d.x2,b),D.setFloat32(a,d.x,!0),a+=4,d.y=C(d.y1,d.y2,b),D.setFloat32(a,d.y,!0),a+=4,d.r=C(d.r1,d.r2,b),D.setFloat32(a,d.r,!0),a+=4,D.setUint32(a,va[d.type]),a+=4);this.u.set(wa.slice(0,a),a>>4);Ea(this.u,v.draw_ball_fill,v.draw_ball_stroke,v.ball_stroke.value/100,v.draw_ball_stroke_bright);a=0;e=O.h;for(c=0;e;++c)d=O.g[c],void 0!=d&&(--e,d.x=C(d.x1,d.x2,b),D.setFloat32(a,d.x,!0),a+=4,d.y=C(d.y1,d.y2,b),D.setFloat32(a,d.y,!0),a+=4,d.r=C(d.r1,d.r2,b),D.setFloat32(a,d.r,!0),a+=4,D.setUint32(a,3958108415),a+=4);this.u.set(wa.slice(0,a),a>>4);Ea(this.u,v.draw_player_fill,v.draw_player_stroke,v.player_stroke.value/100,v.draw_player_stroke_bright);this.l.matrix=R.h.matrix;Ga(this.l);e=O.h;for(a=0;e;++a)if(c=O.g[a],void 0!=c&&(--e,v.draw_player_name&&0!=c.name.length&&(c.O=C(c.O,1<this.g?.5*c.r:.5*c.r+2/(this.g*this.g),.1),Ha(this.l,c.name,c.x,c.y-c.r-c.O,-1/c.r,c.r,this.g,4,"#00000080")),c.M&&(Ha(this.l,c.N,c.x,c.y,-1/c.r,c.r,q(this.g,1),4*p(this.g,1),"#f00"),v.draw_death_arrow))){var g=void 0,k=void 0;g=.75*wb.size;g*=G.g;k=.5*E.width+(c.x-N.x)*G.g;const w=.5*E.height+(c.y-N.y)*G.g;d=!1;if(0>k||k>E.width-0)d=!0,k=p(q(k,E.width-g),g);0>w||w>E.height-0?(d=!0,g=p(q(w,E.height-g),g)):g=w;const [r,A,B]=[(k-.5*E.width)/G.g+N.x,(g-.5*E.height)/G.g+N.y,d];B&&(this.h.translate(r,A),g=Math.atan2(c.y-A,c.x-r),this.h.rotate(g),d=wb,this.h.drawImage(d.canvas,.5*-d.size,.5*-d.size),this.h.rotate(-g),this.h.font=`700 ${.3*wb.size}px Ubuntu`,this.h.fillText(c.N,0,0),this.h.translate(-r,-A))}this.l.g.depthFunc(F.LESS);switch(vb.g){case 0:v.show_tutorial&&0==R.j&&G.text("Need help? Press KeyT for a tutorial.",.5*R.width,2.5*R.g);break;case 1:W(O.g[I.id].x2,O.g[I.id].y2,.2*b);G.text("<-- Your character",N.x+110,N.y);G.text("Your character --\x3e",N.x-110,N.y);G.text("This is your character. You can control it with these keys:",N.x,N.y-220);G.text(`${t.up}: up`,N.x,N.y-170);G.text(`${t.left}: left`,N.x,N.y-130);G.text(`${t.down}: down`,N.x,N.y-90);G.text(`${t.right}: right`,N.x,N.y-50);G.text("You can also control it with mouse. Just",N.x,N.y+50);G.text("press any mouse button to start or stop moving.",N.x,N.y+70);G.text("Scroll to change your field of view.",N.x,N.y+110);G.text("Note that you won't be able to perform some",N.x,N.y+150);G.text("of the above actions until the tutorial ends.",N.x,N.y+170);G.text("Press KeyT to continue",N.x,N.y+220);break;case 2:var f=.5*R.width-6*R.g;e=.5*R.height;W(f,e,.2*b);G.text("--\x3e",f+2*R.g,e-1*R.g);G.text("--\x3e",f+2*R.g,e);G.text("--\x3e",f+2*R.g,e+1*R.g);G.text("<--",f-2*R.g,e-2*R.g);G.text("<--",f-3*R.g,e-1*R.g);G.text("<--",f-4*R.g,e);G.text("<--",f-3*R.g,e+1*R.g);G.text("<--",f-2*R.g,e+2*R.g);G.text("These are safezones. Enemies can't",f,e-130);G.text("reach you inside of these tiles.",f,e-110);G.text("Press KeyT to continue",f,e+110);break;case 3:f=.5*R.width+6*R.g;e=.5*R.height;W(f,e,.2*b);G.text("<--",f-2*R.g,e-2*R.g);G.text("<--",f-1*R.g,e-3*R.g);G.text("<--",f,e-4*R.g);G.text("<--",f-2*R.g,e+2*R.g);G.text("<--",f-1*R.g,e+3*R.g);G.text("<--",f,e+4*R.g);G.text("--\x3e",f+2*R.g,e-3*R.g);G.text("--\x3e",f+2*R.g,e+3*R.g);G.text("<--",f+5*R.g,e-2*R.g);G.text("<--",f+6*R.g,e-1*R.g);G.text("<--",f+7*R.g,e);G.text("<--",f+6*R.g,e+1*R.g);G.text("<--",f+5*R.g,e+2*R.g);G.text("These are walls. Players can't walk over them.",f,e-40);G.text("However, some types (colors) of enemies can.",f,e-10);G.text("Press KeyT to continue",f,e+40);break;case 4:f=.5*R.g;e=.5*R.height;W(f,e,.2*b);G.text("--\x3e",f,e);G.text("This is a teleport tile. If you walk on it,",f,e-130);G.text("you will be teleported to the area it points to.",f,e-110);G.text("Minimap is not yet implemented, but once it is, you",f,e-70);G.text("will be able to see where any area is located at.",f,e-50);G.text("If a teleport doesn't have a number on it, it doesn't point",f,e+50);G.text("anywhere (perhaps because the next area is under construction).",f,e+70);G.text("Press KeyT to continue",f,e+120);break;case 5:for(e=0;65535>e;++e)if(Q.g[e]){f=Q.g[e];break}e=f.x2;f=f.y2;W(e,f,.2*b);G.text("Enemy ball --\x3e",e-110,f);G.text("<-- Enemy ball",e+110,f);G.text("This is an enemy, also simply called a ball. A grey ball",e,f-110);G.text("doesn't do a lot - it simply moves in one direction. However,",e,f-90);G.text("as you are about to find out when you start exploring the game,",e,f-70);G.text("there are lots of types of enemies, each having their own color.",e,f-50);G.text("Coming in contact with an enemy downs you. While downed, you can't move,",e,f+50);G.text("and after a while, you die, unless other players revive you by touching you.",e,f+70);G.text("Press KeyT to continue",e,f+120);break;case 6:f=O.g[I.id].x2,e=O.g[I.id].y2,W(f,e,.2*b),G.text(`You can press ${t.settings} to open settings.`,f,e-80),G.text("There are a lot of cool options to change. Try it out later.",f,e-60),G.text("That's it for this tutorial. See how far you can go!",f,e+60),G.text("GLHF!",f,e+80),G.text("Press KeyT to end the tutorial",f,e+130)}this.v=window.requestAnimationFrame(this.F.bind(this))}}class Bb{constructor(){this.h=new Da;this.g=this.height=this.width=0;this.i=[];this.j=-1}clear(){this.j=-1}}class Cb{constructor(){this.height=this.width=this.h=this.i=this.g=0;this.j=[0,0];window.onresize=this.l.bind(this);window.onkeyup=this.v.bind(this);window.onkeydown=this.u.bind(this);window.onmousemove=this.B.bind(this);window.onbeforeunload=this.m.bind(this)}l(){if(window.devicePixelRatio!=this.g||window.innerWidth!=this.i||window.innerHeight!=this.h){this.g=window.devicePixelRatio;this.i=window.innerWidth;this.h=window.innerHeight;this.width=this.i*this.g;this.height=this.h*this.g;var a=G;a.j.width!=E.width&&(a.j.width=E.width);a.j.height!=E.height&&(a.j.height=E.height)}}u(a){if(!a.repeat)if(mb.g)a.preventDefault(),mb.h(a.code);else if(a.code==t.settings)qb.i?rb(qb):(a=qb,a.g||(a.i=!0,a.j.style.display="block",S.stop(),S.block()));else{if(I.h)switch(a.code){case t.spec_prev:Ta(-1);L(H);break;case t.spec_next:Ta(1),L(H)}switch(a.code){case "Enter":M.focus(a);break;case t.up:S.v||(S.v=1,Z(S));break;case t.down:S.l||(S.l=1,Z(S));break;case t.left:S.i||(S.i=1,Z(S));break;case t.right:S.j||(S.j=1,Z(S));break;case t.slowwalk:1==S.u&&(Db(.5),Z(S));break;case "KeyT":vb.progress()}}}v(a){if(!a.repeat)switch(a.code){case t.up:S.v&&(S.v=0,Z(S));break;case t.down:S.l&&(S.l=0,Z(S));break;case t.left:S.i&&(S.i=0,Z(S));break;case t.right:S.j&&(S.j=0,Z(S));break;case t.slowwalk:.5==S.u&&(Db(1),Z(S))}}B(a){this.j=[a.clientX*this.g,a.clientY*this.g];Z(S)}m(a){if(I.g)return a.preventDefault(),a.returnValue="Are you sure you want to quit?"}}function Z(a){if(I.g&&!a.g){a=K;let c=0;var b=0;if(S.m){b=E.j[0]-.5*E.width;const d=E.j[1]-.5*E.height;c=Math.atan2(d,b);b=Math.hypot(b,d)/G.g}else if(S.v!=S.l||S.i!=S.j)c=Math.atan2(S.l-S.v,S.j-S.i),b=160*E.g;a.g[0]=1;a.view.setFloat32(1,c,!0);a.g[5]=b>=160*E.g?255*S.h:1.59375*b/E.g*S.h;a.h=6;L(H)}}function Db(a){var b=S;b.g||(b.h=a);b.u=a}class Eb{constructor(){this.m=!1;this.h=this.u=1;this.g=!1;this.j=this.i=this.l=this.v=0}clear(){this.m=this.g=!1;this.h=this.u=1}block(){this.g=!0}stop(){this.g||(this.u=this.h,this.h=0,Z(this))}start(){this.g||(this.h=this.u,Z(this))}}function Ka(){var a=I;z.innerHTML="Connecting";a.j?(Pa(),J.name.style.display="none",gb(),fb(M,"Waiting for connection..."),pb()):a.j=!0}function $a(){I.g=!1;z.innerHTML="Disconnected";Pa();var a=J;H.once||la();a.name.style.display="none";a.B.style.display="none";a.u.style.display="none";a.C.style.display="block";clearInterval(a.H);pb()}class Fb{constructor(){this.i=this.h=this.g=!1;this.id=-1;this.j=!1}clear(){this.i=this.h=this.g=!1;this.id=-1}l(){Pa();J.name.style.display="block";z.innerHTML="";gb();M.enable();qb.g=!1}}const J=new Ra,H=new Wa,K=new bb,wb=new cb,M=new hb,N=new ib,O=new jb,Q=new kb,mb=new nb,vb=new ob,qb=new zb,G=new Ab,R=new Bb,E=new Cb,S=new Eb,I=new Fb;E.l();(async function(){Ka();let a;var b=new Promise(function(e){a=e});const c=[];for(const [,,e]of J.m)c[c.length]=new La(e,a);setTimeout(a,2E3,"");b=await b;let d;if(0==b.length){b=0;for(const e of c)e.A.readyState==WebSocket.OPEN&&e.K>b&&(b=e.K,d=e.A.url)}else d=b;if(void 0==d)throw z.innerHTML="Couldn't connect to any server",la(),Error(z.innerHTML);for(const e of c)e.A.url!=d?e.stop():Ma(e);Oa()})();