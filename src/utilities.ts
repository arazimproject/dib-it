import { toHebrewJewishDate } from "jewish-date"
import hash from "./color-hash"
import { DibIt, DibItCourse } from "./models"

export const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24

export const SEMESTERS_TO_NUMBER: Record<string, number> = {
  a: 1,
  b: 2,
}

export const SEMESTERS_TO_HEBREW: Record<string, string> = {
  a: "א'",
  b: "ב'",
}

export const getClosestValue = (value: number, sortedList: number[]) => {
  // Binary search the last x that is smaller than value
  if (value <= sortedList[0]) {
    return sortedList[0]
  }
  if (value >= sortedList[sortedList.length - 1]) {
    return sortedList[sortedList.length - 1]
  }

  let low = 0,
    high = sortedList.length - 1
  while (high > low + 1) {
    const middle = Math.floor((low + high) / 2)
    const middleValue = sortedList[middle]
    if (value >= middleValue) {
      low = middle
    } else {
      high = middle
    }
  }

  if (Math.abs(sortedList[low] - value) < Math.abs(sortedList[high] - value)) {
    return sortedList[low]
  }

  return sortedList[high]
}

export const getColor = (course: DibItCourse): string => {
  return course.color ?? getDefaultColor(course)
}

export const getDefaultColor = (course: DibItCourse): string => {
  return hash.hex(course.id)
}

export const downloadFile = (filename: string, contents: string) => {
  const element = document.getElementById("download") as HTMLAnchorElement
  element.href = contents
  element.download = filename
  element.click()
}

export const uploadJson = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const element = document.getElementById("upload") as HTMLInputElement
    element.onchange = () => {
      const reader = new FileReader()
      reader.addEventListener("load", (e) => {
        resolve(JSON.parse(e.target!.result as string))
      })
      reader.readAsText(element.files![0])
    }
    element.onerror = reject
    element.click()
  })
}

export const parseDateString = (date: string) => {
  if (date === "") {
    return
  }
  const [day, month, year] = date.split("/")
  const d = new Date()
  d.setFullYear(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))

  return d
}

export const formatSemester = (semester: string) =>
  semester.substring(0, 4) + (semester[4] === "a" ? "א'" : "ב'")

export const formatSemesterInHebrew = (semester: string) => {
  const hebrewSemester = SEMESTERS_TO_HEBREW[semester[4]]
  const year = parseInt(semester.slice(0, 4), 10)
  const jewishYear = toHebrewJewishDate({
    year: year + 3760,
    monthName: "Tishri",
    day: 1,
  })
  return `${jewishYear.year.slice(1)} ${hebrewSemester}`
}

export const FIRST_SEMESTER = "2023a"

export const getPastAndPresentCourses = (dibIt: DibIt, until?: string) => {
  const pastCourses = new Set<string>()
  const pastAndPresentCourses = new Set<string>()
  for (const s of Object.keys(dibIt.courses ?? {}).sort()) {
    if (s === until) {
      for (const course of dibIt.courses![s]) {
        pastAndPresentCourses.add(course.id)
      }
      break
    }

    for (const course of dibIt.courses![s]) {
      pastCourses.add(course.id)
      pastAndPresentCourses.add(course.id)
    }
  }
  return [pastCourses, pastAndPresentCourses]
}

export const checkPrerequisites = (
  prerequisites: SemesterCoursesPrerequisiteCourses | undefined,
  pastCourses: Set<string>,
  pastAndPresentCourses: Set<string>,
  format?: (courseId: string) => string,
  root = true
): string | undefined => {
  if (!prerequisites) {
    return
  }

  const doesntHaveCourse = (
    course: string | SemesterCoursesPrerequisiteCourses
  ) => {
    if (typeof course === "string") {
      if (!pastCourses.has(course)) {
        return format?.(course) ?? course
      }
    } else {
      return checkPrerequisites(
        course,
        pastCourses,
        pastAndPresentCourses,
        format,
        false
      )
    }
  }

  if (prerequisites.parallel) {
    const parallelResults = checkPrerequisites(
      prerequisites.parallel,
      pastAndPresentCourses,
      pastAndPresentCourses,
      format,
      root
    )
    if (parallelResults) {
      return "במקביל " + parallelResults
    }
  }

  if (!prerequisites.kind || !prerequisites.courses) {
    return
  }

  let results = prerequisites?.courses
    .map(doesntHaveCourse)
    .filter((r) => r !== undefined)
  const ok =
    prerequisites.kind === "all"
      ? results.length === 0
      : results.length < prerequisites.courses.length
  if (ok) {
    return
  }
  const r =
    prerequisites.kind === "all" ? results.join(" וגם ") : results.join(" או ")
  return root ? r : `(${r})`
}
