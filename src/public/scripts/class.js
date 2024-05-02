$(document).ready(function () {
  const modal = $("#classModal");
  const deleteModal = $("#deleteModal");
  const form = modal.find("#classForm");
  const submitBtn = modal.find("#submitBtn");
  const content = $("#content");
  const deleteForm = deleteModal.find("#deleteForm");

  modal.on("show.bs.modal", function (event) {
    clearError();
    clearForm();
    const button = $(event.relatedTarget);
    const data = button.data("class");
    const title = button.data("bs-title");
    const modalTitle = modal.find("#modalTitle");
    const modalButton = modal.find("#submitBtn");
    modalTitle.text(title);
    modalButton.text(title);
    if (button.attr("name") !== "addClass") {
      const id = button.attr("data-classId");
      form.attr("action", "/classes/" + id + "/update");
      const nameInput = modal.find("#name");
      const gradeInput = modal.find("#grade");
      const teacherInput = modal.find("#teacher");
      const statusInput = modal.find("#status");
      const teacherOption = $("<option>")
        .val(data.teacher.id)
        .text(data.teacher.name)
        .attr("selected", true)
        .attr("data-added-option", true);
      teacherInput.append(teacherOption);
      nameInput.val(data.name);
      gradeInput.val(data.grade.id);
      statusInput.val(data.status);
      statusInput.attr("disabled", false);
    }
  });

  modal.on("hidden.bs.modal", function () {
    const teacherInput = modal.find("#teacher");
    teacherInput.find("option[data-added-option]").remove();
  });

  clearError = () => {
    const errorLists = $(".error-list");
    for (let errorList of errorLists) {
      errorList.innerHTML = "";
    }
  };
  clearForm = () => {
    const nameInput = modal.find("#name");
    nameInput.val("");
  };

  submitBtn.on("click", function () {
    clearError();
    const name = $("#name").val();
    const grade = $("#grade").val();
    const teacher = $("#teacher").val();
    const status = $("#status").val();
    const body = {};
    body.name = name;
    body.grade = grade;
    body.teacher = teacher;
    body.status = status;
    const route =
      form.attr("action") === "/" ? "/classes" : form.attr("action");
    fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.redirected) {
          if (route === "/classes") {
            window.location.href = "/classes?source=create";
          } else {
            window.location.href = "/classes?source=update";
          }
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

  deleteModal.on("show.bs.modal", function (event) {
    const button = $(event.relatedTarget);
    const id = button.attr("data-classId");
    deleteForm.attr("action", "/classes/" + id + "/delete");
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
