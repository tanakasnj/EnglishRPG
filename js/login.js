var ncmb = new NCMB("dca3792d3d60fa0f0fb2070bc46a4956b8287f70b2c2aec2aa6449cfe1f82493", "f61ef3dc2e500a0804adb9b33c9488d29727325b1b70ad28ed37517489646fd7");

function nextPage() {
  id = document.login_form.id.value;
  pwd = document.login_form.pass.value;

  // 1. ユーザー名とパスワードでログイン
  var user = new ncmb.User({userName:id, password:pwd});
  ncmb.User.login(user)
      .then(function(data){
        // ログイン後処理
        if(1==data.role){
          location='index.html';
        }
        else{
          ncmb.User.logout();
          document.getElementById("id").value = '';
          document.getElementById("pass").value = '';
          $("#errMsg").text("※管理者権限を持つアカウントでログインしてください");
        }
        
      })
      .catch(function(err){
        // エラー処理
        document.getElementById("id").value = '';
        document.getElementById("pass").value = '';
        $("#errMsg").text("※ユーザーidかパスワードが間違っています");
        
      });
  
}




