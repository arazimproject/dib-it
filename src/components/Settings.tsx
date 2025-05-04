import { Select, Switch } from "@mantine/core"
import { useLocalStorage } from "../hooks"
import { useDibIt } from "../models"

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
    </div>
  )
}

export default Settings
