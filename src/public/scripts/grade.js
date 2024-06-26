$(document).ready(function () {
  const content = $("#content");
  const modal = $("#manageGrades");
  modal.on("show.bs.modal", function (event) {
    const gradeArray = [];
    $(".list-group-item").each(function () {
      const gradeValue = $(this).attr("data-grade");
      gradeArray.push(+gradeValue);
    });
    if (gradeArray.includes(6)) {
      $("#secondary").attr("checked", true);
    }
    if (gradeArray.includes(10)) {
      $("#high").attr("checked", true);
    }
  });

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
