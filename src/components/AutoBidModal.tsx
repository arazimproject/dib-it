import {
  ActionIcon,
  Button,
  Checkbox,
  NumberInput,
  TextInput,
} from "@mantine/core"
import { useEffect, useState } from "react"
import autoBid, { getPossibleFaculties } from "../autoBid"
import { cachedFetch, useLocalStorage } from "../hooks"
import { DibItCourse } from "../models"

const AutoBidModal = ({ courses }: { courses: DibItCourse[] }) => {
  const [facultyPoints, setFacultyPoints] = useLocalStorage<
    { faculty: string; points?: number }[]
  >({ key: "Auto Bid Faculty Points", defaultValue: [] })
  const [loading, setLoading] = useState(false)
  const [possibleFaculties, setPossibleFaculties] = useLocalStorage<
    Record<string, string[]>
  >({ key: "Auto Bid Possible Faculties", defaultValue: {} })
  const [results, setResults] = useState<
    Record<string, Record<string, number>>
  >({})

  const existingFaculties = facultyPoints
    .filter((p) => p.points)
    .map((p) => p.faculty)

  useEffect(() => {
    setPossibleFaculties({})
    setResults({})
  }, [facultyPoints])

  return (
    <>
      {facultyPoints.map(({ faculty, points }, index) => (
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 10 }}
          key={index}
        >
          <TextInput
            placeholder="מסלול"
            value={faculty}
            onChange={(e) => {
              facultyPoints[index].faculty = e.currentTarget.value
              setFacultyPoints([...facultyPoints])
            }}
          />
          <span style={{ flexGrow: 1 }} />
          <NumberInput
            mr={5}
            placeholder="נקודות"
            value={points}
            min={0}
            onChange={(v) => {
              facultyPoints[index].points =
                typeof v === "number" ? v : undefined
              setFacultyPoints([...facultyPoints])
            }}
          />
          <ActionIcon
            color="red"
            variant="subtle"
            mr={5}
            onClick={() => {
              facultyPoints.splice(index, 1)
              setFacultyPoints([...facultyPoints])
            }}
          >
            <i className="fa-solid fa-trash" />
          </ActionIcon>
        </div>
      ))}
      <Button
        fullWidth
        leftSection={<i className="fa-solid fa-plus" />}
        onClick={() => setFacultyPoints([...facultyPoints, { faculty: "" }])}
        mb="xs"
      >
        הוספת מסלול בבידינג
      </Button>

      {Object.keys(possibleFaculties)
        .sort()
        .map((courseId, index) => (
          <div
            key={index}
            style={{ marginTop: 5, display: "flex", alignItems: "center" }}
          >
            <span>{courseId}</span>
            {existingFaculties.map((faculty, facultyIndex) => (
              <Checkbox
                mr="auto"
                label={faculty}
                display="inline-block"
                key={facultyIndex}
                checked={possibleFaculties[courseId].includes(faculty)}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    possibleFaculties[courseId].push(faculty)
                  } else {
                    possibleFaculties[courseId] = possibleFaculties[
                      courseId
                    ].filter((x) => x !== faculty)
                  }
                  setPossibleFaculties({ ...possibleFaculties })
                }}
              />
            ))}
          </div>
        ))}

      <Button
        variant="gradient"
        gradient={{ from: "blue", to: "grape", deg: 90 }}
        loading={loading}
        fullWidth
        mt="xs"
        leftSection={<i className="fa-solid fa-wand-magic-sparkles" />}
        onClick={async () => {
          setLoading(true)
          const allTimeBiddingInfo = await cachedFetch<AllTimeBiddingInfo>(
            "https://arazim-project.com/data/bidding.json"
          )
          let newPossibleFaculties
          if (Object.keys(possibleFaculties).length === 0) {
            newPossibleFaculties = await getPossibleFaculties(
              courses,
              facultyPoints,
              allTimeBiddingInfo
            )
            setPossibleFaculties(newPossibleFaculties)
          } else {
            newPossibleFaculties = possibleFaculties
          }
          setResults(
            await autoBid(
              courses,
              facultyPoints,
              newPossibleFaculties,
              allTimeBiddingInfo
            )
          )
          setLoading(false)
        }}
      >
        חישוב המלצות (2, 3 - שג׳ר!)
      </Button>
      {Object.keys(results)
        .sort()
        .map((faculty, facultyIndex) => (
          <div key={facultyIndex} style={{ marginTop: 10, whiteSpace: "pre" }}>
            <h3>מסלול: {faculty}</h3>
            {Object.keys(results[faculty])
              .map((course) => `${course}: ${results[faculty][course]} נקודות`)
              .join("\n")}
          </div>
        ))}
    </>
  )
}

export default AutoBidModal
