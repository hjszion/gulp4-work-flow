const gulp = require('gulp');

//3.9.1版本
//第一个参数 任务的名字 第二个参数具体要执行的任务
gulp.task('default', function(cb){
    console.log('gulp is running...');
    cb();
});

//gulp4.0 注册一个任务的时候 直接可以把一个方法注册成一个任务名字 
function html(cb){   //接收一个回调函数作为参数 此回调函数执行后 告诉gulp当前任务执行完成
    console.log('html task is running...');
    cb();   //告诉gulp 当前任务执行完成了
}

gulp.task(html);

//可以指定当前任务(函数任务)的名字
function style(cb){
    console.log('style is running...');
    cb();
}

style.displayName = 'style:pro';   //可以指定非函数名字的任务名
gulp.task(style);

//注册一个任务 串行的顺序执行 html style:pro 
gulp.task('htmlstyle', gulp.series('html', 'style:pro'));

