import { cachedFetch } from "./hooks"
import { DibItCourse } from "./models"

const autoBid = async (courses: DibItCourse[]) => {
  const bidding = await cachedFetch<AllTimeBiddingInfo>(
    "https://arazim-project.com/data/bidding.json"
  )

  for (const course of courses) {
    for (const group of course.groups ?? []) {
      const faculties = new Set<string>()
      for (const semester in bidding[course.id] ?? {}) {
        for (const statistics of bidding[course.id][semester][group] ?? []) {
          if (statistics.faculty) {
            faculties.add(statistics.faculty)
          }
        }
      }

      console.log(course.id, group, [...faculties])
    }
  }
}

export default autoBid
