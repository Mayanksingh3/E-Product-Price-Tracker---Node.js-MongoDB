function repeat() {
  var date = new Date();
  // date.setHours(00);
  // console.log(date.getHours());
  if (date.getHours() == 0) {
    console.log("Updating the price List ...");
    updatePrice();
  }
  setInterval(repeat, 3600000);
}
