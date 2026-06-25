# 宮古島防衛戦線

Phaser 3 + Vite で作った、にゃんこ大戦争風の横ライン防衛ゲームのプロトタイプです。

## 推奨: Docker 開発環境

ホスト側に Node.js / pnpm を入れず、プロジェクト専用コンテナ内で開発できます。

必要なもの:

- Docker
- Docker Compose

起動:

```sh
docker compose up --build
```

表示された URL、または次の URL をブラウザで開くとゲームを確認できます。

```text
http://localhost:5173
```

停止:

```sh
docker compose down
```

依存関係を完全に作り直したい場合:

```sh
docker compose down -v
docker compose up --build
```

Cursor / VS Code の Dev Containers を使う場合は、このプロジェクトをコンテナで開けます。開いたあとに `pnpm dev` を実行してください。

## ホストで動かす場合

- Node.js 22 以上
- pnpm

Node のバージョン管理に `nvm` を使っている場合は、プロジェクトルートで次を実行します。

```sh
nvm install
nvm use
```

pnpm が未インストールの場合は、Node.js を入れたあとに次を実行します。

```sh
npm install -g pnpm
```

## セットアップ

```sh
pnpm install
```

## 開発サーバー

```sh
pnpm dev
```

表示された URL をブラウザで開くとゲームを確認できます。

## ビルド

```sh
pnpm build
```

ビルド成果物は `dist/` に出力されます。

## 操作方法

- 台風軍団は左から右へ進み、右側の宮古島陣地を狙います。
- 下部メニューの守くん風キャラをクリックすると、シマコインを消費して右側から出撃します。
- 出撃したキャラは左へ進み、台風軍団と接触すると自動で攻撃します。
- 台風発生源を破壊するか、すべての敵を退けるとクリアです。
- 宮古島陣地の HP が 0 になるとゲームオーバーです。

## 画像の配置先

今は画像ファイルなしでも図形プレースホルダーで動きます。あとから写真やイラストを入れる場合は、次の9個の PNG ファイルを置いてください。

```text
public/assets/enemies/taihu01.png
public/assets/enemies/taihu02.png
public/assets/enemies/rain.png
public/assets/enemies/gust.png
public/assets/enemies/thunder.png

public/assets/characters/yamada.png
public/assets/characters/huki.png
public/assets/characters/yuta.png
public/assets/characters/shige.png
public/assets/characters/kasshi.png
public/assets/characters/jumatsu.png

public/assets/backgrounds/11317783i.png
public/assets/bases/miyakojima_base.png
```

## 山田専用効果音の配置先

山田だけ、出撃・攻撃・被弾時に専用効果音を再生します。次の3つの M4A ファイルを置いてください。

```text
public/assets/sounds/characters/ikuze.m4a
public/assets/sounds/characters/ei.m4a
public/assets/sounds/characters/u.m4a
```

## 十松専用効果音の配置先

十松は出撃時と攻撃時に同じ効果音を再生します。次の M4A ファイルを置いてください。

```text
public/assets/sounds/characters/jumatsu_action.m4a
```

## しげ専用効果音の配置先

しげは出撃時に効果音を再生します。次の MP3 ファイルを置いてください。

```text
public/assets/sounds/characters/shige_action.mp3
```

## BGM の配置先

ゲーム中にループ再生するBGMは、次のファイル名で置いてください。ブラウザの自動再生制限に合わせて、最初のクリックまたはキー入力後に再生されます。

```text
public/assets/sounds/bgm/沖縄風BGM.mp3
```
