import { Button, Checkbox, ColorInput } from "@mantine/core"
import { useCourseInfo } from "../CourseInfoContext"
import { useLocalStorage } from "../hooks"
import semesterInfo from "../semesterInfo"
import { getColor } from "../utilities"

interface Props {
  courseId: string
  index: number
  courses: string[]
  setCourses: React.Dispatch<React.SetStateAction<string[]>>
  semester: string
  compactView: boolean
}

const CourseCard: React.FC<Props> = ({
  courseId,
  index,
  courses,
  setCourses,
  semester,
  compactView,
}) => {
  const courseColor = getColor(courseId)
  const courseIdWithDash =
    courseId.substring(0, 4) + "-" + courseId.substring(4)

  const [chosenGroups, setChosenGroups] = useLocalStorage<
    Record<string, string[]>
  >({ key: "Groups", defaultValue: {} })
  const [customColors, setCustomColors] = useLocalStorage<
    Record<string, string>
  >({ key: "Colors", defaultValue: {} })
  const courseInfo = useCourseInfo()

  return (
    <div
      key={courseId}
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
          marginBottom: 10,
        }}
      >
        <b>{`${courseInfo[courseId]?.name} (${courseId})`}</b>
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
                ;[courses[index], courses[index - 1]] = [
                  courses[index - 1],
                  courses[index],
                ]
                setCourses(courses)
              }}
            />
          )}
          {index !== courses?.length - 1 && (
            <i
              className="fa-solid fa-chevron-down"
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                ;[courses[index], courses[index + 1]] = [
                  courses[index + 1],
                  courses[index],
                ]
                setCourses(courses)
              }}
            />
          )}
        </div>
        <i
          className="fa-solid fa-trash"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setCourses(courses.filter((c) => c !== courseId))
            chosenGroups[courseId] = []
            setChosenGroups({ ...chosenGroups })
          }}
        />
      </div>
      {courseInfo[courseId]?.groups.map((group) => (
        <div
          key={group.group}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Checkbox
            styles={{ input: { cursor: "pointer" } }}
            mr={10}
            checked={
              chosenGroups[courseId] !== undefined &&
              chosenGroups[courseId].includes !== undefined &&
              chosenGroups[courseId].includes(group.group)
            }
            onChange={() => {
              if (chosenGroups[courseId] === undefined) {
                chosenGroups[courseId] = []
              }
              const index = chosenGroups[courseId].indexOf(group.group)
              if (index !== -1) {
                chosenGroups[courseId].splice(index, 1)
              } else {
                chosenGroups[courseId].push(group.group)
              }
              setChosenGroups({ ...chosenGroups })
            }}
          />
          {group.group} ({group.lessons[0].type}): {group.lecturer}
        </div>
      ))}
      {compactView || (
        <>
          <ColorInput
            dir="ltr"
            size="md"
            label="בחירת צבע"
            value={courseColor}
            styles={{
              input: { textAlign: "right" },
              label: { color: "inherit" },
            }}
            onChange={(color) => {
              setCustomColors({ ...customColors, [courseId]: color })
            }}
          />
          <Button.Group mt="xs">
            <Button
              size="xs"
              variant="default"
              fullWidth
              leftIcon={<i className="fa-solid fa-chart-column" />}
              onClick={() =>
                window.open(
                  `https://www.tau-factor.com/?course=${courseIdWithDash}`,
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
              leftIcon={<i className="fa-solid fa-line-chart" />}
              type="submit"
              form={"bidding-stats-" + courseId}
            >
              בידינג
            </Button>
            <Button
              size="xs"
              variant="default"
              fullWidth
              leftIcon={<i className="fa-solid fa-search" />}
              type="submit"
              form={"ims-search-" + courseId}
            >
              תוצאות חיפוש
            </Button>
          </Button.Group>

          <Button
            fullWidth
            size="xs"
            variant="default"
            mt="xs"
            leftIcon={<i className="fa-solid fa-file-lines" />}
            component="a"
            href={`https://arazim-project.com/tau-search/?courseNumber=${courseId}&year=&showOnlyWithExams=true`}
            target="_blank"
          >
            מבחני עבר (קישורים ל-Moodle)
          </Button>

          <form
            action="https://www.ims.tau.ac.il/tal/kr/Search_L.aspx"
            method="POST"
            id={"ims-search-" + courseId}
            target="_blank"
          >
            <input type="hidden" name="txtKurs" value={courseId} />
            <input
              type="hidden"
              name="lstYear"
              value={semesterInfo[semester].imsYear}
            />
          </form>
          <form
            action="https://www.ims.tau.ac.il/Bidd/Stats/Stats_L.aspx"
            method="POST"
            id={"bidding-stats-" + courseId}
            target="_blank"
          >
            <input type="hidden" name="lstFacBidd" value="0300" />
            <input type="hidden" name="lstShana" value="" />
            <input
              type="hidden"
              name="sem"
              value={semesterInfo[semester].semesterNumber}
            />
            <input type="hidden" name="txtKurs" value={courseId} />
          </form>
        </>
      )}
    </div>
  )
}

export default CourseCard
