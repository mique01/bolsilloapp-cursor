(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[626],{40874:function(e,r,t){Promise.resolve().then(t.bind(t,84454))},75733:function(e,r,t){"use strict";t.d(r,{Z:function(){return n}});/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,t(78030).Z)("Eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},4086:function(e,r,t){"use strict";t.d(r,{Z:function(){return n}});/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,t(78030).Z)("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]])},16463:function(e,r,t){"use strict";var n=t(71169);t.o(n,"usePathname")&&t.d(r,{usePathname:function(){return n.usePathname}}),t.o(n,"useRouter")&&t.d(r,{useRouter:function(){return n.useRouter}}),t.o(n,"useSearchParams")&&t.d(r,{useSearchParams:function(){return n.useSearchParams}})},84454:function(e,r,t){"use strict";t.r(r),t.d(r,{default:function(){return g}});var n=t(57437),a=t(2265),s=t(16463),o=t(87138),i=t(8721),l=t(4086),c=t(78030);/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let u=(0,c.Z)("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]),d=(0,c.Z)("EyeOff",[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);var m=t(75733);function g(){let e=(0,s.useRouter)(),{signIn:r,signUp:t}=(0,i.K)(),[c,g]=(0,a.useState)(""),[h,p]=(0,a.useState)(""),[f,x]=(0,a.useState)(""),[y,w]=(0,a.useState)(!1),[b,v]=(0,a.useState)(!1),[j,k]=(0,a.useState)(null),[S,N]=(0,a.useState)(null),[E,U]=(0,a.useState)(!1),C=async n=>{n.preventDefault(),k(null),N(null),v(!0);try{if(y){if(h!==f){k("Las contrase\xf1as no coinciden"),v(!1);return}let e=await t(c,h);if(e)throw Error(e.message);N("Cuenta creada con \xe9xito. Por favor, verifica tu correo electr\xf3nico para activar tu cuenta."),w(!1)}else{let t=await r(c,h);if(t)throw Error(t.message);e.push("/dashboard")}}catch(e){k(e instanceof Error?e.message:"Ocurri\xf3 un error. Por favor, int\xe9ntalo de nuevo.")}finally{v(!1)}};return(0,n.jsx)("div",{className:"min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8",children:(0,n.jsxs)("div",{className:"max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-lg",children:[(0,n.jsxs)("div",{className:"text-center",children:[(0,n.jsx)("h1",{className:"text-3xl font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent",children:y?"Crear Cuenta":"Iniciar Sesi\xf3n"}),(0,n.jsx)("p",{className:"mt-2 text-gray-400",children:y?"Crea una cuenta para empezar a gestionar tus finanzas":"Inicia sesi\xf3n para acceder a tu cuenta"})]}),j&&(0,n.jsx)("div",{className:"bg-red-900/40 border border-red-500 text-red-400 px-4 py-3 rounded-md",children:j}),S&&(0,n.jsx)("div",{className:"bg-green-900/40 border border-green-500 text-green-400 px-4 py-3 rounded-md",children:S}),(0,n.jsxs)("form",{className:"mt-8 space-y-6",onSubmit:C,children:[(0,n.jsxs)("div",{className:"space-y-4",children:[(0,n.jsxs)("div",{children:[(0,n.jsx)("label",{htmlFor:"email",className:"block text-sm font-medium text-gray-300",children:"Correo electr\xf3nico"}),(0,n.jsxs)("div",{className:"mt-1 relative",children:[(0,n.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,n.jsx)(l.Z,{className:"h-5 w-5 text-gray-500","aria-hidden":"true"})}),(0,n.jsx)("input",{id:"email",name:"email",type:"email",autoComplete:"email",required:!0,value:c,onChange:e=>g(e.target.value),className:"appearance-none block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-md bg-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",placeholder:"tucorreo@ejemplo.com"})]})]}),(0,n.jsxs)("div",{children:[(0,n.jsx)("label",{htmlFor:"password",className:"block text-sm font-medium text-gray-300",children:"Contrase\xf1a"}),(0,n.jsxs)("div",{className:"mt-1 relative",children:[(0,n.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,n.jsx)(u,{className:"h-5 w-5 text-gray-500","aria-hidden":"true"})}),(0,n.jsx)("input",{id:"password",name:"password",type:E?"text":"password",autoComplete:y?"new-password":"current-password",required:!0,value:h,onChange:e=>p(e.target.value),className:"appearance-none block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-md bg-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",placeholder:"••••••••"}),(0,n.jsx)("div",{className:"absolute inset-y-0 right-0 pr-3 flex items-center",children:(0,n.jsx)("button",{type:"button",onClick:()=>{U(!E)},className:"text-gray-500 hover:text-gray-400 focus:outline-none",children:E?(0,n.jsx)(d,{className:"h-5 w-5","aria-hidden":"true"}):(0,n.jsx)(m.Z,{className:"h-5 w-5","aria-hidden":"true"})})})]})]}),y&&(0,n.jsxs)("div",{children:[(0,n.jsx)("label",{htmlFor:"confirmPassword",className:"block text-sm font-medium text-gray-300",children:"Confirmar contrase\xf1a"}),(0,n.jsxs)("div",{className:"mt-1 relative",children:[(0,n.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,n.jsx)(u,{className:"h-5 w-5 text-gray-500","aria-hidden":"true"})}),(0,n.jsx)("input",{id:"confirmPassword",name:"confirmPassword",type:E?"text":"password",autoComplete:"new-password",required:y,value:f,onChange:e=>x(e.target.value),className:"appearance-none block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-md bg-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",placeholder:"••••••••"})]})]})]}),!y&&(0,n.jsx)("div",{className:"flex items-center justify-end",children:(0,n.jsx)("div",{className:"text-sm",children:(0,n.jsx)(o.default,{href:"/reset-password",className:"text-indigo-400 hover:text-indigo-300 transition-colors",children:"\xbfOlvidaste tu contrase\xf1a?"})})}),(0,n.jsx)("div",{children:(0,n.jsx)("button",{type:"submit",disabled:b,className:"w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ".concat(b?"bg-indigo-700 cursor-not-allowed":"bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600"," focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"),children:b?(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)("svg",{className:"animate-spin -ml-1 mr-3 h-5 w-5 text-white",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",children:[(0,n.jsx)("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),(0,n.jsx)("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),y?"Creando cuenta...":"Iniciando sesi\xf3n..."]}):y?"Crear cuenta":"Iniciar sesi\xf3n"})})]}),(0,n.jsx)("div",{className:"mt-6 text-center",children:(0,n.jsx)("button",{onClick:()=>{w(!y),k(null),N(null)},className:"text-sm text-indigo-400 hover:text-indigo-300 transition-colors",children:y?"\xbfYa tienes una cuenta? Inicia sesi\xf3n":"\xbfNo tienes una cuenta? Reg\xedstrate"})})]})})}},8721:function(e,r,t){"use strict";t.d(r,{B:function(){return u},K:function(){return d}});var n=t(57437),a=t(2265),s=t(84593),o=t(25566);let i=null,l=i=(()=>{var e,r;let t=null==o?void 0:null===(e=o.env)||void 0===e?void 0:"",n=null==o?void 0:null===(r=o.env)||void 0===r?void 0:"";return t&&n?(0,s.eI)(t,n):(console.warn("Supabase URL or Anonymous Key is missing. Using mock client for development."),{auth:{signUp:async e=>{let{email:r,password:t}=e;return console.warn("Using mock Supabase client - signUp"),{data:null,error:Error("Mock client - signUp not implemented")}},signIn:async e=>{let{email:r,password:t}=e;return console.warn("Using mock Supabase client - signIn"),{data:null,error:Error("Mock client - signIn not implemented")}},signInWithPassword:async e=>{let{email:r,password:t}=e;return console.warn("Using mock Supabase client - signInWithPassword"),{data:null,error:Error("Mock client - signInWithPassword not implemented")}},signOut:async()=>(console.warn("Using mock Supabase client - signOut"),{error:null}),onAuthStateChange:e=>(console.warn("Using mock Supabase client - onAuthStateChange"),{data:{subscription:{unsubscribe:()=>{}}}}),getSession:async()=>(console.warn("Using mock Supabase client - getSession"),{data:{session:null},error:null}),getUser:async()=>(console.warn("Using mock Supabase client - getUser"),{data:{user:null},error:null}),resetPasswordForEmail:async e=>(console.warn("Using mock Supabase client - resetPasswordForEmail"),{data:null,error:Error("Mock client - resetPasswordForEmail not implemented")}),updateUser:async e=>{let{password:r}=e;return console.warn("Using mock Supabase client - updateUser"),{data:null,error:Error("Mock client - updateUser not implemented")}}},from:e=>{let r=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return{eq:()=>r(),neq:()=>r(),gt:()=>r(),lt:()=>r(),gte:()=>r(),lte:()=>r(),like:()=>r(),ilike:()=>r(),is:()=>r(),in:()=>r(),contains:()=>r(),containedBy:()=>r(),rangeGt:()=>r(),rangeLt:()=>r(),rangeGte:()=>r(),rangeLte:()=>r(),textSearch:()=>r(),filter:()=>r(),not:()=>r(),or:()=>r(),and:()=>r(),order:()=>r(),limit:()=>r(),range:()=>r(),single:()=>({data:null,error:null}),maybeSingle:()=>({data:null,error:null}),select:()=>r(),then:()=>Promise.resolve({data:e,error:t})}};return{select:e=>r([]),insert:e=>r([]),update:e=>r([]),delete:()=>r([]),upsert:e=>r([])}},storage:{from:e=>({upload:async(e,r)=>(console.warn("Using mock Supabase client - storage.upload"),{data:null,error:null}),getPublicUrl:e=>(console.warn("Using mock Supabase client - storage.getPublicUrl"),{data:{publicUrl:""}}),download:async e=>(console.warn("Using mock Supabase client - storage.download"),{data:null,error:null}),list:async(e,r)=>(console.warn("Using mock Supabase client - storage.list"),{data:[],error:null}),remove:async e=>(console.warn("Using mock Supabase client - storage.remove"),{data:{path:Array.isArray(e)?e:[e]},error:null})})}})})(),c=(0,a.createContext)(void 0);function u(e){let{children:r}=e,[t,s]=(0,a.useState)(null),[o,i]=(0,a.useState)(null),[u,d]=(0,a.useState)(!0),[m,g]=(0,a.useState)(null);(0,a.useEffect)(()=>{(async()=>{try{var e;d(!0);let{data:r}=await l.auth.getSession();i(r.session),s((null===(e=r.session)||void 0===e?void 0:e.user)||null)}catch(e){g(e instanceof Error?e:Error(String(e)))}finally{d(!1)}})();let{data:e}=l.auth.onAuthStateChange((e,r)=>{i(r),s((null==r?void 0:r.user)||null),d(!1)});return()=>{e.subscription.unsubscribe()}},[]);let h=async(e,r)=>{try{d(!0);let{error:t}=await l.auth.signUp({email:e,password:r});if(t)throw t}catch(e){throw g(e instanceof Error?e:Error(String(e))),e}finally{d(!1)}},p=async(e,r)=>{try{d(!0);let{error:t}=await l.auth.signInWithPassword({email:e,password:r});if(t)throw t}catch(e){throw g(e instanceof Error?e:Error(String(e))),e}finally{d(!1)}},f=async()=>{try{d(!0);let{error:e}=await l.auth.signOut();if(e)throw e}catch(e){throw g(e instanceof Error?e:Error(String(e))),e}finally{d(!1)}},x=async e=>{try{d(!0);let{error:r}=await l.auth.resetPasswordForEmail(e);if(r)throw r}catch(e){throw g(e instanceof Error?e:Error(String(e))),e}finally{d(!1)}};return(0,n.jsx)(c.Provider,{value:{user:t,session:o,loading:u,error:m,signUp:h,signIn:p,signOut:f,resetPassword:x},children:r})}function d(){let e=(0,a.useContext)(c);if(void 0===e)throw Error("useSupabaseAuth must be used within a SupabaseAuthProvider");return e}}},function(e){e.O(0,[48,480,971,23,744],function(){return e(e.s=40874)}),_N_E=e.O()}]);