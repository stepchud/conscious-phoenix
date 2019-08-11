export const spaces = (n) => '\u00A0'.repeat(n)
export const s2 = spaces(2)
export const s3 = spaces(3)
export const clickOrReturn = (e) =>
  e.type == 'click' || (e.type == 'keydown' && e.key == 'Enter')
