$(document).ready(function () {
  $("#btn-search").on("click", function () {
    const semester = $("#semester").val();
    const year = $("#year").val();
    window.location.href = `/classes/teachings?semester=${semester}&year=${year}`;
  });

  $(".class-row").on("click", function () {
    const teachingId = $(this).data("teaching-id");
    window.location.href = `/classes/teachings/${teachingId}`;
  });

  const urlParams = new URLSearchParams(window.location.search);
  const semester = urlParams.get("semester");
  const year = urlParams.get("year");
  if (semester) {
    $("#semester").val(semester);
  } else {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    if (currentMonth >= 0 && currentMonth <= 4) $("#semester").val("2");
    else $("#semester").val("1");
  }
  if (year) {
    $("#year").val(year);
  } else {
    const years = $("#content").data("years");
    $("#year").val(years[0].split("-")[0]);
  }
});
