class Events {

  static pressed = false;

};

['mousedown', 'keydown'].forEach(type => {
  document.addEventListener(type, () => {
    Events.pressed = true;
  });
});

['mouseup', 'keyup'].forEach(type => {
  document.addEventListener(type, () => {
    Events.pressed = false;
  });
});