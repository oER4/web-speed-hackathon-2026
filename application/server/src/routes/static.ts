import { createRequire } from "module";
import { readFileSync } from "node:fs";
import path from "path";

import history from "connect-history-api-fallback";
import { type Request, type Response, type NextFunction, Router } from "express";
import serveStatic from "serve-static";

import {
  CLIENT_DIST_PATH,
  PUBLIC_PATH,
  UPLOAD_PATH,
} from "@web-speed-hackathon-2026/server/src/paths";

export const staticRouter = Router();

// SSR バンドルをロード（ビルド済みの場合のみ）
const _require = createRequire(import.meta.url);
let ssrRender: ((url: string) => string) | null = null;

try {
  const ssrBundle = _require(path.join(CLIENT_DIST_PATH, "ssr-bundle.cjs")) as {
    render: (url: string) => string;
  };
  ssrRender = ssrBundle.render;
  console.log("[SSR] バンドル読み込み完了");
} catch {
  console.log("[SSR] バンドルが見つかりません。静的配信にフォールバックします");
}

const indexHtmlPath = path.join(CLIENT_DIST_PATH, "index.html");

// SSR ミドルウェア（HTML ナビゲーション要求のみ）
staticRouter.use((req: Request, res: Response, next: NextFunction) => {
  if (
    req.method !== "GET" ||
    req.path.includes(".") || // 拡張子あり = 静的ファイル
    ssrRender === null
  ) {
    return next();
  }

  try {
    // index.html はキャッシュせず毎回読み直す（ビルドのたびにハッシュが変わるため）
    const indexHtmlTemplate = readFileSync(indexHtmlPath, "utf-8");
    const appHtml = ssrRender(req.url);
    const html = indexHtmlTemplate.replace(
      '<div id="app"></div>',
      `<div id="app">${appHtml}</div>`,
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    return res.send(html);
  } catch (err) {
    console.error("[SSR] レンダリングエラー:", err);
    return next();
  }
});

// SPA 対応のため、ファイルが存在しないときに index.html を返す
staticRouter.use(history());

// アップロードファイル（UUID アドレッサブル: 変更なし）
staticRouter.use(
  serveStatic(UPLOAD_PATH, {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  }),
);

// 公開静的ファイル（フォント・画像・動画・音声 等）
staticRouter.use(
  serveStatic(PUBLIC_PATH, {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  }),
);

// クライアントビルド成果物
staticRouter.use(
  serveStatic(CLIENT_DIST_PATH, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("/index.html") || filePath.endsWith("\\index.html")) {
        // index.html は毎回検証（SPA エントリポイントのため）
        res.setHeader("Cache-Control", "no-cache");
      } else {
        // JS/CSS/フォント等: コンテンツハッシュ付きのため変更不可
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);
