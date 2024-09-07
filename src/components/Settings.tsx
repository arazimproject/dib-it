import { Select } from "@mantine/core"
import { useDibIt } from "../models"

const Settings = () => {
  const [dibIt, setDibIt] = useDibIt()

  return (
    <div style={{ maxWidth: 600 }}>
      <Select
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
