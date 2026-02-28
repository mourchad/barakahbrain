module.exports = {
  plugins: [
    require('cssnano')({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeUnicode: false,
        reduceIdents: false,
        zindex: false,
        colormin: true,
        calc: false
      }]
    })
  ]
};
