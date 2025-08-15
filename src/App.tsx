import { Button, Loader, MantineProvider } from "@mantine/core"
import { useColorScheme } from "@mantine/hooks"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"
import { useEffect, useState } from "react"
import CourseInfoContext from "./CourseInfoContext"
import Exams from "./components/Exams"
import Footer from "./components/Footer"
import Guide from "./components/Guide"
import Header from "./components/Header"
import Practice from "./components/Practice"
import Schedule from "./components/Schedule"
import Settings from "./components/Settings"
import Sidebar from "./components/Sidebar"
import StudyPlan from "./components/StudyPlan"
import { cachedFetch } from "./hooks"
import { DibIt, useDibIt } from "./models"
import { FIRST_SEMESTER } from "./utilities"

const sumHours = (courses: SemesterCourses, dibIt: DibIt) => {
  let hours = 0
  for (const course of (dibIt.courses ?? {})[dibIt.semester ?? ""] ?? []) {
    for (const group of course.groups ?? []) {
      const info = courses[course.id]?.groups?.find((g) => g.group === group)

      if (info === undefined) {
        continue
      }

      for (const lesson of info?.lessons ?? []) {
        try {
          const [startHourStr, endHourStr] = lesson?.time?.split("-")!
          const startHour = parseInt(startHourStr.split(":")[0], 10)
          const endHour = parseInt(endHourStr.split(":")[0], 10)
          hours += endHour - startHour
        } catch (ignored) {}
      }
    }
  }
  return hours
}

const startDateString = `date=${encodeURIComponent(new Date().toDateString())}`

const App = () => {
  const colorScheme = useColorScheme()
  const [dibIt, setDibIt] = useDibIt()
  const [courses, setCourses] = useState<SemesterCourses>({}) // this is tau-tools scraped jsons from arazim project website
  const [prefetching, setPrefetching] = useState(false)

  const hours = sumHours(courses, dibIt)

  useEffect(() => {
    if (dibIt.semester) {
      setCourses({})
      cachedFetch<SemesterCourses>(
        `https://arazim-project.com/data/courses-${dibIt.semester}.json?${startDateString}`
      )
        .then(async (result) => {
          for (const customCourse of Object.values(dibIt.customCourses ?? {})) {
            result = { ...result, ...customCourse }
          }
          setCourses(result)

          setPrefetching(true)
          const generalInfo = await cachedFetch<GeneralInfo>(
            "https://arazim-project.com/data/info.json"
          )
          const prefetches: Promise<any>[] = []
          for (const semester of Object.keys(generalInfo.semesters ?? {})
            .sort()
            .filter((semester) => semester >= FIRST_SEMESTER)) {
            prefetches.push(
              cachedFetch<SemesterCourses>(
                `https://arazim-project.com/data/courses-${semester}.json?${startDateString}`
              )
            )
          }
          try {
            await Promise.all(prefetches)
          } finally {
            setPrefetching(false)
          }
        })
        .catch(() => {})
    }
  }, [dibIt.semester])

  const tab = dibIt.tab ?? "schedule"

  return (
    <MantineProvider
      forceColorScheme={colorScheme}
      theme={{
        primaryColor: "cyan",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      }}
    >
      <ModalsProvider>
        <Notifications />

        <CourseInfoContext.Provider value={courses}>
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
                <Sidebar prefetching={prefetching} />
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
                      style={{ maxWidth: "100%", overflow: "auto" }}
                    >
                      <Button
                        flex="none"
                        className="dont-print"
                        size="md"
                        variant={tab === "schedule" ? "light" : "subtle"}
                        leftSection={<i className="fa-solid fa-calendar" />}
                        onClick={() => setDibIt({ ...dibIt, tab: "schedule" })}
                      >
                        מערכת
                      </Button>
                      <Button
                        flex="none"
                        className="dont-print"
                        size="md"
                        variant={tab === "exams" ? "light" : "subtle"}
                        leftSection={<i className="fa-solid fa-list-check" />}
                        onClick={() => setDibIt({ ...dibIt, tab: "exams" })}
                      >
                        מבחנים
                      </Button>
                      <Button
                        flex="none"
                        className="dont-print"
                        size="md"
                        variant={tab === "study-plan" ? "light" : "subtle"}
                        leftSection={<i className="fa-solid fa-table-list" />}
                        onClick={() =>
                          setDibIt({ ...dibIt, tab: "study-plan" })
                        }
                      >
                        תוכנית
                      </Button>
                      <Button
                        flex="none"
                        className="dont-print"
                        size="md"
                        variant={tab === "practice" ? "light" : "subtle"}
                        leftSection={
                          <i className="fa-solid fa-graduation-cap" />
                        }
                        onClick={() => setDibIt({ ...dibIt, tab: "practice" })}
                      >
                        תרגול מבחנים
                      </Button>
                      <Button
                        flex="none"
                        className="dont-print"
                        size="md"
                        variant={tab === "guide" ? "light" : "subtle"}
                        leftSection={<i className="fa-solid fa-info-circle" />}
                        onClick={() => setDibIt({ ...dibIt, tab: "guide" })}
                      >
                        מדריך
                      </Button>
                      <Button
                        flex="none"
                        className="dont-print"
                        size="md"
                        variant={tab === "settings" ? "light" : "subtle"}
                        leftSection={<i className="fa-solid fa-gears" />}
                        onClick={() => setDibIt({ ...dibIt, tab: "settings" })}
                      >
                        הגדרות
                      </Button>
                    </Button.Group>
                    <div style={{ flexGrow: 1 }} />
                    <p style={{ fontSize: 22 }}>שעות: {hours}</p>
                  </div>
                  <div>
                    {tab === "schedule" && <Schedule />}
                    {tab === "exams" && <Exams />}
                    {tab === "study-plan" && <StudyPlan />}
                    {tab === "settings" && <Settings />}
                    {tab === "guide" && <Guide />}
                    {tab === "practice" && <Practice />}
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
        </CourseInfoContext.Provider>
      </ModalsProvider>
    </MantineProvider>
  )
}

export default App
