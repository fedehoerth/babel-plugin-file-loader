import { dirname, extname, resolve } from 'path'
import transform from './transform'

const myObject = {};

export const defaultOptions = {
  name: '[hash].[ext]',
  outputPath: '/public',
  publicPath: '/public',
  context: '',
  extensions: ['gif', 'jpeg', 'jpg', 'png', 'svg'],
  keepImport: false,
}

const getVariableName = p => {
  if (p.node.specifiers && p.node.specifiers[0] && p.node.specifiers[0].local) {
    return p.node.specifiers[0].local.name
  }

  if (p && p.container && p.container.id && p.container.id.name) {
    return p.container.id.name;
  }
}

const applyTransform = (p, t, state, value, calleeName) => {
  const ext = extname(value)
  const options = Object.assign({}, defaultOptions, state.opts)

  if (options.extensions && options.extensions.indexOf(ext.slice(1)) >= 0) {
    try {
      const rootPath = state.file.opts.sourceRoot || process.cwd()
      const scriptDirectory = dirname(resolve(state.file.opts.filename))
      const filePath = resolve(scriptDirectory, value)
      const uri = transform(rootPath, filePath, options)

      const variableName = getVariableName(p)
      const imageUri = t.StringLiteral(uri);
      const makeOriginalRequire = () => t.expressionStatement(
        t.callExpression(
          t.identifier('require'),
          [
            t.StringLiteral(value),
          ]
        )
      );
      const makeConstDeclaration = () => t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(variableName), imageUri)
      ]);

      // For example, replace
      const replaceRequireStatementIntoString = calleeName === 'require' && p.parentPath && p.parentPath.parentPath && p.parentPath.parentPath.parentPath && p.parentPath.parentPath.parentPath.type !== 'Program';

      if (!variableName && !replaceRequireStatementIntoString) {
        return
      }

      if (options.keepImport && !replaceRequireStatementIntoString) {
        let parentPath = null;

        if (calleeName === 'require') {
          parentPath = p.parentPath.parentPath;
        } else {
          parentPath = p;
        }

        parentPath.replaceWithMultiple([
          makeOriginalRequire(),
          makeConstDeclaration(),
        ]);

        return
      }

      if (calleeName === 'require') {
        p.replaceWith(imageUri)
        return
      } else {
        if (options.keepImport) {
          return
        }

        p.replaceWith(
          makeConstDeclaration(),
        )
      }
    } catch (e) {
      throw p.buildCodeFrameError(e.message)
    }
  }
}

export function transformImportsInline ({ types: t }) {
  return {
    visitor: {
      ImportDeclaration (p, state) {
        if (!state.hasBeenVisited) {
          applyTransform(p, t, state, p.node.source.value, 'import')
        }
      },
      CallExpression (p, state) {
        const callee = p.get('callee')
        if (!callee.isIdentifier() || !callee.equals('name', 'require') || p.hasBeenVisited) {
          return
        }

        const arg = p.get('arguments')[0]
        if (!arg || !arg.isStringLiteral()) {
          return
        }

        applyTransform(p, t, state, arg.node.value, 'require')
      }
    }
  }
}

export default transformImportsInline
