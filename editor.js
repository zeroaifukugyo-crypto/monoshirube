import {buildUpdate, validateProducts, validatePosts} from './update-data.js';
const form=document.querySelector('#entry-form');
let products=[],posts=[],ready=false;
const blobs=[];
const merchantBox=document.querySelector('#merchants');
const status=document.querySelector('#editor-status');
function addMerchant(values={}){
 const section=document.createElement('div');section.className='merchant-entry';
 section.innerHTML='<div class="fields"><label>販売先名<input data-field="name" placeholder="Amazon、楽天市場など"></label><label>発行されたアフィリエイトURL<input data-field="affiliateUrl" type="url" placeholder="https://"></label></div><div class="checks"><label><input data-field="verified" type="checkbox">サービスで発行された商品リンクと遷移先を確認した</label></div><button type="button">この販売先を削除</button>';
 for(const input of section.querySelectorAll('input')){if(input.type==='checkbox')input.checked=values[input.dataset.field]===true;else input.value=values[input.dataset.field]||'';}
 section.querySelector('button').onclick=()=>section.remove();merchantBox.append(section);
}
function inputData(){const data=Object.fromEntries(new FormData(form));for(const checkbox of form.querySelectorAll('input[type=checkbox][name]'))data[checkbox.name]=checkbox.checked;data.merchants=[...merchantBox.children].map(el=>Object.fromEntries([...el.querySelectorAll('input')].map(i=>[i.dataset.field,i.type==='checkbox'?i.checked:i.value])));return data;}
function hideOutput(){document.querySelector('#downloads').hidden=true;blobs.splice(0).forEach(url=>URL.revokeObjectURL(url));}
form.addEventListener('input',hideOutput);
document.querySelector('#add-merchant').onclick=()=>{addMerchant();hideOutput();};addMerchant();
function summary(){document.querySelector('#edit-existing').replaceChildren(new Option('新しい商品を追加',''),...products.map(p=>new Option(`${p.brand||''} ${p.name}`,p.id)));document.querySelector('#loaded-summary').textContent=`読み込み済み：商品${products.length}件・投稿${posts.length}件。書き出しはこの一覧を引き継ぎます。`;}
try{[products,posts]=await Promise.all(['products','posts'].map(async n=>{const response=await fetch(`data/${n}.json`);if(!response.ok)throw Error('読み込み失敗');return response.json();}));validateProducts(products);validatePosts(posts);ready=true;summary();}catch{status.textContent='既存データを取得できません。最新のproducts.jsonとposts.jsonを両方読み込んでください。';}
const imported=new Set();
for(const type of ['products','posts'])document.querySelector(`#import-${type}`).onchange=async event=>{try{const file=event.target.files[0];if(!file)return;const data=JSON.parse(await file.text());(type==='products'?validateProducts:validatePosts)(data);if(type==='products')products=data;else posts=data;imported.add(type);ready=ready||imported.size===2;summary();hideOutput();status.textContent=`${type}.jsonを読み込みました。`;}catch(e){status.textContent=e.message;}};
document.querySelector('#save-local').onclick=()=>{try{localStorage.setItem('monoshirube-editor',JSON.stringify(inputData()));status.textContent='入力内容をこの端末に保存しました。画像ファイルは別途保存してください。';}catch{status.textContent='このブラウザでは端末への保存ができません。';}};
document.querySelector('#restore-local').onclick=()=>{try{const raw=localStorage.getItem('monoshirube-editor');if(!raw){status.textContent='保存された入力内容はありません。';return;}const data=JSON.parse(raw);for(const el of form.elements){if(!el.name)continue;if(el.type==='checkbox')el.checked=data[el.name]===true;else el.value=data[el.name]||'';}merchantBox.replaceChildren();(data.merchants||[{}]).forEach(addMerchant);hideOutput();status.textContent='保存した入力内容を復元しました。';}catch{status.textContent='保存内容を復元できませんでした。';}};
document.querySelector('#clear-local').onclick=()=>{try{localStorage.removeItem('monoshirube-editor');status.textContent='端末の保存内容を削除しました。現在の入力は残っています。';}catch{status.textContent='削除できませんでした。';}};
form.onsubmit=event=>{event.preventDefault();const message=document.querySelector('#validation');hideOutput();try{if(!ready)throw Error('既存のproducts.jsonとposts.jsonを両方読み込んでください。');const updated=buildUpdate(products,posts,inputData());for(const type of ['products','posts']){const url=URL.createObjectURL(new Blob([JSON.stringify(updated[type],null,2)+'\n'],{type:'application/json'}));blobs.push(url);document.querySelector(`#download-${type}`).href=url;}document.querySelector('#output').textContent=JSON.stringify(updated,null,2);document.querySelector('#downloads').hidden=false;message.textContent='更新ファイルを作りました。画像のアップロードとGitHubへの反映後、プレビューを確認してください。';}catch(e){message.textContent=e.message;}};

document.querySelector('#edit-existing').addEventListener('change',event=>{
 const p=products.find(p=>p.id===event.target.value);if(!p)return;
 const post=posts.find(post=>post.productIds.includes(p.id))||{};
 const data={id:p.id,brand:p.brand||'',name:p.name,category:p.category,photoSrc:p.photo?.src||'',description:p.description,check:p.check,status:p.status,sourceName:p.photo?.sourceName||'',sourceUrl:p.photo?.sourceUrl||'',termsUrl:p.photo?.termsUrl||'',credit:p.photo?.credit||'',usageConditions:p.photo?.usageConditions||'',commercialUseAllowed:p.photo?.commercialUseAllowed,websiteUseAllowed:p.photo?.websiteUseAllowed,modificationAllowed:p.photo?.modificationAllowed,photoVerified:p.photo?.verified,photoDate:p.photo?.verifiedAt||'',specificationSourceName:p.editorial?.specificationSourceName,specificationUrl:p.editorial?.specificationUrl,specDate:p.editorial?.checkedAt,number:post.number,postId:post.id,publishedAt:post.publishedAt?new Date(new Date(post.publishedAt).getTime()-new Date(post.publishedAt).getTimezoneOffset()*60000).toISOString().slice(0,16):'',displayOrder:post.displayOrder??'',postCategory:post.category,postStatus:post.status||'published',postTitle:post.title,cover:post.creativeAssets?.cover||post.cover,snsImage:post.snsImage,subtitle:post.subtitle,productIds:(post.productIds||[]).join(', '),background:post.creativeAssets?.background,decorations:(post.creativeAssets?.decorations||[]).join(', '),creativeNotes:post.creativeAssets?.notes,videoUrl:post.videoUrl,presentationSrc:p.presentation?.src,presentationApproved:p.presentation?.approvedForSite};
 for(const el of form.elements){if(!el.name)continue;if(el.type==='checkbox')el.checked=data[el.name]===true;else el.value=data[el.name]??'';}
 merchantBox.replaceChildren();(p.merchants?.length?p.merchants:[{}]).forEach(addMerchant);hideOutput();status.textContent='登録済みの内容を入力しました。変更して書き出せます。';
});
