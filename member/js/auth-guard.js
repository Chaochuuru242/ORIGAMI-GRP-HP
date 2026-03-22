// auth-guard.js
(async function() {
  const supabaseUrl = 'https://gfvnnxuupdmbuxejyfck.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmdm5ueHV1cGRtYnV4ZWp5ZmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY3NjAsImV4cCI6MjA4OTExMjc2MH0.Eq0AVSyY9Jy3dxt-RxwQvJcrntX5y3L2dhhcIz9tWnk';

  // Supabase ライブラリの存在チェック
  if (!window.supabase) {
    console.error('Supabase library is not loaded. Redirecting to login.');
    window.location.replace('login.html');
    return;
  }

  const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (error || !session) {
    // 失敗または未ログイン時は強制リダイレクト
    window.location.replace('login.html');
  } else {
    // ログアウト処理の共通関数
    window.handleLogout = async function(e) {
      if (e) e.preventDefault();
      await supabaseClient.auth.signOut();
      window.location.href = 'login.html';
    };

    const showBody = async () => {
      // '<style>' タグの none を上書き
      document.body.style.display = 'block';
      
      // HTMLの全書き換えを避けるため、「ログアウト」リンクへ自動でログアウト処理を付与
      document.querySelectorAll('a[href="login.html"]').forEach(btn => {
        if (btn.textContent.includes('ログアウト') || btn.innerText.includes('ログアウト')) {
          btn.addEventListener('click', window.handleLogout);
        }
      });

      // ユーザーの DB (profiles) 情報またはメタデータを取得
      const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single();
      const userRole = profile?.role || session.user?.user_metadata?.role || 'user';
      const userName = profile?.full_name || session.user?.user_metadata?.full_name || 'ゲスト';
      const userKana = profile?.full_name_kana || '';
      const userEnglish = profile?.full_name_english || '';
      const userEmail = session.user?.email || '';

      // ★ 今後の動画出し分け・権限判定用ロジックの下準備（プラン情報の取得・保持） ★
      // 'light', 'standard', 'premium'（未課金は'free'）などの値が入る想定
      const userPlan = (profile?.plan || 'free').trim().toLowerCase();
      window.currentUserPlan = userPlan; // 他のJavaScriptからも簡単に自分のプランを参照できるようにする
      window.currentUserRole = userRole; // 権限情報も保持（管理者判定用など）

      // ★ プロフィール未設定者に対する強制遷移処理 ★
      // フリガナか英語表記が空文字 または '未設定' の場合は未完了とみなす
      const isProfileIncomplete = !userKana || userKana === '未設定' || !userEnglish || userEnglish === '未設定';
      const isProfilePage = window.location.pathname.includes('profile.html');

      if (isProfileIncomplete && !isProfilePage) {
        // プロフィール未設定のまま他の画面を開いた人は強制的に設定画面（profile.html）へ飛ばす
        alert('【重要】サービスをご利用いただく前に、ご本人のプロフィール情報（フリガナと英語表記）の設定・保存をお願いいたします。設定画面へ移動します。');
        window.location.replace('profile.html');
        return; // これ以上下の処理（画面表示など）を実行しない
      }

      // ダッシュボード画面の動的表示更新（名前・ランク）
      if (window.location.pathname.includes('dashboard.html')) {
        const header = document.querySelector('.member-main-content header');
        if (header) {
          // お帰りなさい、〇〇 様
          const greetingH1 = header.querySelector('h1');
          if (greetingH1 && greetingH1.textContent.includes('お帰りなさい')) {
            greetingH1.textContent = `お帰りなさい、${userName} 様`;
          }

          // 会員バッジ（現在のステータス）
          const statusBadge = header.querySelector('.status-badge');
          if (statusBadge) {
            let rankLabel = '無料会員';
            let style = { bg: '#f5f5f5', text: '#757575', border: '#e0e0e0' }; // デフォルト

            if (userPlan === 'light') {
              rankLabel = 'ライト会員';
              style = { bg: '#e8f5e9', text: '#2e7d32', border: '#c8e6c9' };
            } else if (userPlan === 'standard') {
              rankLabel = 'スタンダード会員';
              style = { bg: '#fff8e1', text: '#ff8f00', border: '#ffe082' };
            } else if (userPlan === 'premium') {
              rankLabel = 'プレミアム会員';
              style = { bg: '#fff8e1', text: '#ff8f00', border: '#ffe082' };
            } else if (userRole === 'admin' || userRole === 'adder') {
              rankLabel = '管理者';
              style = { bg: '#e0f2f1', text: '#00695c', border: '#b2dfdb' };
            }

            statusBadge.textContent = rankLabel;
            statusBadge.style.background = style.bg;
            statusBadge.style.color = style.text;
            statusBadge.style.border = style.border;
          }

          // 1. 視聴進捗の取得と表示
          const updateProgress = async () => {
             // 全動画（公開中）の取得
             const { data: allVideos } = await supabaseClient.from('videos').select('target_plan').eq('status', 'published');
             // 視聴履歴の取得
             const { data: views } = await supabaseClient.from('video_views').select('video_id').eq('user_id', session.user.id);
             
             if (allVideos) {
               // プランに応じた視聴可能動画の絞り込み
               let allowedPlans = ['all'];
               if (userPlan === 'light') allowedPlans = ['all', 'light'];
               if (userPlan === 'standard') allowedPlans = ['all', 'light', 'standard'];
               if (userPlan === 'premium') allowedPlans = ['all', 'light', 'standard', 'premium'];
               
               const targetVideos = allVideos.filter(v => {
                 const p = (v.target_plan || 'all').trim().toLowerCase();
                 return userRole === 'admin' || userRole === 'adder' || allowedPlans.includes(p);
               });

               const totalCount = targetVideos.length;
               const watchedIds = new Set((views || []).map(v => v.video_id));
               // 視聴済みかつ、現在視聴可能な動画のみカウント（念のため）
               const watchedCount = Array.from(watchedIds).filter(id => {
                  // videosテーブルに存在するか、または単純にカウントするか
                  // ここではシンプルに全視聴済みユニーク数を出す（分母はプラン内総数）
                  return true; 
               }).length;

               const percent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

               const pText = document.getElementById('dash-progress-text');
               const pPercent = document.getElementById('dash-progress-percent');
               const pBar = document.getElementById('dash-progress-bar');

               if (pText) pText.textContent = `全動画 ${totalCount}本中 ${watchedCount}本視聴済み`;
               if (pPercent) pPercent.textContent = `${percent}%`;
               if (pBar) pBar.style.width = `${percent}%`;
             }
          };

          // 2. 最新のお知らせ取得
          const updateNews = async () => {
             const newsList = document.getElementById('dash-news-list');
             if (!newsList) return;

             // テーブルが存在するか不明なため、try-catch
             try {
               const { data: newsData, error } = await supabaseClient.from('news').select('*').order('created_at', { ascending: false }).limit(3);
               if (error || !newsData || newsData.length === 0) throw new Error();
               
               newsList.innerHTML = '';
               newsData.forEach((n, idx) => {
                 const date = new Date(n.created_at).toLocaleDateString('ja-JP').replace(/\//g, '.');
                 const isLast = idx === newsData.length - 1;
                 const li = document.createElement('li');
                 li.style.paddingBottom = isLast ? '0' : '12px';
                 li.style.borderBottom = isLast ? 'none' : '1px solid var(--border)';
                 li.style.marginBottom = isLast ? '0' : '12px';
                 li.innerHTML = `
                   <span style="display: block; font-size: 11px; color: var(--text-muted);">${date}</span>
                   ${n.title}
                 `;
                 newsList.appendChild(li);
               });
             } catch (e) {
               // テーブルがない、またはデータがない場合はデフォルトを表示（またはそのまま）
               // 現状の内容を維持、もしくは「お知らせはありません」にする
             }
          };

          // 3. おすすめコンテンツの取得
          const updateFeatured = async () => {
             const grid = document.getElementById('dash-featured-grid');
             if (!grid) return;

             const { data: featuredVideos } = await supabaseClient.from('videos')
               .select('*')
               .eq('status', 'published')
               .order('created_at', { ascending: false })
               .limit(2);

             if (featuredVideos && featuredVideos.length > 0) {
               grid.innerHTML = '';
               featuredVideos.forEach(v => {
                 let thumbUrl = v.thumbnail_url || '';
                 if (!thumbUrl && v.video_url.includes('youtube.com/watch?v=')) {
                   const vid = new URL(v.video_url).searchParams.get('v');
                   thumbUrl = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
                 }
                 
                 const thumbHtml = thumbUrl 
                   ? `<img src="${thumbUrl}" style="width:100%; height:100%; object-fit:cover;">`
                   : `<span>Thumbnail</span>`;

                 const card = `
                   <div class="content-item">
                     <div class="content-thumb" style="overflow:hidden; height:140px; background:#1e293b; display:flex; justify-content:center; align-items:center;">
                       ${thumbHtml}
                     </div>
                     <div class="content-info">
                       <h4 style="margin-bottom:8px; font-size:14px;">${v.title}</h4>
                       <p class="content-meta">公式動画 | プラン: ${v.target_plan}</p>
                       <a href="content-detail.html?id=${v.id}" style="display: block; margin-top: 12px; font-size: 13px; font-weight: 700; color: var(--primary);">視聴する</a>
                     </div>
                   </div>
                 `;
                 grid.insertAdjacentHTML('beforeend', card);
               });
             }
          };

          updateProgress();
          updateNews();
          updateFeatured();
        }
      }


      // ★ 動画登録(upload.html)へのアクセス制限（AdderとAdmin以外は弾く） ★
      const isUploadPage = window.location.pathname.includes('upload.html');
      const isAdminOrAdder = userRole === 'admin' || userRole === 'adder';
      
      // サイドバーの「動画の登録」メニューの表示制御（権限がある人だけ表示する）
      if (isAdminOrAdder) {
        document.querySelectorAll('.adder-menu').forEach(menu => menu.style.display = 'block');
      }
      if (isUploadPage && !isAdminOrAdder) {
        alert('このページはコンテンツ管理担当者専用です。');
        window.location.replace('dashboard.html');
        return;
      }

      // プロフィール画面：フォームの初期値更新と更新処理
      if (isProfilePage) {
        const inputs = document.querySelectorAll('.profile-input');
        const saveBtn = document.querySelector('.profile-btn-primary');

        // 初期値のセット
        if (inputs.length >= 4) {
          inputs[0].value = userName === '未設定' ? '' : userName; // 氏名
          inputs[1].value = userKana === '未設定' ? '' : userKana; // フリガナ
          inputs[2].value = userEnglish === '未設定' ? '' : userEnglish; // 英語表記
          inputs[3].value = userEmail; // メールアドレス
        }

        // 保存ボタンクリック時の更新処理（Supabase profiles テーブルへ保存）
        if (saveBtn && inputs.length >= 4) {
          saveBtn.addEventListener('click', async (e) => {
            // HTML5のバリデーションを手動で発動
            const form = saveBtn.closest('form');
            if (form && !form.checkValidity()) {
              form.reportValidity();
              return;
            }

            const newName = inputs[0].value;
            const newKana = inputs[1].value;
            const newEnglish = inputs[2].value;
            const originalText = saveBtn.textContent;
            
            saveBtn.disabled = true;
            saveBtn.textContent = '保存中...';

            // ① profiles テーブルに上書き保存 (UPDATE)
            const { error: dbError } = await supabaseClient.from('profiles').update({
              full_name: newName,
              full_name_kana: newKana,
              full_name_english: newEnglish
            }).eq('id', session.user.id);

            // ② 念のためメタデータ側も並行して同期しておく
            const { error: metaError } = await supabaseClient.auth.updateUser({
              data: { full_name: newName, full_name_kana: newKana, full_name_english: newEnglish }
            });

            if (dbError || metaError) {
              alert('保存に失敗しました: ' + (dbError?.message || metaError?.message));
            } else {
              alert('プロフィール情報の更新が完了しました。全機能をご利用いただけます。');
              window.location.reload(); // 表示を最新にするためリロード
            }
            
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
          });
        }
      }
    };
    
    // HTMLのロード状態に応じて表示処理を実行
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', showBody);
    } else {
      showBody();
    }
  }
})();
