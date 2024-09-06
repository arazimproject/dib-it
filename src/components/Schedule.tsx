import { Switch } from "@mantine/core"
import { useColorScheme } from "@mantine/hooks"
import { DaySchedule, ScheduleView, createTheme } from "react-schedule-view/src"
import { useCourseInfo } from "../CourseInfoContext"
import { useLocalStorage } from "../hooks"
import { useDibIt } from "../models"
import { getColor } from "../utilities"

const wideScheduleTheme = createTheme("apple", {
  hourHeight: "85px",
  minorGridlinesPerHour: 1,
  timeFormatter: (hour: number) => hour.toString() + ":00",
})

const compactScheduleTheme = createTheme("apple", {
  hourHeight: "65px",
  minorGridlinesPerHour: 1,
})

const DAY_INDEX: Record<string, number> = {
  א: 5,
  ב: 4,
  ג: 3,
  ד: 2,
  ה: 1,
  ו: 0,
}

const Schedule = () => {
  const courseInfo = useCourseInfo()
  const [compactView, setCompactView] = useLocalStorage<boolean>({
    key: "Compact View",
    defaultValue: false,
  })
  const [dibIt] = useDibIt()
  const colorScheme = useColorScheme()

  const currentCourses = (dibIt.courses ?? {})[dibIt.semester ?? ""] ?? []

  const data: DaySchedule[] = [
    { name: "שישי", events: [] },
    { name: "חמישי", events: [] },
    { name: "רביעי", events: [] },
    { name: "שלישי", events: [] },
    { name: "שני", events: [] },
    { name: "ראשון", events: [] },
  ]

  for (const course of currentCourses) {
    for (const group of course.groups ?? []) {
      const info = courseInfo[course.id]?.groups.find((g) => g.group === group)

      if (info === undefined) {
        continue
      }

      for (const lesson of info.lessons) {
        try {
          const [startHourStr, endHourStr] = lesson.time.split("-")
          const startHour = parseInt(startHourStr.split(":")[0], 10)
          const endHour = parseInt(endHourStr.split(":")[0], 10)
          data[DAY_INDEX[lesson.day]].events.push({
            startTime: startHour,
            endTime: endHour,
            title: `${courseInfo[course.id]?.name} (${lesson.type})`,
            description: `${lesson.building}  ${lesson.room} ${
              info.lecturer !== null ? " (" + info.lecturer + ")" : ""
            }`,
            color: getColor(course),
          })
        } catch (ignored) {}
      }
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "auto",
        overflowY: "clip",
      }}
    >
      <Switch
        className="dont-print"
        mt="xs"
        label={compactView ? "קומפקטי" : "רחב"}
        checked={compactView}
        onChange={(e) => setCompactView(e.currentTarget.checked)}
      />
      <div
        dir="ltr"
        id="schedule-container"
        className={compactView ? "" : "wide"}
        style={{ minWidth: compactView ? undefined : 600, maxWidth: "100%" }}
      >
        <ScheduleView
          darkMode={colorScheme === "dark"}
          theme={compactView ? compactScheduleTheme : wideScheduleTheme}
          daySchedules={data}
          viewStartTime={8}
          viewEndTime={20}
        />
      </div>
    </div>
  )
}

export default Schedule
