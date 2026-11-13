import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildUpdate} from '../update-data.js';import {publishable} from '../publication.js';import {postNumber} from '../post-number.js';
const entry={id:'item-01',name:'仕様確認用の商品',category:'デスク',photoSrc:'assets/photos/item-01.jpg',description:'公開仕様に基づく紹介',check:'対応サイズを確認',status:'published',merchants:[{name:'テスト用販売先',affiliateUrl:'https://test.invalid/item?tag=abc%2Bdef&x=1&x=2',verified:true}],sourceName:'テスト提供元',sourceUrl:'https://test.invalid/photo',termsUrl:'https://test.invalid/terms',usageConditions:'サイトの商用掲載を許可。加工不可。',commercialUseAllowed:true,websiteUseAllowed:true,modificationAllowed:false,photoVerified:true,photoDate:'2026-11-08',specificationSourceName:'テスト公式仕様',specificationUrl:'https://test.invalid/spec',specDate:'2026-11-08',number:'1',postTitle:'特集',cover:'assets/creative/post-01.jpg'};
test('投稿番号の入力形式と全角に対応し、不正な番号を除外',()=>{for(const raw of ['1','01','#01','  # 1 ','＃０１'])assert.equal(postNumber(raw),'01');for(const raw of ['0','00','100','abc','1a',''])assert.equal(postNumber(raw),null);});
test('商品と特集を書き出し、URLをそのまま保持。加工不可写真も条件確認済みなら掲載',()=>{const result=buildUpdate([],[],entry);assert.equal(result.products[0].merchants[0].affiliateUrl,entry.merchants[0].affiliateUrl);assert.equal(result.posts[0].number,'01');assert.deepEqual(result.posts[0].productIds,['item-01']);assert.ok(publishable(result.products[0]));});
test('写真利用条件と仕様の未確認商品を本番から除外',()=>{const p=buildUpdate([],[],entry).products[0];for(const key of ['verified','commercialUseAllowed','websiteUseAllowed'])assert.equal(publishable({...p,photo:{...p.photo,[key]:false}}),false);assert.equal(publishable({...p,editorial:{...p.editorial,specificationUrl:''}}),false);assert.equal(publishable({...p,merchants:[]}),false);assert.equal(publishable({...p,status:'draft'}),false);});
test('未確認の公開書き出しを拒否し、下書きは保存できる',()=>{assert.throws(()=>buildUpdate([],[],{...entry,photoVerified:false}),/確認/);const result=buildUpdate([],[],{...entry,photoVerified:false,status:'draft'});assert.equal(publishable(result.products[0]),false);});
test('同一商品の再追加は更新、特集の既存順と他の商品は保持',()=>{let a=buildUpdate([],[],entry);const second={...entry,id:'item-02',name:'次の商品'};a=buildUpdate(a.products,a.posts,second);assert.equal(a.products.length,2);assert.deepEqual(a.posts[0].productIds,['item-01','item-02']);a=buildUpdate(a.products,a.posts,{...entry,name:'修正した商品'});assert.equal(a.products.length,2);assert.equal(a.products[0].name,'修正した商品');assert.deepEqual(a.posts[0].productIds,['item-01','item-02']);});
test('未登録の商品順、写真と表紙の共用を拒否',()=>{assert.throws(()=>buildUpdate([],[],{...entry,productIds:'item-01, missing'}),/未登録/);assert.throws(()=>buildUpdate([],[],{...entry,cover:entry.photoSrc}),/別ファイル/);});
test('本番に香水12商品・2特集、別データに9商品・3特集を保持',async()=>{const load=async name=>JSON.parse(await readFile(new URL('../'+name,import.meta.url)));assert.equal((await load('data/products.json')).length,12);assert.equal((await load('data/posts.json')).length,2);assert.equal((await load('demo-data/products.json')).length,9);assert.equal((await load('demo-data/posts.json')).length,3);});

