function calc(str) {
  var OPS = {
    '*':true,
    '-':true,
    '/':true,
    '+':true,
    '^':true,
    '(':true,
    ')':true,
  };

  var chr,n='',convert=[];
  // first pass, str-> [num,op,num,op,etc...]
  // only accepting integers
  for (var i=0; i<=str.length; i++) {
    chr = str[i];
    if ((OPS[str[i-1]] || str[i-1]===void 0) && chr === '-') {
      n += '-';
    } else if (/\d/.test(chr)) {
      n+=chr;
    } else {
      if (n) {
        convert.push(+n);
        n = '';
      }
      if (OPS[chr]) {
        convert.push(chr);
      }
    }
  }

  // second pass, parens
  var active = {
    save: false,
    start: null,
  };
  for (i=0; i<convert.length; i++) {
    if (convert[i] === ')') {
      active.save = false;
      convert.splice(active.start,1+i-active.start,calc(n));
    }
    if (active.save) {
      n += convert[i]
    }
    if (convert[i] === '(') {
      active.save = true;
      active.start = i;
    }
  }

  // third pass, exponents
  for (i=0; i<convert.length; i++) {
    if (convert[i] === '^') {
      convert.splice(i-1,3,Math.pow(convert[i-1],convert[i+1]));
    }
  }

  // fourth pass, mul/div
  for (i=0; i<convert.length; i++) {
    if (convert[i] === '*') {
      convert.splice(i-1,3,convert[i-1]*convert[i+1]);
    }
    if (convert[i] === '/') {
      convert.splice(i-1,3,convert[i-1]/convert[i+1]);
    }
  }

  // fifth pass, add/sub
  for (i=0; i<convert.length; i++) {
    if (convert[i] === '+') {
      convert.splice(i-1,3,convert[i-1]+convert[i+1]);
    }
    if (convert[i] === '-') {
      convert.splice(i-1,3,convert[i-1]-convert[i+1]);
    }
  }

  return convert[0];
}

