const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const sourcemap = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const clean = require('gulp-clean');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const connect = require('gulp-connect');
const modRewrite = require('connect-modrewrite');
const open = require('gulp-open');
const configRevReplace = require('gulp-requirejs-rev-replace');

console.log('env:', process.env.xx);

//gulp4.0 注册一个任务的时候 直接可以把一个方法注册成一个任务名字   
function html() {   //接收一个回调函数作为参数 此回调函数执行后 告诉gulp当前任务执行完成   
    //把src目录下的html都复制到dist目录下 并且替换css版本 js版本也得替换   
    //最后 html 进行压缩   
    return gulp.src(['./src/index.html', './src/view/**/*.html', './src/style/rev-manifest.json', './src/js/rev-manifest.json'], { base: './src/' })
        .pipe(revCollector({ replaceReved: true }))   //对这些文件进行打版本   
        .pipe(htmlmin({   
            removeComments: true, // 清除HTML注释   
            collapseWhitespace: true, // 压缩HTML   
            // collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />   
            removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />   
            removeScriptTypeAttributes: true, // 删除<script>的type="text/javascript"   
            removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"   
            minifyJS: true, // 压缩页面JS   
            minifyCSS: true // 压缩页面CSS   
        })) //压缩html   
        .pipe(gulp.dest('./dist/'))  //目标目录和源目录对应  ./dist/ => ./src/
}

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
function style() {
    return gulp.src(['./src/style/**/*.{scss,css}', '!./src/style/main.css'])
        .pipe(sourcemap.init())    //注意sourcemap的位置 现在出现了两次
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 0.5%'],   //支持的浏览器的版本 这里可以写成browserlist的写法 大于0.5%市场占有率的浏览器
            cascade: true  //设定最终生成的css的样式 
        }))
        .pipe(concat('main.css'))
        .pipe(sourcemap.write())   //注意sourcemap的位置 现在出现了两次
        .pipe(gulp.dest('./src/style/'));
}
//#endregion

//#region style for production
function stylePro() {
    return gulp.src(['./src/style/**/*.{scss,css}', '!./src/style/main.css'])  //拿到该目下的所有.scss .css
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 0.5%'],   //支持的浏览器的版本 这里可以写成browserlist的写法 大于0.5%市场占有率的浏览器
            cascade: true  //设定最终生成的css的样式 
        }))
        .pipe(concat('main.css'))  //都合并到main.css文件里
        .pipe(cleanCss({   //5.压缩css
            compatibility: 'ie8',   //兼容IE8浏览器
            keepSpecialComments: '*'
        }))
        .pipe(rev())   //给main.css生成版本映射关系
        .pipe(gulp.dest('./dist/style/'))
        .pipe(rev.manifest())   //使用版本映射关系生成具体json文件
        .pipe(gulp.dest('./src/style/'))   //把映射文件存到指定路径 最后该路径就会多了main-a443c1d8..和rev-manifest.json这两个文件
}
//清理指定目录下的所有.css文件和.html文件
function cleanDist() {
    return gulp.src(['dist/**/*.*'], { read: false, allowEmpty: true })
        .pipe(clean());
}
//#endregion

//#region gulp任务的各种操作
//注册一个任务 串行的顺序执行 html style:pro 

//#endregion

//#region gulp拷贝任务 一个文件夹到另一个文件夹
//实现从src/assets/ 下所有的文件都拷贝到dist/assets
function copy() {
    //task 方法 接收一个cb回调函数 在任务结束的时候执行下cb回调函数
    //方法:可以返回一个流
    //方法:返回一个promise也是可以  /** 代表任何子目录 /*.*代表任何文件下的任何后缀名文件
    return gulp.src(['src/lib/**/*.*', 'src/assets/**/*.*'], { base: 'src/' })  //node 一个src流   base:'src/' 以src为基准目录 然后pipe对应了dist/
        .pipe(gulp.dest('dist/'))   //pipe到另一个文件夹下 gulp.dest:把所有文件保存到xxx地方   
}
//#endregion

//图片进行压缩处理
function imgMin() {
    return gulp.src(['./src/assets/**/*.{jpeg,png,jpg,gif,ico,svg}'], { base: './src/assets/' })
        .pipe(imagemin({
            optimizationLevel: 5, // 类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, // 类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true,
            // 类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true // 类型：Boolean
            // 默认：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest('./dist/assets/'));
}
//js 任务方法
//1.保证js开发的格式的规范性 eslint => 进行代码格式规范校验(es6 js jsx),还可以辅助我们进行格式化
//2.es6的转码成es5 => babel 来实现
//3.对js代码进行压缩处理
//4.对压缩后的js代码打上版本号
function js() {
    return gulp.src(['./src/js/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.results(results => {
            // Called once for all ESLint results.
            console.log(`JStotalFilesNumber: ${results.length}`);
            console.log(`JSwarningNumber：: ${results.warningCount}`);
            console.log(`JSfailNumber: ${results.errorCount}`);
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(babel())  //配置内容都放到了 .babelrc文件里面了
        .pipe(uglify())  //压缩代码
        .pipe(rev())  //给js打版本 生成打版本文件
        .pipe(gulp.dest('./dist/js/'))
        .pipe(rev.manifest())   //使用版本映射关系生成具体json文件
        .pipe(gulp.dest('./src/js/'));
}

// 给requirejs引用的文件修改版本号的路径
function revjs() {
    return gulp
        .src('./dist/**/*.js')
        .pipe(configRevReplace({
            manifest: gulp.src('./src/js/rev-manifest.json')
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));
}

//使用gulp-connect配置服务器
//#region 开发测试服务器
// 配置测试服务器
function devServer(cb) {
    connect.server({
        root: ['./src'], // 网站根目录
        port: 38900, // 端口
        livereload: true,
        middleware: function (connect, opt) {
            return [modRewrite([// 设置代理
                // http://localhost:38900/api/userlist  该地址被转为下面的地址
                // http://localhost:4000/userlist
                '^/api/(.*)$ http://localhost:4000/$1 [P]'])];
        },
    });
    cb();
}

// 启动浏览器打开地址
function openBrowser() {
    return gulp
        .src(__filename)
        .pipe(open({ uri: 'http://localhost:38900/index.html' }));
}
//#endregion 开发测试服务器

//#region 生产测试服务器
function devServer(cb) {
    connect.server({
        root: ['./dist'], // 网站根目录
        port: 38901, // 端口
        livereload: true,
        middleware: function (connect, opt) {
            return [modRewrite([// 设置代理
                // http://localhost:38900/api/userlist  该地址被转为下面的地址
                // http://localhost:4000/userlist
                '^/api/(.*)$ http://localhost:4000/$1 [P]'])];
        },
    });
    cb();
}

// 启动浏览器打开地址
function distBrowser() {
    return gulp
        .src(__filename)
        .pipe(open({ uri: 'http://localhost:38901/index.html' }));
}
//#endregion

//开发相关的任务
//1.监听sass的变化 自动编译sass
//2.自动执行打开浏览器 启动server
//3.监听js的变化

//dev 任务
gulp.task('dev', gulp.series(devServer, openBrowser, function () {
    gulp.watch(['./src/style/scss/**/*.scss', './src/style/css/**/*.css'], gulp.series(style))
}));

//default 任务
//第一个参数 任务的名字 第二个参数具体要执行的任务
gulp.task('default', gulp.series(cleanDist, gulp.parallel(js, stylePro, imgMin), revjs, copy, html, distServer, openBrowserDist));


