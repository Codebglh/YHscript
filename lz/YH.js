var box = true;
var movie = true;

function en() {
    if (box) {
        box = false;
        $("body").hide();
        if ($(".box_bg").length === 0) {
            $("html").append("<div class='box_bg'><div id='ss'><div id=\"dplayer\" class=\"artplayer-app\"></div></div><div class=\"list_bg\"></div></div>")
            var lists = [];
            var list = $("body").text().match(/htt.*?m3u8/g);
            for (var i = 0; i < list.length; i++) {
                if (list[i] !== "htt.*?m3u8" && list[i].length <= 60) {
                    lists.push(list[i]);
                    $(".list_bg").append('<input class="list_input" onclick="bofang(\'' + lists[i] + '\')" type="button" value="第 ' + (i + 1) + ' 集">');
                }
            }
        }
    } else {
        $(".box_bg").remove();
        $("body").show();
        box = true;
    }
}

function openmovie(url) {
    const dp = new DPlayer({
        container: document.getElementById("dplayer"),
        video: {
            url: url,
            type: "customHls",
            customType: {
                customHls: function (video, player) {
                    const hls = new Hls();
                    hls.loadSource(video.src);
                    hls.attachMedia(video);
                },
            },
        },
    });
}

function bofang(url) {
    if (movie) {
        movie = false;
    } else {
        $(".artplayer-app").remove();
        $("#ss").append("<div id =\"dplayer\" class=\"artplayer-app\"> </div>");
    }

    var art = new Artplayer({
        container: ".artplayer-app",
        url: url,
        volume: 0.5,
        theme: "#ffad00",
        type: "m3u8",
        autoplay: false,
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
}
