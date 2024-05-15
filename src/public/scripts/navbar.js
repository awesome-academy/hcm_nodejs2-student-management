$(document).ready(function () {
  const currentPath = window.location.pathname;
  $(".nav-link").each(function () {
    const href = $(this).attr("href");
    if (href === currentPath) {
      $(this).removeClass("link-dark");
      $(this)
        .closest("li")
        .addClass("nav-item sidebar-item sidebar-item-active");
    }
  });

  const profile = $("#profile-card");
  const user = profile.data("user");
  if (user.role) {
    const staffRole = profile.data("staff-role");
    const studentRole = profile.data("student-role");
    const teacherRole = profile.data("teacher-role");
    switch (user.role) {
      case staffRole:
        const staffLis = $(".staff-feature");
        staffLis.removeClass("d-none");
        break;
      case studentRole:
        const studentLis = $(".student-feature");
        studentLis.removeClass("d-none");
        break;
      case teacherRole:
        const teacherLis = $(".teacher-feature");
        teacherLis.removeClass("d-none");
        break;
    }
  }
});
