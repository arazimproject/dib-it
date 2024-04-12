import "@fortawesome/fontawesome-free/css/all.min.css"
import { Button, MantineProvider } from "@mantine/core"
import { useColorScheme } from "@mantine/hooks"
import React from "react"
import ReactDOM from "react-dom/client"
import { ErrorBoundary, FallbackProps } from "react-error-boundary"
import App from "./App.tsx"
import "./index.css"

import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/dates/styles.css"

const ErrorFallback: React.FC<FallbackProps> = () => {
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
        <p>אם יש לכם קשר כלשהו למפתחים, אנא העבירו את זה אליהם:</p>
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
          }}
          dir="ltr"
        >
          <pre>{JSON.stringify(ls, null, 4)}</pre>
        </code>
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
