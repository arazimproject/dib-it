import * as ics from "ics"
import { Course } from "./CourseInfoContext"
import { getLocalStorage, setLocalStorage } from "./hooks"
import semesterInfo from "./semesterInfo"

/**
 * Restore the application state from the given JSON.
 * The JSON should be generated using the {@link save} method.
 */
export const restore = (json: any) => {
  for (const key in json) {
    setLocalStorage(key, json[key])
  }
}

/**
 * Store the application state in JSON form.
 * Restoring it with {@link restore} should persist all of the user's courses and application state.
 */
export const save = () => {
  const data: Record<string, any> = {}

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!
    if (
      k.startsWith("Courses") ||
      k.startsWith("Groups") ||
      k.startsWith("Colors") ||
      k.includes("Dib It Serialize") ||
      k === "Semester"
    ) {
      data[k] = getLocalStorage(k)
    }
  }

  return data
}

const DAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"]

export const getICS = (
  semester: string,
  courses: string[],
  courseInfo: Record<string, Course | undefined>
) => {
  const chosenGroups: Record<string, string[]> = getLocalStorage("Groups", {})

  return new Promise((resolve, reject) => {
    const info = semesterInfo[semester]
    const events: ics.EventAttributes[] = []

    for (const courseName of courses) {
      const course = courseInfo[courseName]
      if (!course) {
        continue
      }

      for (const group of course.groups) {
        if (!chosenGroups[courseName].includes(group.group)) {
          continue
        }

        for (const lesson of group.lessons) {
          const [startHourStr, endHourStr] = lesson.time.split("-")
          const startHour = parseInt(startHourStr.split(":")[0], 10)
          const endHour = parseInt(endHourStr.split(":")[0], 10)

          events.push({
            title: `${course.name} (${lesson.ofen_horaa})`,
            description:
              "מרצה: " + group.lecturer + "\nמספר קורס:" + courseName,
            location: `${lesson.building}  ${lesson.room}`,
            start: [
              info.startDate.getFullYear(),
              info.startDate.getMonth() + 1,
              info.startDate.getDate() + DAYS.indexOf(lesson.day),
              startHour,
              0,
            ],
            duration: { hours: endHour - startHour },
            recurrenceRule:
              "FREQ=WEEKLY;UNTIL=" +
              info.endDate
                .toISOString()
                .replaceAll("-", "")
                .replaceAll(":", "")
                .replaceAll(".", "")
                .replace("00Z", "Z"),
          })
        }
      }
    }

    ics.createEvents(events, (error, value) => {
      if (error) {
        reject(error)
      }

      if (value) {
        resolve(value)
      }
    })
  })
}
