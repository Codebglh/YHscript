function en() {
    addelement("body",'< div class =\"box\"></div>')
    var lists=new Array();
        var x=0;
        var list = $("body").text().match(/htt.*?m3u8/g);
        for (var i=0;i<list.length;i++){
            if(list[i]!="htt.*?m3u8"){
                lists[x]=list[i];
                x=x+1;
                $(".box").append('<div class=\"bg-movie\" id =\"dplayer\" > </div><div class=\"list-bg\"></div>')
                $(".list-bg").append('<input onclick="opensss('+ lists[i] + ')" type="button" value="第" '+ (i + 1) +' "集>')
                console.log(lists[i])
            }
        }



}


function addelement(lo,element){
    $(lo).append(element)
}
function opensss(url) {
    const dp = new DPlayer({
        container: $("#dplayer"),
        video: {
            url: url,
            type: "customHls",
            playbackSpeed: [0.5, 0.75, 1, 1.5, 2, 2.5],
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



