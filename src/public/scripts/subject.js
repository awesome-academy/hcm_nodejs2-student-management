$(document).ready(function () {
  const modal = $("#subjectModal");
  const deleteModal = $("#deleteModal");
  const selAllCheckbox = modal.find("#selectAll");
  const checkboxes = modal.find(".grade-checkbox");
  const form = modal.find("#subjectForm");
  const deleteForm = deleteModal.find("#deleteForm");

  modal.on("show.bs.modal", function (event) {
    const button = $(event.relatedTarget);
    const title = button.data("bs-title");
    const modalTitle = modal.find(".modal-title");
    const modalButton = modal.find("#submitBtn");

    if (button.attr("name") !== "addSubject") {
      const id = button.attr("data-subjectId");
      form.attr("action", "/subjects/" + id + "/update");
      const data = button.data("subject");
      const input = modal.find("#name");
      input.val(data.name);
      checkboxes.each(function () {
        $(this).prop("checked", data.grades.includes(+$(this).val()));
      });
    }
    modalTitle.text(title);
    modalButton.text(title);
  });

  modal.on("hidden.bs.modal", function (event) {
    const input = modal.find("#name");
    input.val("");
    checkboxes.prop("checked", false);
    form.attr("action", "/subjects");
  });

  deleteModal.on("show.bs.modal", function (event) {
    const button = $(event.relatedTarget);
    const id = button.attr("data-subjectId");
    deleteForm.attr("action", "/subjects/" + id + "/delete");
  });

  selAllCheckbox.on("change", function (event) {
    checkboxes.prop("checked", selAllCheckbox.prop("checked"));
  });

  const content = $("#content");
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
