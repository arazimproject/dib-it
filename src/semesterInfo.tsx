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
  "2023a": {
    name: "תשפ״ג א׳",
    imsYear: "2022",
    semesterNumber: 1,
    startDate: new Date("October 23, 2022 00:00:00"),
    endDate: new Date("January 22, 2023 00:00:00"),
  },
  "2023b": {
    name: "תשפ״ג ב׳",
    imsYear: "2022",
    semesterNumber: 2,
    startDate: new Date("March 12, 2023 00:00:00"),
    endDate: new Date("June 30, 2023 00:00:00"),
  },
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
  "2025a": {
    name: "תשפ״ה א׳",
    imsYear: "2024",
    semesterNumber: 1,
    startDate: new Date("November 3, 2024 00:00:00"),
    endDate: new Date("February 2, 2025 00:00:00"),
  },
  "2025b": {
    name: "תשפ״ה ב׳",
    imsYear: "2024",
    semesterNumber: 2,
    startDate: new Date("March 16, 2025 00:00:00"),
    endDate: new Date("July 2, 2025 00:00:00"),
  },
}

export const currentSemester = "2025a"

export default semesterInfo
