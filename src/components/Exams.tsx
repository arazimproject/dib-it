import { Tooltip } from "@mantine/core"
import { Calendar } from "@mantine/dates"
import React from "react"
import { useCourseInfo } from "../CourseInfoContext"
import { useLocalStorage } from "../hooks"
import { MILLISECONDS_IN_DAY, getColor, parseDateString } from "../utilities"

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]

const stringifyDate = (d: Date) => {
  return d.getDate() + "/" + (d.getMonth() + 1)
}

const Exams = () => {
  const courseInfo = useCourseInfo()
  let [courses] = useLocalStorage<string[]>({
    key: "Courses",
    defaultValue: [],
  })

  if (courses.length === undefined) {
    courses = []
  }

  useLocalStorage<Record<string, string>>({
    key: "Colors",
    defaultValue: {},
  })

  const examDates: {
    courseId: string
    date: Date
    moed: string
    type: string
  }[] = []
  const dateToExams: Record<
    string,
    {
      courseId: string
      date: Date
      moed: string
      type: string
    }[]
  > = {}

  for (const courseId of courses) {
    for (const date of courseInfo[courseId]?.exam_dates ?? []) {
      const parsedDate = parseDateString(date.date)
      if (parsedDate === undefined) {
        continue
      }
      examDates.push({
        courseId,
        date: parsedDate,
        type: date.type,
        moed: date.moed,
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
        {examDates.map(({ courseId, date, moed }) => (
          <p key={courseId + date + moed}>
            {date.toLocaleString("he").split(",")[0]} ({DAYS[date.getDay()]})
            מועד {moed}' ב-
            <span style={{ color: getColor(courseId) }}>
              {courseInfo[courseId]?.name}
            </span>
          </p>
        ))}

        <h3 style={{ marginTop: 10, marginBottom: 10 }}>הפרשים</h3>
        <div dir="ltr">
          {examDates.map(({ courseId, date, moed }, index) => (
            <React.Fragment key={index}>
              <Tooltip label={courseInfo[courseId]?.name}>
                <div
                  key={index}
                  style={{
                    backgroundColor: getColor(courseId),
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
                      moed === "א" && examDates[index + 1]?.moed === "ב"
                        ? 10
                        : undefined,
                    marginLeft:
                      moed === "א" && examDates[index + 1]?.moed === "ב"
                        ? 10
                        : undefined,
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
        dir="ltr"
        firstDayOfWeek={0}
        weekendDays={[]}
        static
        maxLevel="month"
        defaultDate={firstExam}
        minDate={firstExam}
        maxDate={lastExam}
        renderDay={(date) => {
          const day = date.getDate()
          const exams = dateToExams[date.toDateString()]
          if (exams !== undefined) {
            if (exams.length > 1) {
              return (
                <Tooltip
                  label={
                    "התנגשות בין " +
                    exams.map((e) => courseInfo[e.courseId]?.name).join(", ")
                  }
                >
                  <div style={{ color: "red" }}>{day}</div>
                </Tooltip>
              )
            } else {
              return (
                <Tooltip
                  label={`${courseInfo[exams[0].courseId]?.name} (מועד ${
                    exams[0].moed
                  })`}
                >
                  <div
                    style={{
                      color: getColor(exams[0].courseId),
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
