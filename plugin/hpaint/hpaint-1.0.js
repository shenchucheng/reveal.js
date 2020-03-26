/**********手绘模式**********/
(function(){
    //初始化函数：通过id获取功能唤起按钮、画板，若不存在则新建
    var $d = document;
    var $b = $d.body;
    var $m = Reveal.getConfig().multiplex;
    var $s = io.connect( $m.url );
    var data = {
        socketId: $m.id,
        secret: $m.secret,
        type: null,
        screen: {
            width: $b.clientWidth,
            height: $b.clientHeight
        },
        points: []
    } //用于远程绘画
    var pPoints = [];
    var isPainting;
    var isConnect = true;
    var trashable = false;

    //功能按钮
    if (!document.getElementById('paintTools')){
        var drawingBoxElement = $d.createElement('div');
        drawingBoxElement.style.position = 'absolute';
        drawingBoxElement.style.zIndex = 999;
        drawingBoxElement.style.bottom = '10px';
        drawingBoxElement.style.left = '10px';
        drawingBoxElement.innerHTML = `
            <div id="paintTools" class="paint-tool-box" style="display:none">
            <div id="paintPen">
            <botton id="paintBrush" class="fa fa-paint-brush paint-botton"></botton>
            <botton id="paintEraser" class="fa fa-eraser paint-botton"></botton>
            </div>
            <botton id="paintTrash" class="fa fa-trash paint-botton"></botton>
            <botton id="paintSetting" class="fa fa-cog paint-botton"></botton>
            <botton id="paintSize" class="fa fa-arrows-alt paint-botton"></botton>
            <botton id="paintConnect" class="fa fa-refresh fa-spin paint-botton"></botton>
            </div>
            <botton id="paintToolsToggle" class="fa fa-wrench paint-botton" data-toggle="fa fa-close"></botton>
            `;
        $b.appendChild(drawingBoxElement)
    }

    //画板容器
    if (!document.getElementById('paintContainer')){
        var canvasElement=$d.createElement('canvas');
        canvasElement.id = 'drawingBoard';
        canvasElement.classList.add('drawing-board');
        canvasElement.width = $b.clientWidth;
        canvasElement.height = $b.clientHeight;
        canvasElement.style.position = 'absolute';
        canvasElement.style.zIndex = 101;
        var container = $d.createElement('div');
        container.appendChild(canvasElement);
        $b.appendChild(container);
        $reveal = $b.querySelector('.reveal');
        $reveal.style.position = 'absolute';
        $reveal.querySelector('aside.controls').style.zIndex = 999;
    }
    var $db = document.getElementById( 'drawingBoard' ); //画板

    //初始化画板
    $db.context = $db.getContext('2d');
    var context = $db.context;
    context.lineWidth = 3;
    context.lineJoin = 'round';
    context.strokeStyle = 'rgb(0,0,0)';

    //工具栏控制按钮
    document.getElementById('paintToolsToggle').addEventListener('click', function (){
        var isOpen = false;
        return  function(){
            if (isOpen) {
                this.classList.add('fa-wrench');
                this.classList.remove('fa-close');
                document.getElementById('paintTools').style.display = 'none'} //收起工具栏
            else {
                this.classList.add('fa-close');
                this.classList.remove('fa-wrench');
                document.getElementById( 'paintTools' ).style.display = 'inline-block';
            }
            isOpen = !isOpen;
        }}(), false);

    //画板收起/调出按钮
    document.getElementById('paintSize').addEventListener('click', function(){
        var isMax = true;
        return function(){
            if (isMax) {
                this.style.opacity = 0.5;
                document.getElementById('drawingBoard').style.display = 'none'
            }else{
                this.style.opacity = 1;
                document.getElementById('drawingBoard').style.display = ''
            }
            isMax = !isMax
        }}(), false);

    //远程画板控制按钮
    document.getElementById('paintConnect').addEventListener('click', function(){
        if (isConnect) {
            this.classList.remove('fa-spin');
            this.style.opacity = 0.5;
        }else{
            this.classList.add('fa-spin');
            this.style.opacity = 1;
        }
        isConnect = !isConnect
    }, false);

    //画刷
    document.getElementById('paintBrush').addEventListener('click', function(){
        var isActive = this.isActive;
        if (isActive){
            this.style.opacity = 0.5;
            stopPainting()
        }else{
            this.style.opacity = 1;
            context.strokeStyle = 'black';
            if (isPainting){var id = this.id; chageOtherStatus(id)}else{startPainting()}
        }
        this.isActive = !isActive
        }, false);

    //橡皮
    document.getElementById('paintEraser').addEventListener('click', function(){
        var isActive = this.isActive;
        if (isActive){
            this.style.opacity = 0.5;
            stopPainting()
        }else{
            this.style.opacity = 1;
            context.strokeStyle = 'white';
            if (isPainting){var id = this.id; chageOtherStatus(id)}else{startPainting()}
        }
        this.isActive = !isActive
    }, false);

    //笔切换
    function chageOtherStatus(id){
        document.getElementById('paintPen').querySelectorAll('botton').forEach(
            function(e){
                if (e.id != id){e.style.opacity=0.5;e.isActive=!e.isActive}
            }
        )
    }

    //清空
    document.getElementById('paintTrash').addEventListener('click', function(){
        if (trashable){
        context.clearRect(0, 0, $b.clientWidth, $b.clientHeight);
        this.style.opacity = 0.5;
        trashable = false
    }}, false);

    //元素监听
    function startPainting(){
        isPainting = true;
        showTrashable();
        $db.addEventListener('mousedown', pMouseDown);
        $db.addEventListener('mouseup', pMouseUp);
        $db.addEventListener('mousemove', pMouseMove);
        $db.addEventListener('touchmove', pMouseMove);
        $db.addEventListener('touchend', pMouseUp);
        $db.addEventListener('touchcancel', pMouseUp);
        $db.addEventListener('touchstart', pMouseDown);
        $d.addEventListener('selectstart', stopSelect, true);
    }

    //显示是否删除
    function showTrashable(){
        if (!trashable){
            document.getElementById('paintTrash').style.opacity = 1;
            trashable = true
        }
    }

    //取消监听
    function stopPainting(){
        isPainting = false;
        $db.removeEventListener('mousedown', pMouseDown);
        $db.removeEventListener('mouseup', pMouseUp);
        $db.removeEventListener('mousemove', pMouseMove);
        $db.removeEventListener('touchstart', pMouseDown);
        $db.removeEventListener('touchmove', pMouseMove);
        $db.removeEventListener('touchend', pMouseUp);
        $db.removeEventListener('touchcancel', pMouseUp);
        $d.removeEventListener('selectstart', stopSelect, true);
    }

    //禁止选中
    function stopSelect(){
        return false
    }


    function pMouseDown (e) {
        $db.isMouseDown = true;
        try { //j 触屏画笔
            var touch = e.targetTouches[0];
            e = touch;
        } catch (err) {}
        //        $db.iLastX = e.clientX - $db.offsetLeft + (window.pageXOffset || $d.body.scrollLeft || $d.documentElement.scrollLeft);
        //        $db.iLastY = e.clientY - $db.offsetTop + (window.pageYOffset || $d.body.scrollTop || $d.documentElement.scrollTop);
        var x = $db.iLastX = e.layerX || e.offsetX || (e.clientX - $db.offsetLeft + (window.pageXOffset || $d.body.scrollLeft || $d.documentElement.scrollLeft));
        var y = $db.iLastY = e.layerY || e.offsetY || (e.clientY - $db.offsetTop + (window.pageYOffset || $d.body.scrollTop || $d.documentElement.scrollTop));
        pPoints.push({
            x: x,
            y: y
        });
        return false; //j 触屏画笔
    };


    function pMouseUp (e) {
        $db.isMouseDown = false;
        $db.iLastX = -1;
        $db.iLastY = -1;
        data.points = pPoints,
        $s.emit('paint', data, function(){console.log(data)}());
        pPoints.length = 0;
        return false
    }


    function pMouseMove (e) {
        var ee = e;
        if ($db.isMouseDown) {
            try { //j 触屏画笔
                var touch = e.targetTouches[0];
                e = touch;
            } catch (err) {
                console.log(err);
            }
            //            var iX = e.clientX - $db.offsetLeft + (window.pageXOffset || $d.body.scrollLeft || $d.documentElement.scrollLeft);
            //            var iY = e.clientY - $db.offsetTop + (window.pageYOffset || $d.body.scrollTop || $d.documentElement.scrollTop);
            var iX = e.layerX || e.offsetX || (e.clientX - $db.offsetLeft + (window.pageXOffset || $d.body.scrollLeft || $d.documentElement.scrollLeft));
            var iY = e.layerY || e.offsetY || (e.clientY - $db.offsetTop + (window.pageYOffset || $d.body.scrollTop || $d.documentElement.scrollTop));
            var context = $db.context;
            context.beginPath();
            context.moveTo($db.iLastX, $db.iLastY);
            context.lineTo(iX, iY);
            context.stroke();
            $db.iLastX = iX;
            $db.iLastY = iY;
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
    }

    //socket监听
    $s.on(data.socketId+":paint", function(data){
        if (isConnect) {
            showTrashable();
            var points = data.points;
            var wh = data.screen;
            var tOX = wh.width / 2,
                tOY = wh.height / 2;

            var width = $b.offsetWidth;
            var height = $b.offsetHeight;
            var cOX = width / 2,
                cOY = height / 2;

            var iw = width / wh.width;
            var ih = height / wh.height;

            var context = $db.context;
            var localCentext = context;
            context.beginPath();
            var startX = cOX - (tOX - points[0].x) * iw;
            var startY = cOY - (tOY - points[0].y) * ih;
            // console.log(startX, points[0].x, startY, iw, wh);
            context.moveTo(startX, startY);
            for (var i = 0, len = points.length; i < len; i++) {
                context.lineTo(cOX - (tOX - points[i].x) * iw, cOY - (tOY - points[i].y) * ih);
            }
            context.stroke();
        }
    });

    //添加样式、font-awesome
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
        style.innerHTML=`
            .paint-botton
        {background:none;color:rgb(255,255,255);border:0;opacity:0.5;cursor:pointer}
            #paintSize
            {opacity:1}
            #paintConnect
            {opacity:1}
            #paintPen
            {display:inline-block}
        `
        document.getElementsByTagName("head")[0].appendChild(style)
    })();
    (function(){
        var links = document.querySelectorAll('link');
        links.forEach(function(ls){if (ls.href.match('font-awesome')){return}})
        loadStyles("https://cdn.staticfile.org/font-awesome/4.7.0/css/font-awesome.css")})()
})()
