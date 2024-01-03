/** A context to store the information about all of the courses of the current semester */

import { createContext, useContext } from "react"

export interface Course {
  name: string
  faculty: string

  exams: {
    date: string
    hour: string
    moed: string
    type: string
  }[]

  groups: {
    group: string
    lessons: {
      building: string
      day: string
      type: string
      room: string
      semester: string
      time: string
    }[]
    lecturer: string | null
  }[]
}

const CourseInfoContext = createContext<Record<string, Course>>({})

export const useCourseInfo = (): Record<string, Course | undefined> => {
  return useContext(CourseInfoContext)
}

export default CourseInfoContext
