// ==UserScript==
// @name         视频嗅探
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  自动嗅探页面上的视频资源，将链接展示出来，并提供复制和下载方法（除部分流媒体不能下载，需要专用的下载器）。
// @author       geigei717
// @license      MIT
// @match        https://*/*
// @match        http://*/*
// @icon         https://img-blog.csdnimg.cn/20181221195058594.gif
// @require      https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js
// @require      https://unpkg.com/@ffmpeg/ffmpeg@0.10.0/dist/ffmpeg.min.js
// @noframes
// @grant        unsafeWindow
// @grant        GM_download
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      *
// ==/UserScript==

(function() {
    var n = 1 //窗口是否自动打开：默认关闭 1关闭，0开启
    var Isffmpeg = 1 //是否转码：默认开启，1开启，0关闭 （需要浏览器支持，否则这个设置不会生效）
    let URLs = [];
    unsafeWindow.GM_D = [];
    var mn = -1
    $("body").append("<div id='MyUrls' style='width: 430px;background-color: #3e8f3e;color: black;position: fixed;top: 0;right: 0;z-index: 99999;border-radius: 10px;display: none;'>" +
        "<div style='height: 30px;font-size: 20px;'>&nbsp&nbsp&nbsp视频链接：<span style='font-size: 10px;color:red;'>部分m3u8等流媒体无法下载，需要专用下载器</span></div>" +
        "<hr style='border-color: black;margin: 5px 5px'>" +
        "<div class='MyUrls' style='margin: 10px 10px;max-height: 500px;overflow-y: auto;text-align: left;'>" +
        "   <div class='urlnone' style='height: 30px;color: red'> 暂时没有嗅探到视频资源</div>" +
        "</div>" +
        "</div>")
        .append("<div id='MyUpDown' style='width: 30px;height: 30px;color: black;background-color: #3e8f3e;position: fixed;top: 0;right: 0;z-index: 100000;font-size: 20px;line-height: 30px;text-align: center;cursor: pointer;border-radius: 30px;'>" +
            "<div id='redPoint' style='width: 5px;height: 5px;position: fixed;top: -25px;right: 30px;font-size: 50px;color: red;font-weight: 400;display:none; '>.</div>"+
            "<div id='downIcon' style='font-size: 30px;line-height: 30px;transform: rotate(90deg);font-family:cursive;font-weight:400'>+</div>" +
            "</div>")

    $(".MyUrls").append("<div class='downloadUrl' style='padding: 5px 0;height: 30px;'><div style='width: 40px;text-align: right;display: inline-block;'> 0、</div><input autocomplete='on' class='downUrl'  style='position: relative;top: -2px;font-size: 12px;width: 200px;display: inline-block;max-width: 240px;word-wrap: break-word;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin: 0px;height: 20px;border: 1px solid white;border-radius: 5px;padding: 0 5px; background: white;color:black' placeholder='请输入要下载的视频链接：'>  <input class='downName' style='position: relative;top: -2px;font-size: 12px;width: 75px;display: inline-block;max-width: 240px;word-wrap: break-word;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin: 0px;height: 20px;border: 1px solid white;border-radius: 5px;padding: 0 5px; background: white;color:black'  placeholder='请输入文件名'><div class='SaveUrl' style=\"display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;\">下载</div><div class='StopSaveUrl' style='display: none;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;'>0%</div>")
    //<button class='SaveUrl' style='margin-left: 5px;height: 20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;color:black;font-size: 10px;'>下载</button><button class='StopSaveUrl' style='display: none;margin-left: 5px;height: 20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>0%</button></div>")
    $("#MyUpDown").click(function () {
        $("#MyUrls").slideToggle("slow", function () {
            if (mn=="1"||mn==1){
                $("#MyUpDown #downIcon").text('+')
            }else {
                $("#MyUpDown #downIcon").text('I')
                $("#redPoint").css("display","none")
            }
            mn = -mn;
        });
    })
    $("body>[id!=MyUpDown][id!=MyUrls]").click(function () {
        if($("#MyUrls").css("display")!="none"){
            $("#MyUpDown").click()
        }
    })
    functionAll("")

    function functionAll(u){
        //跳转链接
        $(".GoUrl"+u).click(function (){
            var url = $(this).prevAll(".downUrl"+u).attr("title")
            var link = document.createElement('a');
            link.href = url;
            link.target="_blank";
            link.click();
            link.remove();
        })
        //复制链接
        $(".CopyUrl"+u).click(function (){
            var url = $(this).prevAll(".downUrl"+u).attr("title")
            GM_setClipboard(url);
            $(this).text("已复制")
        })

        //下载链接
        $(".SaveUrl"+u).click(function (){
            //$(obj).attr("disabled","disabled")
            var that = $(this)
            var url = $(that).prevAll(".downUrl"+u).val()
            if(url==undefined||url.trim()==''){
                url = $(that).prevAll(".downUrl"+u).attr('title')
                if(url==undefined||url.trim()==''){return;}
            }
            var name = $(that).prevAll(".downName"+u).val()
            if(name==undefined||name.trim()==""){
                name = $('title').text()
                if(name==undefined||name.trim()==""){
                    name = url.split("/").pop().split("?")[0]
                    if(name==undefined||name.trim()==""){
                        name = "video.mp4"
                    }
                }
            }
            //if(! /\.[\w]+$/.test(name)&& ! /(\.com$ | \.cn)/.test(name)){ name = name + ".mp4"}
            name = name.replaceAll(/\s+/ig," ").trim().replace(/(\.mp4)*$/igm,"")+".mp4"
            //console.log(name,url)
            $(that).css("display","none").next('.StopSaveUrl'+u).css("display","inline-block").text("解析中");
            var request = [];
            var blob = [];
            var loadSize = [];
            var xhrs = 0
            var num = -1
            GM_xmlhttpRequest({
                method: "HEAD",
                fetch: true,
                url: url,
                onerror: function(x) {
                    $(that).text("错误").css("display","inline-block").attr("title","下载出错。").next(".StopSaveUrl"+u).css("display","none").text("0%");
                },
                onload: function(response) {
                    if( response.status /100 >=4){
                        $(that).text("错误").css("display","inline-block").attr("title","下载出错。").next(".StopSaveUrl"+u).css("display","none").text("0%");
                        return;
                    }
                    var Length =response.responseHeaders.match(/content-length:\s*[\d]+\s/im)
                    if(Length==null||Length==undefined||Length==""){
                        request.push(GM_download({
                            url: url,
                            name: name,
                            onprogress : function (event) {
                                if (event.lengthComputable) {
                                    var loaded = parseInt(event.loaded / event.total * 100);
                                    if(loaded==100){
                                        $(that).text("下载").css("display","inline-block").attr("title","下载").next(".StopSaveUrl"+u).css("display","none");
                                    }else{
                                        $(that).next(".StopSaveUrl"+u).text(loaded+"%");
                                    }
                                }
                            },
                            onload : function () {
                                $(that).text("下载").css("display","inline-block").attr("title","下载").next(".StopSaveUrl"+u).css("display","none").text("0%");
                            },
                            onerror : function () {
                                $(that).text("错误").css("display","inline-block").attr("title","下载出错。").next(".StopSaveUrl"+u).css("display","none").text("0%");
                            }
                        }))
                        num =GM_D.push(request)
                        $(that).next('.StopSaveUrl'+u).data('num',num-1);
                        return;
                    };
                    Length = parseInt(Length[0].match(/\d+/)[0]);
                    var Type =response.responseHeaders.match(/content-type:\s*[\S]+\s/im)[0].split(':')[1].trim().toLowerCase();
                    if( (Type.split('/')[0] != "video" && Length <= 1024*100) || Type =="Application/vnd.apple.mpegurl"){
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: url,
                            onerror: function(x) {
                                $(that).text("错误").css("display","inline-block").attr("title","下载出错。").next(".StopSaveUrl"+u).css("display","none").text("0%");
                            },
                            onload: function(response) {
                                var err = 0
                                var tsNum=0
                                var tsS = 0
                                function downTs(Ts,tsUrl){
                                    request[0] = GM_xmlhttpRequest({
                                        method: "GET",
                                        url: tsUrl,
                                        fetch: false,
                                        responseType: "arraybuffer",
                                        onloadstart: function(){
                                            num = $(that).next(".StopSaveUrl"+u).data("num")
                                            if (num == undefined ||num == -1 || num == ""){
                                                num =GM_D.push(request)
                                                tsS = Ts.length + 1
                                                $(that).next('.StopSaveUrl'+u).data('num',num-1)
                                            }else{
                                                num = parseInt( num );
                                                GM_D[num] = request;
                                            }
                                        },
                                        onload: function(response) {
                                            blob.push( new Blob([response.response]) )
                                            if (Ts.length>0) {
                                                tsNum = tsNum+ parseInt(1 / tsS * 100);
                                                tsNum = tsNum >100 ? 100 : tsNum;
                                                $(that).next(".StopSaveUrl"+u).text(tsNum+"%");
                                                downTs(Ts,Ts.shift())
                                            }else{
                                                var is = true;
                                                try {
                                                    var sab = new SharedArrayBuffer(1);
                                                } catch(err) {
                                                    console.log( err.message +"\n 浏览器不支持SharedArrayBuffer")
                                                    is = false
                                                }
                                                var link = document.createElement("a");
                                                if(Isffmpeg == 1 && is){
                                                    $(that).next(".StopSaveUrl"+u).text("转码中");
                                                    const { createFFmpeg, fetchFile } = FFmpeg;
                                                    const ffmpeg = createFFmpeg({
                                                        //corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
                                                        log: true,
                                                        progress: ({ ratio }) => {
                                                            tsNum = (ratio * 100.0).toFixed(2)
                                                            $(that).next(".StopSaveUrl"+u).text(tsNum+"%").attr("title",'转码中');
                                                        },
                                                    });
                                                    (async () => {
                                                        console.log( '正在加载 ffmpeg-core.js');
                                                        await ffmpeg.load();
                                                        console.log('开始转码');
                                                        ffmpeg.FS('writeFile', 'video.ts', await fetchFile(new Blob(blob)) );
                                                        await ffmpeg.run('-i', 'video.ts' ,'output.mp4');
                                                        console.log('转码完成');
                                                        const data = ffmpeg.FS('readFile', 'output.mp4');
                                                        $(that).text("下载").css("display","inline-block").attr("title","下载").next(".StopSaveUrl"+u).css("display","none").attr("title","下载中");
                                                        link.href = window.URL.createObjectURL(new Blob([data.buffer]));
                                                        link.download = name;
                                                        link.click();
                                                        link.remove();
                                                        ffmpeg.exit()
                                                    })();

                                                }else{
                                                    $(that).text("下载").css("display","inline-block").attr("title","下载").next(".StopSaveUrl"+u).css("display","none").attr("title","下载中");
                                                    link.href = window.URL.createObjectURL(new Blob(blob));
                                                    link.download = name;
                                                    link.click();
                                                    link.remove();
                                                }
                                            }
                                        },
                                        onabort: function(){
                                            console.log("abort！");
                                        },
                                        onerror: function(x) {
                                            console.log("error！");
                                            if (err<10){
                                                err = err+1
                                                downTs(Ts,tsUrl)
                                            }else{
                                                err = 0
                                                $(that).text("错误").css("display","inline-block").attr("title","下载出错").next(".StopSaveUrl"+u).css("display","none").text("0%");
                                            }
                                        }
                                    });
                                }

                                var Ts = response.responseText.trim().split("\n")
                                if(Ts[0].trim()=="#EXTM3U"){
                                    //console.log("m3u8")
                                    var status = "",bool ="false";
                                    Ts.forEach(function(item){
                                        if(/#EXT-X-KEY/.test(item.trim())){
                                            status = "key"
                                            return;
                                        }
                                        if(/#EXT-X-TARGETDURATION/.test(item.trim())){
                                            bool = "true"
                                            return;
                                        }
                                    })
                                    if(status == "key"){
                                        $(that).text("错误").css("display","inline-block").attr("title","m3u8加密，暂时无法解决。").next(".StopSaveUrl"+u).css("display","none").text("0%");
                                        console.log("m3u8加密，暂时无法解决。")
                                        return;
                                    }
                                    console.log("m3u8解析下载中ing。")
                                    //console.log(Ts)
                                    var tsUrl
                                    Ts.forEach(function(item,i){
                                        if(!/^#EXT/.test(item.trim())){
                                            if(/^(http:|https:)/.test(item)){
                                                //"完整链接"
                                                tsUrl = item
                                            }else{
                                                //"不完整，需要拼接"
                                                tsUrl = url.split("?")[0].split("/");
                                                tsUrl.pop();
                                                tsUrl = tsUrl.join("/")+"/"+item
                                            }
                                            Ts[i] = tsUrl
                                            //console.log(tsUrl)
                                        }
                                    })
                                    if(bool == "true"){
                                        Ts = Ts.filter(function(item){
                                            return !/^#EXT/.test(item.trim())
                                        });
                                        downTs(Ts,Ts.shift())
                                    }else{
                                        console.log("这下边嵌套了m3u8。")
                                        Ts = Ts.join("\n").split("#EXT-X-STREAM-INF:"); Ts.shift()
                                        var maxP=0,maxUrl='';
                                        Ts.forEach(function(item,i){
                                            tsUrl = item.split("\n",2)
                                            if( /RESOLUTION=\d+\D\d+/igm.test( tsUrl[0] )){
                                                var P=1;
                                                tsUrl[0].match(/RESOLUTION=\d+\D\d+/igm)[0].match(/\d+\D\d+/igm)[0].split(/\D/).forEach(function(item,i){
                                                    P = P * parseInt(item)
                                                })
                                                if( maxP < P ){
                                                    maxUrl = tsUrl[1] ;
                                                    maxP = P
                                                }
                                            }else{
                                                maxUrl = tsUrl[1]
                                                return;
                                            }
                                        })
                                        console.log(maxP,maxUrl)
                                        //name = name.replace(/(\.mp4)*$/igm,"")+"_"+m3u8Url.split("?")[0].split("/").pop().replace(/(\.m3u8)*$/igm,"")+".mp4"
                                        GM_xmlhttpRequest({
                                            method: "GET",
                                            url: maxUrl,
                                            onerror: function(x) {
                                                $(that).text("错误").css("display","inline-block").attr("title","下载出错。").next(".StopSaveUrl"+u).css("display","none").text("0%");
                                            },
                                            onload: function(response) {
                                                var Ts1 = response.responseText.trim().split("\n")
                                                if(Ts1[0].trim()=="#EXTM3U"){
                                                    //console.log("m3u8")
                                                    var status = "";
                                                    Ts1.forEach(function(item){
                                                        if(/#EXT-X-KEY/.test(item.trim())){
                                                            status = "key"
                                                            return;
                                                        }
                                                    })
                                                    if(status == "key"){
                                                        $(that).text("错误").css("display","inline-block").attr("title","m3u8加密，暂时无法解决。").next(".StopSaveUrl"+u).css("display","none").text("0%");
                                                        console.log("m3u8加密，暂时无法解决。")
                                                        return;
                                                    }
                                                    Ts1 = Ts1.filter(function(item){
                                                        return !/^#EXT/.test(item.trim())
                                                    });
                                                    var tsUrl
                                                    Ts1.forEach(function(item,i){
                                                        if(/^(http:|https:)/.test(item)){
                                                            //"完整链接"
                                                            tsUrl = item
                                                        }else{
                                                            //"不完整，需要拼接"
                                                            tsUrl = maxUrl.split("?")[0].split("/");
                                                            tsUrl.pop();
                                                            tsUrl = tsUrl.join("/")+"/"+item
                                                        }
                                                        Ts1[i] = tsUrl
                                                        //console.log(tsUrl)
                                                    })
                                                    downTs(Ts1,Ts1.shift())
                                                }else{
                                                    var link = document.createElement("a");
                                                    link.href = window.URL.createObjectURL(new Blob([response.response]));
                                                    link.download = name;
                                                    link.click();
                                                    link.remove();
                                                    $(that).text("下载").css("display","inline-block").attr("title","下载").next(".StopSaveUrl"+u).css("display","none").text("0%");
                                                }
                                            }
                                        })
                                    }
                                }else{
                                    var link = document.createElement("a");
                                    link.href = window.URL.createObjectURL(new Blob([response.response]));
                                    link.download = name;
                                    link.click();
                                    link.remove();
                                    $(that).text("下载").css("display","inline-block").attr("title","下载").next(".StopSaveUrl"+u).css("display","none").text("0%");
                                }
                            }})
                    }else{
                        //console.log("video")
                        console.log("mp4视频下载中ing。")
                        var RangeSize = parseInt((Length/5).toFixed(0))
                        for(var i=0,z=0;i<Length;i=i+RangeSize,z++){
                            var range_start=i,range_end=i+RangeSize-1;
                            if (range_end+1>=Length) {range_end = Length}
                            //console.log(range_start,range_end)
                            eval('function onprogress'+z+' (event){'+
                                'loadSize['+z+'] = event.loaded;'+
                                'var x =0;'+
                                'loadSize.forEach(function(item){'+
                                '    x = x + item'+
                                '});'+
                                'var loaded = parseInt(x / Length * 100);'+
                                'if(loaded==100){'+
                                '     $(that).text("下载").css("display","inline-block").next(".StopSaveUrl'+u+'").css("display","none");'+
                                '}else{'+
                                '     $(that).next(".StopSaveUrl'+u+'").text(loaded+"%"); '+
                                //'     console.log(loaded+"%")'+
                                '}'+
                                '}'+
                                'request['+z+'] = GM_xmlhttpRequest({'+
                                'method: "GET",'+
                                'url: url,'+
                                'fetch: false,'+
                                'responseType: "arraybuffer",'+
                                'headers: { "Range":"bytes="+range_start+"-"+range_end},'+
                                'onprogress: onprogress'+ z +','+
                                'onload: function(response) {'+
                                '    blob[' + z + '] = new Blob([response.response]);' +
                                //'    console.log(blob);' +
                                '    var x=0;' +
                                '    loadSize.forEach(function(item){' +
                                '        x = x + item' +
                                '    });' +
                                '    if (x == Length) {' +
                                '       var link = document.createElement("a");' +
                                '       link.href = window.URL.createObjectURL(new Blob(blob));' +
                                '       link.download = name;' +
                                '       link.click();' +
                                '       link.remove();' +
                                '       $(that).text("下载").css("display","inline-block").attr("title","下载").next(".StopSaveUrl'+u+'").css("display","none").text("0%");'+
                                '    }' +
                                '},'+
                                'onabort: function(){'+
                                //'$(that).text("继续").css("display","inline-block").next(".StopSaveUrl1").css("display","none").text("0%");'+
                                'console.log("error！");'+
                                '},'+
                                'onerror: function(x) {'+
                                //'$(that).text("错误").css("display","inline-block").next(".StopSaveUrl'+u+'").css("display","none").text("0%");'+
                                'console.log("error！更换线路ing");'+
                                'request.forEach(function(item){'+
                                '   item.abort()'+
                                '});'+
                                'request['+z+'] = GM_download({'+
                                '    url: url,'+
                                '    name: name,'+
                                '    onprogress : function (event) {'+
                                '        if (event.lengthComputable) {'+
                                '            var loaded = parseInt(event.loaded / event.total * 100);'+
                                '            if(loaded==100){'+
                                '                $(that).text("下载").css("display","inline-block").attr("title","下载").next(".StopSaveUrl'+u+'").css("display","none");'+
                                '            }else{'+
                                '                $(that).next(".StopSaveUrl'+u+'").text(loaded+"%"); '+
                                '            }'+
                                '        }'+
                                '    },'+
                                '    onload : function () {'+
                                '        $(that).text("下载").css("display","inline-block").attr("title","下载").next(".StopSaveUrl'+u+'").css("display","none").text("0%");'+
                                '    },'+
                                '    onerror : function () {'+
                                '        $(that).text("错误").css("display","inline-block").attr("title","下载出错。").next(".StopSaveUrl'+u+'").css("display","none").text("0%");'+
                                '    }'+
                                '});'+
                                'var numi = parseInt( $(that).next(".StopSaveUrl'+u+'").data("num") );'+
                                'GM_D[numi] = request;'+
                                '},'+
                                '});')
                        }
                        //console.log(request)
                        num =GM_D.push(request)
                        $(that).next('.StopSaveUrl'+u).data('num',num-1)
                    }
                }
            });
        })
        //停止
        $(".StopSaveUrl"+u).click(function (){
            var num = $(this).data("num")
            GM_D[num].forEach(function(item){
                item.abort()
            })
            $(this).data("num","").css("display","none").text("0%").prev(".SaveUrl"+u).text("继续").attr("title","下载中断").css("display","inline-block");
        })
    }



    function getNetworkRequsts(){
        return performance.getEntriesByType("resource").filter((entry) => {
            return entry.initiatorType === "xmlhttprequest"||entry.initiatorType === "video";
        });
    }
    var observer = new PerformanceObserver(perf_observer);
    observer.observe({entryTypes: ["resource"]})

    function perf_observer(list,observer){
        var z,m,length=$('.isUrl').length;
        var scripts =getNetworkRequsts()
        scripts.forEach(function (x,i) {
            if (x.initiatorType === "xmlhttprequest" || (x.initiatorType === "video" && !/\.jpg/.test(x.name))) {
                z = x.name.trim()

                if(/m3u8/.test(x.name) && !/\.ts/.test(x.name) || /\.mp4$/.test(z.split('?')[0]) ){
                    if(! URLs.includes(z) ){
                        m = URLs.push(z)-1
                        //console.log('type: m3u8 , url: ' + x.name)
                        $(".urlnone").remove()
                        $(".MyUrls").append("<div class='isUrl' style='height: 30px;'> <div style='width: 40px;text-align: right;display: inline-block;'>"+ (m+1) +"、</div><div class='downUrl"+m+"' style=\"position: relative;top: 5px;font-size: 12px;width: 200px;display: inline-block;max-width: 240px;word-wrap: break-word;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin: 0px;height: 20px;border: 1px solid white;border-radius: 5px;padding: 0 5px;background: white;line-height: 20px;color: #000000 !important;\" title='"+z+"'>"+z+"</div><div class='GoUrl"+m+"' style=\"display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;\">访问</div><div class='CopyUrl"+m+"' style='display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;'>复制</div><div class='SaveUrl"+m+"' style=\"display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;\">下载</div><div class='StopSaveUrl"+m+"' style=\"display: none;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;\">0%</div></div>")
                        // <p class='downUrl"+m+"' style='position: relative;top: 5px;font-size: 12px;width: 200px;display: inline-block;max-width: 240px;word-wrap: break-word;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin: 0px;height: 20px;border: 1px solid white;border-radius: 5px;padding: 0 5px; background: white;line-height: 20px;color: #000000 !important;' title='"+z+"'>"+z+"</p><button class='GoUrl"+m+"' style='margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>访问</button><button class='CopyUrl"+m+"' style='margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>复制</button><button class='SaveUrl"+m+"' style='display:none;margin-left: 5px;height: 20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>下载</button><button class='StopSaveUrl"+m+"' style='display: none;margin-left: 5px;height: 20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>0%</button></div>")
                        functionAll(m)
                    }
                    //}else if(/\.mp4$/.test(z.split('?')[0])){
                    //    if(! URLs.includes(z) ){
                    //        m =URLs.push(z)-1
                    //console.log('type: m3u8 , url: ' + x.name)
                    //        $(".urlnone").remove()
                    //        $(".MyUrls").append("<div class='isUrl' style='height: 30px;'> <div style='width: 40px;text-align: right;display: inline-block;'>"+ (m+1) +"、</div><div class='downUrl"+m+"' style=\"position: relative;top: 5px;font-size: 12px;width: 200px;display: inline-block;max-width: 240px;word-wrap: break-word;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin: 0px;height: 20px;border: 1px solid white;border-radius: 5px;padding: 0 5px;background: white;line-height: 20px;color: #000000 !important;\" title='"+z+"'>"+z+"</div><div class='GoUrl"+m+"' style=\"display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;\">访问</div><div class='CopyUrl"+m+"' style='display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;'>复制</div><div class='SaveUrl"+m+"' style=\"display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;\">下载</div><div class='StopSaveUrl"+m+"' style='display: none;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;'>0%</div></div>")
                    //                        $(".MyUrls").append("<div class='isUrl' style='height: 30px;'><div style='width: 40px;text-align: right;display: inline-block;'>"+ (m+1) +"、</div> <p class='downUrl"+m+"' style='position: relative;top: 5px;font-size: 12px;width: 200px;display: inline-block;max-width: 240px;word-wrap: break-word;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin: 0px;height: 20px;border: 1px solid white;border-radius: 5px;padding: 0 5px; background: white;line-height: 20px;color: #000000 !important;' title='"+z+"'>"+z+"</p><button class='GoUrl"+m+"' style='margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>访问</button><button class='CopyUrl"+m+"' style='margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>复制</button><button class='SaveUrl"+m+"' style='margin-left: 5px;height: 20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>下载</button><button class='StopSaveUrl"+m+"' style='display: none;margin-left: 5px;height: 20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>0%</button></div>")
                    //        functionAll(m)
                    //    }
                }
            }
            //if (x.initiatorType === "video" && !/\.jpg/.test(x.name)) {
            //    z = x.name.trim()
            //    if(! URLs.includes(z) ){
            //        m =URLs.push(z)-1
            //        //console.log('type: video , url: ' + x.name)
            //        $(".urlnone").remove()
            //        $(".MyUrls").append("<div class='isUrl' style='height: 30px;'> <div style='width: 40px;text-align: right;display: inline-block;'>"+ (m+1) +"、</div><div class='downUrl"+m+"' style=\"position: relative;top: 5px;font-size: 12px;width: 200px;display: inline-block;max-width: 240px;word-wrap: break-word;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin: 0px;height: 20px;border: 1px solid white;border-radius: 5px;padding: 0 5px;background: white;line-height: 20px;color: #000000 !important;\" title='"+z+"'>"+z+"</div><div class='GoUrl"+m+"' style=\"display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;\">访问</div><div class='CopyUrl"+m+"' style='display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;'>复制</div><div class='SaveUrl"+m+"' style=\"display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;\">下载</div><div class='StopSaveUrl"+m+"' style='display: none;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;'>0%</div></div>")
            //                    $(".MyUrls").append("<div class='isUrl' style='height: 30px;'><div style='width: 40px;text-align: right;display: inline-block;'>"+ (m+1) +"、</div><p  class='downUrl"+m+"' style='position: relative;top: 5px;font-size: 12px;width: 200px;display: inline-block;max-width: 240px;word-wrap: break-word;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin: 0px;height: 20px;border: 1px solid white;border-radius: 5px;padding: 0 5px; background: white;line-height: 20px;color: #000000 !important;' title='"+z+"'>"+z+"</p><button class='GoUrl"+m+"' style='margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>访问</button><button class='CopyUrl"+m+"' style='margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>复制</button><button class='SaveUrl"+m+"' style='margin-left: 5px;height: 20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>下载</button><button class='StopSaveUrl"+m+"' style='display: none;margin-left: 5px;height: 20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>0%</button></div>")
            //        functionAll(m)
            //    }
            //}
        })
        $("video").each(function () {
            if(!/^blob:/.test(this.currentSrc)){
                z = this.currentSrc.trim()
                if(! URLs.includes(z)&& this.currentSrc!=""){
                    m =URLs.push(z)-1
                    //console.log('type: video , url: ' + this.currentSrc)
                    $(".urlnone").remove()
                    $(".MyUrls").append("<div class='isUrl' style='height: 30px;'> <div style='width: 40px;text-align: right;display: inline-block;'>"+ (m+1) +"、</div><div class='downUrl"+m+"' style=\"position: relative;top: 5px;font-size: 12px;width: 200px;display: inline-block;max-width: 240px;word-wrap: break-word;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin: 0px;height: 20px;border: 1px solid white;border-radius: 5px;padding: 0 5px;background: white;line-height: 20px;color: #000000 !important;\" title='"+z+"'>"+z+"</div><div class='GoUrl"+m+"' style=\"display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;\">访问</div><div class='CopyUrl"+m+"' style='display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;'>复制</div><div class='SaveUrl"+m+"' style=\"display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;\">下载</div><div class='StopSaveUrl"+m+"' style='display: none;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;'>0%</div></div>")
                    //                    $(".MyUrls").append("<div class='isUrl' style='height: 30px;'><div style='width: 40px;text-align: right;display: inline-block;'>"+ (m+1) +"、</div><p class='downUrl"+m+"' style='position: relative;top: 5px;font-size: 12px;width: 200px;display: inline-block;max-width: 240px;word-wrap: break-word;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin: 0px;height: 20px;border: 1px solid white;border-radius: 5px;padding: 0 5px; background: white;line-height: 20px;color: #000000 !important;' title='"+z+"'>"+z+"</p><button class='GoUrl"+m+"' style='margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>访问</button><button class='CopyUrl"+m+"' style='margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>复制</button><button class='SaveUrl"+m+"' style='margin-left: 5px;height: 20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>下载</button><button class='StopSaveUrl"+m+"' style='display: none;margin-left: 5px;height: 20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>0%</button></div>")
                    functionAll(m)
                }
            }
        })
        $("source").each(function () {
            if($(this).attr('src')!=''&&$(this).attr('src')!=undefined){
                if(!/^(http:|https:)/.test($(this).attr('src'))){
                    z = location.href.split("://")[0] +':'+ $(this).attr('src').trim()
                }else{
                    z = $(this).attr('src').trim()
                }
                if(! URLs.includes(z) && z != ""){
                    m =URLs.push(z)-1
                    //console.log('type: src , url: ' + z)
                    $(".urlnone").remove()
                    $(".MyUrls").append("<div class='isUrl' style='height: 30px;'> <div style='width: 40px;text-align: right;display: inline-block;'>"+ (m+1) +"、</div><div class='downUrl"+m+"' style=\"position: relative;top: 5px;font-size: 12px;width: 200px;display: inline-block;max-width: 240px;word-wrap: break-word;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin: 0px;height: 20px;border: 1px solid white;border-radius: 5px;padding: 0 5px;background: white;line-height: 20px;color: #000000 !important;\" title='"+z+"'>"+z+"</div><div class='GoUrl"+m+"' style=\"display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;\">访问</div><div class='CopyUrl"+m+"' style='display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;'>复制</div><div class='SaveUrl"+m+"' style=\"display: inline-block;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;\">下载</div><div class='StopSaveUrl"+m+"' style='display: none;margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;line-height: 20PX;font-size: 10px;text-align: center;'>0%</div></div>")
                    //                        $(".MyUrls").append("<div class='isUrl' style='height: 30px;'><div style='width: 40px;text-align: right;display: inline-block;'>"+ (m+1) +"、</div><p style='position: relative;top: 5px;font-size: 12px;width: 200px;display: inline-block;max-width: 240px;word-wrap: break-word;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin: 0px;height: 20px;border: 1px solid white;border-radius: 5px;padding: 0 5px; background: white;line-height: 20px;color: #000000 !important;' title='"+z+"'>"+z+"</p><button class='GoUrl"+m+"' style='margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>访问</button><button class='CopyUrl"+m+"' style='margin-left: 5px;height:20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>复制</button><button class='SaveUrl"+m+"' style='margin-left: 5px;height: 20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>下载</button><button class='StopSaveUrl"+m+"' style='display: none;margin-left: 5px;height: 20px;width: 40px;padding: 0;border: none;background: white;border-radius:10px;cursor: pointer;'>0%</button></div>")
                    functionAll(m)
                }
            }
        })
        if($('.isUrl').length > length){
            if($("#MyUrls").css("display")=="none"){
                $("#redPoint").css("display","block")
                if(n==0){
                    $("#MyUpDown").click()
                    n = 1
                }
            }
        }
    }
})();