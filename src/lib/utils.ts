export function getSrcFromPath(path: string) {
  return `https://image.tmdb.org/t/p/w300${path}`
}

export function seasonLabelByNumber(seasonNumber: number | undefined) {
  if (seasonNumber === undefined) {
    return undefined
  }

  switch (seasonNumber) {
    case 0: return 'Specials'
    default: return `Season ${seasonNumber}`
  }
}

export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
) {
  return new Intl.DateTimeFormat('en-uk', options).format(new Date(date)) // day month year is better :P
}

export function checkIfFutureDate(date: string) {
  const today = new Date()
  const inputDate = new Date(date)

  return inputDate > today
}
