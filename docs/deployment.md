# ORIGAMI GRP メンバーズ デプロイ手順書

> Phase 8：本番切替時の作業手順書。Phase 1〜7 と Phase 4（Stripe）の実装完了後に実行する。

---

## 1. 準備するアカウント

| サービス | 用途 | 取得タイミング |
|---|---|---|
| Vercel | ホスティング | 必須・最初に |
| Stripe | サブスク + Connect | Stripe再申請通過後 |
| Resend | メール送信 | Phase 4-5 で必要 |
| Google Cloud | Calendar / Meet API | 任意（Phase 6 拡張時） |

## 2. Stripe セットアップ（再申請通過後）

### 2-1. Products を作成
Stripe Dashboard → Products → 3つ作成：
- ライトプラン: ¥4,980/月
- スタンダードプラン: ¥10,000/月
- プレミアムプラン: ¥19,800/月

各 Price ID を控えておく（`price_xxx`）。

### 2-2. Webhook エンドポイント登録
Dashboard → Webhooks → Add endpoint：
- URL: `https://members.origami-grp.com/api/stripe/webhook`
- 受信イベント：
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
  - `account.updated`

発行された **Signing Secret** (`whsec_xxx`) を控える。

### 2-3. Connect 設定
Dashboard → Connect → Settings：
- Branding（ロゴ・カラー）を ORIGAMI GRP に設定
- Express プラットフォーム名を「ORIGAMI GRP」に
- 利用規約 URL を設定

---

## 3. Vercel デプロイ

### 3-1. プロジェクト作成
1. [Vercel Dashboard](https://vercel.com/new) で「Import Git Repository」
2. `Chaochuuru242/ORIGAMI-GRP-HP` を選択
3. **Root Directory**: `origami-members` ⚠ 必須
4. Framework Preset: Next.js（自動検出）
5. Build Command / Output Directory はデフォルト

### 3-2. 環境変数設定
Project Settings → Environment Variables に以下を追加：

```
NEXT_PUBLIC_SUPABASE_URL=https://gfvnnxuupdmbuxejyfck.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=（Supabase ダッシュボードからコピー）
SUPABASE_SERVICE_ROLE_KEY=（Supabase ダッシュボードからコピー）

STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_LIGHT=price_xxx
STRIPE_PRICE_STANDARD=price_xxx
STRIPE_PRICE_PREMIUM=price_xxx
STRIPE_CONNECT_CLIENT_ID=ca_xxx

RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@origami-grp.com

NEXT_PUBLIC_APP_URL=https://members.origami-grp.com
```

⚠ Test キー（`sk_test_xxx`）と Live キー（`sk_live_xxx`）を間違えないこと。

### 3-3. ドメイン設定
Project Settings → Domains：
- 本番ドメイン（例：`members.origami-grp.com`）を追加
- DNS レコードを設定（CNAME を Vercel が指示）

---

## 4. Supabase 本番準備

### 4-1. Production プロジェクトの確認
- 既存プロジェクト `gfvnnxuupdmbuxejyfck` をそのまま本番として利用
- migrations 01〜03 が実行済みであることを確認（[supabase/migrations/RUN_ORDER.md](../origami-members/supabase/migrations/RUN_ORDER.md)）

### 4-2. Auth 設定
Supabase Dashboard → Authentication → URL Configuration：
- Site URL: `https://members.origami-grp.com`
- Redirect URLs:
  - `https://members.origami-grp.com/login`
  - `https://members.origami-grp.com/password-update`

---

## 5. 旧静的サイトの取り扱い

### 選択肢 A：完全置き換え（推奨）
1. Vercel 設定で Root Directory = `origami-members` にする
2. 旧 `member/`、`admin/`、ルートの static HTML は **デプロイ対象外** になる
3. 旧URLからの 301 リダイレクトを `next.config.ts` で設定（後述）

### 選択肢 B：並列稼働（移行期間）
1. 旧サイト：別の Vercel プロジェクト or サブドメイン
2. 新サイト：本番ドメイン
3. ユーザーには新サイトを案内

### 旧URLからの 301 リダイレクト

`origami-members/next.config.ts` に以下を追加：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 旧 member/ HTML → 新ルート
      { source: "/member/index.html",        destination: "/",                 permanent: true },
      { source: "/member/login.html",        destination: "/login",            permanent: true },
      { source: "/member/register.html",     destination: "/register",         permanent: true },
      { source: "/member/dashboard.html",    destination: "/dashboard",        permanent: true },
      { source: "/member/contents.html",     destination: "/contents",         permanent: true },
      { source: "/member/content-detail.html", destination: "/contents",       permanent: true },
      { source: "/member/profile.html",      destination: "/profile",          permanent: true },
      { source: "/member/account-billing.html", destination: "/account/billing", permanent: true },
      { source: "/member/pricing.html",      destination: "/pricing",          permanent: true },
      { source: "/member/support.html",      destination: "/support",          permanent: true },
      { source: "/member/upload.html",       destination: "/upload",           permanent: true },
      { source: "/member/faq.html",          destination: "/faq",              permanent: true },
      { source: "/member/password-reset.html", destination: "/password-reset", permanent: true },
      { source: "/member/password-update.html", destination: "/password-update", permanent: true },
      // 旧 admin/ HTML → 新管理画面
      { source: "/admin/login.html",         destination: "/login",            permanent: true },
      { source: "/admin/index.html",         destination: "/admin",            permanent: true },
    ];
  },
};

