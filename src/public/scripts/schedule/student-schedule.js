$(document).ready(function () {
  $('#btn-search').on("click", function () {
    const semester = $("#semester").val();
    const classId = $("#_class").val();
    window.location.href = `/schedules/student-schedule?semester=${semester}&sclass=${classId}`;
  });

  const urlParams = new URLSearchParams(window.location.search);
  const semester = urlParams.get("semester");
  const classId = urlParams.get("sclass");
  if (semester) {
    $("#semester").val(semester);
  } else {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    if (currentMonth >= 0 && currentMonth <= 4) $("#semester").val("2");
    else $("#semester").val("1");
  }
  if (classId) {
    $("#_class").val(classId);
  } else {
    const classes = $("#content").data("classes");
    $("#_class").val(classes[0].id);
  }

  const classSchedule = $("#content").data("schedule");
  if (classSchedule != "") {
    const table = $("#scheduleTable");
    const teacherTitle = table.data("teacher-title");
    let prePeriod = [0, 0, 0, 0, 0, 0];
    classSchedule.period_schedules.forEach((periodSchedule) => {
      const $row = $("<tr>");
      $row.append(`<td>${periodSchedule.period}</td>`);
      for (let i = 1; i < 7; i++) {
        const schedule = periodSchedule.schedules.find(
          (schedule) => schedule.day === i
        );
        let subject = "";
        let teacher = "";
        if (schedule) {
          subject = schedule.subject.name;
          teacher = schedule.teacher.name;
        }
        const teacherData =
          teacher.length > 0 ? JSON.stringify(schedule.teacher) : undefined;
        const subjectData =
          subject.length > 0 ? JSON.stringify(schedule.subject) : undefined;
        const preTd = $(`#td-${prePeriod[i - 1]}-${i}`);
        if (
          preTd &&
          JSON.stringify(preTd.data("teacher")) === teacherData &&
          JSON.stringify(preTd.data("subject")) === subjectData &&
          teacherData !== undefined
        ) {
          const currSpan = +preTd.attr("rowspan");
          preTd.attr("rowspan", currSpan + 1);
        } else {
          prePeriod[i - 1] = +periodSchedule.period;
          $row.append(
            `<td
                id="td-${periodSchedule.period}-${i}"
                rowspan="1"
                class="vertical-center">
                ${
                  subject.length > 0
                    ? `${subject}<br>${teacherTitle}: ${teacher}`
                    : ""
                }
              </td>`
          );
        }
      }
      $("#scheduleBody").append($row);
    });
  }
  if ($("#content").data("errors").length > 0) {
    const toast = $(".toast-error");
    toast.each(function () {
      new bootstrap.Toast(this).show();
    });
  }
});
