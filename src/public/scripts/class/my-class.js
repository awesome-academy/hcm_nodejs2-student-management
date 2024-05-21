$(document).ready(function () {
  $("#_class").on("change", function () {
    window.location.href = `/classes/my-class?sclass=${this.val()}`;
  });
  const classDetail = $("#content").data("class-detail");
  if (classDetail) $("#_class").val(classDetail.id);
});
