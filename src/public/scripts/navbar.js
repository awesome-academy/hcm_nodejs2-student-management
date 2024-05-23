$(document).ready(function () {
  const currentPath = window.location.pathname;
  $(".nav-link").each(function () {
    const href = $(this).attr("href");
    if (currentPath.startsWith(href)) {
      $(this).removeClass("link-dark");
      $(this)
        .closest("li")
        .addClass("nav-item sidebar-item sidebar-item-active");
    }
  });

  const profile = $("#profile-card");
  const user = profile.data("user");
  if (user.roleKey) {
    switch (user.roleKey) {
      case "staff":
        const staffLis = $(".staff-feature");
        staffLis.removeClass("d-none");
        break;
      case "student":
        const studentLis = $(".student-feature");
        studentLis.removeClass("d-none");
        break;
      case "teacher":
        const teacherLis = $(".teacher-feature");
        teacherLis.removeClass("d-none");
        break;
    }
  }
});
