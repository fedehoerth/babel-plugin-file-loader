'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultOptions = undefined;
exports.transformImportsInline = transformImportsInline;

var _path = require('path');

var _transform = require('./transform');

var _transform2 = _interopRequireDefault(_transform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var myObject = {};

var defaultOptions = exports.defaultOptions = {
  name: '[hash].[ext]',
  outputPath: '/public',
  publicPath: '/public',
  context: '',
  extensions: ['gif', 'jpeg', 'jpg', 'png', 'svg'],
  keepImport: false
};

var getVariableName = function getVariableName(p) {
  if (p.node.specifiers && p.node.specifiers[0] && p.node.specifiers[0].local) {
    return p.node.specifiers[0].local.name;
  }

  if (p && p.container && p.container.id && p.container.id.name) {
    return p.container.id.name;
  }
};

var applyTransform = function applyTransform(p, t, state, value, calleeName) {
  var ext = (0, _path.extname)(value);
  var options = Object.assign({}, defaultOptions, state.opts);

  if (options.extensions && options.extensions.indexOf(ext.slice(1)) >= 0) {
    try {
      var rootPath = state.file.opts.sourceRoot || process.cwd();
      var scriptDirectory = (0, _path.dirname)((0, _path.resolve)(state.file.opts.filename));
      var filePath = (0, _path.resolve)(scriptDirectory, value);
      var uri = (0, _transform2.default)(rootPath, filePath, options);

      var variableName = getVariableName(p);
      var imageUri = t.StringLiteral(uri);
      var makeOriginalRequire = function makeOriginalRequire() {
        return t.expressionStatement(t.callExpression(t.identifier('require'), [t.StringLiteral(value)]));
      };
      var makeConstDeclaration = function makeConstDeclaration() {
        return t.variableDeclaration('const', [t.variableDeclarator(t.identifier(variableName), imageUri)]);
      };

      // For example, replace
      var replaceRequireStatementIntoString = calleeName === 'require' && p.parentPath && p.parentPath.parentPath && p.parentPath.parentPath.parentPath && p.parentPath.parentPath.parentPath.type !== 'Program';

      if (!variableName && !replaceRequireStatementIntoString) {
        return;
      }

      if (options.keepImport && !replaceRequireStatementIntoString) {
        var parentPath = null;

        if (calleeName === 'require') {
          parentPath = p.parentPath.parentPath;
        } else {
          parentPath = p;
        }

        parentPath.replaceWithMultiple([makeOriginalRequire(), makeConstDeclaration()]);

        return;
      }

      if (calleeName === 'require') {
        p.replaceWith(imageUri);
        return;
      } else {
        if (options.keepImport) {
          return;
        }

        p.replaceWith(makeConstDeclaration());
      }
    } catch (e) {
      throw p.buildCodeFrameError(e.message);
    }
  }
};

function transformImportsInline(_ref) {
  var t = _ref.types;

  return {
    visitor: {
      ImportDeclaration: function ImportDeclaration(p, state) {
        if (!state.hasBeenVisited) {
          applyTransform(p, t, state, p.node.source.value, 'import');
        }
      },
      CallExpression: function CallExpression(p, state) {
        var callee = p.get('callee');
        if (!callee.isIdentifier() || !callee.equals('name', 'require') || p.hasBeenVisited) {
          return;
        }

        var arg = p.get('arguments')[0];
        if (!arg || !arg.isStringLiteral()) {
          return;
        }

        applyTransform(p, t, state, arg.node.value, 'require');
      }
    }
  };
}

exports.default = transformImportsInline;