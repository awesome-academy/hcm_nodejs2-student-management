$(document).ready(function () {
  const content = $("#content");
  const modal = $("#studentModal");
  const table = $("#table-body");

  const getAvailableStudents = () => {
    const gradeId = content.data("class-detail").grade.id;
    fetch(`/students/available-students?grade=${gradeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((students) => {
        if (students.length > 0) {
          $("#student-list").removeClass("d-none");
          students.forEach((student) => {
            const row = `<tr>
                            <td><input
                            class="form-check-input"
                            type="checkbox"
                            value="${student.id}"
                            name="students"
                            /></td>
                            <td>${student.name}</td>
                            <td>${student.phone}</td>
                            <td>${student.email}</td>
                        </tr>`;
            table.append(row);
          });
        }
      });
  };

  modal.on("show.bs.modal", function () {
    getAvailableStudents();
  });

  modal.on("hidden.bs.modal", function () {
    table.empty();
  });

  $("#check-all").on("change", function () {
    $("input[name='students-to-delete']").prop(
      "checked",
      $("#check-all").prop("checked")
    );
    if ($("#check-all").prop("checked") == true)
      $("#delete-student").removeClass("d-none");
    else $("#delete-student").addClass("d-none");
  });

  $("#deleteBtn").on("click", function () {
    const body = {};
    const selectedStudents = $("input[name='students-to-delete']:checked")
      .map(function () {
        return $(this).val();
      })
      .get();
    if (selectedStudents.length > 0) {
      body.students = selectedStudents;
      let currentURL = window.location.href;
      const urlObject = new URL(currentURL);
      if (urlObject.searchParams.has("source")) {
        urlObject.searchParams.delete("source");
      }
      const classId = content.data("class-detail").id;
      fetch(`/classes/${classId}/remove-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).then((res) => {
        if (res.redirected) {
          if (res.redirected) {
            urlObject.searchParams.append("source", "delete");
            window.location.href = urlObject.toString();
          }
        }
      });
    }
  });

  $(".student-check").on("change", function () {
    const selectedStudents = $("input[name='students-to-delete']:checked")
      .map(function () {
        return $(this).val();
      })
      .get();
    if (selectedStudents.length > 0) $("#delete-student").removeClass("d-none");
    else $("#delete-student").addClass("d-none");
  });

  $("#submitBtn").on("click", function () {
    const body = {};
    const selectedStudents = $("input[name='students']:checked")
      .map(function () {
        return $(this).val();
      })
      .get();
    if (selectedStudents.length > 0) {
      body.students = selectedStudents;
      let currentURL = window.location.href;
      const urlObject = new URL(currentURL);
      if (urlObject.searchParams.has("source")) {
        urlObject.searchParams.delete("source");
      }
      const classId = content.data("class-detail").id;
      fetch(`/classes/${classId}/add-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).then((res) => {
        if (res.redirected) {
          if (res.redirected) {
            urlObject.searchParams.append("source", "create");
            window.location.href = urlObject.toString();
          }
        }
      });
    }
  });

  if (content.data("success-msg").length > 0) {
    const toast = $("#toast-success");
    new bootstrap.Toast(toast.get(0)).show();
  }
});
