﻿/*
 * by 社交产品中心 柳学峰
 * email：xuefengliu@sohu-inc.com
 * QQ：1140215489
 * lastUpdate：20160606
 */

jsFileInject(
  "http://hy-web2.bjcnc.scs.sohucs.com/other/chrome/explain/explain.js"
);

// document.querySelector("#btnGo").addEventListener(
//   "click",
//   function() {
//     var code = "overtimeExplain();"; //这里要添加 对已经解释过的处理
//     jsCodeInject(code);
//   },
//   false
// );

function jsCodeInject(code) {
  //单行字符串
  var jsStr =
    'jsEle=document.createElement("script");jsEle.innerHTML="' +
    code +
    '";document.body.appendChild(jsEle);';
  chrome.tabs.executeScript(null, { code: jsStr });
}
function jsFileInject(file) {
  //
  var jsStr =
    'jsEle=document.createElement("script");jsEle.src="' +
    file +
    '";document.body.appendChild(jsEle);';
  chrome.tabs.executeScript(null, { code: jsStr });
}
