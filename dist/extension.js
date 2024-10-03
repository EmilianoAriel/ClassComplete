"use strict";var F=Object.create;var p=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var T=Object.getOwnPropertyNames;var k=Object.getPrototypeOf,b=Object.prototype.hasOwnProperty;var P=(e,s)=>{for(var n in s)p(e,n,{get:s[n],enumerable:!0})},C=(e,s,n,a)=>{if(s&&typeof s=="object"||typeof s=="function")for(let c of T(s))!b.call(e,c)&&c!==n&&p(e,c,{get:()=>s[c],enumerable:!(a=I(s,c))||a.enumerable});return e};var v=(e,s,n)=>(n=e!=null?F(k(e)):{},C(s||!e||!e.__esModule?p(n,"default",{value:e,enumerable:!0}):n,e)),j=e=>C(p({},"__esModule",{value:!0}),e);var S={};P(S,{activate:()=>D,deactivate:()=>E});module.exports=j(S);var t=v(require("vscode")),r=v(require("fs")),w=v(require("path"));async function x(e){let s=[],n=t.workspace.getConfiguration().get("fileFilter.includeHtml",!0),a=t.workspace.getConfiguration().get("fileFilter.includeJsx",!0),c=[{extension:".html",include:n},{extension:".jsx",include:a}],f=r.readdirSync(e);for(let o of f){let u=w.join(e,o);if(r.statSync(u).isDirectory()){let g=await x(u);s.push(...g)}else if(c.find(i=>o.endsWith(i.extension)&&i.include)){let i=r.readFileSync(u,"utf-8"),h=i.match(/class=["']([^"']+)["']/g)||i.match(/className=["']([^"']+)["']/g);h&&h.forEach(m=>{let l=m.replace(/class=["']/g,"").replace(/className=["']/g,"").replace(/["']/g,"").split(" ");s.push(...l)})}}return Array.from(new Set(s))}async function D(e){let s=t.workspace.workspaceFolders;if(!s){console.error("No hay carpetas en el espacio de trabajo.");return}let n=s[0].uri.fsPath,a=await x(n),c=t.languages.registerCompletionItemProvider({scheme:"file",language:"*"},{provideCompletionItems(d,o,u,g){let i=[];return d.lineAt(o).text.slice(0,o.character).endsWith("*")&&i.push(...a.map(m=>{let l=new t.CompletionItem(m,t.CompletionItemKind.Class);l.insertText=m;let y=new t.Range(o.translate(0,-1),o);return l.additionalTextEdits=[t.TextEdit.delete(y)],l})),i.length?i:void 0}},"*");e.subscriptions.push(c);let f=t.workspace.onDidChangeTextDocument(async d=>{let o=d.document;(o.languageId==="html"||o.languageId==="javascriptreact")&&(a=await x(n))});e.subscriptions.push(f)}function E(){}0&&(module.exports={activate,deactivate});
