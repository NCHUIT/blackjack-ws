function status(status) {
    $('#roomId').css({"visibility": "hidden"});
    $('#poker-table').css({"visibility": "hidden"});
    $('#result').css({"visibility": "hidden"});
    if(status == 'waiting')
    	$('#roomId').css({"visibility": "visible"});
    else if(status == 'playing')
    	$('#poker-table').css({"visibility": "visible"});
    else if(status == 'result')
    	$('#result').css({"visibility": "visible"});
}