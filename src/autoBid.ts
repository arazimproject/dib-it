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

  const result: Record<string, Record<string, number>> = {}
  for (const faculty in facultyPointsMap) {
    result[faculty] = {}
  }

  // Calculate mean costs for a course in every possible faculty. The cost would be the average minimal cost, plus one.
  const courseFacultyCosts: Record<string, Record<string, number>> = {}
  for (const course of courses) {
    const facultySums: Record<string, number> = {}
    const facultyCounts: Record<string, number> = {}

    for (const semester in bidding[course.id] ?? {}) {
      for (const group in bidding[course.id][semester] ?? {}) {
        for (const statistics of bidding[course.id][semester][group]) {
          // Unknown faculty, add to all.
          if (!statistics.faculty || !facultyPointsMap[statistics.faculty]) {
            for (const faculty of possibleFaculties[course.id]) {
              facultySums[faculty] =
                (facultySums[faculty] ?? 0) + statistics.minimal
              facultyCounts[faculty] = (facultyCounts[faculty] ?? 0) + 1
            }
          } else {
            facultySums[statistics.faculty] =
              (facultySums[statistics.faculty] ?? 0) + statistics.minimal
            facultyCounts[statistics.faculty] =
              (facultyCounts[statistics.faculty] ?? 0) + 1
          }
        }
      }
    }

    for (const faculty in facultySums) {
      facultySums[faculty] =
        Math.ceil(facultySums[faculty] / facultyCounts[faculty]) + 1
    }

    courseFacultyCosts[course.id] = facultySums
  }

  // Assign courses that can only be assigned to one faculty.
  const currentFacultyPoints: Record<string, number> = {}
  for (const faculty in facultyPointsMap) {
    currentFacultyPoints[faculty] = 0
  }

  for (const course in courseFacultyCosts) {
    const faculties = Object.keys(courseFacultyCosts[course])
    if (faculties.length === 1) {
      result[faculties[0]][course] = courseFacultyCosts[course][faculties[0]]
      currentFacultyPoints[faculties[0]] +=
        courseFacultyCosts[course][faculties[0]]
    }
  }

  // Assign remaining courses to the faculty with the most remaining points.
  for (const course in courseFacultyCosts) {
    const faculties = Object.keys(courseFacultyCosts[course])
    if (faculties.length > 1) {
      let bestFaculty = ""
      let bestFacultyRemainingPoints = -1000
      for (const faculty of faculties) {
        const remainingPoints =
          facultyPointsMap[faculty] -
          currentFacultyPoints[faculty] -
          courseFacultyCosts[course][faculties[0]]
        if (remainingPoints > bestFacultyRemainingPoints) {
          bestFacultyRemainingPoints = remainingPoints
          bestFaculty = faculty
        }
      }
      result[bestFaculty][course] = courseFacultyCosts[course][bestFaculty]
      currentFacultyPoints[bestFaculty] +=
        courseFacultyCosts[course][bestFaculty]
    }
  }

  // Balance the points to match the available points for each faculty.
  for (const faculty in facultyPointsMap) {
    let iterations = 0
    let difference = facultyPointsMap[faculty] - currentFacultyPoints[faculty]
    const sortedCourses = Object.keys(result[faculty]).sort(
      (a, b) => result[faculty][b] - result[faculty][a]
    )
    const sortedCoursesReverse = sortedCourses.reverse()

    // Add more points to bids, giving more to higher bids.
    while (difference > 0 && iterations <= 50) {
      for (const course of sortedCourses) {
        const increase = Math.min(
          difference,
          Math.ceil(result[faculty][course] * 0.05) + 1
        )
        result[faculty][course] += increase
        difference -= increase
      }

      iterations++
    }

    // Reduce points from bids, taking more from lower bids.
    while (difference < 0 && iterations <= 50) {
      for (const course of sortedCoursesReverse) {
        const decrease = Math.min(
          -difference,
          Math.ceil(result[faculty][course] * 0.05) + 1,
          result[faculty][course]
        )
        result[faculty][course] -= decrease
        difference += decrease
      }

      iterations++
    }
  }

  return result
}

export default autoBid
