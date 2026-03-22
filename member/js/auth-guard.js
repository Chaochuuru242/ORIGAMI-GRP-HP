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

    const showBody = () => {
      // '<style>' タグの none を上書き
      document.body.style.display = 'block';
      
      // HTMLの全書き換えを避けるため、「ログアウト」リンクへ自動でログアウト処理を付与
      document.querySelectorAll('a[href="login.html"]').forEach(btn => {
        if (btn.textContent.includes('ログアウト') || btn.innerText.includes('ログアウト')) {
          btn.addEventListener('click', window.handleLogout);
        }
      });

      // ユーザー情報の動的表示（ダッシュボードおよびプロフィール）
      const userName = session.user?.user_metadata?.full_name || 'ゲスト';
      const userEmail = session.user?.email || '';

      // ダッシュボード画面：「お帰りなさい」表示の更新
      if (window.location.pathname.includes('dashboard.html')) {
        const greetingH1 = document.querySelector('h1');
        if (greetingH1 && greetingH1.textContent.includes('お帰りなさい')) {
          greetingH1.textContent = `お帰りなさい、${userName} 様`;
        }
      }

      // プロフィール画面：フォームの初期値更新と更新処理
      if (window.location.pathname.includes('profile.html')) {
        const inputs = document.querySelectorAll('.profile-input');
        const saveBtn = document.querySelector('.profile-btn-primary');
        const userKana = session.user?.user_metadata?.full_name_kana || '';
        const userEnglish = session.user?.user_metadata?.full_name_english || '';

        // 初期値のセット
        if (inputs.length >= 4) {
          inputs[0].value = userName; // 氏名
          inputs[1].value = userKana; // フリガナ
          inputs[2].value = userEnglish; // 英語表記
          inputs[3].value = userEmail; // メールアドレス
        }

        // 保存ボタンクリック時の更新処理（Supabase）
        if (saveBtn && inputs.length >= 3) {
          saveBtn.addEventListener('click', async (e) => {
            // HTML5のバリデーション（スペース入力必須ルール等）を手動で発動
            const form = saveBtn.closest('form');
            if (form && !form.checkValidity()) {
              form.reportValidity(); // ブラウザ標準のエラーメッセージをポップアップ表示
              return; // 判定エラー時はデータを送信せずに中止
            }

            const newName = inputs[0].value;
            const newKana = inputs[1].value;
            const newEnglish = inputs[2].value;
            const originalText = saveBtn.textContent;
            
            saveBtn.disabled = true;
            saveBtn.textContent = '保存中...';

            // 氏名、フリガナ、英語表記のメタデータを新しい値に更新
            const { data, error } = await supabaseClient.auth.updateUser({
              data: { 
                full_name: newName,
                full_name_kana: newKana,
                full_name_english: newEnglish
              }
            });

            if (error) {
              alert('保存に失敗しました: ' + error.message);
            } else {
              alert('プロフィール情報の更新が完了しました。');
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
