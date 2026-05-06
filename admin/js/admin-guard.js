(async function() {
  const supabaseUrl = 'https://gfvnnxuupdmbuxejyfck.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmdm5ueHV1cGRtYnV4ZWp5ZmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY3NjAsImV4cCI6MjA4OTExMjc2MH0.Eq0AVSyY9Jy3dxt-RxwQvJcrntX5y3L2dhhcIz9tWnk';
  const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (error || !session) {
    alert('ログインしていません。ログイン画面へ移動します。');
    window.location.replace('../member/login.html');
    return;
  }

  // Adminテーブルに自分のIDが存在するかチェックする
  const { data: adminData, error: adminError } = await supabaseClient.from('admin_users').select('id').eq('id', session.user.id).single();

  if (adminError || !adminData) {
    alert('管理者権限がありません。一般ページへ移動します。');
    window.location.replace('../member/dashboard.html');
  } else {
    // ログアウト処理の共通関数
    window.handleLogout = async function(e) {
      if (e) e.preventDefault();
      await supabaseClient.auth.signOut();
      window.location.href = 'login.html';
    };

    const showBody = () => {
      document.body.style.display = 'block';
      
      // ログアウトボタンへイベント付与
      document.querySelectorAll('a').forEach(btn => {
        if (btn.textContent.includes('ログアウト') || btn.innerText.includes('ログアウト')) {
          btn.addEventListener('click', window.handleLogout);
        }
      });
    };
    
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', showBody);
    } else {
      showBody();
    }
  }
})();
