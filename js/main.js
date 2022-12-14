var ncmb = new NCMB("dca3792d3d60fa0f0fb2070bc46a4956b8287f70b2c2aec2aa6449cfe1f82493", "f61ef3dc2e500a0804adb9b33c9488d29727325b1b70ad28ed37517489646fd7");



var nNum = [1];
var nPer = [0];
var data = [];

$(function () {





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
    .order("userName", false)
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
      ncmb.User.logout()
        .then(function () {
          // ログアウト完了
          location = 'login.html';
        })
    });

  
 

  drowchart();




  //ユーザーをクリックしたときのイベント
  $('body').on('click', '.clickuser', function () {

    //選択されたユーザー名を表示
    $(".nowUser").text($(this).text() + " さんの学習履歴");
    $(".nowUser").attr('id', $(this).prop("id"));
    exdata();
  });

  //期間を変更したときのイベント
  $('input[type=radio][name="period"]').change(function () {
    if (($(".nowUser").text()) != "児童を選択してください") {
      exdata();
    }

  });


  function exdata() {
    var userId = $(".nowUser").attr('id');
    var period = new Date();
    var value = $("input[type=radio][name=period]:checked").val();
    var ans1 = 0;//正解数
    var playTime = 0; //プレイ時間
    var playDays = {};//プレイした日にち
    var progress = {};//進捗
    //ジャンルごとの記録
    var genre = {};
    var genreTime = {};
    var genreTrue = {};
    var genreName;
    //正答率の変化記録
    var countMax = {};
    var countNum = [];
    var countTrue = [];
    var nNum2 = [];
    var nPer2 = [];









    //表データの削除
    $("#table").children().remove();



    //取得する期間を設定
    period.setDate(period.getDate() - value);


    //選択されたユーザーの解答情報を取得
    var userData = ncmb.DataStore("AnsData");
    userData.equalTo("userID", userId)
      .greaterThan("createDate", period)
      .order("createDate", false)
      .limit(1000)
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
            genre[Number(object.genreId)] = genre[Number(object.genreId)] + 1;//回答数
            if (object.ans == 1) {
              genreTrue[object.genreId] = genreTrue[object.genreId] + 1;//正解数
            }
            genreTime[object.genreId] = genreTime[object.genreId] + object.time;//解答時間

          }
          else {
            genre[Number(object.genreId)] = 1;
            if (object.ans == 1) {
              genreTrue[object.genreId] = 1;
            }
            else {
              genreTrue[object.genreId] = 0;
            }
            genreTime[object.genreId] = object.time;
          }


          //正答率の変化記録
          //2回め以降
          if (object.quesID in countMax) {

            if (countNum[countMax[object.quesID]] === undefined) {
              countNum[countMax[object.quesID]] = 1;
            }
            else {
              countNum[countMax[object.quesID]] = countNum[countMax[object.quesID]] + 1;
            }
            if (object.ans == 1) {
              if (countTrue[countMax[object.quesID]] === undefined) {
                countTrue[countMax[object.quesID]] = 1;
              }
              else {
                countTrue[countMax[object.quesID]] = countTrue[countMax[object.quesID]] + 1;
              }
            }
            countMax[object.quesID] = countMax[object.quesID] + 1;//回答数
          }

          //初回
          else {
            countMax[object.quesID] = 1;
            if (countNum.length === 0) {
              countNum[0] = 1;
            }
            countNum[0] = countNum[0] + 1;
            if (object.ans == 1) {
              if (countTrue.length === 0) {
                countTrue[0] = 1;
              }
              countTrue[0] = countTrue[0] + 1;
            }
          }
        }
        //for文終わり

        //正答率変化のグラフ描画
        console.log(countNum);
        console.log(countTrue);
        for (var n = 0; n < countNum.length; n++) {
          if (countNum[n] > 10) {
            console.log(n);
            nNum2.push(n + 1 + "回目");
            nPer2.push(countTrue[n] / countNum[n] * 100);
          }

        }

        $("#nChart").children().remove();
        $("#nChart").append('<canvas id="myAreaChart"></canvas>');
        nNum = nNum2;
        nPer = nPer2;

        drowchart();

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
          console.log("キー" + key);
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
              let min = Math.floor(genreTime[key] / 60);
              let rem = genreTime[key] % 60;
              $("#table").append("<tr><td>" + key + "</td><td>" + genreName + "</td><td>" + genre[key] + "問</td><td>" + min + "分" + rem + "秒</td><td>" + rate + "%</td></tr>");
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
        console.log(data);

        /*$('#dataTable').dataTable().fnClearTable();
        $('#dataTable').dataTable().fnAddData(data);
        $("#dataTable").DataTable({
          data: data
        });*/





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
    businessHours: true,

  });

  calendar.render();




});




//カレンダーに解いた問題数を表示
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

//児童を検索(不具合のため別処理に)
window.addEventListener('DOMContentLoaded', function(){
  
  // input要素を取得
  var input_name = document.getElementById("search-text");

  // イベントリスナーでイベント「change」を登録
  input_name.addEventListener("change",function(){
    console.log("Change action");
    console.log(this.value);
  });

  // イベントリスナーでイベント「input」を登録
  input_name.addEventListener("input",function(){
    console.log("Input action");
    console.log(this.value);
    
      var searchText = $(this).val(), // 検索ボックスに入力された値
        targetText;
      console.log("サーチ");
      $('.target-area li').each(function () {
        targetText = $(this).text();
  
        // 検索対象となるリストに入力された文字列が存在するかどうかを判断
        if (targetText.indexOf(searchText) != -1) {
          $(this).removeClass('hidden');
        } else {
          $(this).addClass('hidden');
        }
      });
    
  });
});