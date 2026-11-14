import {postNumber} from './post-number.js';
import {links, visibleProduct, photoReady, presentationReady} from './publication.js';
import {sortPosts, matchesPost, matchesProduct, mediaUrl, postCover, postRoute} from './content-model.js';
const app=document.querySelector('#app');
const demoPreview=document.body.dataset.preview==='demo';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let products=[],posts=[],settings={programDisclosures:[]};
const visible=p=>demoPreview?p.status==='demo'||visibleProduct(p):visibleProduct(p);
const availablePosts=()=>sortPosts(posts);
const orderedProducts=post=>post.productIds.map(id=>products.find(p=>p.id===id)).filter(p=>p&&visible(p));
function media(src,alt,{className='',eager=false}={}){
 const url=mediaUrl(src);
 return `<div class="media ${className}${url?'':' is-missing'}"><span class="image-fallback">画像準備中</span>${url?`<img src="${esc(url)}" ${/^assets\/creative\/christmas-2026\/.*\.jpg$/.test(url)?`data-fallback="${esc(url.replace(/\.jpg$/,'.svg'))}"`:''} alt="${esc(alt)}" loading="${eager?'eager':'lazy'}" decoding="async" width="1024" height="1280">`:''}</div>`;
}
function productImage(p){
 if(p.status==='demo')return {src:p.image,alt:p.name+'のオリジナル仮イラスト',note:'デモ・サンプル商品'};
 if(presentationReady(p))return {src:p.presentation.src,alt:p.presentation.alt||`${p.brand||''} ${p.name}のSNS紹介画像`,note:'SNS紹介画像（演出を含みます）'};
 if(photoReady(p))return {src:p.photo.src,alt:`${p.brand||''} ${p.name}の商品写真`,note:p.photo.credit||p.photo.sourceName};
 return {src:'',alt:p.name,note:''};
}
function purchase(p){
 const merchants=links(p);
 if(!merchants.length)return '<div class="pending" aria-disabled="true">販売リンク準備中</div>';
 return merchants.map(m=>{
  if(m.renderMode==='provided-html'){
   const path=/^affiliate\/[a-z0-9-]+\.html$/.test(m.htmlPath||'')?m.htmlPath:'';
   if(!path)return '<div class="pending" aria-disabled="true">販売リンク準備中</div>';
   return `<section class="affiliate" aria-label="${esc(m.name)}の商品広告"><h4 class="affiliate-heading">${esc(m.name)}の商品広告${m.storeName?` · ${esc(m.storeName)}`:''}</h4><div class="affiliate-frame"><iframe src="${esc(path)}" title="${esc(p.brand)} ${esc(p.name)}の${esc(m.name)}広告" width="880" height="520" sandbox="allow-popups allow-popups-to-escape-sandbox" loading="lazy"></iframe></div><a class="affiliate-expand" href="${esc(path)}" target="_blank" rel="noopener noreferrer">広告を大きく開く ↗</a></section>`;
  }
  return `<a class="buy" href="${esc(m.affiliateUrl)}" target="_blank" rel="nofollow sponsored noopener noreferrer">${esc(m.name)}で商品を見る <span aria-hidden="true">↗</span></a>`;
 }).join('');
}
function card(p,index){
 const image=productImage(p),related=availablePosts().filter(post=>post.productIds.includes(p.id));
 return `<article class="product" id="product-${esc(p.id)}">${media(image.src,image.alt,{className:'product-image',eager:index===0})}<div class="product-body">${image.note?`<p class="image-note">${esc(image.note)}</p>`:''}<div class="product-meta"><span>${esc(p.category)}</span><span>${related.map(post=>`<a href="#${postRoute(post)}">#${esc(post.number)}</a>`).join(' ')}</span></div>${p.brand?`<p class="brand">${esc(p.brand)}</p>`:''}<h3>${esc(p.name)}</h3><p class="description">${esc(p.description)}</p>${p.status!=='demo'?`<details class="sources"><summary>紹介文の出典</summary><p>実使用なし・公開仕様に基づく紹介</p><a href="${esc(p.editorial.specificationUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.editorial.specificationSourceName)} ↗</a><p>確認：${esc(p.editorial.checkedAt)}</p></details>`:''}${p.check?`<div class="check"><span>買う前にチェック</span>${esc(p.check)}</div>`:''}${purchase(p)}</div></article>`;
}
function feature(post){const count=orderedProducts(post).length;
 return `<a class="feature" href="#${postRoute(post)}">${media(postCover(post),post.title+'の表紙',{className:'cover'})}<div class="feature-body"><div class="feature-meta"><span class="category-tag">${esc(post.category||'特集')}</span><span>${count}商品</span></div><p class="feature-number">投稿 #${esc(post.number)}</p><h3>${esc(post.title)}</h3><p>${esc(post.subtitle)}</p><span class="feature-cta">紹介商品を見る <span aria-hidden="true">→</span></span></div></a>`;
}
function filterButtons(categories,name){return ['すべて',...new Set(categories.filter(Boolean))].map((c,i)=>`<button type="button" data-${name}="${esc(c)}" aria-pressed="${i===0}">${esc(c)}</button>`).join('');}
function home(){
 document.title=(demoPreview?'サンプル表示 | ':'')+'モノシルベ | 投稿で見た商品を探す';
 const latest=availablePosts();
 app.innerHTML=`<section class="intro"><p class="eyebrow">SNSで気になった、あのモノ。</p><h1>投稿で見た商品、ここから探せます。</h1><p>Instagram・TikTokで紹介した商品をまとめています。<br>投稿の番号や表紙から、気になるモノをチェック。</p></section><section class="number-finder" aria-labelledby="number-heading"><div><p class="eyebrow">動画から来た方はこちら</p><h2 id="number-heading">投稿の番号から探す</h2></div><form id="number-form"><label for="post-number">投稿番号</label><div class="number-input"><span aria-hidden="true">#</span><input id="post-number" name="post" inputmode="numeric" autocomplete="off" placeholder="例：01" aria-describedby="number-hint"><button type="submit">探す →</button></div><p id="number-hint" role="status">「01」「#01」「1」のどれでも探せます。</p></form></section><section aria-labelledby="posts-heading" id="posts"><div class="section-head"><h2 id="posts-heading">投稿から探す</h2><span>新しい投稿からチェック</span></div><details class="post-tools"><summary>投稿を検索・絞り込み</summary><label class="search-label" for="post-search">投稿番号・タイトルで探す</label><div class="search"><input type="search" id="post-search" placeholder="例：#01、香水"></div><div class="filters" role="group" aria-label="投稿のカテゴリ">${filterButtons(latest.map(p=>p.category),'post-category')}</div></details><p class="result-info" id="post-count" aria-live="polite"></p><div class="features" id="feature-results"></div></section><section class="catalog" id="catalog" aria-labelledby="products-heading"><div class="section-head"><h2 id="products-heading">すべての商品</h2><span>名前やカテゴリで探せます</span></div><label class="search-label" for="search">商品名・ブランド名・投稿番号で検索</label><div class="search"><input id="search" type="search" placeholder="例：TOM FORD、#01"><button class="clear-search" aria-label="検索をクリア" hidden>×</button></div><div class="filters" role="group" aria-label="商品のカテゴリ">${filterButtons(products.filter(visible).map(p=>p.category),'category')}</div><div class="result-info" aria-live="polite"><span id="count"></span><span>${demoPreview?'デモ・サンプル商品':'公開仕様に基づく紹介'}</span></div><div id="matches" class="search-matches"></div><div id="results" class="products"></div></section>`;
 app.querySelector('#number-form').addEventListener('submit',e=>{e.preventDefault();const number=postNumber(app.querySelector('#post-number').value);const hint=app.querySelector('#number-hint');if(!number){hint.textContent='投稿番号を数字で入力してください。';return;}if(!latest.some(p=>p.number===number)){hint.textContent=`#${number}はまだ公開されていません。番号をご確認ください。`;return;}location.hash=`/posts/${number}`;});
 let category='すべて',postCategory='すべて';
 const search=app.querySelector('#search'),postSearch=app.querySelector('#post-search'),clear=app.querySelector('.clear-search');
 function updatePosts(){const found=latest.filter(p=>matchesPost(p,postSearch.value,postCategory));app.querySelector('#post-count').textContent=`${found.length}件の投稿`;app.querySelector('#feature-results').innerHTML=found.length?found.map(feature).join(''):'<div class="empty-posts"><h3>投稿が見つかりませんでした</h3><p>番号やカテゴリを変えて探してみてください。</p></div>';animate();}
 function updateProducts(){const found=products.filter(visible).filter(p=>matchesProduct(p,search.value,category,latest));const number=postNumber(search.value);const matched=number?latest.filter(p=>p.number===number):[];app.querySelector('#count').textContent=`${found.length}件の商品`;app.querySelector('#matches').innerHTML=matched.map(p=>`<a class="match" href="#${postRoute(p)}"><b>#${esc(p.number)}</b> ${esc(p.title)} <span>→</span></a>`).join('');app.querySelector('#results').innerHTML=found.length?found.map(card).join(''):'<div class="empty">商品が見つかりませんでした。<br>名前や番号を変えて、もう一度探してみてください。<br><button class="text-button" id="reset">条件をリセット</button></div>';clear.hidden=!search.value;app.querySelector('#reset')?.addEventListener('click',()=>{search.value='';category='すべて';app.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.category===category));updateProducts();});animate();}
 search.addEventListener('input',updateProducts);postSearch.addEventListener('input',updatePosts);clear.addEventListener('click',()=>{search.value='';updateProducts();search.focus();});
 for(const button of app.querySelectorAll('[data-category]'))button.addEventListener('click',()=>{category=button.dataset.category;app.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',b===button));updateProducts();});
 for(const button of app.querySelectorAll('[data-post-category]'))button.addEventListener('click',()=>{postCategory=button.dataset.postCategory;app.querySelectorAll('[data-post-category]').forEach(b=>b.setAttribute('aria-pressed',b===button));updatePosts();});
 updatePosts();updateProducts();
}
function postPage(key){
 const post=availablePosts().find(p=>p.number===key||p.id===key);
 if(!post){app.innerHTML='<h1>特集が見つかりませんでした。</h1><a class="back" href="#/">← トップへ戻る</a>';return;}
 const ordered=orderedProducts(post);document.title=`#${post.number} ${post.title} | モノシルベ`;
 app.innerHTML=`<a class="back" href="#/">← 投稿一覧に戻る</a><section class="post-intro">${media(postCover(post),post.title+'の表紙',{className:'post-cover',eager:true})}<div><p class="eyebrow">投稿 #${esc(post.number)} ／ ${esc(post.category||'特集')}</p><h1>${esc(post.title)}</h1><p>${esc(post.subtitle)}</p><p class="post-count">${ordered.length}商品 · SNSで紹介した順に掲載</p><button class="share">この投稿のリンクをコピー ↗</button><p class="share-status" role="status"></p></div></section>${mediaUrl(post.videoUrl)?`<div class="video"><button class="video-poster" aria-label="動画を読み込んで再生">${media(postCover(post),'投稿動画の表紙')}<span>▶ 投稿の動画を見る</span></button></div>`:''}<div class="section-head"><h2>この投稿で紹介した商品</h2><span>${ordered.length}商品</span></div><p class="post-guidance">紹介文は各ブランドの公開情報に基づいています。画像はSNS紹介用のビジュアルです。</p><div class="products post-products">${ordered.length?ordered.map(card).join(''):'<p class="empty">商品は準備中です。</p>'}</div><a class="back" href="#/">← ほかの投稿・商品を探す</a>`;
 app.querySelector('.share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);app.querySelector('.share-status').textContent='リンクをコピーしました。';}catch{app.querySelector('.share-status').textContent=`このURLをコピーしてください：${location.href}`;}});
 app.querySelector('.video-poster')?.addEventListener('click',()=>{const v=document.createElement('video');v.controls=true;v.playsInline=true;v.autoplay=true;v.src=post.videoUrl;v.poster=postCover(post);app.querySelector('.video').replaceChildren(v);});animate();
}
let observer;
function animate(){sizeAds();if(!('IntersectionObserver'in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;observer??=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.remove('will-reveal');observer.unobserve(e.target);}},{threshold:.05});for(const el of app.querySelectorAll('.feature,.product')){if(el.getBoundingClientRect().top>window.innerHeight){el.classList.add('will-reveal');observer.observe(el);}}}
function route(){observer?.disconnect();const path=location.hash.slice(1)||'/';if(path==='/'||path==='/products'){home();if(path==='/products')requestAnimationFrame(()=>app.querySelector('#catalog').scrollIntoView());else window.scrollTo(0,0);}else if(/^\/posts\/[a-zA-Z0-9-]+$/.test(path)){postPage(path.split('/')[2]);window.scrollTo(0,0);}else{app.innerHTML='<h1>ページが見つかりませんでした。</h1><a class="back" href="#/">トップへ戻る</a>';}}
app.addEventListener('error',e=>{if(e.target.tagName==='IMG'){const img=e.target;if(img.dataset.fallback&&!img.dataset.fallbackUsed){img.dataset.fallbackUsed='true';img.src=img.dataset.fallback;return;}img.hidden=true;img.closest('.media')?.classList.add('is-missing');}},true);
// Supplied ad HTML is visible immediately; only the outer iframe is scaled.
function sizeAds(){
 for(const frame of app.querySelectorAll('.affiliate-frame iframe')){
  const box=frame.parentElement;
  const scale=()=>{frame.style.transform=`scale(${box.clientWidth/880})`;};
  scale();
  if('ResizeObserver'in window&&!frame._resizeObserver){frame._resizeObserver=new ResizeObserver(scale);frame._resizeObserver.observe(box);}
 }
}

try{
 [products,posts,settings]=await Promise.all(['products','posts','settings'].map(async name=>{const res=await fetch(`${demoPreview&&name!=='settings'?'demo-data':'data'}/${name}.json`);if(!res.ok)throw Error(name);return res.json();}));
 document.querySelector('.notice').innerHTML=(demoPreview?'<span>SAMPLE</span> 仮の商品・画像でサイトの使い方を確認できます。':'<span>広告・PR</span> 当サイトはアフィリエイト広告を利用しています')+(settings.programDisclosures||[]).map(s=>`<div>${esc(s)}</div>`).join('');route();window.addEventListener('hashchange',route);
}catch(error){app.innerHTML='<h1>データを読み込めませんでした。</h1><p>時間をおいて、もう一度開いてみてください。</p>';console.error(error);}
