# モノシルベ

TikTok・Instagramで紹介した商品を、投稿番号から探せる静的サイトです。提供いただいたロゴ画像をそのまま使用し、オレンジ・生成り・墨色で統一しています。

## Cloudflare Pagesで公開する

リポジトリ：https://github.com/zeroaifukugyo-crypto/monoshirube

Cloudflareの「Workers & Pages」から「Pages に続行」→ GitHubと接続し、このリポジトリを選びます。

| 設定 | 値 |
| --- | --- |
| 本番ブランチ | `main` |
| フレームワーク | なし（None） |
| ビルドコマンド | `npm run build` |
| 出力ディレクトリ | `dist` |
| ルートディレクトリ | 空欄（リポジトリのルート） |

保存してデプロイすると、Cloudflareが公開URLを発行します。その後はmainの更新で自動反映されます。まだ実商品は未登録なので、トップは準備中、`/demo.html` では仮の9商品を確認できます。

## 画面

- `/`：本番用。上部の投稿番号検索 → 投稿別特集 → 販売先へ。商品名検索とカテゴリ絞り込みにも対応。
- `/demo.html`：操作確認用。3特集・9点の仮データ。商品未登録でもサイトの完成イメージを確認できます。
- `/editor.html`：商品・投稿の更新データを書き出す補助画面。入力は外部に送信しません。端末への保存・復元・削除を選べます。サーバー保存、自動公開、ログインはありません。

本番用データは実商品の提供待ちのため空です。発行済みアフィリエイトリンクや写真の許諾を捏造していません。初期のSites配信は所有者向けの非公開確認用です。SNS訪問者が見られる一般公開設定とGitHub・Cloudflare Pagesの接続は別途行います。

## iPhoneで商品を追加する

1. サイトの `/editor.html` をSafariで開く。
2. 最新の `data/products.json` と `data/posts.json` を読み込む。初回は空の一覧で構いません。編集画面が自動で読むのは配信済みの公開商品だけなので、**下書きも含めて保持する場合はGitHubから最新の2ファイルを取得し、両方を必ず読み込んでください**。
3. 商品ID・名前・写真のパス・説明・販売先名・発行されたアフィリエイトURLを入力。写真の出典・利用条件・確認日と公開仕様の参照先も入力します。
4. 投稿番号を `01` のように指定。同じ投稿番号に商品を追加すると、その特集にひも付きます。商品IDの並びをカンマ区切りで指定すると、SNSで登場した順に並べられます。
5. 「確認して更新データを作る」を押し、`products.json` と `posts.json` をそれぞれ保存。ダウンロード項目が表示されない場合はSafariのダウンロード一覧・ファイルアプリを確認します。
6. GitHubで `data/products.json`、`data/posts.json` の同名ファイルを置き換える。写真は `assets/photos/`、表紙・背景・装飾は `assets/creative/` にアップロード。英数字・ハイフンのファイル名を推奨します。
7. プレビュービルドで `/#/posts/01` を直接開き、番号検索・商品順・画像・販売リンクを確認してから本番へ反映します。

入力を端末保存する場合、共用端末では作業後に保存内容を削除してください。画像ファイルそのものや商品一覧全体は端末保存機能の対象ではありません。編集画面は認証付き管理画面ではなく、JSONを作るツールです。URLを知っている人が使っても、サイトのデータを変更・公開する権限はありません。

### ファイルを直接編集する場合

`data/products.json` の配列内の商品1件分 `{ ... }` を複製し、次の例の各値を書き換えます。隣の商品との間にはカンマを入れ、最後には付けません。商品IDは重複させません。

```json
{
  "id": "cable-01",
  "name": "正式な商品名",
  "category": "デスク",
  "image": "",
  "description": "公開仕様に基づく短い紹介文",
  "check": "購入前に確認したいサイズや対応機種",
  "status": "draft",
  "merchants": [{ "name": "Amazon", "affiliateUrl": "", "verified": false }],
  "photo": {
    "src": "assets/photos/cable-01.jpg",
    "sourceName": "写真の提供元",
    "sourceUrl": "",
    "termsUrl": "",
    "usageConditions": "確認した条件を記録",
    "commercialUseAllowed": false,
    "websiteUseAllowed": false,
    "modificationAllowed": false,
    "verified": false,
    "verifiedAt": "",
    "credit": "指定された表記"
  },
  "editorial": {
    "basis": "public-specifications",
    "personallyUsed": false,
    "specificationUrl": "",
    "specificationSourceName": "メーカー公式仕様等",
    "checkedAt": ""
  }
}
```

