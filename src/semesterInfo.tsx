/** Contains necessary metadata about the semesters in the application */

interface SemesterInfo {
  name: string
  imsYear: string
  semesterNumber: number // 1 - Winter, 2 - Spring, 3 - Summer
  startDate: Date
  endDate: Date
}

// START DATE SHOULD ALWAYS BE A SUNDAY!
const semesterInfo: Record<string, SemesterInfo> = {
  "2024a": {
    name: "תשפ״ד א׳",
    imsYear: "2023",
    semesterNumber: 1,
    startDate: new Date("December 31, 2023 00:00:00"),
    endDate: new Date("March 15, 2024 00:00:00"),
  },
  "2024b": {
    name: "תשפ״ד ב׳",
    imsYear: "2023",
    semesterNumber: 2,
    startDate: new Date("May 26, 2024 00:00:00"),
    endDate: new Date("August 12, 2024 00:00:00"),
  },
}

export const currentSemester = "2024a"

export default semesterInfo
