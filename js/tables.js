var ncmb = new NCMB("dca3792d3d60fa0f0fb2070bc46a4956b8287f70b2c2aec2aa6449cfe1f82493", "f61ef3dc2e500a0804adb9b33c9488d29727325b1b70ad28ed37517489646fd7");





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
                //for文終わり
                for (let key in ques) {
                    if (isNaN(key) == false) {
                        console.log('key:' + key + ' value:' + ques[key]);
                        var n = 2;
                        let min = Math.floor(quesTime[key] / ques[key] * Math.pow(10, n)) / Math.pow(10, n);
                        let rate = Math.floor(quesTrue[key] / ques[key] * 100 * Math.pow(10, n)) / Math.pow(10, n);
                        var problemtext;
                        var answertext;
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
                                        console.log(object.problem+"日本語");
                                        problemtext=object.problem;
                                        answertext=object.asnwer;
                                    } else {
                                        // 日本語文字列が含まれていない
                                        console.log(object.problem+"英語");
                                    }
                                }
                                $("#table").append("<tr><td>" + key + "</td><td>" + ques[key] + "</td><td>" + min + "</td><td>" + rate + "</td><td>" + problemtext + "</td></tr>");
                            });
                                
                        }
            
          }

                });
    }


});

