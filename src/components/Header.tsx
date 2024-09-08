import { Button } from "@mantine/core"
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase"

const google = new GoogleAuthProvider()

const Header = () => {
  const [currentUser] = useAuthState(auth)

  return (
    <div
      id="header"
      className="dont-print"
      style={{
        backgroundColor: "#4f6522",
        color: "white",
        width: "100%",
        height: 75,
        flex: "none",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <a href="/">
        <img
          className="logo"
          src="https://arazim-project.com/logo.png"
          height={40}
          style={{ marginLeft: 10, marginRight: 20 }}
        />
      </a>
      <h3
        style={{ fontWeight: "bold", fontSize: "1.17em" }}
        className="show-wide"
      >
        ארזים | Dib It
      </h3>
      <a
        href="https://github.com/arazimproject/dib-it"
        className="link show-wide"
      >
        <i
          className="fa-brands fa-github"
          style={{ marginInlineStart: 10, fontSize: 24, color: "white" }}
        />
      </a>
      <div style={{ flexGrow: 1 }} />
      {(currentUser === null || currentUser === undefined) && (
        <Button
          mx="xs"
          variant="white"
          leftSection={<i className="fa-solid fa-sign-in" />}
          onClick={() => signInWithPopup(auth, google)}
        >
          התחבר/י
        </Button>
      )}
      {currentUser !== null && currentUser !== undefined && (
        <>
          <p style={{ display: "flex", alignItems: "center" }}>
            שלום,{" "}
            <b style={{ marginInlineStart: 5 }}>{currentUser.displayName}</b>
            {currentUser.photoURL !== null && (
              <img
                src={currentUser.photoURL}
                height={30}
                style={{ borderRadius: "50%", marginInlineStart: 5 }}
              />
            )}
          </p>
          <Button
            mx="xs"
            variant="white"
            leftSection={<i className="fa-solid fa-sign-out" />}
            onClick={() => signOut(auth)}
          >
            התנתק/י
          </Button>
        </>
      )}
    </div>
  )
}

export default Header