export default nextConfig;
```

---

## 6. データ移行

### 移行対象（既存DBに残留・そのまま利用）
| テーブル | 状態 |
|---|---|
| profiles | ✓ 既存データそのまま |
| videos | ✓ 既存データそのまま（category_id は「未分類」が初期割当） |
| video_views | ✓ 既存データそのまま |
| video_downloads | ✓ 既存データそのまま |
| news | ✓ 既存データそのまま（body は title をコピー） |
| admin_users | ⚠ profiles.role='admin' に統合済み。**Phase 8 完了後に DROP 検討** |

### 既存ユーザーの Stripe 移行
- 既存ユーザーは Stripe Customer がない状態
- 初回プラン購入時に自動で Customer 作成（[checkout/route.ts](../origami-members/app/api/stripe/checkout/route.ts) 参照）
- 既存有料会員は admin 画面で手動でプランを設定後、本人に「決済情報を再登録してください」とメール案内

### admin_users テーブル削除
本番切替後、admin 動作が問題ないことを 1〜2週間確認後：
```sql
DROP TABLE public.admin_users;
```

---

## 7. 本番切替手順

### Step 1：本番デプロイ前
- [ ] Stripe Live キー取得・環境変数に設定
- [ ] Webhook URL 登録・Signing Secret 取得
- [ ] Resend ドメイン認証完了
- [ ] テスト：Test キーで Stripe Checkout が動くか確認
- [ ] テスト：Webhook が届いて profiles.plan が更新されるか確認

### Step 2：本番デプロイ
- [ ] Vercel に Live キーをセット
- [ ] `git push origin main` → 自動デプロイ
- [ ] 本番ドメインで `/login` `/dashboard` `/pricing` が動くか確認

### Step 3：旧サイトとの切替
- [ ] DNS を新サイトに向ける（旧サイトは別ドメイン or サブドメインへ退避）
- [ ] 旧URLの 301 リダイレクト確認
- [ ] サポートに「メンバーズサイトをリニューアルしました」アナウンス

### Step 4：監視
- [ ] Vercel ログ監視（最初の24時間）
- [ ] Stripe Webhook の失敗監視
- [ ] Supabase の Error Log 確認

---

## 8. ロールバック手順

### Stripe 関連が壊れた場合
1. Vercel 環境変数 `STRIPE_SECRET_KEY` を空に
2. Redeploy
3. アプリは Stripe 抜きモードに戻る（プラン購入・面談決済が動作停止）

### Next.js デプロイ自体が壊れた場合
1. Vercel Dashboard → Deployments
2. 直前の安定デプロイを「Promote to Production」

### Supabase 変更を巻き戻したい場合
- [supabase/migrations/RUN_ORDER.md](../origami-members/supabase/migrations/RUN_ORDER.md) のロールバック手順を参照

---

## 9. 旧静的サイトの最終削除

本番切替・安定運用 1〜2 週間後、旧 HTML を物理削除：

```bash
git rm -r member/ admin/
git rm index.html about.html ai-school.html company.html contact.html \
       faq.html legal.html pricing.html privacy.html recruit.html \
       styles.css robots.txt sitemap.xml
git rm -r assets/ images/
git commit -m "Remove legacy static HTML site (replaced by origami-members/)"
```

origami-members を root に昇格させたい場合は、別途 monorepo 構成または mv 作業が必要。

---

## 更新履歴
- 2026-05-10：初版作成（Phase 1-7 + Phase 4 Stripe 実装完了時点）
