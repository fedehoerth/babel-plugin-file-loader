import transformCode from './transformCode';

const transformCodeWithKeepImport = (file, config = {}) =>
  transformCode(file, Object.assign({}, config, { emitFiles: false }))

export default transformCodeWithKeepImport;
