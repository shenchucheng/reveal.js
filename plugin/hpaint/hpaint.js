/***********画图部分事件处理函数************/
//画图前准备
(function(){    
    function loadStyles(url) {
               var link = document.createElement("link");
               link.rel = "stylesheet";
               link.type = "text/css";
               link.href = url;
               var head = document.getElementsByTagName("head")[0];
               head.appendChild(link);
    };
    (function(){
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML=`.paint-botton {background:none;color:rgba(255,255,255,0.5);border:0}`
        document.getElementsByTagName("head")[0].appendChild(style)
    })();
    (function(){
        var links = document.querySelectorAll('link');
        links.forEach(function(ls){if (ls.href.match('font-awesome')){return}})
        loadStyles("https://cdn.staticfile.org/font-awesome/4.7.0/css/font-awesome.css")})()
    var multiplex = Reveal.getConfig().multiplex;
    var socket = io.connect( multiplex.url );
    var slideWidth = screen.width;
    var slideHeight = screen.height;
    var dom = {};
    dom.wrapper = document.body;

    if( !dom.wrapper.querySelector( 'drwaing-box' ) ) {
            var searchElement = document.createElement( 'div' );
            searchElement.id = "_buttons";
            // searchElement.classList.add( 'searchdiv' );
            searchElement.style.position = 'absolute';
            searchElement.style.zIndex = 999;
            searchElement.style.bottom = '10px';
            searchElement.style.left = '10px';
            searchElement.innerHTML ='<div class="_btn-box" id="_btn-box" style="display:none;"><button class="fa fa-paint-brush paint-botton" id="_btn-brush"></div><button class="fa fa-wrench paint-botton" id="_btn-bar" data-toggle="fa fa-close"></button>' 
            dom.wrapper.appendChild( searchElement );
    }
    if ( !document.getElementById( 'paint-canvas' ) ){
        var canvasElement=document.createElement( 'div' );
        canvasElement.id='paint-canvas';
        canvasElement.innerHTML = '<canvas id="drawBoard" class="drawing-board" style="zIndex:101"></canvas>';
        (document.body.querySelector( '.reveal' ) || document.body).appendChild(canvasElement)
    };
// document.body.append(document.createElement("
var $doc=document
var $drawBoard = document.getElementById("drawBoard"); //画板
var $body = document.body
var $win = window
var $container = document.getElementById("container")
function drawCanvasReady() {
    $drawBoard.context = $drawBoard.getContext('2d');
    var context = $drawBoard.context;
    context.lineWidth = 3;
    // context.lineCap = 'square'; //'round';
    context.lineJoin = 'round'; //'bevel';
    context.strokeStyle = 'rgba(255,0,0,0.5)'; //"red";
}
document.getElementById('_btn-bar').addEventListener('click', function () {
    var isOpen = false;
    return function () {
        if (!isOpen) {
            this.classList.remove('fa-wrench');
            this.classList.add('fa-close');
            document.getElementById('_btn-box').style.display = 'inline-block';
        } else {
            this.classList.remove('fa-close');
            this.classList.add('fa-wrench');
            document.getElementById('_btn-box').style.display = 'none';

        }
        isOpen = !isOpen;
    };
}(), false);
document.getElementById('_btn-brush').addEventListener('click', function () {
    var isOpen = false;
    return function () {
        if (isOpen) {
            this.classList.add('fa-paint-brush');
            this.classList.remove('fa-eraser');
            removePaint();
        } else {
            showPaint();
            this.classList.add('fa-eraser');
            this.classList.remove('fa-paint-brush');
        }
        isOpen = !isOpen;
    };
}(), false);

//显示画板
var isControl = 0;
function startPaint() {
        var isOpen = false;
        return function () {
            if (isOpen) {
                this.classList.add('fa-paint-brush');
                this.classList.remove('fa-eraser');
                removePaint();
            } else {
                showPaint();
                this.classList.add('fa-eraser');
                this.classList.remove('fa-paint-brush');
            }
            isOpen = !isOpen;
        };
    }

function showPaint(isFromControl) {
    if (!$drawBoard) {
        return;
    }
    //1、将翻页停止
    isStopTouchEvent = true;
    //2、将管理模式去掉
    if ($body.classList.contains('with-notes')) {
        isControl = 1;
        $body.classList.remove('with-notes');
        $body.classList.remove('popup');
    }
    $drawBoard.width = $body.clientWidth;
    $drawBoard.height = $body.clientHeight;
    drawCanvasReady();

    $drawBoard.style.display = '';
    $drawBoard.style.position = 'absolute';
    $drawBoard.style.zIndex = 101;
    $container.style.overflow = 'hidden';

    $drawBoard.addEventListener('mousedown', pMouseDown, true);
    $drawBoard.addEventListener('mouseup', pMouseUp, true);
    $drawBoard.addEventListener('mousemove', pMouseMove, true);
    //滑动
    $drawBoard.addEventListener('touchmove', pMouseMove, true);
    $drawBoard.addEventListener('touchend', pMouseUp, true);
    $drawBoard.addEventListener('touchcancel', pMouseUp, true);
    $drawBoard.addEventListener('touchstart', pMouseDown, true);

    $doc.addEventListener('selectstart', stopSelect, true);
}
//禁止选中
function stopSelect() {
    return false;
}

//清除画板内容
function clearPaint() {
    $container.style.overflow = '';
    $drawBoard.context && $drawBoard.context.clearRect(0, 0, slideWidth, slideHeight);
    $drawBoard.style.display = 'none';
}

//删除画板
var removePaint = function (isFromControl) {
    clearPaint();
    slideJump = ''; //j 幻灯片跳转
    if (isControl) {
        $body.classList.add('with-notes');
        $body.classList.add('popup');
    }
    isStopTouchEvent = false;
    $drawBoard.removeEventListener('mousedown', pMouseDown);
    $drawBoard.removeEventListener('mouseup', pMouseUp);
    $drawBoard.removeEventListener('mousemove', pMouseMove);
    //滑动
    $drawBoard.removeEventListener('touchstart', pMouseDown);
    $drawBoard.removeEventListener('touchmove', pMouseMove);
    $drawBoard.removeEventListener('touchend', pMouseUp);
    $drawBoard.removeEventListener('touchcancel', pMouseUp);


    $doc.removeEventListener('selectstart', stopSelect, true);
};
var pMouseDown = function (e) {
    $drawBoard.isMouseDown = true;
    try { //j 触屏画笔
        var touch = e.targetTouches[0];
        e = touch;
    } catch (err) {}
    //        $drawBoard.iLastX = e.clientX - $drawBoard.offsetLeft + ($win.pageXOffset || $doc.body.scrollLeft || $doc.documentElement.scrollLeft);
    //        $drawBoard.iLastY = e.clientY - $drawBoard.offsetTop + ($win.pageYOffset || $doc.body.scrollTop || $doc.documentElement.scrollTop);
    var x = $drawBoard.iLastX = e.layerX || e.offsetX || (e.clientX - $drawBoard.offsetLeft + ($win.pageXOffset || $doc.body.scrollLeft || $doc.documentElement.scrollLeft));
    var y = $drawBoard.iLastY = e.layerY || e.offsetY || (e.clientY - $drawBoard.offsetTop + ($win.pageYOffset || $doc.body.scrollTop || $doc.documentElement.scrollTop));
    pPoints.push({
        x: x,
        y: y
    });
    return false; //j 触屏画笔
};
var pPoints = [];
var pMouseUp = function (e) {
    $drawBoard.isMouseDown = false;
    $drawBoard.iLastX = -1;
    $drawBoard.iLastY = -1;
    var data = {
        secret: multiplex.secret,
        socketId: multiplex.id,
        points: pPoints.copyWithin(),
        screen: {
            width: $doc.body.offsetWidth,
            height: $doc.body.offsetHeight
        }
    }
    socket.emit('paint', data, function(){console.log(data)}());
    pPoints.length = 0;
};

var pMouseMove = function (e) {
    var ee = e;
    if ($drawBoard.isMouseDown) {
        try { //j 触屏画笔
            var touch = e.targetTouches[0];
            e = touch;
        } catch (err) {
            console.log(err);
        }
        //            var iX = e.clientX - $drawBoard.offsetLeft + ($win.pageXOffset || $doc.body.scrollLeft || $doc.documentElement.scrollLeft);
        //            var iY = e.clientY - $drawBoard.offsetTop + ($win.pageYOffset || $doc.body.scrollTop || $doc.documentElement.scrollTop);
        var iX = e.layerX || e.offsetX || (e.clientX - $drawBoard.offsetLeft + ($win.pageXOffset || $doc.body.scrollLeft || $doc.documentElement.scrollLeft));
        var iY = e.layerY || e.offsetY || (e.clientY - $drawBoard.offsetTop + ($win.pageYOffset || $doc.body.scrollTop || $doc.documentElement.scrollTop));
        var context = $drawBoard.context;
        context.beginPath();
        context.moveTo($drawBoard.iLastX, $drawBoard.iLastY);
        context.lineTo(iX, iY);
        context.stroke();
        $drawBoard.iLastX = iX;
        $drawBoard.iLastY = iY;
        pPoints.push({
            x: iX,
            y: iY
        });
        try {
            ee.preventDefault();
        } catch (err) {
            console.log(err);
        }
        return false; //j 触屏画笔
    }
};
showPaint(false)
socket.on(multiplex.id+':paint', function (data) {
        console.log(data)
        var points = data.points;
        //远程来的屏幕
        var wh = data.screen;
        var tOX = wh.width / 2,
            tOY = wh.height / 2;

        var width = $body.offsetWidth;
        var height = $body.offsetHeight;
        var cOX = width / 2,
            cOY = height / 2;

        var iw = width / wh.width;
        var ih = height / wh.height;

        var context = $drawBoard.context;
        if (!context) {
            return;
        }
        context.beginPath();
        var startX = cOX - (tOX - points[0].x) * iw;
        var startY = cOY - (tOY - points[0].y) * ih;
        // console.log(startX, points[0].x, startY, iw, wh);
        context.moveTo(startX, startY);
        for (var i = 0, len = points.length; i < len; i++) {
            context.lineTo(cOX - (tOX - points[i].x) * iw, cOY - (tOY - points[i].y) * ih);
        }
        context.stroke();
    });})()
