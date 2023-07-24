var box=true;
var movie=true;
function en() {

    if (box){
        box=false;
        $("body").hide();
        if ($(".box_bg").length==0) {
            $("html").append("<div class='box_bg'>  <div class=\"bg_movie\" id =\"dplayer\" > </div><div class=\"list_bg\"></div></div>")
            var lists=new Array();
            var x=0;
            var list = $("body").text().match(/htt.*?m3u8/g);
            for (var i=0;i<list.length;i++){
                if(list[i]!="htt.*?m3u8"){
                    lists[x]=list[i];
                    x=x+1;
                }
                $(".list_bg").append('<input class="list_input" onclick="bofang(\''+ lists[i] + '\')" type="button" value="第 '+ (i + 1) +' 集">')
            }
        }
    }else {
        $(".box_bg").remove();
        $("body").show();
        box=true;
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
    var art;
    if(movie){
        movie=false
        Artplayer.DEBUG = true;
        Artplayer.PLAYBACK_RATE = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];
        art =new Artplayer({
            container: ".artplayer-app",
            url: url,
            // poster: "/Users/bgcode/Downloads/codebglh.github.io-main/icon/favicon.png", //未播放图片
            volume: 0.5, //初始音量
            theme: "#ffad00", //主题颜色ß
            type: "m3u8",
            autoplay: true, //是否自动播放
            //autoSize: true,//调节黑边
            autoMini: true, //离开页面变成小屏
            playbackRate: true, //播放速度
            aspectRatio: true, //显示视频长宽比
            screenshot: true, //视频截图
            lock:true,
            fastForward: true,
            hotkey: true, //是否使用快捷键
            pip: true, // 画中画
            mutex: true, //是否只能让一个播放器播放
            fullscreen: true, //窗口全屏
            fullscreenWeb: true, //网页全屏
            miniProgressBar: true, //迷你进度条
            playsInline: true, //移动端
            aspectRatio: true,
            subtitleOffset: true,
            setting: true, //设置面板
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
        console.info(art.option);
    }else{
        document.getElementsByClassName("artplayer-app")[0].remove()
        document.getElementById("box").innerHTML="<div class=\"artplayer-app\"></div>"
        Artplayer.DEBUG = true;
        Artplayer.PLAYBACK_RATE = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];
        art =new Artplayer({
            container: ".artplayer-app",
            url: url,
            // poster: "/Users/bgcode/Downloads/codebglh.github.io-main/icon/favicon.png", //未播放图片
            volume: 0.5, //初始音量
            theme: "#ffad00", //主题颜色ß
            type: "m3u8",
            autoplay: true, //是否自动播放
            //autoSize: true,//调节黑边
            autoMini: true, //离开页面变成小屏
            playbackRate: true, //播放速度
            aspectRatio: true, //显示视频长宽比
            screenshot: true, //视频截图
            lock:true,
            fastForward: true,
            hotkey: true, //是否使用快捷键
            pip: true, // 画中画
            mutex: true, //是否只能让一个播放器播放
            fullscreen: true, //窗口全屏
            fullscreenWeb: true, //网页全屏
            miniProgressBar: true, //迷你进度条
            playsInline: true, //移动端
            aspectRatio: true,
            subtitleOffset: true,
            setting: true, //设置面板
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
        })
    }

}


