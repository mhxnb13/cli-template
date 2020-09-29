const isPorduct = ["production"].includes(process.env.NODE_ENV);

const plugins = [];
if (isPorduct) {
  // 去除console.log的信息
  plugins.push("transform-remove-console");
}

module.exports = {
  presets: [
    ['@vue/app', {
      useBuiltIns: 'entry'
    }]
  ],
  plugins
}