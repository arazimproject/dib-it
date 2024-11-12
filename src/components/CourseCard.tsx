import { Badge, Button, Checkbox, ColorInput, Tooltip } from "@mantine/core"
import { useCourseInfo } from "../CourseInfoContext"
import { useDibIt } from "../models"
import semesterInfo from "../semesterInfo"
import { getColor, getDefaultColor } from "../utilities"
import { useURLValue } from "../hooks"

export interface CourseCardProps {
  index: number
  semester: string
  compactView: boolean
}

const CourseCard = ({ index, semester, compactView }: CourseCardProps) => {
  const [gradeInfo] = useURLValue<any>(
    "https://arazim-project.com/courses/grades.json"
  )
  const [dibIt, setDibIt] = useDibIt()
  const course = dibIt.courses![semester][index]

  const courseInfo = useCourseInfo()
  const courseColor = getColor(course)

  let sum = 0
  let count = 0
  for (const semester in gradeInfo[course.id] ?? {}) {
    for (const group in gradeInfo[course.id][semester]) {
      for (const grades of gradeInfo[course.id][semester][group]) {
        if (grades.mean !== undefined && grades.mean !== 0) {
          sum += grades.mean
          count++
        }
      }
    }
  }

  return (
    <div
      id={`course-${course.id}`}
      key={course.id}
      className="card"
      style={{
        backgroundColor: courseColor,
        boxShadow: `${courseColor}77 0px 5px 4px 0px`,
        color: "white",
        padding: 10,
        borderRadius: 10,
        marginBottom: 15,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 5,
        }}
      >
        <b>{`${courseInfo[course.id]?.name} (${course.id})`}</b>
        <div style={{ flexGrow: 1 }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginInlineEnd: 10,
            fontSize: 12,
          }}
        >
          {index !== 0 && (
            <i
              className="fa-solid fa-chevron-up"
              style={{ cursor: "pointer" }}
              onClick={() => {
                const previous = dibIt.courses![semester][index - 1]
                const current = dibIt.courses![semester][index]
                dibIt.courses![semester][index] = previous
                dibIt.courses![semester][index - 1] = current
                setDibIt({ ...dibIt })
              }}
            />
          )}
          {index !== dibIt.courses![semester]?.length - 1 && (
            <i
              className="fa-solid fa-chevron-down"
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                const next = dibIt.courses![semester][index + 1]
                const current = dibIt.courses![semester][index]
                dibIt.courses![semester][index] = next
                dibIt.courses![semester][index + 1] = current
                setDibIt({ ...dibIt })
              }}
            />
          )}
        </div>
        <i
          className="fa-solid fa-trash"
          style={{ cursor: "pointer" }}
          onClick={() => {
            dibIt.courses![semester].splice(index, 1)
            setDibIt({ ...dibIt })
          }}
        />
      </div>
      {!compactView && count !== 0 && (
        <div style={{ textAlign: "center" }}>
          <Tooltip label="הממוצע מחושב מ-TAU Factor">
            <Badge variant="default" mb="xs">
              ממוצע עבר: {(sum / count).toFixed(2)}
            </Badge>
          </Tooltip>
        </div>
      )}
      {courseInfo[course.id]?.groups.map((group) => (
        <div
          key={group.group}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Checkbox
            styles={{ input: { cursor: "pointer" } }}
            ml={10}
            checked={course.groups?.includes(group.group)}
            onChange={() => {
              if (!course.groups) {
                course.groups = []
              }
              const index = course.groups.indexOf(group.group)
              if (index !== -1) {
                course.groups.splice(index, 1)
              } else {
                course.groups.push(group.group)
              }
              setDibIt({ ...dibIt })
            }}
          />
          {group.group} ({group.lessons[0].type}): {group.lecturer}
        </div>
      ))}
      {compactView || (
        <>
          <div dir="ltr">
            <ColorInput
              mt="xs"
              size="md"
              value={courseColor}
              onChange={(color) => {
                course.color = color === "" ? getDefaultColor(course) : color
                setDibIt({ ...dibIt })
              }}
            />
          </div>
          <Button.Group mt="xs">
            <Button
              size="xs"
              variant="default"
              fullWidth
              leftSection={<i className="fa-solid fa-chart-column" />}
              onClick={() =>
                window.open(
                  `https://arazim-project.com/tau-factor/?course=${course.id}`,
                  "_blank"
                )
              }
            >
              ציוני עבר
            </Button>
            <Button
              size="xs"
              variant="default"
              fullWidth
              leftSection={<i className="fa-solid fa-line-chart" />}
              type="submit"
              form={"bidding-stats-" + course.id}
            >
              בידינג
            </Button>
            <Button
              size="xs"
              variant="default"
              fullWidth
              leftSection={<i className="fa-solid fa-search" />}
              type="submit"
              form={"ims-search-" + course.id}
            >
              תוצאות חיפוש
            </Button>
          </Button.Group>
          <Button
            fullWidth
            size="xs"
            variant="default"
            mt={5}
            leftSection={<i className="fa-solid fa-file-lines" />}
            component="a"
            href={`https://arazim-project.com/tau-search/?courseNumber=${course.id}&year=&showOnlyWithExams=true&compactView=true&edit=false`}
            target="_blank"
          >
            מבחני עבר (קישורים ל-Moodle)
          </Button>

          <form
            action="https://www.ims.tau.ac.il/tal/kr/Search_L.aspx"
            method="POST"
            id={"ims-search-" + course.id}
            target="_blank"
          >
            <input type="hidden" name="txtKurs" value={course.id} />
            <input
              type="hidden"
              name="lstYear"
              value={semesterInfo[semester].imsYear}
            />
          </form>
          <form
            action="https://www.ims.tau.ac.il/Bidd/Stats/Stats_L.aspx"
            method="POST"
            id={"bidding-stats-" + course.id}
            target="_blank"
          >
            <input type="hidden" name="lstFacBidd" value="0300" />
            <input type="hidden" name="lstShana" value="" />
            <input
              type="hidden"
              name="sem"
              value={semesterInfo[semester].semesterNumber}
            />
            <input type="hidden" name="txtKurs" value={course.id} />
          </form>
        </>
      )}
    </div>
  )
}

export default CourseCard
