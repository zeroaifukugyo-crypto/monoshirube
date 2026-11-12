import {postNumber} from './post-number.js';
export const normal = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase('ja').trim();
export const postVisible = p => p.status !== 'draft' && p.status !== 'hidden' && p.isPublic !== false;
export function sortPosts(posts){
 return posts.filter(postVisible).map((p,i)=>({p,i})).sort((a,b)=>{
  const rank=p=>Number.isFinite(p.displayOrder)?p.displayOrder:0;
  const timestamp=p=>Number.isFinite(Date.parse(p.publishedAt))?Date.parse(p.publishedAt):0;
  return rank(b.p)-rank(a.p)||timestamp(b.p)-timestamp(a.p)||Number(b.p.number)-Number(a.p.number)||a.i-b.i;
 }).map(({p})=>p);
}
export function matchesPost(post,query,category='すべて'){
 const number=postNumber(query),q=normal(query);
 return (category==='すべて'||post.category===category)&&(!q||(number?post.number===number:normal(`${post.id} ${post.title} ${post.subtitle} ${post.category}`).includes(q)));
}
export function matchesProduct(product,query,category,posts){
 const q=normal(query),number=postNumber(query);
 return (category==='すべて'||product.category===category)&&(!q||normal(`${product.brand||''} ${product.name} ${product.description}`).includes(q)||posts.some(post=>post.productIds.includes(product.id)&&(number?post.number===number:normal(post.title).includes(q))));
}
export function mediaUrl(value){if(typeof value!=='string'||!value)return '';if(/^assets\/[a-zA-Z0-9_./-]+$/.test(value)&&!value.includes('..'))return value;try{return new URL(value).protocol==='https:'?value:'';}catch{return '';}}
export const postCover = p => mediaUrl(p.creativeAssets?.cover||p.cover);
export const postRoute = p => `/posts/${p.number}`;
