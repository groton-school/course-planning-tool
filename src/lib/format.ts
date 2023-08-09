export const apply = (format, data) =>
  Object.keys(data).reduce(
    (format, key) => format.replaceAll(`{{${key}}}`, data[key]),
    format
  );
