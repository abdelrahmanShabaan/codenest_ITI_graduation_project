import{u as d}from"./links.37929787.js";import{r as i,a as p,g as m}from"./params.f0608262.js";import{r as _,o as r,c as n,d as f,a as h}from"./vue.runtime.esm-bundler.588d3a9f.js";import{_ as a}from"./_plugin-vue_export-helper.a6f24833.js";import"./index.c39be324.js";import"./Caret.4d98c50a.js";/* empty css                                            */import"./default-i18n.3881921e.js";import"./constants.44daa6bb.js";/* empty css                                              */import{N as w}from"./Network.eae8db1f.js";import"./TruSeoHighlighter.ed998abe.js";/* empty css                                              */const v={setup(){return{rootStore:d()}},emits:["selected-site"],mixins:[w],props:{followSelectedSite:Boolean,showNetwork:Boolean},data(){return{site:null,network:{value:"network",label:this.$t.__("Network Admin (no site)",this.$td)}}},watch:{site(t){let e=this.rootStore.aioseo.data.network.sites.sites.find(o=>this.getUniqueSiteId(o)===t.value);t.value==="network"&&(e={blog_id:"network"}),this.$emit("selected-site",e),this.followSelectedSite&&this.querySelectedSite()}},computed:{sites(){const t=this.getSites.filter(e=>!e.parentDomain).map(e=>({value:this.getUniqueSiteId(e),label:`${e.domain}${e.path}`}));return this.showNetwork?[this.network].concat(t):t}},methods:{querySelectedSite(){i("aioseo-selected-site-value"),this.site.value!=="network"&&p("aioseo-selected-site-value",this.site.value)}},created(){const t=m();if(t["aioseo-selected-site-value"])return this.site=this.sites.find(e=>e.value===decodeURIComponent(t["aioseo-selected-site-value"])),i("aioseo-selected-site-value"),!1;this.showNetwork&&(this.site=this.network)}},S={class:"aioseo-network-site-selector"};function k(t,e,o,$,s,l){const c=_("base-select");return r(),n("div",S,[f(c,{size:"medium",modelValue:s.site,"onUpdate:modelValue":e[0]||(e[0]=u=>s.site=u),options:l.sites},null,8,["modelValue","options"])])}const z=a(v,[["render",k]]),g={},x={viewBox:"0 0 24 25",fill:"none",xmlns:"http://www.w3.org/2000/svg",class:"aioseo-upload"},V=h("path",{"fill-rule":"evenodd","clip-rule":"evenodd",d:"M15 17V11H19L12 4L5 11H9V17H15ZM12 6.83L14.17 9H13V15H11V9H9.83L12 6.83ZM19 21V19H5V21H19Z",fill:"currentColor"},null,-1),y=[V];function N(t,e){return r(),n("svg",x,y)}const D=a(g,[["render",N]]);export{z as C,D as S};
