/*
 * Befunge
 *
 * >25*"!dlrow ,olleH"v
 *     @,,,,,,,,,,,,,,<
 *
 */

module.exports = befunge;

function befunge(code) {
  "use strict";
  if (typeof code !== 'string') throw new TypeError('Invalid input');
  let grid = code.split('\n').map(l=>l.split(''));
  let o = '';
  let y = 0, x = 0;
  let c = grid[y][x];
  let s = [];
  // "override" native pop to return 0
  s.p = function() {
    return this.length?Array.prototype.pop.call(this):0;
  };
  // pass in modification function, eg: _=>++x
  function next(modifier) {
    return function(m) {
      if (m) return next(m);
      modifier();
      if (y === grid.length) {
        y = 0;
      }
      if (y < 0) {
        y = grid.length-1;
      }
      if (x === grid[y].length) {
        x = 0;
      }
      if (x < 0) {
        x = grid[y].length-1;
      }
      return c = grid[y][x];
    };
  }
  let n = next(_=>++x);
  // scratch variable
  let t;

  let counter = 0;
  while (c !== '@') {

    // 0..9
    if (/\d/.test(c)) {
      s.push(parseInt(c));
    }
    switch (c) {
      case '+': s.push(s.p()+s.p()); break;
      case '-': s.push(-s.p()+s.p()); break;
      case '*': s.push(s.p()*s.p()); break;
      case '/': t=s.p();s.push(t?Math.floor(s.p()/t):0); break;
      case '%': t=s.p();s.push(t?s.p()%t:0); break;
      case '!': s.push(s.p()===0?1:0); break;
      case '`': s.push(s.p()<s.p()?1:0); break;
      case '>': n=n(_=>++x); break;
      case '<': n=n(_=>--x); break;
      case '^': n=n(_=>--y); break;
      case 'v': n=n(_=>++y); break;
      case '?': t=Math.random();
                t>0.75?n=n(_=>++x):
                t>0.50?n=n(_=>--x):
                t>0.25?n=n(_=>++y):
                       n=n(_=>--y);
                break;
      case '_': s.p()===0?n=n(_=>++x):n=n(_=>--x); break;
      case '|': s.p()===0?n=n(_=>++y):n=n(_=>--y); break;
      case '"': while (n()!=='"'){ s.push(c.charCodeAt(0)); } break;
      case ':': t=s.p(); s.push(t,t); break;
      case '\\': t=s.p();t^=s[s.length-1];s[s.length-1]^=t;s.push(t^=s[s.length-1]); break;
      case '$': s.p(); break;
      case '.': o+=s.p(); break;
      case ',': o+=String.fromCharCode(s.p()); break;
      case '#': n(); break;
      case 'p': grid[s.p()][s.p()]=String.fromCharCode(s.p()); break;
      case 'g': s.push(grid[s.p()][s.p()].charCodeAt(0)); break;
      /*
      case '&': prompt for int; break;
      case '~': prompt for chr; break;
      case '@': loop exits; break;
      case ' ': noop; break;
      */
    }

    n();
  }

  return o;
}
