import "@fortawesome/fontawesome-free/css/all.min.css"
import { Button, MantineProvider } from "@mantine/core"
import { useColorScheme } from "@mantine/hooks"
import React from "react"
import ReactDOM from "react-dom/client"
import { ErrorBoundary, FallbackProps } from "react-error-boundary"
import App from "./App.tsx"
import "./index.css"

import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import { notifications } from "@mantine/notifications"
import "@mantine/notifications/styles.css"
import { getLocalStorage } from "./hooks.ts"
import { DibIt, DibItCourse, getDibIt, setDibIt } from "./models.ts"
import { currentSemester } from "./semesterInfo.tsx"

const handleDeprecation = () => {
  // Remove "Cached Courses for {semester}", they weigh too much to be in local storage.
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) {
      continue
    }

    if (key.startsWith("Cached Courses for")) {
      keysToRemove.push(key)
    }
  }

  for (const key of keysToRemove) {
    localStorage.removeItem(key)
  }

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

  if (Object.keys(data).some((x) => x.startsWith("Courses"))) {
    const result: DibIt = {}
    let semester = ""
    if (data["Semester"]) {
      semester = result.semester = data["Semester"]
      delete data["Semester"]
    }
    if (data["Courses"]) {
      data[`Courses ${semester}`] = data["Courses"]
      delete data["Courses"]
    }
    if (data["Groups"]) {
      data[`Groups ${semester}`] = data["Groups"]
      delete data["Groups"]
    }
    if (data["Colors"]) {
      data[`Colors ${semester}`] = data["Colors"]
      delete data["Colors"]
    }
    if (data["School (Dib It Serialize)"]) {
      result.school = data["School (Dib It Serialize)"]
    }
    if (data["Study Plan (Dib It Serialize)"]) {
      result.studyPlan = data["Study Plan (Dib It Serialize)"]
    }

    const keys = Object.keys(data).sort()
    for (const key of keys) {
      if (key.startsWith("Courses")) {
        const semester = key.split(" ")[1]
        const courses = data[key]
        const groupsKey = `Groups ${semester}`
        let groups: any = {}
        if (data[groupsKey]) {
          groups = data[groupsKey]
        }
        const colorsKey = `Colors ${semester}`
        let colors: any = {}
        if (data[colorsKey]) {
          colors = data[colorsKey]
        }

        if (!result.courses) {
          result.courses = {}
        }

        if (!result.courses[semester]) {
          result.courses[semester] = []
        }

        for (const course of courses) {
          const courseDict: DibItCourse = { id: course }
          result.courses[semester].push(courseDict)
          if (groups[course]) {
            courseDict.groups = groups[course]
          }
          if (colors[course]) {
            courseDict.color = colors[course]
          }
        }
      }
    }

    localStorage.clear()
    setDibIt({ ...result })
    notifications.show({
      title: "עדכון ה-Dib It בוצע בהצלחה",
      message:
        "המערכת שלכם שודרגה לפורמט חדש ותתאים לפיצ׳רים חדשים שאנחנו עובדים עליהם!",
      style: { direction: "rtl" },
      icon: <i className="fa-solid fa-check" />,
      color: "green",
    })
  }
}

const initialize = () => {
  const dibIt = getDibIt()
  if (!dibIt.semester) {
    dibIt.semester = currentSemester
    setDibIt(dibIt)
  }
}

handleDeprecation()
initialize()

const ErrorFallback: React.FC<FallbackProps> = ({ error }) => {
  const colorScheme = useColorScheme()

  const ls: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!
    if (key !== "All Courses") {
      ls[key] = localStorage.getItem(key)!
    }
  }

  return (
    <MantineProvider
      forceColorScheme={colorScheme}
      theme={{
        primaryColor: "cyan",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <h1>
          שלום! <i className="fa-solid fa-face-sad-tear" />
        </h1>
        <p>
          לצערנו אירעה שגיאה באתר. יש לכם את כפתור המחץ שכנראה יפתור לכם את
          הבעייה, אבל הוא גם ימחק את כל המערכות ששמורות לכם לצערנו.
        </p>
        <Button
          my={10}
          color="red"
          leftSection={<i className="fa-solid fa-wrench" />}
          onClick={() => {
            localStorage.clear()
            window.location.reload()
          }}
        >
          כפתור המחץ
        </Button>
        <p>
          נשמח לנסות לעזור לכם לתקן את הבעייה - אתם מוזמנים לשלוח לנו את התוכן
          הבא{" "}
          <a className="link handle text-accent" href="/contact-us">
            כאן
          </a>{" "}
          ונשתדל לעזור לכם לתקן את הבעייה בהקדם!
        </p>
        <code
          style={{
            maxHeight: 200,
            maxWidth: 500,
            overflow: "auto",
            marginBottom: 10,
            borderColor: "lightgray",
            borderStyle: "solid",
            borderRadius: 10,
            paddingLeft: 10,
            paddingRight: 10,
            marginTop: 10,
          }}
          dir="ltr"
        >
          <pre>{JSON.stringify(ls, null, 4)}</pre>
        </code>
        {error?.message && (
          <p style={{ marginBottom: 10 }}>
            תוכן השגיאה: <code>{error.message}</code>
          </p>
        )}
        <p>
          אתם יכולים גם לשמור את זה אצלכם ולנסות לשחזר מזה את המידע שלכם. אנו
          מתנצלים על התקלה.
        </p>
      </div>
    </MantineProvider>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
