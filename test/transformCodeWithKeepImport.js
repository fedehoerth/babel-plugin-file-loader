import transformCode from './transformCode';

const transformCodeWithKeepImport = (file, config = {}) =>
  transformCode(file, Object.assign({}, config, { keepImport: true }))

export default transformCodeWithKeepImport;
