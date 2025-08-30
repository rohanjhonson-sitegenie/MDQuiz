/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-cross-feature-imports',
      comment: 'Features should only import from other features through their api/ directories',
      severity: 'error',
      from: {
        path: '^src/features/video-wall/'
      },
      to: {
        path: '^src/features/blog/(?!api/).*'
      }
    },
    {
      name: 'no-cross-feature-imports-cotent-editor-to-blog',
      comment: 'Blog editor should only import from blog through api',
      severity: 'error',
      from: {
        path: '^src/features/cotent-editor/'
      },
      to: {
        path: '^src/features/blog/(?!api/).*'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    exclude: {
      path: '^(node_modules|dist|build|coverage|\\..*)'
    },
    includeOnly: {
      path: '^src'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
        filters: {
          exclude: {
            path: 'node_modules'
          }
        }
      },
      archi: {
        collapsePattern: '^src/features/([^/]+)/.*',
        theme: {
          graph: {
            splines: 'ortho'
          }
        }
      }
    }
  }
}