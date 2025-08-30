module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        options: {
          outputReferences: true
        }
      }]
    },
    scss: {
      transformGroup: 'scss',
      buildPath: 'build/scss/',
      files: [{
        destination: '_variables.scss',
        format: 'scss/variables',
        options: {
          outputReferences: true
        }
      }]
    },
    'ios-swift': {
      transformGroup: 'ios-swift',
      buildPath: 'build/ios/',
      files: [{
        destination: 'DesignTokens.swift',
        format: 'ios-swift/class.swift',
        className: 'CTRCDesignTokens',
        options: {
          outputReferences: true
        }
      }]
    },
    'ios-swift-separate-enums': {
      transformGroup: 'ios-swift-separate',
      buildPath: 'build/ios/',
      files: [{
        destination: 'DesignTokensColor.swift',
        format: 'ios-swift/enum.swift',
        className: 'DesignTokensColor',
        type: 'color',
        filter: {
          attributes: {
            category: 'color'
          }
        }
      }, {
        destination: 'DesignTokensSize.swift',
        format: 'ios-swift/enum.swift',
        className: 'DesignTokensSize',
        type: 'float',
        filter: {
          attributes: {
            category: 'size'
          }
        }
      }]
    },
    android: {
      transformGroup: 'android',
      buildPath: 'build/android/res/values/',
      files: [{
        destination: 'colors.xml',
        format: 'android/colors',
        filter: {
          attributes: {
            category: 'color'
          }
        }
      }, {
        destination: 'dimens.xml',
        format: 'android/dimens',
        filter: {
          attributes: {
            category: 'size'
          }
        }
      }, {
        destination: 'integers.xml',
        format: 'android/integers',
        filter: {
          attributes: {
            category: 'time'
          }
        }
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/module'
      }]
    },
    'json-flat': {
      transformGroup: 'js',
      buildPath: 'build/json/',
      files: [{
        destination: 'tokens.json',
        format: 'json/flat'
      }]
    }
  }
};