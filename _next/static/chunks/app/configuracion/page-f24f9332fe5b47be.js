(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[585],{48148:function(e,t,s){Promise.resolve().then(s.bind(s,53280))},78030:function(e,t,s){"use strict";s.d(t,{Z:function(){return o}});var n=s(2265);/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),r=function(){for(var e=arguments.length,t=Array(e),s=0;s<e;s++)t[s]=arguments[s];return t.filter((e,t,s)=>!!e&&s.indexOf(e)===t).join(" ")};/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,n.forwardRef)((e,t)=>{let{color:s="currentColor",size:a=24,strokeWidth:l=2,absoluteStrokeWidth:o,className:c="",children:d,iconNode:u,...h}=e;return(0,n.createElement)("svg",{ref:t,...i,width:a,height:a,stroke:s,strokeWidth:o?24*Number(l)/Number(a):l,className:r("lucide",c),...h},[...u.map(e=>{let[t,s]=e;return(0,n.createElement)(t,s)}),...Array.isArray(d)?d:[d]])}),o=(e,t)=>{let s=(0,n.forwardRef)((s,i)=>{let{className:o,...c}=s;return(0,n.createElement)(l,{ref:i,iconNode:t,className:r("lucide-".concat(a(e)),o),...c})});return s.displayName="".concat(e),s}},59061:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(78030).Z)("Save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]])},53280:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return l}});var n=s(57437),a=s(2265);/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(78030).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);var i=s(59061);function l(){let[e,t]=(0,a.useState)({livingAlone:!0});(0,a.useEffect)(()=>{let e=localStorage.getItem("settings");if(e){let s=JSON.parse(e);t({livingAlone:void 0===s.livingAlone||s.livingAlone})}},[]);let s=(s,n)=>{let a={...e,[s]:n};t(a),localStorage.setItem("settings",JSON.stringify(a))};return(0,n.jsxs)("div",{className:"space-y-6 dark-theme",children:[(0,n.jsx)("div",{className:"flex justify-between items-center",children:(0,n.jsx)("h1",{className:"text-2xl font-bold",children:"Configuraci\xf3n"})}),(0,n.jsxs)("form",{onSubmit:t=>{t.preventDefault(),localStorage.setItem("settings",JSON.stringify(e)),alert("Configuraci\xf3n guardada correctamente")},className:"space-y-8",children:[(0,n.jsxs)("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[(0,n.jsxs)("h2",{className:"text-lg font-medium mb-4 flex items-center gap-2",children:[(0,n.jsx)(r,{size:20,className:"text-purple-400"}),(0,n.jsx)("span",{children:"Preferencias personales"})]}),(0,n.jsx)("div",{className:"space-y-4",children:(0,n.jsxs)("div",{children:[(0,n.jsxs)("label",{className:"flex items-center justify-between",children:[(0,n.jsx)("span",{className:"text-sm",children:"Vivo solo"}),(0,n.jsxs)("div",{className:"relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-gray-600 rounded-full",children:[(0,n.jsx)("input",{type:"checkbox",className:"absolute w-6 h-6 opacity-0 z-10 cursor-pointer",checked:e.livingAlone,onChange:e=>s("livingAlone",e.target.checked)}),(0,n.jsx)("div",{className:"w-6 h-6 transform transition-transform duration-200 ease-in-out bg-white rounded-full ".concat(e.livingAlone?"translate-x-6":"translate-x-0")})]})]}),(0,n.jsx)("p",{className:"text-xs text-gray-400 mt-1",children:e.livingAlone?"Gestiona tus gastos de forma individual":"Gestiona gastos e ingresos con otras personas"})]})})]}),(0,n.jsx)("div",{className:"flex justify-end",children:(0,n.jsxs)("button",{type:"submit",className:"flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",children:[(0,n.jsx)(i.Z,{size:20}),(0,n.jsx)("span",{children:"Guardar Configuraci\xf3n"})]})})]})]})}}},function(e){e.O(0,[971,23,744],function(){return e(e.s=48148)}),_N_E=e.O()}]);