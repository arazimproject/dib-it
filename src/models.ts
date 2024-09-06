import { getLocalStorage, setLocalStorage, useLocalStorage } from "./hooks"

export const getDibIt = () => getLocalStorage<DibIt>("Dib It")
export const setDibIt = (dibIt: DibIt) => setLocalStorage("Dib It", dibIt)
export const useDibIt = () =>
  useLocalStorage<DibIt>({ key: "Dib It", defaultValue: {} })

/** All Dib It information for a given user (this is what's uploaded to Firestore when uploading/downloading). */
export interface DibIt {
  /** A mapping from a semester like '2024a' to a mapping from course IDs like '03661111' to course information stored on Dib It. */
  courses?: Record<string, DibItCourse[]>

  /** The current semester the user's viewing */
  semester?: string
  /** The school of the user, like 'הפקולטה למדעים מדויקים ע"ש ריימונד ובברלי סאקלר' */
  school?: string
  /** The study plan of the user, like 'תוכנית דו-חוגית במתמטיקה ובמדעי המחשב' */
  studyPlan?: string
  /** The degree start year of the user, like 2024 */
  degreeStartYear?: number
  /** The user's theme */
  theme?: string
}

export interface DibItCourse {
  /** The course ID like '03661111' */
  id: string
  /** The groups the user has selected for this course */
  groups?: string[]
  /** The color override the user has selected for this course */
  color?: string
  /** The study plan category override the user has selected for this course */
  studyPlanCategory?: string
}
