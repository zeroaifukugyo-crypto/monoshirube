import {rm,mkdir,cp,readFile,writeFile} from 'node:fs/promises';
import {validateProducts,validatePosts} from '../update-data.js';
const root=new URL('../',import.meta.url), dist=new URL('dist/',root);
const products=JSON.parse(await readFile(new URL('data/products.json',root),'utf8'));
const posts=JSON.parse(await readFile(new URL('data/posts.json',root),'utf8'));
validateProducts(products);validatePosts(posts);
if(posts.some(post=>post.productIds.some(id=>!products.some(p=>p.id===id))))throw Error('特集に未登録の商品IDがあります');
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const name of ['index.html','demo.html','editor.html','app.js','style.css','editor.js','editor.css','update-data.js','publication.js','post-number.js','content-model.js','affiliate','assets','demo-data','robots.txt','_headers'])await cp(new URL(name,root),new URL(name,dist),{recursive:true});
// A draft is editorial source, not content served by the public site.
const {visibleProduct}=await import('../publication.js');
const {sortPosts}=await import('../content-model.js');
const publicProducts=products.filter(visibleProduct);
const publicPosts=sortPosts(posts).map(post=>({...post,productIds:post.productIds.filter(id=>publicProducts.some(p=>p.id===id))}));
await mkdir(new URL('data/',dist),{recursive:true});
await cp(new URL('data/settings.json',root),new URL('data/settings.json',dist));
await writeFile(new URL('data/products.json',dist),JSON.stringify(publicProducts,null,2)+'\n');
await writeFile(new URL('data/posts.json',dist),JSON.stringify(publicPosts,null,2)+'\n');
console.log(`静的サイトをdist/に生成（公開商品${publicProducts.length}件・特集${publicPosts.length}件）。下書きは配信対象外。`);
