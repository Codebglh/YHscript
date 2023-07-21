function binEncode(data) {
    var binArray = []
    var datEncode = "";

    for (i=0; i < data.length; i++) {
        binArray.push(data[i].charCodeAt(0).toString(2));
    }
    for (j=0; j < binArray.length; j++) {
        var pad = padding_left(binArray[j], '0', 8);
        datEncode += pad + ' ';
    }
    function padding_left(s, c, n) { if (! s || ! c || s.length >= n) {
        return s;
    }
        var max = (n - s.length)/c.length;
        for (var i = 0; i < max; i++) {
            s = c + s; } return s;
    }
    console.log(binArray);
}

binEncode('/Users/bgcode/Downloads/codebglh.github.io-main/icon/favicon.png');