import {sortPosts,matchesPost,matchesProduct,mediaUrl} from '../content-model.js';
import {visibleProduct,links} from '../publication.js';
test('投稿は手動順・日時・番号の順で並び、非公開は除外する',()=>{
 const posts=[{id:'a',number:'01',publishedAt:'2026-11-12',displayOrder:0},{id:'b',number:'02',publishedAt:'2026-11-10',displayOrder:1},{id:'c',number:'03',publishedAt:'2026-11-11',displayOrder:0},{id:'d',number:'04',displayOrder:999,status:'draft'}];
 assert.deepEqual(sortPosts(posts).map(p=>p.id),['b','a','c']);assert.deepEqual(sortPosts([{number:'01'},{number:'03'},{number:'02'}]).map(p=>p.number),['03','02','01']);
});
test('投稿・商品検索は番号、ブランド、タイトルとカテゴリを組み合わせられる',()=>{
 const p={id:'perfume',number:'01',title:'メンズ香水6選',category:'美容・香水',productIds:['wood']};
 assert.ok(matchesPost(p,'＃０１','美容・香水'));assert.ok(matchesPost(p,'香水'));assert.ok(!matchesPost(p,'香水','家電'));
 const product={id:'wood',brand:'TOM FORD',name:'ウード・ウッド',category:'美容・香水'};
 assert.ok(matchesProduct(product,'tom ford','すべて',[p]));assert.ok(matchesProduct(product,'#01','美容・香水',[p]));assert.ok(!matchesProduct(product,'#01','家電',[p]));
});
test('画像未設定・危険なURLでも安全な表示にフォールバック',()=>{assert.equal(mediaUrl(undefined),'');assert.equal(mediaUrl('javascript:alert(1)'),'');assert.equal(mediaUrl('assets/../secret'),'');assert.equal(mediaUrl('assets/photo.jpg'),'assets/photo.jpg');});
test('香水特集はSNS画像の順、Aiam65の正しいリンクを使用し、リンク文字列を保持',async()=>{
 const posts=JSON.parse(await readFile(new URL('../data/posts.json',import.meta.url)));const allProducts=JSON.parse(await readFile(new URL('../data/products.json',import.meta.url)));const products=allProducts.filter(p=>posts[0].productIds.includes(p.id));
 assert.deepEqual(posts[0].productIds,['jomalone-wood-sage','tomford-oud-wood','aiam-chapter65','samourai-eau-de-toilette','ahres-sayu','tomford-lost-cherry']);
 assert.equal(products.filter(visibleProduct).length,6);assert.equal(links(products.find(p=>p.id==='aiam-chapter65')).length,1);assert.equal(products.reduce((n,p)=>n+links(p).length,0),6);assert.ok(links(products.find(p=>p.id==='aiam-chapter65'))[0].affiliateUrl.includes('10000020%2F'));assert.ok(!links(products.find(p=>p.id==='aiam-chapter65'))[0].affiliateUrl.includes('10000087'));
 for(const p of products){for(const m of links(p)){const raw=await readFile(new URL('../'+m.htmlPath,import.meta.url),'utf8');assert.ok(raw.includes(`href="${m.affiliateUrl}"`));assert.ok(m.affiliateUrl.includes('link_type=picttext'));}}
});
test('リンク未設定でも紹介のみ公開でき、非公開と未確認写真の公開は除外',()=>{
 const p=buildUpdate([],[],{...entry,status:'listed',photoSrc:'',merchants:[],cover:''}).products[0];assert.ok(visibleProduct(p));assert.equal(links(p).length,0);assert.ok(!visibleProduct({...p,status:'draft'}));assert.ok(!visibleProduct({...p,isPublic:false}));assert.ok(!publishable({...p,status:'published'}));
});
test('追加画面でブランド・投稿順・日時・カテゴリ・公開設定を保存',()=>{const out=buildUpdate([],[],{...entry,status:'listed',photoSrc:'',brand:'Brand',postId:'perfume',publishedAt:'2026-11-12T12:00:00+09:00',displayOrder:'50',postCategory:'美容・香水',postStatus:'draft'});assert.equal(out.posts[0].displayOrder,50);assert.equal(out.posts[0].category,'美容・香水');assert.equal(out.posts[0].publishedAt,'2026-11-12T03:00:00.000Z');assert.equal(sortPosts(out.posts).length,0);assert.equal(out.products[0].brand,'Brand');});

test('追加画面は新しい投稿を自動で先頭に追加し、画像付き広告の設定を保持する',()=>{let a=buildUpdate([],[],{...entry,status:'listed',displayOrder:'100'});a.products[0].merchants[0].renderMode='provided-html';a.products[0].merchants[0].htmlPath='affiliate/test.html';const updated=buildUpdate(a.products,a.posts,entry);assert.equal(updated.products[0].merchants[0].renderMode,'provided-html');const next=buildUpdate(a.products,a.posts,{...entry,id:'second',number:'02',postTitle:'新しい投稿',displayOrder:''});assert.equal(sortPosts(next.posts)[0].number,'02');assert.equal(next.posts[1].displayOrder,110);});

test('レディースは最新の#02、6商品を画像順に掲載し、重複と別商品の広告を除外',async()=>{
 const products=JSON.parse(await readFile(new URL('../data/products.json',import.meta.url)));const posts=JSON.parse(await readFile(new URL('../data/posts.json',import.meta.url)));const pending=JSON.parse(await readFile(new URL('../data/pending-links.json',import.meta.url)));
 const post=posts.find(p=>p.number==='02');assert.equal(sortPosts(posts)[0].number,'02');assert.deepEqual(post.productIds,['jomalone-english-pear','ysl-libre-intense','shiro-savon','lanvin-eclat-darpege','jimmy-choo-edt','ck-eternity-women']);
 const women=post.productIds.map(id=>products.find(p=>p.id===id));assert.equal(women.filter(visibleProduct).length,6);assert.equal(women.reduce((n,p)=>n+links(p).length,0),6);assert.equal(links(women.find(p=>p.id==='ysl-libre-intense')).length,1);assert.equal(links(women.find(p=>p.id==='ck-eternity-women')).length,1);
 assert.equal(pending.length,0);for(const p of women)assert.equal(links(p).length,1);assert.ok(links(women.find(p=>p.id==='jimmy-choo-edt'))[0].affiliateUrl.includes('x-sell%2F42630340'));assert.equal(links(women.find(p=>p.id==='ck-eternity-women'))[0].htmlPath,'affiliate/ck-eternity-fragrance-u.html');assert.ok(!women.find(p=>p.id==='jimmy-choo-edt').relatedOffers);
 for(const p of women){assert.ok((await readFile(new URL('../'+p.presentation.src,import.meta.url))).length>0);for(const m of links(p)){const html=await readFile(new URL('../'+m.htmlPath,import.meta.url),'utf8');assert.ok(html.includes(`href="${m.affiliateUrl}"`));}}
});
