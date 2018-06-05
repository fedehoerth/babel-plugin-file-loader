// -------- //
// Stmts that make replaceRequireStatementIntoString to equal false.
require('../assets/file.jpg');
() => require('../assets/file.jpg');
// -------- //
// Stmts that make replaceRequireStatementIntoString to equal true.

require('../assets/file.png');

const filePng = '/public/test/assets/file.png';

() => () => '/public/test/assets/file.jpg';
const myImage = () => '/public/test/assets/file.jpg';
function MyComponent() {
  return `<img src=${'/public/test/assets/file.jpg'} />`;
}

require('../assets/file.jpg');

const fileJpg = '/public/test/assets/file.jpg';
