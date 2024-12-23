import * as ics from "ics"
import { DibItCourse } from "./models"
import { parseDateString } from "./utilities"
import { cachedFetch } from "./hooks"

const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24

const DAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"]

export const getICS = (
  semester: string,
  courses: DibItCourse[],
  courseInfo: SemesterCourses
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const generalInfo = await cachedFetch<GeneralInfo>(
      "https://arazim-project.com/data/info.json"
    )
    const info = (generalInfo.semesters ?? {})[semester]
    if (!info || !info.startDate || !info.endDate) {
      reject()
      return
    }

    const events: ics.EventAttributes[] = []

    for (const c of courses) {
      const course = courseInfo[c.id]
      if (!course) {
        continue
      }

      for (const exam of course?.exams ?? []) {
        const date = parseDateString(exam.date!)
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

      for (const group of course?.groups ?? []) {
        if (!c.groups?.includes(group.group!)) {
          continue
        }

        for (const lesson of group?.lessons ?? []) {
          if (lesson.time === "") {
            continue
          }

          const [startHourStr, endHourStr] = lesson?.time?.split("-")!
          const startHour = parseInt(startHourStr.split(":")[0], 10)
          const endHour = parseInt(endHourStr.split(":")[0], 10)

          const startDate = new Date(
            new Date(info.startDate).getTime() +
              DAYS.indexOf(lesson.day!) * MILLISECONDS_IN_DAY
          )

          events.push({
            title: `${course.name} (${lesson.type})`,
            description: "מרצה: " + group.lecturer + "\nמספר קורס:" + c.id,
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
              new Date(info.endDate)
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
        const icsWithTimezone = value.replaceAll(
          "DTSTART:",
          "TZID:Asia/Jerusalem\r\nDTSTART:"
        )
        resolve(icsWithTimezone)
      }
    })
  })
}
