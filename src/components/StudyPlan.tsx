import {
  Autocomplete,
  Badge,
  Button,
  Checkbox,
  Select,
  Switch,
} from "@mantine/core"
import { useCourseInfo } from "../CourseInfoContext"
import hash from "../color-hash"
import { useLocalStorage } from "../hooks"
import { getClosestValue, parseDateString } from "../utilities"
import plansRaw from "./plans.json"
const plans: Record<string, Record<string, Record<string, string[]>>> = plansRaw

const StudyPlan = () => {
  const [school, setSchool] = useLocalStorage<string>({
    key: "School",
    serialize: true,
    defaultValue: "",
  })
  const [studyPlan, setStudyPlan] = useLocalStorage<string>({
    key: "Study Plan",
    serialize: true,
    defaultValue: "",
  })
  const [takenCourses, setTakenCourses] = useLocalStorage<
    Record<string, boolean | undefined>
  >({ key: "Taken Courses", serialize: true, defaultValue: {} })
  const [courses, setCourses] = useLocalStorage<string[]>({
    key: "Courses",
    defaultValue: [],
  })
  const [sorted, setSorted] = useLocalStorage<boolean>({
    key: "Study Plan Sorted",
    defaultValue: false,
  })
  const [showOnlyPlanCourses, setShowOnlyPlanCourses] =
    useLocalStorage<boolean>({
      key: "Show Only Plan Courses",
      defaultValue: false,
    })

  const courseInfo = useCourseInfo()

  let courseDates: number[] = []
  if (sorted) {
    for (const course of courses) {
      const examDates = courseInfo[course]?.exam_dates
      if (examDates?.length !== undefined && examDates.length > 0) {
        for (const date of examDates) {
          const parsedDate = parseDateString(date.date)
          if (parsedDate) {
            courseDates.push(parsedDate.getTime())
          }
        }
      }
    }

    courseDates.sort()
  }

  const getSortingValue = (courseId: string) => {
    if (takenCourses[courseId]) {
      return 1000
    }
    if (courses.includes(courseId)) {
      return 999
    }

    const date = courseInfo[courseId]!.exam_dates
    if (date.length === 0) {
      return -1000
    }

    if (courseDates.length === 0) {
      return 0
    }

    const time = parseDateString(date[0].date)?.getTime() ?? 0
    const difference = Math.abs(getClosestValue(time, courseDates) - time)
    return -difference
  }

  const possiblySort = (a: string[]) => {
    if (sorted) {
      a.sort((x, y) => getSortingValue(x) - getSortingValue(y))
    }

    return a
  }

  return (
    <div
      style={{
        overflow: "auto",
        paddingTop: 10,
        marginBottom: 10,
      }}
    >
      <p style={{ marginTop: 5 }}>
        מוצגים ברשימה רק קורסים שמועברים בסמסטר הקרוב.
      </p>

      <Select
        mt="xs"
        label="פקולטה"
        icon={<i className="fa-solid fa-school" />}
        data={Object.keys(plans).sort()}
        value={school}
        onChange={(e) => {
          if (e) {
            setSchool(e)
          }
        }}
      />
      {plans[school] !== undefined && (
        <Autocomplete
          mt="xs"
          size="md"
          label="תוכנית לימוד"
          icon={<i className="fa-solid fa-book" />}
          data={Object.keys(plans[school]).sort()}
          value={studyPlan}
          onChange={setStudyPlan}
          limit={20}
          maxDropdownHeight={200}
        />
      )}

      <Switch
        mt="xs"
        label="מיון לפי השתלבות במבחנים"
        checked={sorted}
        onChange={(e) => setSorted(e.currentTarget.checked)}
      />
      <Switch
        mt="xs"
        label="הצג רק קורסים מהתוכנית בחיפוש"
        checked={showOnlyPlanCourses}
        onChange={(e) => setShowOnlyPlanCourses(e.currentTarget.checked)}
      />

      {plans[school] !== undefined &&
        plans[school][studyPlan] !== undefined &&
        Object.keys(plans[school][studyPlan]).map((key) => {
          const textColor = hash.hsl(key)[2] > 0.5 ? "black" : "white"

          return (
            <div
              key={key}
              style={{
                borderColor: hash.hex(key),
                borderWidth: 5,
                borderStyle: "solid",
                backgroundColor: hash.hex(key) + "bb",
                color: textColor,
                marginTop: 10,
                borderRadius: 10,
                padding: 5,
                paddingRight: 10,
                paddingLeft: 10,
              }}
            >
              <h2 style={{ marginBottom: 10 }}>{key}</h2>
              {possiblySort(
                plans[school][studyPlan][key].filter(
                  (courseId: string) => courseInfo[courseId] !== undefined
                )
              ).map((courseId: string) => (
                <Checkbox
                  // Convert to boolean to make sure the component doesn't change
                  // from uncontrolled to controlled if this is undefined
                  checked={takenCourses[courseId] === true}
                  styles={{ input: { cursor: "pointer" } }}
                  onChange={(e) => {
                    if (e.currentTarget.checked) {
                      takenCourses[courseId] = true
                    } else {
                      takenCourses[courseId] = undefined
                    }
                    setTakenCourses({ ...takenCourses })
                  }}
                  mb="xs"
                  size="md"
                  key={courseId}
                  label={
                    <>
                      <span style={{ color: textColor }}>
                        {courseInfo[courseId]?.name} ({courseId})
                      </span>

                      {courseInfo[courseId] !== undefined &&
                        courseInfo[courseId]!.exam_dates.filter(
                          (x) => x.date !== ""
                        ).length === 0 && (
                          <Badge
                            ml={5}
                            variant="filled"
                            color="dark"
                            leftSection={<i className="fa-solid fa-check" />}
                          >
                            אין מבחן
                          </Badge>
                        )}

                      {courses.includes(courseId) && (
                        <Badge
                          ml={5}
                          variant="filled"
                          color="green"
                          leftSection={<i className="fa-solid fa-check" />}
                        >
                          נמצא במערכת
                        </Badge>
                      )}

                      {!courses.includes(courseId) && (
                        <Button
                          variant="default"
                          style={{ marginInlineStart: 5 }}
                          leftIcon={<i className="fa-solid fa-plus" />}
                          size="xs"
                          onClick={(e) => {
                            e.preventDefault()
                            setCourses([...courses, courseId])
                          }}
                        >
                          הוספה
                        </Button>
                      )}
                    </>
                  }
                />
              ))}
            </div>
          )
        })}
    </div>
  )
}

export default StudyPlan
