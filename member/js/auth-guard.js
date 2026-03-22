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

      // ダッシュボード画面：「お帰りなさい」表示の更新
      if (window.location.pathname.includes('dashboard.html')) {
        const greetingH1 = document.querySelector('h1');
        if (greetingH1 && greetingH1.textContent.includes('お帰りなさい')) {
          greetingH1.textContent = `お帰りなさい、${userName} 様`;
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
