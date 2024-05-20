$(document).ready(function () {
  const content = $("#content");
  const modal = $("#conductModal");

  $("#btn-search-header").on("click", function () {
    const year = $("#school_year").val();
    const semester = $("#semester").val();
    window.location.href = `/classes/homeroom-class?year=${year}&semester=${semester}`;
  });

  modal.on("show.bs.modal", function (event) {
    const button = $(event.relatedTarget);
    modal.data("student-id", button.data("student-id"));
    const conduct = button.data("conduct");
    $("#conduct").val(conduct);
  });

  $("#submitBtn").on("click", function () {
    const body = {};
    const studentId = modal.data("student-id");
    body.conduct = $("#conduct").val();
    body.semester_id = content.data("semester-id");
    body.class_id = content.data("class-detail")
      ? content.data("class-detail").id
      : null;
    let currentURL = window.location.href;
    const urlObject = new URL(currentURL);
    if (urlObject.searchParams.has("source")) {
      urlObject.searchParams.delete("source");
    }
    fetch(`/students/${studentId}/update-conduct`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.redirected) {
          if (res.redirected) {
            urlObject.searchParams.append("source", "update");
            window.location.href = urlObject.toString();
          }
        }
        return res.json();
      })
      .then((data) => {
        if (data !== null && data.errors) {
          const errorList = $("error-conduct");
          for (let error in data.errors) {
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

  const semester = content.data("semester");
  const year = content.data("year");
  $("#semester").val(semester);
  $("#school_year").val(year);

  if (content.data("success-msg").length > 0) {
    const toast = $("#toast-success");
    new bootstrap.Toast(toast.get(0)).show();
  }
});
