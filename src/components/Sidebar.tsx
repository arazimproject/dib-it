import { Autocomplete, Button, Select } from "@mantine/core"
import { useState } from "react"
import { useCourseInfo } from "../CourseInfoContext"
import { useLocalStorage } from "../hooks"
import semesterInfo from "../semesterInfo"
import { getICS, restore, save } from "../serialize"
import { downloadFile, uploadJson } from "../utilities"
import CourseCard from "./CourseCard"
import GoogleSaveButtons from "./GoogleSaveButtons"
import plansRaw from "./plans.json"
const plans: Record<string, Record<string, Record<string, string[]>>> = plansRaw

interface Props {
  semester: string
  setSemester: (s: string) => void
}

const Sidebar: React.FC<Props> = ({ semester, setSemester }) => {
  const courseInfo = useCourseInfo()
  const [search, setSearch] = useState("")
  let [courses, setCourses] = useLocalStorage<string[]>({
    key: "Courses",
    defaultValue: [],
  })

  const [school] = useLocalStorage<string>({
    key: "School",
    serialize: true,
    defaultValue: "",
  })
  const [studyPlan] = useLocalStorage<string>({
    key: "Study Plan",
    serialize: true,
    defaultValue: "",
  })
  const [showOnlyStudyPlan] = useLocalStorage<boolean>({
    key: "Show Only Plan Courses",
    defaultValue: false,
  })

  if (courses?.length === undefined) {
    courses = []
  }

  const possiblyFilterPlanOnly = (courses: string[]) => {
    if (
      showOnlyStudyPlan &&
      plans[school] !== undefined &&
      plans[school][studyPlan] !== undefined
    ) {
      const courseSet = new Set()
      for (const part in plans[school][studyPlan]) {
        for (const course of plans[school][studyPlan][part]) {
          courseSet.add(course)
        }
      }
      return courses.filter((c) => courseSet.has(c))
    }
    return courses
  }

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
      }}
    >
      <Select
        size="md"
        mb={10}
        value={semester}
        onChange={(v) => setSemester(v!)}
        data={Object.keys(semesterInfo)
          .sort()
          .map((key) => ({ value: key, label: semesterInfo[key].name }))}
        label="סמסטר"
        icon={<i className="fa-solid fa-cloud-moon" />}
      />

      <GoogleSaveButtons />

      <Button.Group mb={10} style={{ width: "100%" }}>
        <Button
          style={{ width: "50%" }}
          size="md"
          leftIcon={<i className="fa-solid fa-download" />}
          onClick={() =>
            downloadFile(
              "dibit.json",
              "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(save()))
            )
          }
        >
          הורדה
        </Button>
        <Button
          style={{ width: "50%" }}
          size="md"
          leftIcon={<i className="fa-solid fa-upload" />}
          onClick={async () => {
            const state = await uploadJson()
            restore(state)
          }}
        >
          העלאת מערכת
        </Button>
      </Button.Group>

      <Button
        fullWidth
        leftIcon={<i className="fa-solid fa-calendar" />}
        size="md"
        color="blue"
        style={{ flex: "none" }}
        onClick={async () => {
          const ics = await getICS(semester, courses, courseInfo)
          downloadFile(
            "calendar.ics",
            "data:text/calendar;charset=utf-8," + ics
          )
        }}
      >
        ייצוא ל-Apple/Google Calendar
      </Button>

      <h2>בחירת קורסים</h2>
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
            setCourses([...courses, courseId])
            setSearch("")
          } else {
            setSearch(courseName)
          }
        }}
        data={possiblyFilterPlanOnly(
          courses.includes !== undefined
            ? Object.keys(courseInfo).filter((id) => !courses.includes(id))
            : Object.keys(courseInfo)
        ).map((id) => `${courseInfo[id]?.name} (${id})`)}
        icon={<i className="fa-solid fa-search" />}
        placeholder="חיפוש"
        limit={20}
        maxDropdownHeight={300}
      />

      {courses.map((courseId, index) => (
        <CourseCard
          key={index}
          index={index}
          courseId={courseId}
          courses={courses}
          setCourses={setCourses}
          semester={semester}
        />
      ))}
    </div>
  )
}

export default Sidebar