import { Tooltip } from "@mantine/core"
import { Calendar } from "@mantine/dates"
import React from "react"
import { useCourseInfo } from "../CourseInfoContext"
import { DibItCourse, useDibIt } from "../models"
import { MILLISECONDS_IN_DAY, getColor, parseDateString } from "../utilities"

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]
const DAY_LETTERS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"]
const MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
]

const stringifyDate = (d: Date) => {
  return d.getDate() + "/" + (d.getMonth() + 1)
}

const Exams = () => {
  const courseInfo = useCourseInfo()
  const [dibIt] = useDibIt()

  const currentCourses = (dibIt.courses ?? {})[dibIt.semester ?? ""] ?? []

  const examDates: {
    course: DibItCourse
    date: Date
    moed: string
    type: string
  }[] = []
  const dateToExams: Record<
    string,
    {
      course: DibItCourse
      date: Date
      moed: string
      type: string
    }[]
  > = {}

  for (const course of currentCourses) {
    for (const date of courseInfo[course.id]?.exams ?? []) {
      const parsedDate = parseDateString(date.date!)
      if (parsedDate === undefined) {
        continue
      }
      examDates.push({
        course,
        date: parsedDate,
        type: date.type!,
        moed: date.moed!,
      })
      if (dateToExams[parsedDate.toDateString()] === undefined) {
        dateToExams[parsedDate.toDateString()] = []
      }
      dateToExams[parsedDate.toDateString()].push(
        examDates[examDates.length - 1]
      )
    }
  }
  examDates.sort((a, b) => {
    return a.date.toISOString().localeCompare(b.date.toISOString())
  })
  const firstExam = examDates.length > 0 ? examDates[0].date : undefined
  const lastExam =
    examDates.length > 0 ? examDates[examDates.length - 1].date : undefined

  if (!firstExam) {
    return <></>
  }

  return (
    <div
      className="adaptive-flex"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        {examDates.map(({ course, date, moed }) => (
          <p key={course.id + date + moed}>
            {date.toLocaleString("he").split(",")[0]} ({DAYS[date.getDay()]})
            מועד {moed}' ב-
            <span style={{ color: getColor(course) }}>
              {courseInfo[course.id]?.name}
            </span>
          </p>
        ))}
        <h3 style={{ marginTop: 10, marginBottom: 10 }}>הפרשי ימים</h3>
        <div dir="ltr">
          {examDates.map(({ course, date, moed }, index) => (
            <React.Fragment key={index}>
              <Tooltip label={courseInfo[course.id]?.name}>
                <div
                  key={index}
                  style={{
                    backgroundColor: getColor(course),
                    display: "inline-block",
                    padding: 5,
                    paddingRight: 10,
                    paddingLeft: 10,
                    borderRadius: 10,
                  }}
                >
                  {index === 0
                    ? stringifyDate(date)
                    : Math.round(
                        (date.getTime() - examDates[index - 1].date.getTime()) /
                          MILLISECONDS_IN_DAY
                      )}
                </div>
              </Tooltip>

              {index !== examDates.length - 1 && (
                <span
                  style={{
                    marginRight:
                      moed !== examDates[index + 1]?.moed ? 10 : undefined,
                    marginLeft:
                      moed !== examDates[index + 1]?.moed ? 10 : undefined,
                  }}
                >
                  →
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <Calendar
        firstDayOfWeek={0}
        weekendDays={[]}
        static
        maxLevel="month"
        defaultDate={firstExam}
        minDate={firstExam}
        maxDate={lastExam}
        monthLabelFormat={(m) =>
          `${MONTHS[new Date(m).getMonth()]} ${new Date(m).getFullYear()}`
        }
        weekdayFormat={(d) => DAY_LETTERS[new Date(d).getDay()] + "'"}
        renderDay={(d) => {
          const date = new Date(d)
          const day = date.getDate()
          const exams = dateToExams[date.toDateString()]
          if (exams !== undefined) {
            if (exams.length > 1) {
              return (
                <Tooltip
                  label={
                    "התנגשות בין " +
                    exams.map((e) => courseInfo[e.course.id]?.name).join(", ")
                  }
                >
                  <div
                    style={{
                      border: "3px solid red",
                      width: 30,
                      height: 30,
                      textAlign: "center",
                      padding: 2,
                      borderRadius: 5,
                    }}
                  >
                    {day}
                  </div>
                </Tooltip>
              )
            } else {
              return (
                <Tooltip
                  label={`${courseInfo[exams[0].course.id]?.name} (מועד ${
                    exams[0].moed
                  })`}
                >
                  <div
                    style={{
                      backgroundColor: getColor(exams[0].course),
                      color: "white",
                      width: 30,
                      height: 30,
                      textAlign: "center",
                      padding: 5,
                      borderRadius: 5,
                    }}
                  >
                    {day}
                  </div>
                </Tooltip>
              )
            }
          }

          return <div>{day}</div>
        }}
      />
    </div>
  )
}

export default Exams
