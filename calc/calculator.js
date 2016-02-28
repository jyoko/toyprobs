var calc = function (expression) {
  var at,chr,result,first;
  var eatWhite = function() {
    while (chr && chr.match(/\s/)) {
      next();
    }
  };
  var number = function(neg) {
    var num = chr;
    next();
    var digitSet = function() {
      while (chr && chr.match(/\d/)) {
        num += chr;
        next();
      }
    }
    var decOrExp = function(punc) {
      if (chr && chr.toUpperCase() === punc) {
        num += chr;
        next();
        if (chr.match(/\d/)) {
          digitSet();
        } else {
          throw new Error('Invalid number')
        }
      }
    }
    digitSet();
    decOrExp('.');
    decOrExp('E');
    if (first) {
      first = false;
      result = neg?-num:+num;
      return value();
    }
    eatWhite();
    if (chr==='*') return mul(+num);
    if (chr==='/') return div(+num);
    return neg?-num:+num;
  };
  var add = function() {
    next();
    return result+value(true);
  };
  var sub = function(subbed) {
    next();
    eatWhite();
    if (chr==='(') {
      if (subbed) return par(true);
      else return result-par();
    }
    if (subbed || first) return number(true);
    return result-value(true);
  };
  var mul = function(int) {
    next();
    return (int===void 0?result:int)*value(true);
  };
  var div = function(int) {
    next();
    return (int===void 0?result:int)/value(true);
  };
  var par = function(neg,ret) {
    var result;
    if (chr==='(') {
      next();
      eatWhite();
      if (chr === ')') throw new Error('Empty parens');
      first = true;
      while (chr) {
        if (chr==='(') result = par();
        else result = value(true);
        result = value(false,result);
        eatWhite();
        if (chr===')') {
          next();
          eatWhite();
          if (!ret) {
            if (chr==='*') return neg?mul(-result):mul(result);
            if (chr==='/') return neg?div(-result):div(result);
          }
          return neg?-result:result;
        }
      }
      throw new Error('Unclosed paren');
    }
  };
  var next = function(c) {
    at+=1;
    chr = expression[at];
    return chr;
  };
  var value = function(subbed,closured) {
    result = closured===void 0?result:closured;
    eatWhite();
    if (chr==='-') return sub(subbed);
    if (chr==='+') return add();
    if (chr==='/') return div();
    if (chr==='*') return mul();
    if (chr==='(') return par(undefined,subbed);
    if (chr && chr.match(/\d/)) return number();
    return result;
  }
  var first = true;
  var at = -1;
  next();
  while(chr) {
    result = value();
    console.log('loop: ',result);
  }
  return result;
};

