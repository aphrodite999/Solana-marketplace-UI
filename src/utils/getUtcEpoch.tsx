import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

export const getUtcEpoch = (date: string) => {
  const newDate = dayjs.utc(date)
  return newDate.unix()
}
