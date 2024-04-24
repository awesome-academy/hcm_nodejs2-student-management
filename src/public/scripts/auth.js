//logout click handler
$("#logout-btn").on("click", function () {
  fetch(`/auth/logout`, {
    method: "POST",
  }).then(() => {
    window.location.href = "/auth/login";
  });
});
