/*
 * whitespace interpreter
 *
 */

module.exports = whitespace;

function whitespace(code, input) {
  "use strict";

  if (typeof code !== 'string') throw new TypeError('Code not given as string');
  if (input !== void 0 && typeof input !== 'string') throw new TypeError('Input not given as string');
  if (input) input = input.split('');

  const C = {
    S: ' ',
    T: '\t',
    N: '\n',
  };
  const l = code.length;
  let output = '';
  let stack = [];
  let heap = {};
  let subs = {};
  let callstack = [];
  let at = -1;
  let searchLabel = false; // ugly hack for lazy forward-search til refactor
  let c;

  function readIMP() {
    const stack = C.S;
    const flow = C.N;
    const modifier = C.T;
    const math = C.S;
    const heap = C.T;
    const io = C.N;

    next();
    switch(c) {
      case stack:
        return stackManipulation();
        break;
      case flow:
        return flowControl();
        break;
      case modifier:
        switch(next()) {
          case math:
            return arithmetic();
            break;
          case heap:
            return heapAccess();
            break;
          case io:
            return inputOutput();
            break;
        }
    }
  }

  function stackManipulation() {
    const push = C.S;
    const mod1 = C.T;
    const duplicate = C.S;
    const discard = C.N;
    const mod2 = C.N;
    const dupTop = C.S;
    const swap = C.T;
    const pop = C.N;
    let n;

    switch(next()) {
      case push:
        n = readNumber();
        if (!searchLabel) {
          stack.push(n);
        }
        break;
      case mod1:
        switch(next()) {
          case duplicate:
            n = stack.length-1-readNumber();
            if (!searchLabel) {
              if (n<0 || n>=stack.length) {
                error('Invalid stack access');
              }
              stack.push(stack[n]);
            }
            break;
          case discard:
            if (!searchLabel) {
              if (!stack.length) {
                error('Cannot discard from empty stack');
              }
            }
            n = readNumber();
            if (!searchLabel) {
              if (n<0 || n>=stack.length) {
                stack = [stack.pop()];
              } else {
                stack.splice(stack.length-n-1,n);
              }
            }
            break;
          default:
            error('Incorrect stack modifier');
        }
        break;
      case mod2:
        switch(next()) {
          case dupTop:
            if (!searchLabel) {
              if (!stack.length) {
                error('Cannot copy from empty stack');
              }
              stack.push(stack[stack.length-1]);
            }
            break;
          case swap:
            if (!searchLabel) {
              if (stack.length<2) {
                error('Cannot swap, less than two values in stack');
              }
              n = stack[stack.length-1];
              stack[stack.length-1] = stack[stack.length-2];
              stack[stack.length-2] = n;
            }
            break;
          case pop:
            if (!searchLabel) {
              if (!stack.length) {
                error('Cannot remove item from empty stack');
              }
              stack.pop();
            }
            break;
        }
        break;
    }
    return readIMP();
  }

  function flowControl() {
    const mod1 = C.S;
    const markSub = C.S;
    const callSub = C.T;
    const jump = C.N;
    const mod2 = C.T;
    const jeq0 = C.S;
    const jlt0 = C.T;
    const exitSub = C.N;
    const exit = C.N; // twice
    let a,l;

    switch (next()) {
      case mod1:
        switch(next()) {
          case markSub:
            l = readLabel();
            if (searchLabel === l) {
              searchLabel = false;
            }
            if (subs.hasOwnProperty(l)) error('Duplicate label');
            subs[l] = at-1;
            break;
          case callSub:
            l = readLabel();
            if (!searchLabel && !subs.hasOwnProperty(l)) {
              searchLabel = l;
              callstack.push(at-1);
            }
            if (!searchLabel) {
              callstack.push(at-1);
              next(subs[l]);
            }
            break;
          case jump:
            l = readLabel();
            if (!searchLabel && !subs.hasOwnProperty(l)) {
              searchLabel = l;
            }
            if (!searchLabel) {
              next(subs[l]);
            }
            break;
        }
        break;
      case mod2:
        switch(next()) {
          case jeq0:
            l = readLabel();
            if (!searchLabel) {
              if (!stack.length) error('jeq0 from empty stack');
              a = stack.pop();
              if (a===0) {
                if (!subs.hasOwnProperty(l)) {
                  searchLabel = l;
                }
                if (!searchLabel) {
                  next(subs[l]);
                }
              }
            }
            break;
          case jlt0:
            l = readLabel();
            if (!searchLabel) {
              if (!stack.length) error('jlt0 from empty stack');
              a = stack.pop();
              if (a<0) {
                if (!searchLabel && !subs.hasOwnProperty(l)) {
                  searchLabel = l;
                }
                if (!searchLabel) {
                  next(subs[l]);
                }
              }
            }
            break;
          case exitSub:
            if (!searchLabel) {
              if (!callstack.length) error('Cannot return from uncalled subroutine');
              next(callstack.pop());
            }
            break;
        }
        break;
      case exit:
        if (next() === exit) {
          if (!searchLabel) {
            return;
          }
        } else {
          error('Attempted exit?');
        }
        break;
    }
    return readIMP();
  }

  function heapAccess() {
    let a,b;
    switch(next()) {
      case C.S:
        if (!searchLabel) {
          if (stack.length<2) {
            error('Not enough values on stack');
          }
          a = stack.pop();
          b = stack.pop();
          heap[b] = a;
        }
        break;
      case C.T:
        if (!searchLabel) {
          if (stack.length<1) {
            error('Not enough values on stack');
          }
          a = stack.pop();
          if (!heap.hasOwnProperty(a)) {
            error('Invalid heap address');
          }
          stack.push(heap[a]);
        }
        break;
    }
    return readIMP();
  }

  function arithmetic() {
    const mod1 = C.S;
    const add = C.S;
    const sub = C.T;
    const mul = C.N;
    const mod2 = C.T;
    const div = C.S;
    const mod = C.T;
    const checkStack = n=>(stack.length<2)?error('Not enough values on stack'):1;
    let a,b;

    switch(next()) {
      case mod1:
        switch(next()) {
          case add:
            if (!searchLabel) {
              checkStack();
              a = stack.pop();
              b = stack.pop();
              stack.push(b+a);
            }
            break;
          case sub:
            if (!searchLabel) {
              checkStack();
              a = stack.pop();
              b = stack.pop();
              stack.push(b-a);
            }
            break;
          case mul:
            if (!searchLabel) {
              checkStack();
              a = stack.pop();
              b = stack.pop();
              stack.push(b*a);
            }
            break;
        }
        break;
      case mod2:
        switch(next()) {
          case div:
            if (!searchLabel) {
              checkStack();
              a = stack.pop();
              b = stack.pop();
              if (a===0) {
                error('Attempt to divide by 0');
              }
              stack.push(Math.floor(b/a));
            }
            break;
          case mod:
            if (!searchLabel) {
              checkStack();
              a = stack.pop();
              b = stack.pop();
              if (a===0) {
                error('Attempted modulo by 0');
              }
              b = b - (a * Math.floor(b/a));
              if (a<0 && b>0) {
                b = -b;
              } 
              stack.push(b);
            }
            break;
        }
        break;
    }

    return readIMP();
  }

  function inputOutput() {
    const mod1 = C.S;
    const popChar = C.S;
    const popNum = C.T;
    const mod2 = C.T;
    const readChar = C.S;
    const readNum = C.T;
    const checkStack = n=>!stack.length?error('Attempt to output from empty stack'):1;
    let a,b,n = '';

    switch (next()) {
      case mod1:
        switch(next()) {
          case popChar:
            if (!searchLabel) {
              checkStack();
              output += String.fromCharCode(stack.pop());
            }
            break;
          case popNum:
            if (!searchLabel) {
              checkStack();
              output += stack.pop();
            }
            break;
        }
        break;
      case mod2:
        switch(next()) {
          case readChar:
            if (!searchLabel) {
              checkStack();
              if (!input.length) error('Attempt to read from empty input');
              a = input.shift();
              b = stack.pop();
              heap[b] = a.charCodeAt(0);
            }
            break;
          case readNum:
            if (!searchLabel) {
              checkStack();
              if (!input.length) error('Attempt to read from empty input');
              a = input.shift();
              while (a !== '\n') {
                n += a;
                a = input.shift();
              }
              b = stack.pop();
              heap[b] = parseInt(n);
            }
            break;
        }
        break;
    }

    return readIMP();
  }

  function readNumber() {
    const negative = C.T;
    const positive = C.S;
    const terminator = C.N;
    const zero = C.S;
    const one = C.T;
    let n = '';

    if (next() === negative) {
      n = '-';
    }
    if (n === '' && c !== positive) {
      error('Malformed number');
    }
    if (next() === terminator) {
      return 0;
    }

    while (c !== terminator) {
      switch(c) {
        case zero:
          n += '0';
          break;
        case one:
          n += '1';
          break;
      }
      next();
    }

    return parseInt(n,2);
  }

  function readLabel() {
    const terminator = C.N;
    let lbl = '';
    while (next() !== terminator) {
      lbl += c;
    }
    lbl = lbl || terminator;
    return lbl;
  }

  function next(gt) {
    let valid = /[\t \n]/;
    if (gt !== void 0) {
      at = gt;
    }
    while(!valid.test(code[++at])) {
      if (at>code.length) {
        if (searchLabel) error('No subroutine with that name');
        error('Unclean termination');
      }
    }
    c = code[at];
    return c;
  }

  function error(msg) {
    throw new SyntaxError(msg+' at '+at);
  }

  readIMP();
  return output;
}

