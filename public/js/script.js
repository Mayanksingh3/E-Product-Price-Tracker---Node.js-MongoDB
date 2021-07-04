$(document).ready(function () {
  $(".aboutus-box").waypoint(
    function (direction) {
      $(".aboutus-box").addClass("animated fadeIn");
    },
    { offset: "50%" }
  );
  $(".myImage").waypoint(
    function (direction) {
      $(".myImage").addClass("animated fadeInUp");
    },
    { offset: "70%" }
  );
});
