// ==UserScript==
// @name        量子资源
// @version      0.0.1
// @description  用于修改样式便于操作播放!
// @author       bgcode
// @match        http://lzizy.net/*
// @match        https://lzizy.net/*
// @match        http://www.lzizy7.com/*
// @match        http://www.lzizy7.com/*
// @require      https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js
// ==/UserScript==
(function () {
    var n = 1 //窗口是否自动打开：默认关闭 1关闭，0开启

    $(".index-card").hide()
    $(".index-header").hide()
    $(".header_fl").hide()
    $(".header_left").hide()
    $(".nav").css("background-color", "white")
    $(".footer").hide()
    $("body > font > div.head_box > div.nav > div > ul > li a").css("color", "blue")
    $("body > font > div.head_box > div.nav > div > ul > li.yes").hide()
    $("body > font > div.container > div.list-nav").css("background-color", "blue")
    // $("body > font > div.container > div.list-nav").hide()

    var sad
    var name = $("body > font > div.container > div.list-nav > span").text().match(/[^]».*[\u4e00-\u9fa5].*?/g)
    console.log(name)
    if (name[0].length > 3) {
        name = $("body > font > div.container > div.list-nav > span").text().match(/[^]».*[\u4e00-\u9fa5].*?/g)
        sad = name[0].replace("»", "")
        $("body > font > div.container > div.list-nav > span").remove()
        $("body > font > div.container > div.list-nav ").append("<span>" + sad + "</span>").equal
    } else {
        name = $("body > font > div.list-nav>span").text()
        sad = name[0].replace("»", "")
       $("body > font > div.list-nav>span").remove()
       $("body > font > div.list-nav").append("<span>" + sad + "</span>")

    }




})();
//代码总体写的很简单，只是供参考，如果大家有兴趣可以自行对页面进行修改。
//如何选中要修改的区域？打开控制台观看页面的html的结构，类的绑定写法为jquery写法。
//图片只能为线上图片，css样式等可以用jquery的链式编程写。
//你可能发现了我为什么要加定时器延时50毫秒，你可以仔细观察脚本代码写在了什么区域内，没错，立即执行函数。
//因为立即执行函数的原因，可能导致写的脚本代码执行时机太早，被页面本身的代码给覆盖掉。