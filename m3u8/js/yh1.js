var art
var lists
var box = true;
var movie = true;
var currentUrl

function bgcode() {
    if (box) {
        box = false;
        $("body").hide();
        if ($(".box_bg").length === 0) {
            $("html").append("<div class='box_bg'><div id='ss'><div id=\"dplayer\" class=\"artplayer-app\"></div></div><div class=\"list_bg\"></div></div>");
            var list = $("body").text().match(/htt.*?m3u8/g);
            var bgcode = [];
            currentUrl = window.location.href;
            for (var i = 0; i < list.length; i++) {
                bgcode.push({
                    url:list[i],
                    key:"1"
                })
            }
            let aaaaa={};
            aaaaa["lists"]=bgcode
            aaaaa["playM3u8"]="0"
            var xxx = JSON.stringify(aaaaa);
            // 从 localStorage 获取数据
            var dataStr = localStorage.getItem(currentUrl);
            if (!dataStr) {
                localStorage.setItem(currentUrl, xxx);
            }
            var dataObj = JSON.parse(localStorage.getItem(currentUrl));
            for (var i = 0; i < list.length; i++) {
                var color = dataObj.lists[i].key === "1" ? "#34dcd8" : "#9c18e8";
                $(".list_bg").append('<input class="list_input" id="button' + i + '" onclick="bg_play(' + i + ')" type="button" value="' + (i + 1) + '" style="color: ' + color + ';">');
            }
            var aaa=JSON.parse(get_value("currentUrl"))[playM3u8]

            if(!aaa){
                bg_play(0)
            }else{
                bg_play(aaa)
            }

        }
    } else {
        $(".box_bg").remove();
        $("body").show();
        box = true;
    }

}

function get_value(key) {
    return localStorage.getItem(key)
}

function set_value(key, value) {
    return localStorage.setItem(key, value);
}

function bg_play(key) {
    if (movie) {
        movie = false;
    } else {
        $(".artplayer-app").remove();
        $("#ss").append("<div id=\"dplayer\" class=\"artplayer-app\"></div>");
    }
    if (art) {
        art.destroy()
    }
    if (!lists) {
        lists = JSON.parse(get_value(currentUrl)).lists
    }
    var url = lists[key].url
    var id = "bgcode" + key.toString()
    set_value("playM3u8", key)
    var button = document.getElementById(("button" + key));
    button.style.color = "#9c18e8";

    // 从本地存储中获取数据
    var dataStr = localStorage.getItem(currentUrl);
    if (dataStr) {
        // 如果获取到数据，则解析为对象
        var dataObj = JSON.parse(dataStr).lists;
        // 更新对象的 url 属性
        dataObj[key].key = "0";
        // 将更新后的对象转换为字符串并存储回本地存储中
        localStorage.setItem(currentUrl, JSON.stringify(dataObj));
    }
    set_value(currentUrl, JSON.stringify(dataObj));
    art = new Artplayer({
        container: ".artplayer-app",
        volume: 0.5,
        theme: "#ffad00",
        type: "m3u8",
        autoplay: true,
        autoMini: true,
        playbackRate: true,
        aspectRatio: true,
        screenshot: true,
        lock: true,
        fastForward: true,
        hotkey: true,
        pip: true,
        mutex: true,
        fullscreen: true,
        fullscreenWeb: true,
        miniProgressBar: true,
        playsInline: true,
        autoPlayback: true,
        subtitleOffset: true,
        setting: true,
        customType: {
            m3u8: function playM3u8(video, url) {
                if (Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else {
                    art.notice.show = '不支持播放格式：m3u8';
                }
            },
        },
    });
    art.url = url
    art.id = id

    art.controls.add({
        name: 'ssn',
        index: 11,
        position: 'left',
        html: '<svg t="1706590665551" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5184" width="20" height="20"><path d="M665.47 417.65l-345.03-244.3c-69.8-49.42-166.29 0.49-166.29 86.01v502.27c0 85.52 96.49 135.43 166.29 86.01l345.03-244.31c64.02-45.34 64.02-140.34 0-185.68zM811.82 868.52c-30.38 0-55-24.62-55-55V207.46c0-30.38 24.62-55 55-55s55 24.62 55 55v606.07c0 30.37-24.62 54.99-55 54.99z" p-id="5185"></path></svg>',
        tooltip: '下一集',
        style: {
            color: 'red',
        },
        click: function () {
            if (key == (lists.length - 1)) {
                alert("无下一集，请寻找其他进行播放即将播放当前集")
                bg_play(key)
            } else {
               
                bg_play(Number(key)+1)
            }
        }
    })
    art.controls.add({
        name: 'ssu',
        index: 10,
        position: 'left',
        html: '<svg t="1706590646768" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4209" width="20" height="20"><path d="M356.77 605.22L701.8 849.53c69.8 49.42 166.29-0.49 166.29-86.01V261.25c0-85.52-96.49-135.43-166.29-86.01L356.77 419.55c-64.02 45.34-64.02 140.34 0 185.67zM210.42 154.36c30.38 0 55 24.62 55 55v606.07c0 30.38-24.62 55-55 55s-55-24.62-55-55V209.36c0-30.38 24.62-55 55-55z" p-id="4210"></path></svg>',
        tooltip: '上一集',
        style: {
            color: 'red',
        },
        click: function () {
            if (key == 0) {
                alert("无上一集，请寻找其他进行播放即将播放当前集")
                bg_play(Number(key))
            } else {
                bg_play(Number(key) - 1)
            }

        }

    })

    // art.controls.update({
    //     name: 'ssn',
    //     index: 11,
    //     position: 'left',
    //     html: '<svg t="1706590665551" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5184" width="20" height="20"><path d="M665.47 417.65l-345.03-244.3c-69.8-49.42-166.29 0.49-166.29 86.01v502.27c0 85.52 96.49 135.43 166.29 86.01l345.03-244.31c64.02-45.34 64.02-140.34 0-185.68zM811.82 868.52c-30.38 0-55-24.62-55-55V207.46c0-30.38 24.62-55 55-55s55 24.62 55 55v606.07c0 30.37-24.62 54.99-55 54.99z" p-id="5185"></path></svg>',
    //     tooltip: '下一集',
    //     style: {
    //         color: 'red',
    //     },
    //     click: function () {
    //         if(key==lists.length-1){
    //             alert("无下一集，请寻找其他进行播放即将播放当前集")
    //             bg_play(key)
    //         }else{
    //             bg_play(key  +1)
    //         }

    //     }
    // })
    // art.controls.update({
    //     name: 'ssu',
    //     index: 10,
    //     position: 'left',
    //     html: '<svg t="1706590646768" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4209" width="20" height="20"><path d="M356.77 605.22L701.8 849.53c69.8 49.42 166.29-0.49 166.29-86.01V261.25c0-85.52-96.49-135.43-166.29-86.01L356.77 419.55c-64.02 45.34-64.02 140.34 0 185.67zM210.42 154.36c30.38 0 55 24.62 55 55v606.07c0 30.38-24.62 55-55 55s-55-24.62-55-55V209.36c0-30.38 24.62-55 55-55z" p-id="4210"></path></svg>',
    //     tooltip: '上一集',
    //     style: {
    //         color: 'red',
    //     },
    //     click: function () {
    //         if(key==0){
    //             alert("无上一集，请寻找其他进行播放即将播放当前集")
    //             bg_play(key)
    //         }else{
    //             bg_play(key - 1)
    //         }
    //     }

    // })





}