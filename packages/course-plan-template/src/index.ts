function onOpen(e) {
  let color;
  for (let row = 0; row < data.length && !found; row++) {
    if (data[row][0] == e.user.getEmail()) {
      color = users.offset(row, 0, 1, 1).getBackground();
      found = true;
    } else if (data[row][0] == '') {
      color = rainbow(data.length, row);
      users
        .offset(row, 0, 1, 1)
        .setValue(e.user.getEmail())
        .setBackground(color);
      found = true;
    }
  }
  if (color) {
    PropertiesService.getUserProperties().setProperty('color', color);
  }
}

function onEdit(e) {
  let color = PropertiesService.getUserProperties().getProperty('color');
  e.range.setBackground(color);
}
