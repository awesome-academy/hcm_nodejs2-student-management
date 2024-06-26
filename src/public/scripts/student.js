$(document).ready(function () {
  const modal = $("#studentModal");
  const deleteModal = $("#deleteModal");
  const form = modal.find("#studentForm");
  const submitBtn = modal.find("#submitBtn");
  const content = $("#content");
  const deleteForm = deleteModal.find("#deleteForm");
  
  modal.on("show.bs.modal", function (event) {
    clearError();
    clearForm();
    const button = $(event.relatedTarget);
    const title = button.data("bs-title");
    const modalTitle = modal.find("#modalTitle");
    const modalButton = modal.find("#submitBtn");
    modalTitle.text(title);
    modalButton.text(title);

    if (button.attr("name") !== "addStudent") {
      const id = button.attr("data-studentId");
      form.attr("action", "/students/" + id + "/update");
      const data = button.data("student");
      const nameInput = modal.find("#name");
      const emailInput = modal.find("#email");
      const addressInput = modal.find("#address");
      const genderInput = modal.find("#gender");
      const phoneInput = modal.find("#phone");
      const gradeInput = modal.find("#grade");
      const dobInput = modal.find("#dateOfBirth");
      const statusInput = modal.find("#status");
      nameInput.val(data.name);
      emailInput.val(data.email);
      addressInput.val(data.address);
      genderInput.val(data.gender);
      phoneInput.val(data.phone);
      dobInput.val(data.date_of_birth);
      statusInput.val(data.status);
      statusInput.prop("disabled", false);
      gradeInput.val(data.gradeId);
      gradeInput.prop("disabled", true);
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
    const inputs = [
      "name",
      "email",
      "address",
      "gender",
      "phone",
      "dateOfBirth",
      "status",
    ];
    inputs.forEach((input) => {
      const inputElement = modal.find(`#${input}`);
      inputElement.val(input === "gender" || input === "status" ? "1" : "");
      inputElement.prop("disabled", input === "status");
    });
    const grade = $("#grade");
    const firstOption = grade.find("option").eq(0);
    firstOption.prop("selected", true);
    grade.prop("disabled", false);
  };

  submitBtn.on("click", function () {
    clearError();
    const name = $("#name").val();
    const email = $("#email").val();
    const phone = $("#phone").val();
    const address = $("#address").val();
    const gender = $("#gender").val();
    const date_of_birth = $("#dateOfBirth").val();
    const grade = $("#grade").val();
    const status = $("#status").val();
    const body = {};
    body.name = name;
    body.email = email;
    body.phone = phone;
    body.address = address;
    body.gender = gender;
    body.status = status;
    body.grade = grade;
    body.date_of_birth = date_of_birth;
    const route =
      form.attr("action") === "/" ? "/students" : form.attr("action");
    fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.redirected) {
          if (route === "/students") {
            window.location.href = "/students?source=create";
          } else {
            window.location.href = "/students?source=update";
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
    const id = button.attr("data-studentId");
    deleteForm.attr("action", "/students/" + id + "/delete");
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
