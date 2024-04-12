import { Button } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, firestore } from "../firebase"
import { restore, save } from "../serialize"

const GoogleSaveButtons = () => {
  const [currentUser] = useAuthState(auth)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  if (!currentUser) {
    return <></>
  }

  return (
    <Button.Group mb={10} style={{ width: "100%" }}>
      <Button
        color="green"
        style={{ width: "50%" }}
        leftSection={<i className="fa-solid fa-save" />}
        loading={saveLoading}
        onClick={() =>
          setDoc(doc(firestore, `/users/${currentUser.uid}`), save(), {
            merge: true,
          })
            .then(() => {
              setSaveLoading(false)
              notifications.show({
                title: "השמירה בגוגל בוצעה בהצלחה",
                message: "המערכות שלכם זמינות כעת להורדה במכשירים אחרים",
                style: { direction: "rtl" },
                icon: <i className="fa-solid fa-check" />,
                color: "green",
              })
            })
            .catch((e) => {
              setSaveLoading(false)
              notifications.show({
                title: "שגיאה בשמירה בגוגל",
                message: "אנא נסו שנית. פרטי השגיאה: " + e?.message,
                style: { direction: "rtl" },
                icon: <i className="fa-solid fa-exclamation" />,
                color: "red",
              })
            })
        }
      >
        שמירה בגוגל
      </Button>
      <Button
        color="green"
        style={{ width: "50%" }}
        leftSection={<i className="fa-solid fa-sync" />}
        loading={restoreLoading}
        onClick={() => {
          setRestoreLoading(true)
          getDoc(doc(firestore, `/users/${currentUser.uid}`))
            .then((d) => {
              restore(d.data())
              notifications.show({
                title: "העדכון מגוגל בוצע בהצלחה",
                message: "המערכות שלכם התעדכנו בהתאם למה ששמור במשתמש שלכם",
                style: { direction: "rtl" },
                icon: <i className="fa-solid fa-check" />,
                color: "green",
              })
              setRestoreLoading(false)
            })
            .catch((e) => {
              notifications.show({
                title: "שגיאה בעדכון מגוגל",
                message: "אנא נסו שנית. פרטי השגיאה: " + e?.message,
                style: { direction: "rtl" },
                icon: <i className="fa-solid fa-exclamation" />,
                color: "red",
              })
              setRestoreLoading(false)
            })
        }}
      >
        עדכון מגוגל
      </Button>
    </Button.Group>
  )
}

export default GoogleSaveButtons
