import { Button, Loader, MantineProvider } from "@mantine/core"
import { useColorScheme } from "@mantine/hooks"
import { Notifications } from "@mantine/notifications"
import { useEffect, useState } from "react"
import CourseContext, { Course } from "./CourseInfoContext"
import Exams from "./components/Exams"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Schedule from "./components/Schedule"
import Sidebar from "./components/Sidebar"
import StudyPlan from "./components/StudyPlan"
import { getLocalStorage, setLocalStorage, useLocalStorage } from "./hooks"
import { currentSemester } from "./semesterInfo"

const switchSemesterLocalStorage = (
  oldSemester: string,
  newSemester: string
) => {
  setLocalStorage("Courses " + oldSemester, getLocalStorage("Courses"))
  setLocalStorage("Groups " + oldSemester, getLocalStorage("Groups"))
  setLocalStorage("Colors " + oldSemester, getLocalStorage("Colors"))
  let courses = getLocalStorage("Courses " + newSemester, [])
  if (courses.length === undefined) {
    courses = []
  }
  setLocalStorage("Courses", courses)
  setLocalStorage("Groups", getLocalStorage("Groups " + newSemester))
  setLocalStorage("Colors", getLocalStorage("Colors " + newSemester))
}

const sumHours = (
  courses: Record<string, Course>,
  chosenGroups: Record<string, string[]>
) => {
  let hours = 0
  for (const course in chosenGroups) {
    for (const group of chosenGroups[course]) {
      const info = courses[course]?.groups.find((g) => g.group === group)

      if (info === undefined) {
        continue
      }

      for (const lesson of info.lessons) {
        try {
          const [startHourStr, endHourStr] = lesson.time.split("-")
          const startHour = parseInt(startHourStr.split(":")[0], 10)
          const endHour = parseInt(endHourStr.split(":")[0], 10)
          hours += endHour - startHour
        } catch (ignored) {}
      }
    }
  }
  return hours
}

const App = () => {
  const colorScheme = useColorScheme()

  const [tab, setTab] = useState("schedule")
  const [courses, setCourses] = useState<Record<string, Course>>({})
  const [semester, setSemester] = useLocalStorage<string>({
    key: "Semester",
    defaultValue: currentSemester,
  })
  const [chosenGroups] = useLocalStorage<Record<string, string[]>>({
    key: "Groups",
    defaultValue: {},
  })

  const hours = sumHours(courses, chosenGroups)

  useEffect(() => {
    if (semester) {
      const localStorageKey = "Cached Courses for " + semester
      setCourses(getLocalStorage(localStorageKey))
      fetch(
        `https://arazim-project.com/courses/${semester}.json?date=${encodeURIComponent(
          new Date().toDateString()
        )}`
      )
        .then((r) => r.json())
        .then((result) => {
          setCourses(result)
          setLocalStorage(localStorageKey, result)
        })
        .catch(() => {})
    }
  }, [semester])

  return (
    <MantineProvider
      forceColorScheme={colorScheme}
      theme={{
        primaryColor: "cyan",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      }}
    >
      <Notifications />

      <CourseContext.Provider value={courses}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Header />
          {Object.keys(courses).length !== 0 && (
            <div
              id="main"
              style={{
                flexGrow: 1,
                overflowY: "auto",
                display: "flex",
                width: "calc(100% - 20px)",
              }}
            >
              <Sidebar
                semester={semester}
                setSemester={(newSemester) => {
                  setSemester(newSemester)
                  switchSemesterLocalStorage(semester, newSemester)
                }}
              />
              <div id="content">
                <div
                  className="adaptive-flex"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <Button.Group
                    style={{ maxWidth: "100%", overflow: "hidden" }}
                  >
                    <Button
                      className="dont-print"
                      size="md"
                      variant={tab === "schedule" ? "light" : "subtle"}
                      leftSection={<i className="fa-solid fa-calendar" />}
                      onClick={() => setTab("schedule")}
                    >
                      מערכת
                    </Button>
                    <Button
                      className="dont-print"
                      size="md"
                      variant={tab === "exams" ? "light" : "subtle"}
                      leftSection={<i className="fa-solid fa-list-check" />}
                      onClick={() => setTab("exams")}
                    >
                      מבחנים
                    </Button>
                    <Button
                      className="dont-print"
                      size="md"
                      variant={tab === "study-plan" ? "light" : "subtle"}
                      leftSection={<i className="fa-solid fa-table-list" />}
                      onClick={() => setTab("study-plan")}
                    >
                      תוכנית
                    </Button>
                  </Button.Group>
                  <div style={{ flexGrow: 1 }} />
                  <p style={{ fontSize: 22 }}>שעות: {hours}</p>
                </div>
                <div>
                  {tab === "schedule" && <Schedule />}
                  {tab === "exams" && <Exams />}
                  {tab === "study-plan" && <StudyPlan />}
                </div>
              </div>
            </div>
          )}

          {Object.keys(courses).length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <p>טוען את הקורסים של הסמסטר...</p>
              <Loader mt={10} />
            </div>
          )}
          <Footer />
        </div>
      </CourseContext.Provider>
    </MantineProvider>
  )
}

export default App
