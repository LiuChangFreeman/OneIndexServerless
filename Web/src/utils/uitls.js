export function renderTime(date) {
  const time = new Date(date).toJSON();
  return new Date(+new Date(time) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
}
