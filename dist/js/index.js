"use strict";

// var f = 0;
// f += 10;
var c = 10;
c = 9;
console.log(c);
var k = 'abc';
var d = k + 'bbbb';
console.log(d);

var a = function a(b) {
  return b + 10;
};

function abc(params) {
  console.log(k, params);
}

abc();
console.log(a(20));