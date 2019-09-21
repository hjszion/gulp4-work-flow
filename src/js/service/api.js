requirejs.config({
    paths: {
        jquery: '../../lib/jQuery-3.4-1.js'
    }
});

//用requirejs定义了一个模块
define([
    'jquery',
], function($){
    'use strict';
    return {
        getUserList:function(params, callback){
            $.ajax;({
                url:'api/userlist',
                type:'GET',
                data:params,
                success:callback
            });
        }
    };
});