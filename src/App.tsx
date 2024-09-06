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
import { DibIt, useDibIt } from "./models"

const sumHours = (courses: Record<string, Course>, dibIt: DibIt) => {
  let hours = 0
  for (const course of (dibIt.courses ?? {})[dibIt.semester ?? ""] ?? []) {
    for (const group of course.groups ?? []) {
      const info = courses[course.id]?.groups.find((g) => g.group === group)

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
  const [dibIt] = useDibIt()
  const [tab, setTab] = useState("schedule")
  const [courses, setCourses] = useState<Record<string, Course>>({}) // this is tau-tools scraped jsons from arazim project website

  const hours = sumHours(courses, dibIt)

  useEffect(() => {
    if (dibIt.semester) {
      setCourses({})
      fetch(
        `https://arazim-project.com/courses/courses-${
          dibIt.semester
        }.json?date=${encodeURIComponent(new Date().toDateString())}`
      )
        .then((r) => r.json())
        .then((result) => {
          setCourses(result)
        })
        .catch(() => {})
    }
  }, [dibIt.semester])

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
              <Sidebar />
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
