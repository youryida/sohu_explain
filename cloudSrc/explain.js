var WORK_ROLE_BEGIN = 9; //解释加班需要按标准时开始计时 来的再早也是按九点
var ASPX_EXPLAIN = "AnomalyInterpretationApprove.aspx";
var URL_WORKLIST =
  "http://skd.sohu-inc.com/UI/PC/index.html#/handlelist?showHeader=1";
var nowUrl = location.href;
// 页面引导
if (nowUrl.indexOf(ASPX_EXPLAIN) == -1) {
  if (nowUrl.indexOf(URL_WORKLIST) == -1) {
    var bl = confirm("确定前往【考勤解释】吗？");
    if (bl) location.href = URL_WORKLIST;
  } else {
    alert("请点击要解释的任务单号");
  }
} else {
  // ui展开
  slideDown();
  // 解释
  setTimeout(() => {
    overtimeExplain();
  }, 400);
}

/*进入独立解释页之后*/
function isOvertime(oLine) {
  //日常加班 如'09:40:11~20:22:42'
  var WORKTIME = 9 * 3600,
    OVERTIME = 2 * 3600; //正常9小时,加班2小时
  var OVERTIME_FIX = (getQS("fix") || 10) * 60; //加班时间修正-10分钟
  var oWork = oLine.find(".x-grid3-col-3");
  var txtWT = oWork.text();
  if (!/\d~\d/.test(txtWT)) return false;
  var begin = txtWT.split("~")[0].split(":"),
    end = txtWT.split("~")[1].split(":");

  var bs = begin[0] * 3600 + begin[1] * 60 + begin[2] * 1,
    es = end[0] * 3600 + end[1] * 60 + end[2] * 1;
  if (bs < WORK_ROLE_BEGIN * 3600) bs = WORK_ROLE_BEGIN * 3600;

  if (es < bs) es += 24 * 3600;
  var ts = es - bs;
  if (ts >= WORKTIME + OVERTIME - OVERTIME_FIX) return true; //计为加班
  return false;
}
function isRestday(oLine) {
  //休息日有打开的
  return (
    oLine.find(".attValue").text() == "休息日" &&
    oLine.find(".x-grid3-col-3").text() != "无打卡记录"
  );
}

//留个后门 可以通过 url参数 修改 OVERTIME_FIX
function getQS(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return decodeURIComponent(r[2]);
  return null;
}

//展开异常、周末打开和日常加班的
function slideDown() {
  $(".editLine").each(function() {
    var obj = this; //
    var needOpen = false;
    var oLine = $(obj).closest(".x-grid3-row-collapsed");
    //console.log(workTime)
    var oStatus = oLine.find(".x-grid3-col-4");
    if (
      oStatus.text().trim() == "异常" ||
      isOvertime(oLine) ||
      isRestday(oLine)
    )
      needOpen = true;
    if (needOpen) {
      var gridobj = Ext.getCmp("grid");
      gridobj.plugins.expandRow(
        $(obj)
          .parents(".x-grid3-row-collapsed")
          .get(0)
      );
      $(obj).addClass("editLineSel");
      $(obj).html("收起");
    }
  });
}
//展开后根据时间，自动填写日常加班
function overtimeExplain() {
  $(".x-grid3-row-expanded .inTable").each(function() {
    var txt = $(this)
        .find(".txtHours")
        .text(),
      h = parseInt(txt);
    // if() {// isNaN(h)||h<11
    //     $(this).closest(".x-grid3-row-expanded").find(".editLine").click();//收起来
    //     return true;
    // }
    if (isNaN(h)) return true; //第一栏没有默认时数或者异常的跳过
    var oneBox = $(this).closest(".x-grid3-row-expanded");
    if (
      oneBox
        .find(".x-grid3-col-4")
        .text()
        .trim() == "异常"
    )
      return true;
    var tr1 = $(this)
      .find(".editTr")
      .eq(0);
    var startH = tr1.find(".startTime").val(),
      startM = tr1.find(".selStartMinute").val();
    var endH = tr1.find(".endTime").val(),
      endM = tr1.find(".selEndMinute").val(); //这个不是很合适 应该可以去掉
    var start_end_arr = oneBox
      .find(".x-grid3-col-3")
      .text()
      .trim()
      .split("~");

    if (startH - 0 < WORK_ROLE_BEGIN) {
      //如果满足9:00之后的+2，但是打卡早于9:00
      startH = WORK_ROLE_BEGIN;
      startM = 0;
      tr1.find(".startTime").val(startH);
      tr1.find(".selStartMinute").val(startM);
    }
    if (start_end_arr.length > 1) {
      //如果有起止打卡时间 按照计算的来
      endH = start_end_arr[1].split(":")[0] - 0;
      endM = start_end_arr[1].split(":")[1] - 0;
      h = endH - startH;
    }
    var midH = startH - 0 + 9,
      midM = startM;
    //console.log(midH)
    tr1.find(".endTime").val(midH);
    tr1.find(".selEndMinute").val(midM);
    if ($(this).find(".editTr").length == 1) tr1.find(".inAdd").click();

    if (h <= 11) {
      //实际时间不够 按照 OVERTIME_FIX 展开的 补齐
      endH = midH + 2;
      endM = Math.max(startM, endM);
    }

    var tr2 = tr1.next();
    tr2.find(".selHoliday").val("b3cea43e-0df6-4730-8d94-49acbdcb45be");
    chanageSelect(tr2.find(".selHoliday")[0]);
    tr2.find(".startTime").val(midH);
    tr2.find(".selStartMinute").val(midM);
    tr2.find(".endTime").val(endH);
    tr2.find(".selEndMinute").val(endM);
    var box = tr2.closest(".inOuter");
    box.find("input[value=保存并收起]").click(); //保存并收起 先不要提交
  });
  alert(
    "稍等片刻(10-40秒)，\n【日常加班】部分的考勤就解释ok了！\n\n未收起的休息日、异常、以及其他部分请自行解释！"
  );
}
