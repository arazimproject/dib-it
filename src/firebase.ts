import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import config from "./firebase.json"

export const app = initializeApp(config)

export const firestore = getFirestore(app)
export const auth = getAuth(app)
