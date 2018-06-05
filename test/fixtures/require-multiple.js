// -------- //
// Stmts that make replaceRequireStatementIntoString to equal false.
require('../assets/file.jpg');
() => require('../assets/file.jpg');
// -------- //
// Stmts that make replaceRequireStatementIntoString to equal true.
import filePng from '../assets/file.png';
() => () => require('../assets/file.jpg');
const myImage = () =>  require('../assets/file.jpg');
function MyComponent() {
  return `<img src=${require('../assets/file.jpg')} />`;
}
const fileJpg = require('../assets/file.jpg');
