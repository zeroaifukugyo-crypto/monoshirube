export const isHttps = value => {try{return new URL(value).protocol==='https:';}catch{return false;}};
export function validateProducts(data){if(!Array.isArray(data)||data.some(p=>!p||typeof p.id!=='string'||!Array.isArray(p.merchants))||new Set(data.map(p=>p.id)).size!==data.length)throw Error('products.jsonの商品IDや形式を確認してください。');}
export function validatePosts(data){
 if(!Array.isArray(data)||data.some(p=>!p||!/^\d{2}$/.test(p.number)||!Array.isArray(p.productIds)||new Set(p.productIds).size!==p.productIds.length||(p.displayOrder!=null&&!Number.isFinite(p.displayOrder))||(p.publishedAt&&!Number.isFinite(Date.parse(p.publishedAt))))||new Set(data.map(p=>p.number)).size!==data.length)throw Error('posts.jsonの番号・商品ID・日時・表示順を確認してください。');
 const ids=data.map(p=>p.id).filter(Boolean);if(new Set(ids).size!==ids.length)throw Error('投稿IDが重複しています。');
}
const list = value => String(value||'').split(',').map(s=>s.trim()).filter(Boolean);
const requireText=(value,label)=>{if(!String(value||'').trim())throw Error(`${label}を入力してください。`);return String(value).trim();};
const path=(value,label)=>{const text=requireText(value,label);if(!/^assets\/[a-zA-Z0-9_\-./]+\.(png|jpe?g|webp|svg|avif)$/i.test(text)||text.includes('..'))throw Error(`${label}はassets/から始まる画像パスを指定してください（英数字のファイル名）。`);return text;};
export function buildUpdate(products,posts,d){
 validateProducts(products);validatePosts(posts);
 const id=requireText(d.id,'商品ID');if(!/^[a-z0-9-]+$/.test(id))throw Error('商品IDは半角英小文字・数字・ハイフンで入力してください。');
 const raw=requireText(d.number,'投稿番号').normalize('NFKC');if(!/^\d{1,2}$/.test(raw)||Number(raw)<1)throw Error('投稿番号は01〜99で入力してください。');
 const number=String(Number(raw)).padStart(2,'0');
 const existingProduct=products.find(p=>p.id===id);
 const merchants=(d.merchants||[]).filter(m=>m.name||m.affiliateUrl).map(m=>({...existingProduct?.merchants?.find(old=>old.name===m.name&&old.affiliateUrl===m.affiliateUrl),...m}));
 for(const m of merchants){if(!m.name||!isHttps(m.affiliateUrl))throw Error('販売先名と、発行済みのHTTPSアフィリエイトURLを入力してください。');}
 // Keep issued URLs exactly as provided, without trimming, decoding, or query rewriting.
 const photo=d.photoSrc?{src:path(d.photoSrc,'商品写真'),sourceName:requireText(d.sourceName,'写真の提供元'),sourceUrl:d.sourceUrl,termsUrl:d.termsUrl,usageConditions:requireText(d.usageConditions,'写真の利用条件'),commercialUseAllowed:d.commercialUseAllowed===true,websiteUseAllowed:d.websiteUseAllowed===true,modificationAllowed:d.modificationAllowed===true,verified:d.photoVerified===true,verifiedAt:requireText(d.photoDate,'写真の確認日'),credit:d.credit||''}:existingProduct?.photo||{};
 const editorial={basis:'public-specifications',personallyUsed:false,specificationUrl:d.specificationUrl,specificationSourceName:requireText(d.specificationSourceName,'仕様の参照先名'),checkedAt:requireText(d.specDate,'仕様の確認日')};
 for(const [url,label] of [...(photo.src?[[photo.sourceUrl,'写真の出典URL'],[photo.termsUrl,'利用条件のURL']]:[]),[editorial.specificationUrl,'仕様のURL']])if(!isHttps(url))throw Error(`${label}はHTTPSで指定してください。`);
 if(!['draft','listed','published'].includes(d.status))throw Error('掲載状態を選択してください。');
 const presentation=d.presentationSrc?{src:path(d.presentationSrc,'SNS紹介画像'),alt:`${d.brand||''} ${d.name}のSNS紹介画像`,source:'user-supplied-social-artwork',approvedForSite:d.presentationApproved===true}:existingProduct?.presentation;
 if(d.status==='published'&&(!merchants.some(m=>m.verified===true)||!(photo.src&&photo.commercialUseAllowed&&photo.websiteUseAllowed&&photo.verified)&&!presentation?.approvedForSite))throw Error('公開するには、有効な販売リンクと写真の利用条件を確認し、確認欄にチェックしてください。未確認なら下書きを選んでください。');
 const product={...existingProduct,id,brand:d.brand??existingProduct?.brand??'',name:requireText(d.name,'商品名'),category:requireText(d.category,'カテゴリ'),image:'',description:requireText(d.description,'紹介文'),check:requireText(d.check,'確認点'),status:d.status,merchants,photo,editorial,...(presentation?{presentation}:{})};
 const updatedProducts=products.some(p=>p.id===id)?products.map(p=>p.id===id?product:p):[...products,product];
 const existing=posts.find(p=>p.number===number);
 const ids=d.productIds?.trim()?list(d.productIds):[...new Set([...(existing?.productIds||[]),id])];
 if(!ids.includes(id))throw Error('商品の登場順に、今回の商品IDも含めてください。');
 if(new Set(ids).size!==ids.length||ids.some(item=>!updatedProducts.some(p=>p.id===item)))throw Error('商品の登場順に未登録または重複したIDがあります。');
 const cover=d.cover?path(d.cover,'サイト表紙'):existing?.cover||'';
 const snsImage=d.snsImage?path(d.snsImage,'SNS原稿'):'';
 if(photo.src&&(cover===photo.src||snsImage===photo.src))throw Error('商品写真と表紙・SNS原稿は別ファイルで管理してください。');
 const background=d.background?path(d.background,'背景'):'';
 const decorations=list(d.decorations).map(value=>path(value,'装飾'));
 if(photo.src&&(background===photo.src||decorations.includes(photo.src)))throw Error('商品写真と背景・装飾は別ファイルで管理してください。');
 if(d.videoUrl&&!isHttps(d.videoUrl))throw Error('動画URLはHTTPSで指定してください。');
 const order=d.displayOrder!==undefined&&d.displayOrder!==''?Number(d.displayOrder):existing?.displayOrder??Math.max(0,...posts.map(p=>Number.isFinite(p.displayOrder)?p.displayOrder:0))+10;
 if(!Number.isFinite(order))throw Error('表示順は数字で入力してください。');
 const date=d.publishedAt?new Date(d.publishedAt).toISOString():existing?.publishedAt??null;
 const post={...existing,id:d.postId||existing?.id||`post-${number}`,number,publishedAt:date,displayOrder:order,category:d.postCategory||existing?.category||d.category,status:d.postStatus||existing?.status||'published',isPublic:(d.postStatus||existing?.status||'published')!=='draft',title:requireText(d.postTitle,'投稿タイトル'),subtitle:d.subtitle||'',cover,snsImage,coverFit:'contain',productIds:ids,videoUrl:d.videoUrl||'',creativeAssets:{cover,background,decorations,origin:'recorded-by-editor',notes:d.creativeNotes||''}};
 const updatedPosts=existing?posts.map(p=>p.number===number?post:p):[...posts,post];
 validatePosts(updatedPosts);
 return {products:updatedProducts,posts:updatedPosts};
}
