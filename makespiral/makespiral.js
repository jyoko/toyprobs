var spiralize = function(size) {
  var ret = new Array(size);
  for (var i=0;i<size;i++) {
    var toPush = new Array(size);
    //toPush.fill(0);
    for (var j=0;j<size;j++) toPush[j]=0;
    ret[i] = toPush;
  }
  for (i=0;i<size;i++) (ret[0][i]=1,ret[i][size-1]=1);
  var x=size-1,y=x;
  var middle = (size/2)|0;
  var move=-1;
  var count = 0;
  while (x!==middle||y!==middle) {
    while(ret[y][x+move]!==void 0&&ret[y][x+(2*move)]!==1) {
      x+=move;
      ret[y][x] = 1;
    }
    while (ret[y+move]!==void 0&&(ret[y+(2*move)]&&ret[y+(2*move)][x]!==1)) {
      y+=move;
      ret[y][x] = 1;
    }
    move *= -1;
    count++;
    if (count>size) return ret;
  }
  return ret;
}

spiralize(12);
