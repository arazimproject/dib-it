import { cachedFetch } from "./hooks"
import { DibItCourse } from "./models"

export const getPossibleFaculties = async (
  courses: DibItCourse[],
  facultyPoints: { faculty: string; points?: number }[],
  bidding?: AllTimeBiddingInfo
) => {
  bidding ??= await cachedFetch<AllTimeBiddingInfo>(
    "https://arazim-project.com/data/bidding.json"
  )

  const facultyPointsMap: Record<string, number> = {}
  for (const { faculty, points } of facultyPoints) {
    if (points) {
      facultyPointsMap[faculty] = points
    }
  }

  const possibleFaculties: Record<string, string[]> = {}

  for (const course of courses) {
    const faculties = new Set<string>()
    for (const semester in bidding[course.id] ?? {}) {
      for (const group in bidding[course.id][semester] ?? {}) {
        for (const statistics of bidding[course.id][semester][group]) {
          if (statistics.faculty) {
            faculties.add(statistics.faculty)
          }
        }
      }
    }

    const addAll = !Object.keys(facultyPointsMap).some((faculty) =>
      faculties.has(faculty)
    )
    for (const faculty in facultyPointsMap) {
      if (addAll || faculties.has(faculty)) {
        if (!possibleFaculties[course.id]) {
          possibleFaculties[course.id] = []
        }
        possibleFaculties[course.id].push(faculty)
      }
    }
  }

  return possibleFaculties
}

const autoBid = async (
  courses: DibItCourse[],
  facultyPoints: { faculty: string; points?: number }[],
  possibleFaculties: Record<string, string[]>,
  bidding?: AllTimeBiddingInfo
) => {
  bidding ??= await cachedFetch<AllTimeBiddingInfo>(
    "https://arazim-project.com/data/bidding.json"
  )

  const facultyPointsMap: Record<string, number> = {}
  for (const { faculty, points } of facultyPoints) {
    if (points) {
      facultyPointsMap[faculty] = points
    }
  }

  console.log(courses)
  console.log(possibleFaculties)
}

export default autoBid
