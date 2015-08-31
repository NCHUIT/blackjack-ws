(function($){
    $(function () {
        var ws_url = location.origin+location.pathname;
        ws_url = ws_url.replace(/\/$/, '');
        var socket = io.connect(ws_url);    
    });
})(jQuery);