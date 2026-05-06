/* 
  profile.js
  ユーザープロフィールの取得とUI反映
*/

/**
 * プロフィール情報の取得 (profiles テーブル)
 */
async function fetchUserProfile() {
  if (!window.currentUser) return null;

  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('role, plan_type, payment_status')
      .eq('id', window.currentUser.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // プロフィールが存在しない場合、新規登録直後など
        console.warn('Profile not found.');
        return { plan_type: 'free', payment_status: 'unpaid', role: 'member' };
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
}

/**
 * 会員状態によるUIの更新 (例: バッジの表示等)
 */
async function updateUIByStatus() {
  const profile = await fetchUserProfile();
  if (!profile) return;

  // ページ上の要素を動的に書き換える（例: plan-badge IDを持つ要素）
  const badge = document.getElementById('plan-badge');
  if (badge) {
    badge.textContent = profile.plan_type === 'premium' ? 'プレミアム会員' : '無料会員';
    badge.className = 'badge ' + (profile.plan_type === 'premium' ? 'paid' : 'free');
  }

  // 有料コンテンツの制限ロジック等（contents ページ用）
  if (window.location.pathname.includes('contents')) {
    applyContentLock(profile);
  }
}

function applyContentLock(profile) {
  // 有料会員でない場合にコンテンツをマスクする処理をここに記述
  if (profile.plan_type !== 'premium') {
    const premiumItems = document.querySelectorAll('.is-premium');
    premiumItems.forEach(item => {
      item.classList.add('locked');
      item.innerHTML += '<div class="lock-overlay"><span>有料プラン専用</span></div>';
      item.onclick = (e) => {
        e.preventDefault();
        alert('このコンテンツを見るにはプレミアムプランへの加入が必要です。');
        window.location.href = 'pricing.html';
      };
    });
  }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', updateUIByStatus);
