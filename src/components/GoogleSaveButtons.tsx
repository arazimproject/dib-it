import { Menu, Tooltip } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, firestore } from "../firebase"
import { useDibIt } from "../models"

const GoogleSaveButtons = () => {
  const [currentUser] = useAuthState(auth)
  const [dibIt, setDibIt] = useDibIt()

  if (!currentUser) {
    return <></>
  }

  return (
    <>
      <Tooltip label="פעולה זו תדרוס את כל מה ששמור כרגע בגוגל!">
        <Menu.Item
          color="green"
          leftSection={<i className="fa-solid fa-save" />}
          onClick={() => {
            setDoc(doc(firestore, `/users/${currentUser.uid}`), dibIt, {
              merge: true,
            })
              .then(() => {
                notifications.show({
                  title: "השמירה בגוגל בוצעה בהצלחה",
                  message: "המערכות שלכם זמינות כעת להורדה במכשירים אחרים",
                  style: { direction: "rtl" },
                  icon: <i className="fa-solid fa-check" />,
                  color: "green",
                })
              })
              .catch((e) => {
                notifications.show({
                  title: "שגיאה בשמירה בגוגל",
                  message: "אנא נסו שנית. פרטי השגיאה: " + e?.message,
                  style: { direction: "rtl" },
                  icon: <i className="fa-solid fa-exclamation" />,
                  color: "red",
                })
              })
          }}
        >
          גיבוי בגוגל
        </Menu.Item>
      </Tooltip>
      <Tooltip label="פעולה זו תדרוס את כל המערכות שלכם כרגע! מומלץ לגבות לפני כדי שתוכלו לשחזר.">
        <Menu.Item
          color="green"
          leftSection={<i className="fa-solid fa-sync" />}
          onClick={() => {
            getDoc(doc(firestore, `/users/${currentUser.uid}`))
              .then((d) => {
                const data = d.data()

                if (data) {
                  setDibIt({
                    ...data,
                    semester: dibIt.semester ?? data.semester,
                  })
                }

                notifications.show({
                  title: "העדכון מגוגל בוצע בהצלחה",
                  message: "המערכות שלכם התעדכנו בהתאם למה ששמור במשתמש שלכם",
                  style: { direction: "rtl" },
                  icon: <i className="fa-solid fa-check" />,
                  color: "green",
                })
              })
              .catch((e) => {
                notifications.show({
                  title: "שגיאה בעדכון מגוגל",
                  message: "אנא נסו שנית. פרטי השגיאה: " + e?.message,
                  style: { direction: "rtl" },
                  icon: <i className="fa-solid fa-exclamation" />,
                  color: "red",
                })
              })
          }}
        >
          שחזור מגוגל
        </Menu.Item>
      </Tooltip>
    </>
  )
}

export default GoogleSaveButtons
