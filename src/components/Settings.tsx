import { Button, Select, Switch } from "@mantine/core"
import { useLocalStorage } from "../hooks"
import { useDibIt } from "../models"
import { Dropzone } from "@mantine/dropzone"

const Settings = () => {
  const [dibIt, setDibIt] = useDibIt()
  const [compactView, setCompactView] = useLocalStorage<boolean>({
    key: "Compact View",
    defaultValue: false,
  })

  return (
    <div style={{ maxWidth: 600, marginBottom: 20 }}>
      <p>תצוגת מערכת</p>
      <Switch
        label={compactView ? "קומפקטי" : "רחב"}
        checked={compactView}
        onChange={(e) => setCompactView(e.currentTarget.checked)}
      />
      <Select
        mt="xs"
        label="עיצוב"
        leftSection={<i className="fa-solid fa-palette" />}
        data={[
          { label: "גוגל", value: "google" },
          { label: "אפל", value: "apple" },
        ]}
        value={dibIt.theme ?? "apple"}
        onChange={(v) => {
          dibIt.theme = v ?? "apple"
          setDibIt({ ...dibIt })
        }}
      />
      <Dropzone
        onDrop={async (files) => {
          for (const file of files) {
            const text = await file.text()
            const data = JSON.parse(text)
            if (!dibIt.customCourses) {
              dibIt.customCourses = {}
            }
            dibIt.customCourses[file.name] = data
            setDibIt({ ...dibIt })
          }
        }}
        my="xs"
        accept={["application/json"]}
      >
        <p>
          <i
            className="fa-solid fa-file-lines"
            style={{ marginInlineEnd: 10 }}
          />
          גררו לכאן קובץ של קורסים מיוחדים שלכם או לחצו...
        </p>
      </Dropzone>
      {Object.keys(dibIt.customCourses ?? {}).map((filename) => (
        <Button
          color="red"
          key={filename}
          mb={5}
          ml={5}
          rightSection={<i className="fa-solid fa-trash" />}
          onClick={() => {
            delete dibIt.customCourses![filename]
            setDibIt({ ...dibIt })
          }}
        >
          {filename}
        </Button>
      ))}
    </div>
  )
}

export default Settings
