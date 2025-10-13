// ** Returns initials from string
export const getInitials = (string, notFound) =>
  notFound ? string : string.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')
