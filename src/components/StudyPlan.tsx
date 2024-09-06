import { Autocomplete, Badge, Checkbox, Select, Switch } from "@mantine/core"
import { useCourseInfo } from "../CourseInfoContext"
import hash from "../color-hash"
import { useLocalStorage } from "../hooks"
import { useDibIt } from "../models"
import { getClosestValue, parseDateString } from "../utilities"
import plansRaw from "./plans.json"
const plans: Record<string, Record<string, Record<string, string[]>>> = plansRaw

const StudyPlan = () => {
  const [dibIt, setDibIt] = useDibIt()
  const [sorted, setSorted] = useLocalStorage<boolean>({
    key: "Study Plan Sorted",
    defaultValue: false,
  })
  const courseInfo = useCourseInfo()

  const currentCourses = (dibIt.courses ?? {})[dibIt.semester ?? ""] ?? []

  let courseDates: number[] = []
  if (sorted) {
    for (const course of currentCourses) {
      const examDates = courseInfo[course.id]?.exams
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
    if (currentCourses.some((course) => course.id === courseId)) {
      return 99999999999
    }

    const date = courseInfo[courseId]!.exams
    if (date.length === 0) {
      return -100000000000
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
        marginLeft: 10,
      }}
    >
      <p style={{ marginTop: 5 }}>
        מוצגים ברשימה רק קורסים שמועברים בסמסטר הקרוב.
      </p>

      <Select
        mt="xs"
        label="פקולטה"
        leftSection={<i className="fa-solid fa-school" />}
        data={Object.keys(plans).sort()}
        value={dibIt.school}
        onChange={(v) => {
          if (v) {
            dibIt.school = v
            setDibIt({ ...dibIt })
          }
        }}
      />
      {plans[dibIt.school ?? ""] !== undefined && (
        <Autocomplete
          mt="xs"
          size="md"
          label="תוכנית לימוד"
          leftSection={<i className="fa-solid fa-book" />}
          data={Object.keys(plans[dibIt.school!]).sort()}
          value={dibIt.studyPlan}
          onChange={(v) => {
            dibIt.studyPlan = v
            setDibIt({ ...dibIt })
          }}
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

      {plans[dibIt.school ?? ""] !== undefined &&
        plans[dibIt.school!][dibIt.studyPlan ?? ""] !== undefined &&
        Object.keys(plans[dibIt.school!][dibIt.studyPlan!]).map((key) => {
          const textColor = hash.hsl(key)[2] > 0.5 ? "black" : "white"

          const categoryCourses = plans[dibIt.school!][dibIt.studyPlan!][
            key
          ].filter((courseId: string) => courseInfo[courseId] !== undefined)

          if (categoryCourses.length === 0) {
            return <></>
          }

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
              {possiblySort(categoryCourses).map((courseId: string) => (
                <Checkbox
                  // Convert to boolean to make sure the component doesn't change
                  // from uncontrolled to controlled if this is undefined
                  styles={{ input: { cursor: "pointer" } }}
                  mb="xs"
                  size="md"
                  key={courseId}
                  label={
                    <>
                      <span style={{ color: textColor }}>
                        {courseInfo[courseId]?.name} ({courseId})
                      </span>

                      {courseInfo[courseId] !== undefined &&
                        courseInfo[courseId]!.exams.filter((x) => x.date !== "")
                          .length === 0 && (
                          <Badge
                            ml={5}
                            variant="filled"
                            color="green"
                            leftSection={<i className="fa-solid fa-check" />}
                          >
                            אין מבחן
                          </Badge>
                        )}

                      {/* {courses.includes(courseId) && (
                        <Badge
                          ml={5}
                          variant="filled"
                          color="dark"
                          leftSection={<i className="fa-solid fa-check" />}
                        >
                          נמצא במערכת
                        </Badge>
                      )}

                      {!courses.includes(courseId) && (
                        <Button
                          variant="default"
                          style={{ marginInlineStart: 5 }}
                          leftSection={<i className="fa-solid fa-plus" />}
                          size="xs"
                          onClick={(e) => {
                            e.preventDefault()
                            setCourses([...courses, courseId])
                          }}
                        >
                          הוספה
                        </Button>
                      )} */}
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
