var box=true;
function en() {

    if (box){
        box=false;
        $("body").hide();
        if ($(".box_bg").length==0) {
            $("body").append("<div class='box_bg'>  <div class=\"bg_movie\" id =\"dplayer\" > </div><div class=\"list_bg\"></div></div>")
            var lists=new Array();
            var x=0;
            var list = $("body").text().match(/htt.*?m3u8/g);
            for (var i=0;i<list.length;i++){
                if(list[i]!="htt.*?m3u8"){
                    lists[x]=list[i];
                    x=x+1;
                }
                $(".list_bg").append('<input class="list_input" onclick="openmovie(\''+ lists[i] + '\')" type="button" value="第 '+ (i + 1) +' 集">')
            }
        }
    }else {
        $(".box").remove();
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



