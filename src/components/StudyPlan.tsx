import {
  Autocomplete,
  Badge,
  Button,
  Loader,
  Select,
  Switch,
} from "@mantine/core"
import { useCourseInfo } from "../CourseInfoContext"
import hash from "../color-hash"
import { useLocalStorage, useURLValue } from "../hooks"
import { useDibIt } from "../models"
import {
  getClosestValue,
  MILLISECONDS_IN_DAY,
  parseDateString,
} from "../utilities"
import plansRaw from "./plans.json"
const plans: Record<string, Record<string, Record<string, string[]>>> = plansRaw

const StudyPlan = () => {
  const [dibIt, setDibIt] = useDibIt()
  const [sorted, setSorted] = useLocalStorage<boolean>({
    key: "Study Plan Sorted",
    defaultValue: false,
  })
  const courseInfo = useCourseInfo()
  const [allTimeCourseInfo, loadingAllTimeCourseInfo] = useURLValue<any>(
    "https://arazim-project.com/courses/courses.json"
  )

  if (!dibIt.courses) {
    dibIt.courses = {}
  }
  if (!dibIt.courses[dibIt.semester!]) {
    dibIt.courses[dibIt.semester!] = []
  }
  const currentCourses = dibIt.courses[dibIt.semester!]

  let courseDates: number[] = []
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

  const getDayDifference = (courseId: string) => {
    const date = courseInfo[courseId]?.exams
    if (!date || date.length === 0 || date[0].date === "") {
      return
    }
    const time = parseDateString(date[0].date)?.getTime() ?? 0
    const difference = Math.round(
      Math.abs(getClosestValue(time, courseDates) - time) / MILLISECONDS_IN_DAY
    )
    return difference
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

  const possiblySortAndFilter = (a: string[]) => {
    if (sorted) {
      return a
        .filter((x) => courseInfo[x] !== undefined)
        .sort((x, y) => getSortingValue(x) - getSortingValue(y))
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
      {loadingAllTimeCourseInfo && (
        <p
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <Loader size="sm" ml="xs" /> טוען מידע על קורסים מכל השנים...
        </p>
      )}
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
        label="הצג רק קורסים שעוברים בסמסטר הנבחר ומיין לפי השתלבות בתקופת מבחנים"
        checked={sorted}
        onChange={(e) => setSorted(e.currentTarget.checked)}
      />

      {plans[dibIt.school ?? ""] !== undefined &&
        plans[dibIt.school!][dibIt.studyPlan ?? ""] !== undefined &&
        Object.keys(plans[dibIt.school!][dibIt.studyPlan!]).map((key) => {
          const textColor = hash.hsl(key)[2] > 0.5 ? "black" : "white"
          const categoryCourses = plans[dibIt.school!][dibIt.studyPlan!][key]

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
              {possiblySortAndFilter(categoryCourses).map(
                (courseId: string) => {
                  const info =
                    courseInfo[courseId] ?? allTimeCourseInfo[courseId]
                  const name = info?.name
                    ? `${info.name} (${courseId})`
                    : `קורס מספר ${courseId}`
                  const difference = getDayDifference(courseId)
                  const included = currentCourses.some(
                    (course) => course.id === courseId
                  )

                  return (
                    <div
                      key={courseId}
                      style={{ marginTop: 5, marginBottom: 5 }}
                    >
                      <span style={{ color: textColor }}>{name}</span>

                      {courseInfo[courseId] !== undefined && !included && (
                        <Button
                          variant="default"
                          style={{ marginInlineStart: 5 }}
                          leftSection={<i className="fa-solid fa-plus" />}
                          size="xs"
                          onClick={() => {
                            currentCourses.push({ id: courseId })
                            setDibIt({ ...dibIt })
                          }}
                        >
                          הוספה
                        </Button>
                      )}

                      {included && (
                        <Badge
                          mr={5}
                          variant="filled"
                          color="green"
                          leftSection={<i className="fa-solid fa-check" />}
                        >
                          נמצא במערכת
                        </Badge>
                      )}

                      {!sorted &&
                        !included &&
                        courseInfo[courseId] === undefined && (
                          <Badge
                            mr={5}
                            color="red"
                            leftSection={<i className="fa-solid fa-xmark" />}
                          >
                            לא עובר בסמסטר הנבחר
                          </Badge>
                        )}

                      {courseInfo[courseId] !== undefined &&
                        courseInfo[courseId]!.exams.filter((x) => x.date !== "")
                          .length === 0 && (
                          <Badge
                            mr={5}
                            variant="filled"
                            color="green"
                            leftSection={<i className="fa-solid fa-check" />}
                          >
                            אין מבחן
                          </Badge>
                        )}

                      {courseInfo[courseId] !== undefined &&
                        difference !== undefined &&
                        !included && (
                          <Badge
                            mr={5}
                            variant="default"
                            leftSection={<i className="fa-solid fa-clock" />}
                          >
                            הפרש ימים מהמבחן הכי קרוב: {difference}
                          </Badge>
                        )}
                    </div>
                  )
                }
              )}
            </div>
          )
        })}
    </div>
  )
}

export default StudyPlan
