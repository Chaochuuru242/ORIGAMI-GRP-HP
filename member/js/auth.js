/* 
  auth.js
  認証（登録、ログイン、ログアウト、パスワード関連）ロジック
*/

/**
 * 新規会員登録
 */
async function signUp(email, password, fullName) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    if (error) throw error;
    alert('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。');
    return data;
  } catch (error) {
    console.error('Error during sign up:', error.message);
    alert('登録エラー: ' + error.message);
  }
}

/**
 * ログイン
 */
async function signIn(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    window.location.href = 'index.html';
    return data;
  } catch (error) {
    console.error('Error during sign in:', error.message);
    alert('ログインエラー: ' + error.message);
  }
}

/**
 * ログアウト
 */
async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error during sign out:', error.message);
  }
}

/**
 * パスワード再設定メール送信
 */
async function resetPassword(email) {
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/member/password-update.html',
    });
    if (error) throw error;
    alert('パスワード再設定用のメールを送信しました。');
  } catch (error) {
    console.error('Error during password reset:', error.message);
    alert('エラー: ' + error.message);
  }
}

/**
 * パスワード更新
 */
async function updatePassword(newPassword) {
  try {
    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    alert('パスワードを更新しました。');
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error during password update:', error.message);
    alert('更新エラー: ' + error.message);
  }
}
