requirejs.config({
    paths: {
        jquery: '../../lib/jQuery-3.4-1.js',
        api:'../service/api.js'
    }
});

requirejs(['jquery', 'api'], function($, api) {
    $(function(){
        $('.box').click(function(){
            alert(2333);
        });
    }); 
});
//控制器层调用服务器层获取数据
api.getUserList(null, function(data){
    console.log(data);
});