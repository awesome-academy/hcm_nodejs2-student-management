$(document).ready(function () {
  $("#btn-search").on("click", function () {
    const semester = $("#semester").val();
    const year = $("#year").val();
    window.location.href = `/schedules/teacher-schedule?semester=${semester}&year=${year}`;
  });

  const urlParams = new URLSearchParams(window.location.search);
  const semester = urlParams.get("semester");
  const year = urlParams.get("year");
  if (semester) {
    $("#semester").val(semester);
  } else {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    if (currentMonth >= 0 && currentMonth <= 4) $("#semester").val("2");
    else $("#semester").val("1");
  }
  if (year) {
    $("#year").val(year);
  } else {
    const years = $("#content").data("years");
    $("#year").val(years[0].split("-")[0]);
  }

  const teacherSchedule = $("#content").data("schedule");
  if (teacherSchedule != "") {
    const table = $("#scheduleTable");
    const classTitle = table.data("class-title");
    let prePeriod = [0, 0, 0, 0, 0, 0];
    teacherSchedule.forEach((periodSchedule) => {
      const $row = $("<tr>");
      $row.append(`<td>${periodSchedule.period}</td>`);
      for (let i = 1; i < 7; i++) {
        const schedule = periodSchedule.schedules.find(
          (schedule) => schedule.day === i
        );
        let subject = "";
        let _class = "";
        if (schedule) {
          subject = schedule.subject.name;
          _class = schedule.class_school.name;
        }
        const classData =
          _class.length > 0 ? JSON.stringify(schedule.class_school) : undefined;
        const subjectData =
          subject.length > 0 ? JSON.stringify(schedule.subject) : undefined;
        const preTd = $(`#td-${prePeriod[i - 1]}-${i}`);
        if (
          preTd &&
          JSON.stringify(preTd.data("class")) === classData &&
          JSON.stringify(preTd.data("subject")) === subjectData &&
          classData !== undefined
        ) {
          const currSpan = +preTd.attr("rowspan");
          preTd.attr("rowspan", currSpan + 1);
        } else {
          prePeriod[i - 1] = +periodSchedule.period;
          $row.append(
            `<td
                id="td-${periodSchedule.period}-${i}"
                rowspan="1"
                data-class='${classData}'
                data-subject='${subjectData}'
                class="vertical-center">
                  ${
                    subject.length > 0
                      ? `${subject}<br>${classTitle}: ${_class}`
                      : ""
                  }
            </td>`
          );
        }
      }
      $("#scheduleBody").append($row);
    });
  }
});
