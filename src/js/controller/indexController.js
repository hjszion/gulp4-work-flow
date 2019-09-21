requirejs.config({
    paths: {
        jquery: '../../lib/jQuery-3.4-1.js'
    }
});

requirejs(['jquery'], function($) {
    $(function(){
        $('.box').click(function(){
            alert(2333);
        });
        $.ajax({
            url:'/api/userlist',
            type:'GET',
            success:function(data){
                console.log(data);
            }
        });
    }); 
});
