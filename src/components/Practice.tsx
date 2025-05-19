import {
  Accordion,
  Badge,
  Checkbox,
  Loader,
  Menu,
  Tooltip,
} from "@mantine/core"
import { useCourseInfo } from "../CourseInfoContext"
import { useURLValue } from "../hooks"
import { DibItCourse, useDibIt } from "../models"
import { formatSemester, getColor, parseDateString } from "../utilities"

const PracticeInfo = ({
  course,
  semester,
  gradeInfo,
}: {
  course: DibItCourse
  semester: string
  gradeInfo: any
}) => {
  const [semesterInfo, loadingSemesterInfo] = useURLValue<SemesterCourses>(
    `https://arazim-project.com/data/courses-${semester}.json`
  )

  const mean = ((((gradeInfo ?? {})[course.id] ?? {})[semester] ?? {})["00"] ??
    [])[0]?.mean
  const lecturers = new Set<string>()
  // Initially, only show teahers of שיעור.
  for (const group of semesterInfo[course.id]?.groups ?? []) {
    if (!group.lessons?.some((lesson) => lesson.type === "שיעור")) {
      continue
    }

    for (const lecturer of group.lecturer?.split(",") ?? []) {
      lecturers.add(lecturer.trim())
    }
  }
  // If this is empty, show everyone.
  if (lecturers.size === 0) {
    for (const group of semesterInfo[course.id]?.groups ?? []) {
      for (const lecturer of group.lecturer?.split(",") ?? []) {
        lecturers.add(lecturer.trim())
      }
    }
  }
  let lecturersString = [...lecturers].sort().join(", ")
  if (lecturersString !== "") {
    lecturersString = ` (${lecturersString})`
  }
  const examLinks = semesterInfo[course.id]?.exam_links ?? []
  const linksString =
    examLinks.length === 1
      ? "קישור 1 למודל"
      : `${examLinks.length} קישורים למודל`

  return (
    <>
      <span>
        {formatSemester(semester)}
        {lecturersString}
      </span>
      {examLinks.length !== 0 && (
        <Menu>
          <Menu.Target>
            <Badge
              leftSection={<i className="fa-solid fa-file-pdf" />}
              mr="xs"
              style={{ cursor: "pointer" }}
            >
              {linksString}
            </Badge>
          </Menu.Target>

          <Menu.Dropdown>
            {examLinks.map((examLink, index) => (
              <Tooltip
                label='זהו קישור למאגר הבחינות במודל. עליכם להיות מחוברים למודל, אחרת תופיע השגיאה "לא נמצאו כאן אורחים"'
                key={index}
              >
                <Menu.Item
                  component="a"
                  href={examLink}
                  variant="white"
                  leftSection={<i className="fa-solid fa-file-pdf" />}
                  target="_blank"
                >
                  {
                    decodeURIComponent(examLink.split("/").reverse()[0]).split(
                      ".pdf"
                    )[0]
                  }
                </Menu.Item>
              </Tooltip>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
      {mean !== undefined && mean !== 0 && (
        <Badge
          mr="xs"
          color="gray"
          leftSection={<i className="fa-solid fa-chart-line" />}
        >
          ממוצע: {mean.toFixed(2)}
        </Badge>
      )}

      {loadingSemesterInfo && <Loader size="xs" mr="xs" />}
    </>
  )
}

const Practice = () => {
  const courseInfo = useCourseInfo()
  const [allTimeCourseInfo] = useURLValue<AllTimeCourses>(
    "https://arazim-project.com/data/courses.json"
  )
  const [gradeInfo] = useURLValue<any>(
    "https://arazim-project.com/data/grades.json"
  )

  const [dibIt, setDibIt] = useDibIt()

  const currentCourses = (dibIt.courses ?? {})[dibIt.semester ?? ""] ?? []

  let examDates: {
    course: DibItCourse
    date: Date
    moed: string
    type: string
  }[] = []

  for (const course of currentCourses) {
    for (const date of courseInfo[course.id]?.exams ?? []) {
      const parsedDate = parseDateString(date.date!)
      if (parsedDate === undefined) {
        continue
      }
      examDates.push({
        course,
        date: parsedDate,
        type: date.type!,
        moed: date.moed!,
      })
    }
  }
  examDates.sort((a, b) => {
    return a.date.toISOString().localeCompare(b.date.toISOString())
  })
  const seenCourses = new Set<string>()
  examDates = examDates.filter((exam) => {
    const exists = seenCourses.has(exam.course.id)
    seenCourses.add(exam.course.id)
    return !exists
  })

  return (
    <Accordion
      multiple
      value={dibIt.openedPracticeCourses ?? []}
      onChange={(openedPracticeCourses) =>
        setDibIt({ ...dibIt, openedPracticeCourses }, true)
      }
    >
      {examDates.map((exam, examIndex) => {
        const totalPracticed =
          (dibIt.practicedExams ?? {})[exam.course.id]?.length ?? 0
        const totalPracticedString =
          totalPracticed === 1
            ? "תורגל מבחן אחד"
            : `תורגלו ${totalPracticed} מבחנים`
        return (
          <Accordion.Item key={examIndex} value={examIndex.toString()}>
            <Accordion.Control style={{ color: getColor(exam.course) }}>
              {courseInfo[exam.course.id]?.name} ({exam.course.id})
            </Accordion.Control>
            <Accordion.Panel>
              <span style={{ marginBottom: 10, fontWeight: "bold" }}>
                סה״כ {totalPracticedString}!
              </span>
              {(allTimeCourseInfo[exam.course.id]?.semesters ?? []).map(
                (semester, semesterIndex) => {
                  return (
                    <div
                      key={semesterIndex}
                      style={{
                        marginBottom: 5,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Checkbox
                        display="inline-block"
                        label="מועד א׳"
                        ml="xs"
                        checked={
                          (dibIt.practicedExams ?? {})[
                            exam.course.id
                          ]?.includes(semester + "a") ?? false
                        }
                        onChange={(e) => {
                          if (!dibIt.practicedExams) {
                            dibIt.practicedExams = {}
                          }
                          if (!dibIt.practicedExams[exam.course.id]) {
                            dibIt.practicedExams[exam.course.id] = []
                          }
                          if (e.currentTarget.checked) {
                            dibIt.practicedExams[exam.course.id].push(
                              semester + "a"
                            )
                          } else {
                            dibIt.practicedExams[exam.course.id] =
                              dibIt.practicedExams[exam.course.id].filter(
                                (s) => s !== semester + "a"
                              )
                          }
                          setDibIt({ ...dibIt }, true)
                        }}
                      />
                      <Checkbox
                        display="inline-block"
                        label="מועד ב׳"
                        ml="xs"
                        checked={
                          (dibIt.practicedExams ?? {})[
                            exam.course.id
                          ]?.includes(semester + "b") ?? false
                        }
                        onChange={(e) => {
                          if (!dibIt.practicedExams) {
                            dibIt.practicedExams = {}
                          }
                          if (!dibIt.practicedExams[exam.course.id]) {
                            dibIt.practicedExams[exam.course.id] = []
                          }
                          if (e.currentTarget.checked) {
                            dibIt.practicedExams[exam.course.id].push(
                              semester + "b"
                            )
                          } else {
                            dibIt.practicedExams[exam.course.id] =
                              dibIt.practicedExams[exam.course.id].filter(
                                (s) => s !== semester + "b"
                              )
                          }
                          setDibIt({ ...dibIt }, true)
                        }}
                      />
                      <PracticeInfo
                        gradeInfo={gradeInfo}
                        course={exam.course}
                        semester={semester}
                      />
                    </div>
                  )
                }
              )}
            </Accordion.Panel>
          </Accordion.Item>
        )
      })}
    </Accordion>
  )
}

export default Practice
