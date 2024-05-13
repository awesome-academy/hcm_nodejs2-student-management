$(document).ready(function () {
  const modal = $("#teacherModal");
  const deleteModal = $("#deleteModal");
  const form = modal.find("#teacherForm");
  const submitBtn = modal.find("#submitBtn");
  const content = $("#content");
  const deleteForm = deleteModal.find("#deleteForm");

  const currentPath = window.location.pathname;
  $(".nav-link").each(function() {
    var href = $(this).attr("href");
    if (href === currentPath) {
      $(this).removeClass('link-dark')
      $(this).closest("li").addClass("nav-item sidebar-item sidebar-item-active");
    }
  });

  modal.on("show.bs.modal", function (event) {
    clearError();
    clearForm();
    const button = $(event.relatedTarget);
    const title = button.data("bs-title");
    const modalTitle = modal.find("#modalTitle");
    const modalButton = modal.find("#submitBtn");
    form.attr("action", "/");
    modalTitle.text(title);
    modalButton.text(title);

    if (button.attr("name") !== "addTeacher") {
      const id = button.attr("data-teacherId");
      form.attr("action", "/teachers/" + id + "/update");
      const data = button.data("teacher");
      const nameInput = modal.find("#name");
      const emailInput = modal.find("#email");
      const addressInput = modal.find("#address");
      const genderInput = modal.find("#gender");
      const phoneInput = modal.find("#phone");
      const dobInput = modal.find("#dateOfBirth");
      const statusInput = modal.find("#status");
      const checkboxes = modal.find(".subjects");
      nameInput.val(data.name);
      emailInput.val(data.email);
      addressInput.val(data.address);
      genderInput.val(data.gender);
      phoneInput.val(data.phone);
      dobInput.val(data.date_of_birth);
      statusInput.val(data.status);
      statusInput.prop("disabled", false);
      checkboxes.each(function () {
        subjectsIds = data.subjects.map((subject) => subject.id);
        $(this).prop("checked", subjectsIds.includes(+$(this).val()));
      });
    }
  });

  clearError = () => {
    const errorLists = $(".error-list");
    for (let errorList of errorLists) {
      errorList.innerHTML = "";
    }
  };

  clearForm = () => {
    const nameInput = modal.find("#name");
    const emailInput = modal.find("#email");
    const addressInput = modal.find("#address");
    const genderInput = modal.find("#gender");
    const phoneInput = modal.find("#phone");
    const dobInput = modal.find("#dateOfBirth");
    const statusInput = modal.find("#status");
    const checkboxes = modal.find(".subjects");
    nameInput.val("");
    emailInput.val("");
    addressInput.val("");
    genderInput.val("1");
    phoneInput.val("");
    dobInput.val(undefined);
    statusInput.val("1");
    statusInput.prop("disabled", true);
    checkboxes.each(function () {
      $(this).prop("checked", false);
    });
  };

  submitBtn.on("click", function () {
    clearError();
    const name = $("#name").val();
    const email = $("#email").val();
    const phone = $("#phone").val();
    const address = $("#address").val();
    const gender = $("#gender").val();
    const date_of_birth = $("#dateOfBirth").val();
    const status = $("#status").val();
    const subjects = [];
    $(".subjects:checked").each(function () {
      subjects.push($(this).val());
    });
    const body = {};
    body.name = name;
    body.email = email;
    body.phone = phone;
    body.address = address;
    body.gender = gender;
    body.status = status;
    body.subjects = subjects;
    body.date_of_birth = date_of_birth;
    const route =
      form.attr("action") === "/" ? "/teachers" : form.attr("action");
    fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.redirected) {
          if (route === "/teachers") {
            window.location.href = "/teachers?source=create";
          } else {
            window.location.href = "/teachers?source=update";
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
    const id = button.attr("data-teacherId");
    deleteForm.attr("action", "/teachers/" + id + "/delete");
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
