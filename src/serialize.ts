import * as ics from "ics"
import { Course } from "./CourseInfoContext"
import { getLocalStorage } from "./hooks"
import semesterInfo from "./semesterInfo"
import { parseDateString } from "./utilities"

const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24

const DAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"]

export const getICS = (
  semester: string,
  courses: string[],
  courseInfo: Record<string, Course | undefined>
): Promise<string> => {
  const chosenGroups: Record<string, string[]> = getLocalStorage("Groups", {})

  return new Promise((resolve, reject) => {
    const info = semesterInfo[semester]
    const events: ics.EventAttributes[] = []

    for (const courseName of courses) {
      const course = courseInfo[courseName]
      if (!course) {
        continue
      }

      for (const exam of course.exams) {
        const date = parseDateString(exam.date)
        if (date === undefined) {
          continue
        }

        events.push({
          title: `${course.name} (מועד ${exam.moed})`,
          start: [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            0,
            0,
          ],
          duration: { hours: 24 },
        })
      }

      for (const group of course.groups) {
        if (
          chosenGroups[courseName] === undefined ||
          !chosenGroups[courseName].includes(group.group)
        ) {
          continue
        }

        for (const lesson of group.lessons) {
          if (lesson.time === "") {
            continue
          }

          const [startHourStr, endHourStr] = lesson.time.split("-")
          const startHour = parseInt(startHourStr.split(":")[0], 10)
          const endHour = parseInt(endHourStr.split(":")[0], 10)

          const startDate = new Date(
            info.startDate.getTime() +
              DAYS.indexOf(lesson.day) * MILLISECONDS_IN_DAY
          )

          events.push({
            title: `${course.name} (${lesson.type})`,
            description:
              "מרצה: " + group.lecturer + "\nמספר קורס:" + courseName,
            location: `${lesson.building} ${lesson.room}`,
            start: [
              startDate.getFullYear(),
              startDate.getMonth() + 1,
              startDate.getDate(),
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
            startInputType: "local",
            endInputType: "local",
            startOutputType: "local",
            endOutputType: "local",
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
