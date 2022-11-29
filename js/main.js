
var ncmb = new NCMB("dca3792d3d60fa0f0fb2070bc46a4956b8287f70b2c2aec2aa6449cfe1f82493", "f61ef3dc2e500a0804adb9b33c9488d29727325b1b70ad28ed37517489646fd7");
var nNum = [1];
var nPer = [0];

$(function () {
  drowchart();
  // カレントユーザー情報の取得
  var currentUser = ncmb.User.getCurrentUser();
  if (currentUser) {
    $("#loginUser").text(currentUser.get("userName"));
  } else {
    location = 'login.html';
  }

  //ログアウト
  $('#logoutButton').on('click', function () {
    ncmb.User.logout()
      .then(function () {
        // ログアウト完了
        location = 'login.html';
      })
  });

  //登録ユーザーを読み込んで表示
  var user = ncmb.User;
  user.equalTo("role", 0)
    .fetchAll()
    .then(function (results) {
      console.log("Successfully retrieved " + results.length + " scores.");
      for (var i = 0; i < results.length; i++) {
        var object = results[i];
        $('.userList').append("<li class='clickuser' id='" + object.objectId + "'>" + object.userName + "</li>");

      }
    })
    .catch(function (err) {
      console.log(err);
    });




  //ユーザーをクリックしたときのイベント
  $('body').on('click', '.clickuser', function () {
    var userId = $(this).prop("id");
    var userName = $(this).text();
    var ans1 = 0;//正解数
    var playTime = 0; //プレイ時間
    var playDays = {};//プレイした日にち
    var progress = {};//進捗
    //ジャンルごとの記録
    var genre = {};
    var genreTime = {};
    var genreTrue = {};
    var genreName;


    //選択されたユーザー名を表示
    $("#nowUser").text(userName + " さんの学習履歴");

    //表データの削除
    $("#table").children().remove();


    //選択されたユーザーの解答情報を取得
    var userData = ncmb.DataStore("AnsData");
    userData.equalTo("userID", userId)
      .fetchAll()
      .then(function (results) {
        $("#playNum").text(results.length);//解いた問題数を表示
        for (var i = 0; i < results.length; i++) {
          var object = results[i];
          //ジャンルに分ける？
          //正解数を足す
          if (object.ans == 1) {
            ans1 += 1;
          }
          //時間を足す
          playTime += object.time;

          //進捗を足す
          progress[object.quesID] = 1;

          //プレイした日付に問題数を追加
          var day = (object.createDate.slice(0, 10));
          if (day in playDays) {
            playDays[day] = playDays[day] + 1;
          }
          else {
            playDays[day] = 1;
          }

          //ジャンルごとに記録
          if (object.genreId in genre) {
            genre[object.genreId] = genre[object.genreId] + 1;//回答数
            if (object.ans == 1) {
              genreTrue[object.genreId] = genreTrue[object.genreId] + 1;//正解数
            }
            genreTime[object.genreId] = genreTime[object.genreId] + object.time;//解答時間

          }
          else {
            genre[object.genreId] = 1;
            if (object.ans == 1) {
              genreTrue[object.genreId] = 1;
            }
            else {
              genreTrue[object.genreId] = 0;
            }
            genreTime[object.genreId] = object.time;
          }



          //正答率変化
        $("#nChart").children().remove();
        $("#nChart").append('<canvas id="myAreaChart"></canvas>');
         nNum = ["1回目","2回目","3回目"];
         nPer = [10,20,64];
         
        drowchart();

          



        }
        //プレイ時間を表示
        let hour = Math.floor(playTime / 3600);
        let min = Math.floor(playTime % 3600 / 60);
        let rem = playTime % 60;
        $("#playTime").text(`${hour}時間${min}分${rem}秒`);

        //正解率を表示
        let rate = Math.round(ans1 / results.length * 100);
        $("#rate").text(rate + "%");

        //進捗を表示
        $("#progress").text(Object.keys(progress).length + "/878 問");

        //ジャンルごとの記録表示
        //undefinedの削除
        delete genre.undefined;
        delete genreTime.undefined;
        delete genreTrue.undefined;

        for (let key in genre) {
          var genreData = ncmb.DataStore("GenreClass");
          genreData.equalTo("genreID", Number(key))
            .fetchAll()
            .then(function (results) {
              for (var i = 0; i < results.length; i++) {
                var object = results[i];
                genreName = object.genreName;
              }
              let rate = Math.round(genreTrue[key] / genre[key] * 100);
              console.log('key:' + key + ' value:' + genre[key] + "time:" + genreTime[key] + "rate" + rate + "name" + genreName);
              $("#table").append("<tr><td>" + key + ":" + genreName + "</td><td>" + genre[key] + "問</td><td>" + genreTime[key] + "分</td><td>" + rate + "%</td></tr>");
            })
        }




        //カレンダー描画
        const calendarEl = document.querySelector('#calendar');
        const calendar = new FullCalendar.Calendar(calendarEl, {
          locale: 'ja',
          headrToolbar: {
            left: 'prev',
            center: 'title',
            reight: 'next'
          },
          events: getEventDatas(playDays),
        });

        calendar.render();
      })
      .catch(function (err) {
        console.log(err);
      });

  });

  //カレンダー描画
  const calendarEl = document.querySelector('#calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'ja',
    headrToolbar: {
      left: 'prev',
      center: 'title',
      reight: 'next'
    },
    businessHours: true,

  });

  calendar.render();




});



//問題数追加処理
function getEventDatas(playDays) {
  var eventsDates = [];
  for (let key in playDays) {
    var datas =
    {
      title: playDays[key] + "問",
      start: key
    };
    eventsDates.push(datas)
  }
  return eventsDates;

}

//検索ボックス
$(function () {
  searchWord = function () {
    var searchText = $(this).val(), // 検索ボックスに入力された値
      targetText;

    $('.target-area li').each(function () {
      targetText = $(this).text();

      // 検索対象となるリストに入力された文字列が存在するかどうかを判断
      if (targetText.indexOf(searchText) != -1) {
        $(this).removeClass('hidden');
      } else {
        $(this).addClass('hidden');
      }
    });
  };

  // searchWordの実行
  $('#search-text').on('input', searchWord);
});

