const Timestamp = Date.now()
const isPorduct = ["production"].includes(process.env.NODE_ENV);
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin

module.exports = {
    publicPath: './',
    // 输出文件名
    outputDir: process.env.NODE_ENV === 'production' ? 'production_dist' : 'test_dist',
    // 本地服务器代理
    devServer: {},
    // 生成资源的hash值
    filenameHashing: false,
    // 去掉.map文件
    productionSourceMap: false,
    // 配置webpack打包
    configureWebpack: (config) => {
        if (isPorduct) {
            // 重写js文件名
            config.output.filename = 'js/[name].js?v=' + Timestamp
            config.output.chunkFilename = 'js/[name].js?v=' + Timestamp
        }
    },
    chainWebpack: (config) => {
        // ============  开启图片压缩  ==============
        config.module
            .rule("images")
            .use("image-webpack-loader")
            .loader("image-webpack-loader")
            .options({
                mozjpeg: {
                    progressive: true,
                    quality: 65
                },
                optipng: {
                    enabled: false
                },
                pngquant: {
                    quality: [0.65, 0.9],
                    speed: 4
                },
                gifsicle: {
                    interlaced: false
                }
                // webp: { quality: 75 }
            });
        // ========================================
        if (isPorduct) {
            // 移除 prefetch 插件
            config.plugins.delete('prefetch')
            // 移除 preload 插件
            config.plugins.delete('preload');
        }
        if (process.env.NODE_ENV === 'test') {
            // 添加打包分析
            config.plugin("webpack-report").use(BundleAnalyzerPlugin, [{
                analyzerMode: "static"
            }]);
        }
        // 解决You are using the runtime-only build of Vue where the template compiler is not available报错
        config.resolve.alias
            .set('vue$', 'vue/dist/vue.esm.js')
    },
    css: {
        extract: {
            // 重写css文件名
            filename: 'css/[name].css?v=' + Timestamp,
            chunkFilename: 'css/[name].css?v=' + Timestamp
        },
        sourceMap: false,
    }
}