const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const sourcemap = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const clean = require('gulp-clean');

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
//#region style for dev
function style(){
    return gulp.src(['./src/style/**/*.{scss,css}', '!./src/style/main.css'])
    .pipe(sourcemap.init())    //注意sourcemap的位置 现在出现了两次
    .pipe(sass().on('error', sass.logError)) 
    .pipe(autoprefixer({
        overrideBrowserslist:['> 0.5%'],   //支持的浏览器的版本 这里可以写成browserlist的写法 大于0.5%市场占有率的浏览器
        cascade: true  //设定最终生成的css的样式 
    }))
    .pipe(concat('main.css')) 
    .pipe(sourcemap.write())   //注意sourcemap的位置 现在出现了两次
    .pipe(gulp.dest('./src/style/')); 
}
style.displayName = 'style:dev';   //可以指定非函数名字的任务名
gulp.task(style);
//#endregion

//#region style for production
function stylePro(){
    return gulp.src(['./src/style/**/*.{scss,css}', '!./src/style/main.css'])  //拿到该目下的所有.scss .css
    .pipe(sass().on('error', sass.logError)) 
    .pipe(autoprefixer({
        overrideBrowserslist:['> 0.5%'],   //支持的浏览器的版本 这里可以写成browserlist的写法 大于0.5%市场占有率的浏览器
        cascade: true  //设定最终生成的css的样式 
    }))
    .pipe(concat('main.css'))  //都合并到main.css文件里
    .pipe(cleanCss({   //5.压缩css
        compatibility:'ie8',   //兼容IE8浏览器
        keepSpecialComments:'*'
    }))
    .pipe(rev())   //给main.css生成版本映射关系
    .pipe(gulp.dest('./dist/style/'))
    .pipe(rev.manifest())   //使用版本映射关系生成具体json文件
    .pipe(gulp.dest('./src/style/'))   //把映射文件存到指定路径 最后该路径就会多了main-a443c1d8..和rev-manifest.json这两个文件
}
//清理指定目录下的所有css文件
function cleanDistStyle(){
    return gulp.src(['./dist/style/*.css'], {read:false})
    .pipe(clean())
}
gulp.task('stylePro', gulp.series(cleanDistStyle, stylePro));
//#endregion

//#region gulp任务的各种操作
//注册一个任务 串行的顺序执行 html style:pro 
gulp.task('htmlstyle', gulp.series('html', 'style:dev'));
//注册一个任务 并行执行多个任务
gulp.task('htmlstyle_para', gulp.parallel(html, 'style:dev'));  //传方法和传字符串都是一样的
//各种任务执行的嵌套执行 任意多个 可以是方法名字 可以是任务名字
gulp.task('htmlnest', gulp.series(
    html,
    gulp.parallel(html, 'style:dev'),
    gulp.series('html', 'style:dev')
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




