import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {buildPrPages} from './pr-pages.mjs';
const root=new URL('../',import.meta.url);
const load=path=>readFile(new URL(path,root),'utf8');
const {guides,categories}=JSON.parse(await load('data/pr-guides.json'));
await buildPrPages();
test('6件の提供A8広告でリンク・バナー・計測ピクセルの組み合わせを保持',async()=>{
 const expected=[
 ['newtrip','4BGMK5+BET5QA+5VYU+5ZMCH','www24','261116213690','27471001006000','www13'],
 ['osumac','4BGMK5+BE7Q4I+5TWE+5YZ75','www20','261116213689','27203001003000','www12'],
 ['travelwest','4BGMK5+BCFFB6+4R2M+ZRIB5','www24','261116213686','22171006007000','www19'],
 ['big-holiday-ski','4BGMK5+BD0UWY+57BW+BXB8X','www23','261116213687','24278002003000','www13'],
 ['dearmini','4BGMK5+BB8K3M+5YCY+5ZEMP','www29','261116213684','27781001005000','www11'],
 ['hyacca','4BGMK5+ATYZK2+5VGS+5ZEMP','www23','261116213655','27406001005000','www15']];
 assert.equal(guides.length,7);assert.equal(categories.length,4);
 for(const [id,code,server,aid,mid,pixel] of expected){
  const p=guides.find(p=>p.id===id),ad=await load(p.adPath),html=await load(`dist/pr/${id}/index.html`);
  const exact=`<a href="https://px.a8.net/svt/ejp?a8mat=${code}" rel="nofollow">\n<img border="0" width="300" height="250" alt="" src="https://${server}.a8.net/svt/bgt?aid=${aid}&wid=003&eno=01&mid=s000000${mid}&mc=1"></a>\n<img border="0" width="1" height="1" src="https://${pixel}.a8.net/0.gif?a8mat=${code}" alt="">`;
  assert.equal(ad.trim(),exact);assert.ok(html.includes(ad));
  assert.equal((html.match(/href="https:\/\/px\.a8\.net\//g)||[]).length,1);
  assert.equal((html.match(/\.a8\.net\/0\.gif\?/g)||[]).length,1);
 }
});
test('記事・カテゴリは独立URLで、広告表示と公式出典、生成画像の注記を備える',async()=>{
 for(const p of guides){
  const html=await load(`dist/pr/${p.id}/index.html`);
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  assert.ok(html.includes('このページはアフィリエイト広告を利用しています'));
  assert.ok(html.includes(`href="${p.officialUrl}"`));
  assert.ok(html.includes('実使用・利用のレビューではありません'));
  assert.ok(html.includes('申し込み・購入前のチェック'));
  if(p.hero){assert.ok(p.imageNote.startsWith('AI生成'));assert.ok(html.includes(p.imageNote));}
  const cat=await load(`dist/pr/${p.category}/index.html`);assert.ok(cat.includes(`href="/pr/${p.id}/"`));
 }
 const index=await load('dist/pr/index.html');for(const p of guides)assert.ok(index.includes(`href="/pr/${p.id}/"`));
 assert.ok((await load('index.html')).includes('href="/pr/"'));assert.ok((await load('app.js')).includes('pr-home-entry'));
});
test('PR出力内のローカルリンク・画像・スタイルに欠落がない',async()=>{
 const pages=['',...categories.map(p=>p.id+'/'),...guides.map(p=>p.id+'/')];
 for(const path of pages){
  const html=await load(`dist/pr/${path}index.html`);
  for(const match of html.matchAll(/(?:src|href)="(\/(?!\/)[^"#]*)/g)){
   let target=match[1];if(target.endsWith('/'))target+='index.html';
   await access(new URL('dist'+target,root));
  }
 }
});

test('メルカリの最新広告タグとコードを保持し、トップとPR一覧から到達できる',async()=>{
 const ad=await load('affiliate/a8-mercari.html'),html=await load('dist/pr/mercari/index.html');
 assert.equal(ad.trim(),'<a href="https://px.a8.net/svt/ejp?a8mat=4BGMK5+E39DQA+5LNQ+5YJRM" rel="nofollow">メルカリ</a>\n<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4BGMK5+E39DQA+5LNQ+5YJRM" alt="">');
 assert.ok(html.includes(ad));assert.ok(html.includes('<code>ZGSHGG</code>'));assert.ok(html.includes('運営者にもポイント'));
 assert.ok(html.includes('a8-text-ad'));assert.ok((await load('app.js')).includes('href="/pr/mercari/"'));
 assert.ok((await load('dist/pr/index.html')).includes('href="/pr/mercari/"'));
 assert.ok(!html.includes('5YRHE'));
});
