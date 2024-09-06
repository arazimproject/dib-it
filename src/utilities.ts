import hash from "./color-hash"
import { DibItCourse } from "./models"

export const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24

export const getClosestValue = (value: number, sortedList: number[]) => {
  // Binary search the last x that is smaller than value
  if (value <= sortedList[0]) {
    return sortedList[0]
  }
  if (value >= sortedList[sortedList.length - 1]) {
    return sortedList[sortedList.length - 1]
  }

  let low = 0,
    high = sortedList.length - 1
  while (high > low + 1) {
    const middle = Math.floor((low + high) / 2)
    const middleValue = sortedList[middle]
    if (value >= middleValue) {
      low = middle
    } else {
      high = middle
    }
  }

  if (Math.abs(sortedList[low] - value) < Math.abs(sortedList[high] - value)) {
    return sortedList[low]
  }

  return sortedList[high]
}

export const getColor = (course: DibItCourse): string => {
  return course.color ?? getDefaultColor(course)
}

export const getDefaultColor = (course: DibItCourse): string => {
  return hash.hex(course.id)
}

export const downloadFile = (filename: string, contents: string) => {
  const element = document.getElementById("download") as HTMLAnchorElement
  element.href = contents
  element.download = filename
  element.click()
}

export const uploadJson = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const element = document.getElementById("upload") as HTMLInputElement
    element.onchange = () => {
      const reader = new FileReader()
      reader.addEventListener("load", (e) => {
        resolve(JSON.parse(e.target!.result as string))
      })
      reader.readAsText(element.files![0])
    }
    element.onerror = reject
    element.click()
  })
}

export const parseDateString = (date: string) => {
  if (date === "") {
    return
  }
  const [day, month, year] = date.split("/")
  const d = new Date()
  d.setFullYear(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))

  return d
}
