$(document).ready(function () {
  $("#_class").on("change", function (event) {
    window.location.href = `/classes/my-class?sclass=${this.val()}`;
  });
  const classDetail = $("#content").data("class-detail");
  $("#_class").val(classDetail.id);
});
