import {postNumber} from './post-number.js';
import {links, publishable} from './publication.js';
const app = document.querySelector('#app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
const demoPreview = document.body.dataset.preview === 'demo';
let products, posts, settings;
const visible = p => demoPreview ? p.status === 'demo' || publishable(p) : publishable(p);
const sortedPosts = () => [...posts].sort((a,b) => Number(b.number)-Number(a.number)).filter(p => p.productIds.some(id => products.some(x => x.id === id && visible(x))));
const related = p => sortedPosts().filter(post => post.productIds.includes(p.id));
function card(p) {
 const merchants = links(p);
 return `<article class="product"><div class="product-image"><img src="${esc(p.status === 'demo' ? p.image : p.photo.src)}" alt="${esc(p.name)}の${p.status === 'demo' ? 'オリジナル仮イラスト' : '商品画像'}" loading="lazy"></div><div class="product-body">${p.status === 'demo' ? '<span class="demo-tag">デモ・サンプル商品</span>' : `<div class="photo-credit">写真：${esc(p.photo.credit || p.photo.sourceName)} <a href="${esc(p.photo.sourceUrl)}" target="_blank" rel="noopener noreferrer">出典 ↗</a></div>`}<div class="product-meta"><span>${esc(p.category)}</span><span>${related(p).map(post=>`<a href="#/posts/${esc(post.number)}">#${esc(post.number)}</a>`).join(' ')}</span></div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>${p.status !== 'demo' ? `<div class="specification-note">実使用なし・公開仕様に基づく紹介<br><a href="${esc(p.editorial.specificationUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.editorial.specificationSourceName)} ↗</a>（確認：${esc(p.editorial.checkedAt)}）</div>` : ''}<div class="check"><span>買う前にチェック</span>${esc(p.check)}</div>${merchants.length && p.status === 'published' ? merchants.map(m=>`<div class="merchant">販売先：${esc(m.name)}</div><a class="buy" href="${esc(m.affiliateUrl)}" target="_blank" rel="sponsored noopener noreferrer">${esc(m.name)}で見る ↗</a>`).join('') : '<div class="merchant">販売先：未設定</div><div class="pending">販売リンク準備中</div>'}</div></article>`;
}
function home() {
 document.title=(demoPreview?'サンプル表示 | ':'')+'モノシルベ | 投稿で見た商品を探す';
 app.innerHTML=`<section class="intro"><p class="eyebrow">SNSで気になった、あのモノ。</p><h1>投稿で見た商品、ここから探せます。</h1><p>気になった商品を、ここにまとめています。<br>動画の番号や商品名で、さくっと探せます。</p><img class="intro-brand" src="assets/brand/banner.jpg" alt="モノシルベのブランドロゴ" width="1280" height="720"></section><section class="number-finder" aria-labelledby="number-heading"><div><p class="eyebrow">動画から来た方はこちら</p><h2 id="number-heading">動画で見た番号から探す</h2><p>投稿に書いてある番号を入れると、商品が見つかります。</p></div><form id="number-form"><label for="post-number">投稿番号</label><div class="number-input"><span aria-hidden="true">#</span><input id="post-number" name="post" inputmode="numeric" autocomplete="off" placeholder="例：01" aria-describedby="number-hint"><button type="submit">探す <span aria-hidden="true">→</span></button></div><p id="number-hint" role="status">「01」「#01」「1」のどれでも探せます。</p></form></section><section aria-labelledby="posts-heading"><div class="section-head"><h2 id="posts-heading">最新の投稿から探す</h2><span>新しい投稿順 ↓</span></div><div class="features">${sortedPosts().length ? sortedPosts().map((p,i)=>`<a class="feature" href="#/posts/${esc(p.number)}"><div class="cover"><img src="${esc(p.creativeAssets?.cover || p.cover)}" alt="${esc(p.title)}の表紙" style="object-fit:${p.coverFit==='cover'?'cover':'contain'}"><span class="post-label">#${esc(p.number)}</span>${i===0?'<span class="latest">最新</span>':''}</div><div class="feature-meta"><span>投稿 #${esc(p.number)}</span><span>${p.productIds.filter(id=>products.some(x=>x.id===id&&visible(x))).length}点の商品</span></div><h3>${esc(p.title)} <span>↗</span></h3><p>${esc(p.subtitle)}</p></a>`).join('') : '<div class="empty-posts"><span class="empty-icon" aria-hidden="true">#</span><h3>紹介する商品を準備中です</h3><p>SNSで紹介した商品を、ここに追加していきます。<br>気になるモノがあったら、またのぞいてみてください。</p></div>'}</div></section><section class="catalog" id="catalog" aria-labelledby="products-heading"><div class="section-head"><h2 id="products-heading">すべての商品</h2><span>名前やカテゴリで探せます</span></div><div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></svg><input id="search" aria-label="商品名・投稿番号で検索" placeholder="商品名・投稿番号で検索（例：#01）" type="search"><button class="clear-search" aria-label="検索をクリア" hidden>×</button></div><div class="filters" role="group" aria-label="カテゴリで絞り込み">${['すべて',...new Set(products.filter(visible).map(p=>p.category))].map((c,i)=>`<button aria-pressed="${i===0}" data-category="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="result-info" aria-live="polite"><span id="count"></span><span>${demoPreview ? 'デモ・サンプル商品' : '公開仕様に基づく紹介'}</span></div><div class="search-matches" id="matches"></div><div class="products" id="results"></div></section>`;
 app.querySelector('#number-form').addEventListener('submit',event=>{
  event.preventDefault();
  const number=postNumber(app.querySelector('#post-number').value);
  const hint=app.querySelector('#number-hint');
  if(!number){hint.textContent='投稿番号を1〜2桁の数字で入力してください。';return;}
  if(!sortedPosts().some(p=>p.number===number)){hint.textContent=`#${number}はまだ公開されていません。番号をご確認ください。`;return;}
  location.hash=`/posts/${number}`;
 });
 let category='すべて';
 const input=app.querySelector('#search');
 const clear=app.querySelector('.clear-search');
 function update(){
  const query=input.value.trim().normalize('NFKC').toLowerCase();
  const number=postNumber(query);
  const matchingPosts=number?sortedPosts().filter(p=>p.number===number):[];
  const result=products.filter(visible).filter(p=>(category==='すべて'||p.category===category)&&(!query||p.name.normalize('NFKC').toLowerCase().includes(query)||matchingPosts.some(post=>post.productIds.includes(p.id))));
  app.querySelector('#count').textContent=`${result.length}件の商品${category!=='すべて'?' ／ '+category:''}`;
  app.querySelector('#matches').innerHTML=matchingPosts.map(p=>`<a class="match" href="#/posts/${esc(p.number)}"><b>#${esc(p.number)}</b><span>${esc(p.title)}</span><span>↗</span></a>`).join('');
  app.querySelector('#results').innerHTML=result.length?result.map(card).join(''):`<div class="empty">${products.some(visible) ? '商品が見つかりませんでした。<br>名前や番号を変えて、もう一度探してみてください。' : '商品はこれから追加していきます。<br>SNSで紹介したら、ここから探せるようになります。'}<br><button class="text-button" id="reset">条件をリセット</button></div>`;
  clear.hidden=!input.value;
  app.querySelector('#reset')?.addEventListener('click',()=>{input.value='';category='すべて';app.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.category===category));update();});
 }
 input.addEventListener('input',update);
 clear.addEventListener('click',()=>{input.value='';update();input.focus();});
 app.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;app.querySelectorAll('[data-category]').forEach(x=>x.setAttribute('aria-pressed',x===b));update();}));
 update();
}
function postPage(number){
 const post=sortedPosts().find(p=>p.number===number);
 if(!post){app.innerHTML='<h1>特集が見つかりませんでした。</h1><a class="back" href="#/">← トップへ戻る</a>';return;}
 document.title=`#${post.number} ${post.title} | モノシルベ`;
 const ordered=post.productIds.map(id=>products.find(p=>p.id===id)).filter(p=>p&&visible(p));
 app.innerHTML=`<a class="back" href="#/">← トップへ戻る</a><section class="post-intro"><div><p class="eyebrow">投稿 #${esc(post.number)} ／ ${ordered.length}点の商品</p><h1>${esc(post.title)}</h1><p>${esc(post.subtitle)}<br>動画・投稿で紹介した順に並べています。</p><button class="share">この投稿のリンクをコピー ↗</button><p class="share-status" role="status"></p></div><img src="${esc(post.creativeAssets?.cover || post.cover)}" alt="${esc(post.title)}の表紙" style="object-fit:${post.coverFit==='cover'?'cover':'contain'}"></section>${post.videoUrl&&safe(post.videoUrl)?`<div class="video"><button class="video-poster" aria-label="動画を読み込んで再生"><img src="${esc(post.creativeAssets?.cover || post.cover)}" alt="動画の表紙"><span>▶ 投稿の動画を見る</span></button></div>`:''}<div class="section-head"><h2>この投稿で紹介した商品</h2><span>${ordered.length}点の商品</span></div><div class="products">${ordered.map(card).join('')}</div><a class="back" href="#/">← ほかの投稿・商品を探す</a>`;
 app.querySelector('.share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);app.querySelector('.share-status').textContent='URLをコピーしました。';}catch{app.querySelector('.share-status').textContent=`このURLをコピーしてください：${location.href}`;}});
 app.querySelector('.video-poster')?.addEventListener('click',()=>{const video=document.createElement('video');video.controls=true;video.playsInline=true;video.autoplay=true;video.src=post.videoUrl;video.poster=post.cover;app.querySelector('.video').replaceChildren(video);});
}
function route(){const path=location.hash.slice(1)||'/';if(path==='/'||path==='/products'){home();if(path==='/products')requestAnimationFrame(()=>document.querySelector('#catalog').scrollIntoView());else window.scrollTo(0,0);}else if(/^\/posts\/\d{2}$/.test(path)){postPage(path.split('/')[2]);window.scrollTo(0,0);}else{app.innerHTML='<h1>ページが見つかりませんでした。</h1><a href="#/">トップへ戻る</a>';}}
try{
 [products,posts,settings]=await Promise.all(['products','posts','settings'].map(async name=>{const res=await fetch(`${demoPreview && name !== 'settings' ? 'demo-data' : 'data'}/${name}.json`);if(!res.ok)throw Error(name);return res.json();}));
 document.querySelector('.notice').innerHTML=(demoPreview ? '<span>SAMPLE</span> サンプル表示：仮の商品と画像で、サイトの使い方を確認できます。' : '<span>広告</span> 当サイトはアフィリエイト広告を利用しています')+settings.programDisclosures.map(s=>`<div>${esc(s)}</div>`).join('');
 route();window.addEventListener('hashchange',route);
}catch(e){app.innerHTML='<h1>データを読み込めませんでした。</h1><p>プレビューサーバーから開き、再読み込みしてください。</p>';console.error(e);}
