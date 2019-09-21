const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const sourcemap = require('gulp-sourcemaps');

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
//1.sass进行样式的预处理 (sass => css)
//2.代码进行合并 排除掉已经合并的main.css文件 不然会给main.css重复添加内容
//3.sourcemap处理
//4.给css3的样式打上自动的前缀 autoprefixer
//5.压缩css
//6.给main.css文件打上版本号

//1.sass进行样式的预处理 (sass => css)
//2.代码进行合并 排除掉已经合并的main.css文件 不然会给main.css重复添加内容
function style(){
    return gulp.src(['./src/style/**/*.{scss,css}', '!./src/style/main.css'])
    .pipe(sourcemap.init())
    .pipe(sass().on('error', sass.logError)) 
    .pipe(concat('main.css')) 
    .pipe(sourcemap.write())
    .pipe(gulp.dest('./src/style/')); 
}
style.displayName = 'style:pro';   //可以指定非函数名字的任务名
gulp.task(style);

//3.sourcemap处理

//#region gulp任务的各种操作
//注册一个任务 串行的顺序执行 html style:pro 
gulp.task('htmlstyle', gulp.series('html', 'style:pro'));
//注册一个任务 并行执行多个任务
gulp.task('htmlstyle_para', gulp.parallel(html, 'style:pro'));  //传方法和传字符串都是一样的
//各种任务执行的嵌套执行 任意多个 可以是方法名字 可以是任务名字
gulp.task('htmlnest', gulp.series(
    html,
    gulp.parallel(html, 'style:pro'),
    gulp.series('html', 'style:pro')
));
//#endregion

//#region gulp拷贝任务 一个文件夹到另一个文件夹
//实现从src/assets/ 下所有的文件都拷贝到dist/assets
function copy(){
    //task 方法 接收一个cb回调函数 在任务结束的时候执行下cb回调函数
    //方法:可以返回一个流
    //方法:返回一个promise也是可以  /** 代表任何子目录 /*.*代表任何文件下的任何后缀名文件
    return gulp.src(['src/assets/**/*.*','src/lib/**/*.*'], {base:'src/'})  //node 一个src流   base:'src/' 以src为基准目录 然后pipe对应了dist/
    .pipe(gulp.dest('dist/'))   //pipe到另一个文件夹下 gulp.dest:把所有文件保存到xxx地方   
}
gulp.task(copy);  //执行这个任务 拷贝就成功了
//#endregion 




