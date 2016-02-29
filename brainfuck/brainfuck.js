function brainLuck(code, input){
  input = input.split('').map(v=>v.charCodeAt(0));
  var t,b = {},s = [];
  for (var i=0; i<code.length; i++) {
    if (code[i]==='[') s.push(i);
    if (code[i]===']') (b[i] = s.pop(),b[b[i]] = i);
  }
  var d=[],o=[],p=0,c=0,l=code.length;
  while (c!==l) {
    !d[p] && (d[p]=0);
    switch (code[c]) {
      case '>': ++p; break;
      case '<': --p; break;
      case '+': (++d[p]>255&&(d[p]=0)); break;
      case '-': (--d[p]<0&&(d[p]=255)); break;
      case '.': o.push(d[p]); break;
      case ',': d[p] = input.shift(); break;
      case '[': (d[p]===0&&(c=b[c])); break;
      case ']': (d[p]!==0&&(c=b[c])); break;
    }
    c++;
  }
  return o.map(v=>String.fromCharCode(v)).join('');
}
