import {
  Autocomplete,
  Button,
  Loader,
  Select,
  Switch,
  Tooltip,
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useEffect, useState } from "react"
import { useCourseInfo } from "../CourseInfoContext"
import { useLocalStorage, useURLValue } from "../hooks"
import { DibItCourse, useDibIt } from "../models"
import { getICS } from "../serialize"
import {
  downloadFile,
  FIRST_SEMESTER,
  formatSemesterInHebrew,
  uploadJson,
} from "../utilities"
import CourseCard from "./CourseCard"
import GoogleSaveButtons from "./GoogleSaveButtons"

const Sidebar = ({ prefetching }: { prefetching: boolean }) => {
  const courseInfo = useCourseInfo()
  const [search, setSearch] = useState("")
  const [compactView, setCompactView] = useLocalStorage<boolean>({
    key: "Sidebar Compact",
    defaultValue: false,
  })
  const [dibIt, setDibIt] = useDibIt()
  const [generalInfo] = useURLValue<GeneralInfo>(
    "https://arazim-project.com/data/info.json"
  )

  let currentCourses: DibItCourse[] = []
  useEffect(() => {
    if (!dibIt.semester) {
      dibIt.semester = generalInfo.currentSemester
    }
    setDibIt({ ...dibIt })
  }, [generalInfo])

  if (!dibIt.semester) {
    return <></>
  }

  if (
    dibIt.semester !== undefined &&
    dibIt.courses !== undefined &&
    dibIt.courses[dibIt.semester] !== undefined
  ) {
    currentCourses = dibIt.courses[dibIt.semester]
  }
  const semester = dibIt.semester

  return (
    <div
      id="sidebar"
      className="dont-print"
      style={{
        flex: "none",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        padding: 10,
        transition: "300ms ease-in-out",
      }}
    >
      {prefetching && (
        <p style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <Loader size="sm" ml="xs" /> טוען מראש את כל הקורסים כדי להאיץ את
          החיפוש...
        </p>
      )}
      <Select
        mb={10}
        value={semester}
        onChange={(v) => {
          if (v) {
            dibIt.semester = v
            setDibIt({ ...dibIt })
          }
        }}
        data={Object.keys(generalInfo.semesters ?? {})
          .sort()
          .filter((semester) => semester >= FIRST_SEMESTER)
          .map((key) => ({
            value: key,
            label: formatSemesterInHebrew(key),
          }))}
        label="סמסטר"
        leftSection={<i className="fa-solid fa-cloud-moon" />}
      />

      <GoogleSaveButtons />

      <Button.Group mb={10} style={{ width: "100%" }}>
        <Tooltip label="הורידו קובץ JSON שמכיל את כל המערכות שלכם">
          <Button
            style={{ width: "50%" }}
            leftSection={<i className="fa-solid fa-download" />}
            onClick={() =>
              downloadFile(
                "dibit.json",
                "data:text/json;charset=utf-8," +
                  encodeURIComponent(JSON.stringify(dibIt))
              )
            }
          >
            גיבוי
          </Button>
        </Tooltip>
        <Button
          style={{ width: "50%" }}
          leftSection={<i className="fa-solid fa-upload" />}
          onClick={async () => {
            const state = await uploadJson()
            setDibIt(state)
          }}
        >
          שחזור
        </Button>
      </Button.Group>

      <Button
        fullWidth
        leftSection={<i className="fa-solid fa-calendar" />}
        color="blue"
        style={{ flex: "none" }}
        onClick={async () => {
          const ics = await getICS(semester, currentCourses, courseInfo)
          downloadFile(
            "calendar.ics",
            "data:text/calendar;charset=utf-8," + encodeURIComponent(ics)
          )
          notifications.show({
            title: "הייצוא הושלם בהצלחה",
            message:
              "כעת עליכם לבצע ייבוא לקובץ ה-ICS שהורד. לחצו כאן כדי לפתוח את חלון הייבוא של Google Calendar.",
            style: { direction: "rtl" },
            icon: <i className="fa-solid fa-check" />,
            color: "green",
            styles: { body: { cursor: "pointer" } },
            onClick: () => {
              window.open(
                "https://calendar.google.com/calendar/u/0/r/settings/export",
                "_blank"
              )
            },
          })
        }}
      >
        ייצוא ל-Apple/Google Calendar
      </Button>
      <Button
        mt="xs"
        fullWidth
        leftSection={<i className="fa-solid fa-print" />}
        color="violet"
        style={{ flex: "none" }}
        onClick={window.print}
      >
        הדפסה/שמירה כ-PDF
      </Button>

      <Autocomplete
        size="md"
        mt={10}
        mb={10}
        value={search}
        onChange={(courseName) => {
          const split = courseName.split("(")
          if (split.length < 2) {
            setSearch(courseName)
            return
          }
          const courseId = split[split.length - 1].split(")")[0]
          if (courseInfo[courseId] !== undefined) {
            setSearch("")
            if (!dibIt.courses) {
              dibIt.courses = {}
            }
            if (!dibIt.courses[semester]) {
              dibIt.courses[semester] = []
            }
            dibIt.courses[semester].push({ id: courseId })
            setDibIt({ ...dibIt })
          } else {
            setSearch(courseName)
          }
        }}
        data={Object.keys(courseInfo)
          .filter((id) => !currentCourses.some((course) => course.id === id))
          .map((courseId) => `${courseInfo[courseId]?.name} (${courseId})`)
          .sort()}
        leftSection={<i className="fa-solid fa-search" />}
        placeholder="חיפוש קורסים להוספה"
        limit={20}
        maxDropdownHeight={300}
      />

      <Switch
        mb="xs"
        label={compactView ? "תצוגה קומפקטית" : "תצוגה מלאה"}
        checked={compactView}
        onChange={(e) => setCompactView(e.currentTarget.checked)}
      />

      {currentCourses.map((_, index) => (
        <CourseCard
          key={index}
          index={index}
          semester={semester}
          compactView={compactView}
        />
      ))}
    </div>
  )
}

export default Sidebar
