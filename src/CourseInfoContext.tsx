/** A context to store the information about all of the courses of the current semester */

import { createContext, useContext } from "react"

const CourseInfoContext = createContext<SemesterCourses>({})

export const useCourseInfo = (): SemesterCourses => {
  return useContext(CourseInfoContext)
}

export default CourseInfoContext
