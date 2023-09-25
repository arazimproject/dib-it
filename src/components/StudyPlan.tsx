import { Badge, Button, Checkbox, Select, Switch } from "@mantine/core"
import { useCourseInfo } from "../CourseInfoContext"
import hash from "../color-hash"
import { useLocalStorage } from "../hooks"
import { getClosestValue, parseDateString } from "../utilities"
import plans from "./plans.json"

const StudyPlan = () => {
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

  const possiblySort = (a: string[]) => {
    if (sorted) {
      a.sort((x, y) => {
        const xDate = courseInfo[x]!.exam_dates
        if (xDate.length === 0) {
          return -1
        }
        const yDate = courseInfo[y]!.exam_dates
        if (yDate.length === 0) {
          return 1
        }

        if (takenCourses[x]) {
          return 1
        }

        if (takenCourses[y]) {
          return -1
        }

        const xTime = parseDateString(xDate[0].date)?.getTime() ?? 0
        const yTime = parseDateString(yDate[0].date)?.getTime() ?? 0

        const xDifference = Math.abs(
          getClosestValue(xTime, courseDates) - xTime
        )
        const yDifference = Math.abs(
          getClosestValue(yTime, courseDates) - yTime
        )

        return yDifference - xDifference
      })
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
        label="תוכנית לימוד"
        icon={<i className="fa-solid fa-book" />}
        data={Object.keys(plans).sort()}
        value={studyPlan}
        onChange={(e) => {
          if (e) {
            setStudyPlan(e)
          }
        }}
      />
      <Switch
        mt="xs"
        label="מיון לפי השתלבות במבחנים"
        checked={sorted}
        onChange={(e) => setSorted(e.currentTarget.checked)}
      />

      {/* @ts-ignore */}
      {plans[studyPlan] !== undefined &&
        // @ts-ignore
        Object.keys(plans[studyPlan]).map((key) => {
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
                // @ts-ignore
                plans[studyPlan][key].filter(
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
