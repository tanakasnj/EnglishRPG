var ncmb = new NCMB("dca3792d3d60fa0f0fb2070bc46a4956b8287f70b2c2aec2aa6449cfe1f82493", "f61ef3dc2e500a0804adb9b33c9488d29727325b1b70ad28ed37517489646fd7");

var ansdata = [];




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


    $('#miniTest').click(function () {
        if (($(".nowUser").text()) != "児童を選択してください") {
            ansdata.sort( (a, b) => {
                return a[a.length - 1] - b[b.length -1]
              })
            if(ansdata.length<10){
                alert("データ不足のためテストを生成できませんでした")
            }
            else{
            // 現在日時を取得
            let today = new Date();
            // 年月日を取得
            let year = today.getFullYear();
            let month = today.getMonth() + 1;        // 1月~12月 -> 0~11
            let date = today.getDate();


            //テスト出題用乱数作成
            	
var randoms = [];
if(ansdata.length<30){
    var min = 1, max = ansdata.length;
}else{
    var min = 1, max = 30;
}


for(i = min; i <= max; i++){
  while(true){
    var tmp = intRandom(min, max);
    if(!randoms.includes(tmp)){
      randoms.push(tmp);
      break;
    }
  }
}

function intRandom(min, max){
    return Math.floor( Math.random() * (max - min + 1)) + min;
  }


            //pdf書き込み
            const doc = new jspdf.jsPDF(); // 注意！jspdf配下から呼ぶ。
            doc.setFont('mplus-1c-black', 'normal');

            doc.setFontSize(25);
            doc.text('英単語小テスト', 80, 15);
            doc.setFontSize(16);
            doc.text('氏名:', 155, 35);
            doc.line(170, 36, 205, 36);
            doc.text(year + "/" + month + "/" + date, 160, 25);
            let y=60;
            for(i=0;i<10;i++){
                doc.text(i+1+"."+ansdata[randoms[i]][2], 30, y);
                doc.line(110, y, 190, y);
                y+=20;
            }
            doc.setFontSize(30);
            doc.text('/10', 165, 269);
            doc.addPage();
            //解答
            doc.setFontSize(25);
            doc.text('英単語小テスト解答', 70, 15);
            doc.setFontSize(16);
            
            doc.text(year + "/" + month + "/" + date, 160, 30);
            y=60;
            for(i=0;i<10;i++){
                doc.text(i+1+"."+ansdata[randoms[i]][2], 30, y);
                doc.text(ansdata[randoms[i]][3], 115, y-1);
                doc.line(110, y, 190, y);
                y+=20;
            }
            doc.setFontSize(30);
            doc.output('dataurlnewwindow', 'minitest.pdf');
            //doc.save('test.pdf');
        }
    }


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



    //gridjs
    const mygrid = new gridjs.Grid({
        columns: ['ID', 'ジャンル', '英単語', '日本語', '例文', '例文訳', '回答数', '平均解答時間', '正解率'],
        search: true, // 検索
        sort: true,  // ソート
        pagination: { // ページネーション
            limit: 50,
        },
        width: 'auto',
        data: [],
    }).render(document.getElementById('gridContainer')); // レンダリングする要素idの指定

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
        var ques = {};
        var quesTrue = {};
        var quesTime = {};


        //データリセット
        mygrid.updateConfig({
            data: []

        }).forceRender();

        ansdata = [];

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
                    //ジャンルごとに記録
                    if (object.quesID in ques) {
                        ques[object.quesID] = ques[object.quesID] + 1;//回答数
                        if (object.ans == 1) {
                            quesTrue[object.quesID] = quesTrue[object.quesID] + 1;//正解数
                        }
                        quesTime[object.quesID] = quesTime[object.quesID] + object.time;//解答時間

                    }
                    else {
                        ques[object.quesID] = 1;
                        if (object.ans == 1) {
                            quesTrue[object.quesID] = 1;
                        }
                        else {
                            quesTrue[object.quesID] = 0;
                        }
                        quesTime[object.quesID] = object.time;
                    }

                }
                var count = 0;

                var len = Object.keys(ques).length;
                console.log(len);
                //for文終わり
                for (let key in ques) {
                    if (isNaN(key) == false) {

                        var problemtext;
                        var answertext;
                        var genreId;
                        var sentence1;
                        var sentence2;
                        var problemData = ncmb.DataStore("problems");
                        problemData.equalTo("problemId", String(key))
                            .fetchAll()
                            .then(function (results) {
                                console.log(results.length);
                                for (var i = 0; i < results.length; i++) {
                                    var object = results[i];
                                    //問題文が英→日か日→英どちらかを判定
                                    if (object.problem.match(/[^\x01-\x7E]/) || object.problem.match(/^[0-9]+$/)) {
                                        // 日本語文字列が含まれている
                                        //console.log(object.problem+"日本語");
                                        problemtext = object.problem;
                                        answertext = object.answer;
                                        genreId = object.genreId;
                                        sentence1 = object.reibun
                                        sentence2 = object.reibunN

                                    } else {
                                        // 日本語文字列が含まれていない
                                        //console.log(object.problem+"英語");
                                    }
                                }
                                console.log(problemtext);
                                var n = 2;
                                let min = Math.floor(quesTime[key] / ques[key] * Math.pow(10, n)) / Math.pow(10, n);
                                let rate = Math.floor(quesTrue[key] / ques[key] * 100 * Math.pow(10, n)) / Math.pow(10, n);
                                ansdata.push([Number(key), Number(genreId), answertext, problemtext, sentence1, sentence2, Number(ques[key]), min, rate],)
                                count++;
                                console.log(count);

                                if (count+3 > len) {
                                    mygrid.updateConfig({
                                        data: ansdata
                                    }).forceRender();
                                }

                            })
                        //console.log(problemtext);
                        //$("#table").append("<tr><td>" + key + "</td><td>" + ques[key] + "</td><td>" + min + "</td><td>" + rate + "</td><td>" + problemtext + "</td></tr>");
                        console.log(ansdata);
                        

                    }

                    //['問題ID', 'ジャンルID','単語(英)','単語(日)','例文(英)','例文(日)','回答数(問)','平均解答時間(秒)','正解率(%)'],

                }
                


            });


    }
});