$(document).ready(function () {
  const modal = $("#scheduleModal");
  const deleteModal = $("#deleteModal");
  const form = modal.find("#scheduleForm");
  const submitBtn = modal.find("#submitBtn");
  const tableBody = $("#scheduleBody");
  const searchBtn = $("#btn-search");
  const content = $("#content");

  const updateTeacherSelect = (defaulOption) => {
    const subjectId = $("#subject").val();
    const startPeriod = $("#startPeriod").val();
    const endPeriod = $("#endPeriod").val();
    const semesterId = $("#scheduleTable").data("semester-id");
    const day = $("#scheduleModal").data("day");
    const oldEndPeriod = modal.data("old-end");
    const teacherSelect = $("#teacher");
    teacherSelect.empty();
    fetch(
      `/teachers/teachers-by-schedule?subject=${subjectId}&day=${day}&start=${startPeriod}&end=${endPeriod}&semester=${semesterId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((teachers) => {
        if (teachers.length > 0) {
          teachers.forEach((teacher) => {
            const option = $("<option>").val(teacher.id).text(teacher.name);
            teacherSelect.append(option);
          });
        }
      });
    if (defaulOption && +oldEndPeriod < +endPeriod) {
      const teacherId = defaulOption.id;
      fetch(
        `/teachers/is-available?teacher=${teacherId}&day=${day}&start=${oldEndPeriod}&end=${endPeriod}&semester=${semesterId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((res) => {
          return res.json();
        })
        .then((isAvailable) => {
          if (isAvailable) {
            $("<option>")
              .val(defaulOption.id)
              .text(defaulOption.name)
              .attr("selected", true)
              .appendTo("#teacher");
          }
        });
    } else if (+oldEndPeriod >= +endPeriod) {
      $("<option>")
        .val(defaulOption.id)
        .text(defaulOption.name)
        .attr("selected", true)
        .appendTo("#teacher");
    }
  };

  modal.on("show.bs.modal", function (event) {
    clearError();
    $("#deleteBtn").addClass("d-none");
    const button = $(event.relatedTarget);
    const title = button.data("bs-title");
    const period = button.data("period");
    const day = button.data("day");
    const modalTitle = modal.find("#modalTitle");
    const modalButton = modal.find("#submitBtn");
    const startPeriod = modal.find("#startPeriod");
    modalTitle.text(title);
    modalButton.text(title);
    modal.data("day", day);
    form.attr("action", "/");
    startPeriod.val(period);
    for (let p = +period; p <= 10; p++) {
      $("<option>", {
        value: p,
        text: p,
      }).appendTo("#endPeriod");
    }
    const _teacher = button.attr("data-teacher");
    const teacherData =
      _teacher !== "undefined" ? JSON.parse(_teacher) : _teacher;
    modal.data("default-option", teacherData);
    if (button.attr("data-schedule-id") !== "undefined") {
      $("#deleteBtn").removeClass("d-none");
      const _subject = button.attr("data-subject");
      const subjectData =
        _subject !== "undefined" ? JSON.parse(_subject) : _teacher;
      modal.data("subject", subjectData);
      form.attr("action", "/schedules/update");
      modal.data("delete-action", "/schedules/delete");
      const subject = modal.find("#subject");
      const endPeriod = $("#endPeriod");
      endPeriod.val(+period + +button.attr("rowspan") - 1);
      modal.data("old-end", +period + +button.attr("rowspan") - 1);
      updateTeacherSelect(teacherData);
      subject.val(subjectData.id);
    }
  });

  modal.on("hidden.bs.modal", function () {
    $("#endPeriod").empty();
    $("#teacher").empty();
    modal.data("default-option", "undefined");
    modal.data("subject", "undefined");
  });

  $("#delete-cancel").on("click", function () {
    modal.modal("hide");
    deleteModal.modal("hide");
  });

  $("#deleteBtn").on("click", function () {
    const startPeriod = $("#startPeriod").val();
    const endPeriod = $("#endPeriod").val();
    const semester = $("#scheduleTable").attr("data-semester-id");
    const classId = $("#scheduleTable").attr("data-class-id");
    const day = $("#scheduleModal").data("day");
    const body = {};
    body.startPeriod = startPeriod;
    body.endPeriod = endPeriod;
    body.semester = semester;
    body.day = day;
    body._class = classId;
    let currentURL = window.location.href;

    const urlObject = new URL(currentURL);
    if (urlObject.searchParams.has("source")) {
      urlObject.searchParams.delete("source");
    }
    fetch(modal.data("delete-action"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => {
      if (res.redirected) {
        urlObject.searchParams.append("source", "delete");
      }
      window.location.href = urlObject.toString();
    });
  });

  $("#gradeFilter").change(function () {
    const gradeId = $(this).val();
    const year = $("#year").val();
    updateClassSelect("class_filter", gradeId, year);
  });

  updateClassSelect = (selectId, gradeId, year, selectedClass) => {
    fetch(`/classes/classes-by-grade/${gradeId}?year=${year}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.errors) {
          content.attr("data-errors", JSON.stringify(res.errors));
          window.location.href = "/schedules";
        } else return res.json();
      })
      .then((classes) => {
        const classSelect = $(`#${selectId}`);
        classSelect.empty();
        if (classes.length > 0) {
          classes.forEach((_class) => {
            const isSelected = _class.id == selectedClass;
            const option = $("<option>").val(_class.id).text(_class.name).prop("selected", isSelected);
            classSelect.append(option);
          });
        }
      });
  };

  clearError = () => {
    const errorLists = $(".error-list");
    for (let errorList of errorLists) {
      errorList.innerHTML = "";
    }
  };

  $("#subject").on("change", () => {
    if (
      modal.data("subject") === undefined ||
      modal.data("subject").id.toString() !== $("#subject").val()
    )
      updateTeacherSelect();
    else {
      const defaulOption = modal.data("default-option");
      updateTeacherSelect(defaulOption);
    }
  });

  $("#endPeriod").on("change", () => {
    if (modal.data("subject").id.toString() !== $("#subject").val())
      updateTeacherSelect();
    else {
      const defaulOption = modal.data("default-option");
      updateTeacherSelect(defaulOption);
    }
  });

  if (searchBtn) {
    searchBtn.on("click", function () {
      const year = $("#year").val();
      const semester = $("#semester").val();
      const grade = $("#gradeFilter").val();
      const classId = $("#class_filter").val();
      window.location.href = `/schedules?year=${year}&semester=${semester}&grade=${grade}&sclass=${classId}`;
    });
  }

  submitBtn.on("click", function () {
    clearError();
    const subject = $("#subject").val();
    const startPeriod = $("#startPeriod").val();
    const endPeriod = $("#endPeriod").val();
    const teacher = $("#teacher").val();
    const semester = $("#scheduleTable").attr("data-semester-id");
    const classId = $("#scheduleTable").attr("data-class-id");
    const day = $("#scheduleModal").data("day");
    const body = {};
    body.subject = subject;
    body.startPeriod = startPeriod;
    body.endPeriod = endPeriod;
    body.teacher = teacher;
    body.semester = semester;
    body.day = day;
    body._class = classId;
    const route =
      form.attr("action") === "/" ? "/schedules" : form.attr("action");
    if (form.attr("action") !== "/") body.oldEndPeriod = modal.data("old-end");
    let currentURL = window.location.href;
    const urlObject = new URL(currentURL);
    if (urlObject.searchParams.has("source")) {
      urlObject.searchParams.delete("source");
    }
    fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.redirected) {
          if (route === "/schedules") {
            urlObject.searchParams.append("source", "create");
          } else {
            urlObject.searchParams.append("source", "update");
          }
          window.location.href = urlObject.toString();
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        } else {
          return null;
        }
      })
      .then((data) => {
        if (data !== null && data.errors) {
          for (let error in data.errors) {
            const errorList = document.getElementById(`error-${error}`);
            for (let msg of data.errors[error]) {
              let li = document.createElement("li");
              li.className = "text-danger";
              li.textContent = msg;
              errorList.appendChild(li);
            }
          }
        }
      });
  });

  const gradeId = $("#gradeFilter").val();
  const year = $("#year").val();
  updateClassSelect("class_filter", gradeId, year);

  const urlParams = new URLSearchParams(window.location.search);
  const _year = urlParams.get("year");
  const semester = urlParams.get("semester");
  const grade = urlParams.get("grade");
  const classId = urlParams.get("sclass");
  _year && $("#year").val(_year);
  semester && $("#semester").val(semester);
  grade && $("#gradeFilter").val(grade);
  updateClassSelect("class_filter", grade, _year, classId);

  const classSchedule = content.data("schedule");
  if (classSchedule != "") {
    const table = $("#scheduleTable");
    const createTitle = table.data("create-title");
    const updateTitle = table.data("update-title");
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
        let modalTarget = undefined;
        let startMonth, endMonth, year;
        switch (classSchedule.semester.name) {
          case 1:
            startMonth = 9;
            endMonth = 12;
            year = +classSchedule.semester.school_year.split("-")[0];
            break;
          case 2:
            startMonth = 1;
            endMonth = 5;
            year = +classSchedule.semester.school_year.split("-")[1];
            break;
        }
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        if (
          currentYear < year ||
          (currentYear === year && currentMonth < startMonth)
        ) {
          modalTarget = "#scheduleModal";
        } else if (
          currentYear === year &&
          currentMonth <= endMonth &&
          schedule
        ) {
          modalTarget = "#scheduleModal";
        }
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
              class="vertical-center"
              data-bs-toggle="modal"
              data-bs-target=${modalTarget}
              data-day="${i}"
              data-schedule-id="${
                schedule !== undefined ? schedule.id : undefined
              }"
              data-teacher='${teacherData}'
              data-subject='${subjectData}'
              data-period="${periodSchedule.period}"
              data-bs-title="${subject.length > 0 ? updateTitle : createTitle}">
              ${
                subject.length > 0
                  ? `${subject}<br>${teacherTitle}: ${teacher}`
                  : ""
              }
            </td>`
          );
        }
      }
      tableBody.append($row);
    });
  }
  if (content.data("errors").length > 0) {
    const toast = $(".toast-error");
    toast.each(function () {
      new bootstrap.Toast(this).show();
    });
  }
  if (content.data("success-msg").length > 0) {
    const toast = $("#toast-success");
    new bootstrap.Toast(toast.get(0)).show();
  }
});