`data/posts.json` の特集1件分を複製して変更します。同じ商品は同じIDを参照します。番号は01〜99の2桁・重複なしで設定してください。

```json
{
  "number": "01",
  "title": "デスク周りを整える3選",
  "subtitle": "作業スペースに小さな余白を。",
  "cover": "assets/creative/post-01-cover.jpg",
  "snsImage": "assets/creative/post-01-sns.jpg",
  "coverFit": "contain",
  "productIds": ["cable-01"],
  "videoUrl": "",
  "creativeAssets": {
    "cover": "assets/creative/post-01-cover.jpg",
    "background": "",
    "decorations": [],
    "origin": "AI-generated",
    "notes": "使用ツール・制作元・利用条件を記録"
  }
}
```

サイトの表紙は `creativeAssets.cover` を優先し、なければ `cover` を表示します。2つを設定するときは同じパスにします。SNS縦長原稿は `snsImage` で別管理し、サイトの表紙として自動流用しません。文字入り表紙は `contain` を使用します。動画は直接再生可能なHTTPSのMP4等を指定し、表紙の再生ボタンを押してから読み込みます。動画なしでも成立します。

## 写真と紹介内容

商品は購入・実使用をせず、公開仕様に基づいて紹介する運用です。商品カードにも「実使用なし・公開仕様に基づく紹介」と仕様の出典・確認日を表示します。使用感・体験談、架空の価格・レビュー・販売実績は作りません。

商品写真（`photo`）と、AI表紙・背景・装飾（特集の `creativeAssets`）を別ファイルで管理します。`image` はサンプルの仮イラスト用で、本番商品の写真には使いません。商品写真はAmazon・楽天の商品ページから無断流用せず、利用条件を確認した提供素材を使います。出典URL・条件参照URL・許可範囲・確認日を記録し、指定クレジットも記載します。SNS転載の許可とサイト掲載の許可はそれぞれ確認してください。

写真は縦横比を保った全体表示で、商品名・説明・ラベル・クレジットは写真の外側に置きます。サイトでトリミング・フィルター・背景除去・写真への文字の重ね合わせを行いません。加工不可・未確認の場合は `modificationAllowed: false` のままにし、AI素材との合成もしないでください。加工が許可されていても色・形・機能を変えて実物と誤認させないようにします。

公開には `status: "published"` に加えて、サービス発行のHTTPS商品リンクが1件以上あり `verified: true` であること、写真の出典・利用条件と商用／サイト掲載の許可が確認済みであること、公開仕様の参照先と確認日が必要です。未設定商品は本番表示されず、ビルド時も下書きを配信ファイルから除外します。URLの正当性や許諾内容を自動審査する機能ではありません。リンク・出典の実確認は人が行います。購入リンクは発行された文字列をそのまま保存し、パラメータを変更しません。提供HTMLが必須のプログラムは別途対応が必要で、許可された箇所以外は編集しません。

`data/settings.json` の `programDisclosures` にプログラム指定の追加広告文言を設定できます。サイト上部には常に広告表示を出します。

### SNSでの運用例

画像の1枚目または動画冒頭に、十分な大きさと読める時間で「広告・アフィリエイトリンクを含みます｜投稿 #01」。最後に「プロフィールのモノシルベ → #01で検索」と案内します。SNSとサイトで同じ投稿番号を使い、SNSや参加プログラムの指定表示にも従ってください。

## ビルドとプレビュー

Node.jsとPythonがあれば追加パッケージ不要です。

```sh
npm run check
npm test
npm run build
python3 -m http.server 3000 --directory dist
```

`http://localhost:3000/` が本番用、`http://localhost:3000/demo.html` がサンプル、`http://localhost:3000/editor.html` が追加ツールです。同じWi-FiのiPhoneからはPCのLAN内IP:3000を開きます。

Cloudflare Pages：フレームワークなし、ビルド `npm run build`、出力 `dist`。GitHub Pages：ビルドした `dist/` の中身をPagesの公開対象へ配置します。GitHubリポジトリにソースを配置済みです。Cloudflareアカウントとの接続・公開先選択は未実施です。有料サービス・独自ドメイン・データベース・決済は不要です。

## 検証と制限

投稿番号の正規化、公開判定、URLの保持、追加・更新時の既存データ保持、写真と表紙の分離、誤ったIDの拒否を自動テストしています。ビルドとJavaScriptの構文チェックも実施。現環境にはSites指定のブラウザQA経路がないため、この本番版のiPhone画面・Safari実機操作は未確認です。以前のデモの確認結果を本番版の検証済みとは扱っていません。
